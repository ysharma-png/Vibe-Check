# CacheFlow Application Security Architecture & Threat Model

This document establishes the production-grade threat model, permission matrix, authorization policies, and application security architecture for CacheFlow.

---

## 1. Threat Model

### 1.1 Critical Assets
1. **User Identity & Authentication Data**: Password hashes, refresh tokens, TOTP secrets, recovery codes, OAuth tokens, session cookies.
2. **Proprietary Generative Pipelines**: ComfyUI node graphs, custom LoRA weights references, deterministic seeds, prompt engineering IP.
3. **Enterprise Creative Briefs & Budgets**: Unreleased product campaign concepts, confidential brand guidelines, budget ceilings ($5k–$100k+), negative IP constraints.
4. **Proposals & Deal Terms**: Custom price quotes, delivery timelines, milestone splits, contract agreements.
5. **Private Deliverables & Media Assets**: High-resolution 4K master video files, ProRes deliverables, raw latent artifacts stored prior to final release.
6. **Platform Verification & Integrity Signals**: Trust index scores, deterministic pipeline verification flags, commercial indemnity badges, and admin audit trails.

---

### 1.2 Threat Actors
- **Anonymous / Unauthenticated Visitor (A1)**: Public Internet actor probing endpoints for open directories, account enumeration, rate-limit bypassing, or scraping.
- **Unverified / Low-Tier Creator (A2)**: Attempting to fabricate verification badges, upload trojanized workflow payloads, or view competing proposals.
- **Brand User / Client (A3)**: Attempting unauthorized state machine transitions (e.g. marking milestone completed without escrow funding), accessing other brands' private briefs.
- **Privilege Escalator / Compromised Account (A4)**: Attempting to elevate role to `admin` or manipulate `portfolio_score` and `verified_identity`.
- **Malicious External Attacker (A5)**: Executing credential stuffing, session hijacking, prompt injection on AI brief parsing, SVG-based XSS, or Insecure Direct Object References (IDOR).
- **Insider / Administrative Operator (A6)**: Needs strict least-privilege access; actions must be non-repudiable and auditable.

---

### 1.3 Attack Surfaces & Vulnerability Vectors

| Attack Surface | Threat Vector | Primary Risk | Mitigation |
| :--- | :--- | :--- | :--- |
| **Authentication Endpoints** | Credential stuffing, brute force, timing attacks | Account takeover | Unified generic error strings, rate limiting per IP & per account with exponential backoff, disposable email blocklist, optional Turnstile/hCaptcha, TOTP MFA. |
| **Session Management** | Token theft, session fixation, stale tokens | Persistent unauthorized access | HTTP-only, Secure, SameSite=Lax cookies, refresh token rotation, single-use password reset invalidating all sessions, "Sign out of all devices" RPC. |
| **Multi-Tenant Data Access (IDOR)** | Tampered UUIDs in parameters (`/api/...`, server actions) | Data breach of confidential briefs/proposals | Defense in Depth: Middleware routing + server-side session derivation + Database Row Level Security (RLS) on every table + 404 response on foreign resources. |
| **Privilege Escalation** | Client patching `role`, `portfolio_score`, `verified_*` | Unauthorized admin/verification rights | RLS write-rules, column-level security triggers blocking self-escalation, role derivation exclusively from JWT / security definer functions. |
| **Media & File Storage** | Polyglot files, malicious SVGs, path traversal, quota exhaustion | Stored XSS, remote execution, unmetered egress | Magic-byte MIME inspection, strict file-size limits, randomized UUID filenames, path prefix isolation (`auth.uid()/*`), signed private URLs with minute expirations for deliverables. |
| **AI Brief Parser (LLM)** | Prompt injection, delimiter hijacking, resource exhaustion | Model jailbreak, server denial of service | Input length caps, structured JSON schema output validation, sanitized prompt isolation, strict per-user daily token budgets, zero execution of LLM output. |
| **Application UI (Browser)** | Stored XSS in creator bios / briefs / messages, clickjacking | DOM theft, cookie theft | Strict Content Security Policy (CSP), nonce support, iframe frame-ancestors 'none', DOMPurify-grade HTML sanitization at write & render time. |
| **Contract State Machine** | Tampered status transitions (e.g. bypassing escrow review) | Contractual fraud | Server-side state machine validator rejecting and logging invalid transition attempts. |

---

## 2. Permission Matrix (Role x Resource x Action)

| Resource | Action | Public / Anon | Creator | Brand | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Profiles** | `read` | Published Creators | Public Creators + Self | Public Creators + Self | All Profiles |
| | `create` | Self (via signup) | Denied | Denied | Admin created |
| | `update` | Denied | Own Profile (Non-Admin fields) | Own Profile (Non-Admin fields) | Any (via Audit Log) |
| | `delete` | Denied | Own Profile (Soft-delete) | Own Profile (Soft-delete) | Any (via Audit Log) |
| | `modify_role` | Denied | **DENIED** | **DENIED** | Admin only (Trigger locked) |
| | `verify_badge` | Denied | Request only | Denied | Admin only |
| **Portfolio Items** | `read` | Published items | All published + Own drafts | All published | All |
| | `create / update / delete`| Denied | Own items only | Denied | Moderation override |
| **Creative Briefs** | `read` | Published briefs | Published briefs | Published + Own drafts | All |
| | `create / update / delete`| Denied | Denied | Own briefs only | Moderation override |
| **Proposals** | `read` | Denied | Own submitted proposals | Proposals for own briefs | All |
| | `create` | Denied | Allowed on open briefs | Denied | Denied |
| | `update_status` | Denied | Withdraw own | Accept/Shortlist/Decline on own brief | Moderation override |
| **Engagements** | `read` | Denied | Participant only | Participant only | Read-only dispute handling |
| | `transition_stage` | Denied | Upload deliverable | Move to review / approve | Dispute resolution |
| **Messages** | `read / send` | Denied | Participant only | Participant only | Dispute audit only |
| **Deliverables (Bucket)** | `upload` | Denied | Participant creator only | Denied | Denied |
| | `read_download` | Denied | Participant creator (Signed URL) | Participant brand (Signed URL) | Dispute audit |
| **Audit Log** | `read / write` | Denied | Denied | Denied | Read-only; written by system |

---

## 3. Database & Row Level Security (RLS) Policy Architecture

Every PostgreSQL table in CacheFlow enforces Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`):

1. **`public.profiles`**:
   - `SELECT`: `role = 'creator' OR auth.uid() = id OR public.is_admin()`
   - `INSERT`: `auth.uid() = id AND role IN ('creator', 'brand')` (admin role cannot be self-inserted)
   - `UPDATE`: `(auth.uid() = id OR public.is_admin())` guarded by trigger `prevent_privilege_escalation()` preventing modification of `role`, `verified_*`, and `portfolio_score`.
2. **`public.portfolio_items` & `public.pipeline_stages`**:
   - `SELECT`: `true` (publicly showcase vetted generative proof of work).
   - `INSERT / UPDATE / DELETE`: `auth.uid() = creator_id OR public.is_admin()`.
3. **`public.creative_briefs`**:
   - `SELECT`: `status = 'published' OR auth.uid() = brand_id OR public.is_admin()`.
   - `INSERT / UPDATE / DELETE`: `auth.uid() = brand_id OR public.is_admin()`.
4. **`public.proposals`**:
   - `SELECT`: `auth.uid() = creator_id OR EXISTS(SELECT 1 FROM creative_briefs WHERE id = brief_id AND brand_id = auth.uid()) OR public.is_admin()`.
   - `INSERT / UPDATE`: `auth.uid() = creator_id OR public.is_admin()`.
5. **`public.engagements` & `public.engagement_messages`**:
   - `SELECT`: `auth.uid() = brand_id OR auth.uid() = creator_id OR public.is_admin()`.
   - `INSERT / UPDATE`: Participants only; validated with strict engagement membership check.
6. **`public.audit_logs`**:
   - `SELECT`: `public.is_admin()`.
   - `INSERT`: System triggers & security-definer functions only. Immutable (no updates or deletes).
7. **Storage Buckets (`storage.objects`)**:
   - `avatars`: Public read, `(storage.foldername(name))[1] = auth.uid()::text` write.
   - `portfolio-media`: Public read, `(storage.foldername(name))[1] = auth.uid()::text` write.
   - `thumbnails`: Public read, `(storage.foldername(name))[1] = auth.uid()::text` write.
   - `deliverables`: Private read (signed URL requiring participant match), creator participant write only.

---

## 4. Application Security & Defense-in-Depth

### 4.1 Layer 1: Edge & Middleware Routing
- Route role classification:
  - `/dashboard/creator/*`: Requires authenticated session with `role === 'creator'`.
  - `/dashboard/brand/*`: Requires authenticated session with `role === 'brand'`.
  - `/admin/*`: Requires authenticated session with `role === 'admin'` and AAL2 MFA verification.
- In demo/development fallback mode, simulated session tokens provide safe preview isolation without bypassing security checks.

### 4.2 Layer 2: Server Actions & Route Handlers
- **Input Validation**: All payloads validated with shared Zod schemas (`strict()`).
- **Authorization Context**: Session user ID derived exclusively from verified session cookies (`supabase.auth.getUser()`); client-provided actor IDs are rejected.
- **CSRF Defense**: Server actions utilize Next.js built-in Origin checks. Custom route handlers enforce `Host` / `Origin` header matching for state mutations.

### 4.3 Layer 3: Security Headers & CSP
- Strict CSP configured in `next.config.js` and middleware:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-eval' 'unsafe-inline'` (with nonces in production)
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com`
  - `img-src 'self' data: blob: https://*.supabase.co`
  - `media-src 'self' data: blob: https://*.supabase.co`
  - `frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### 4.4 File Upload Security
- Magic-byte validation:
  - MP4: `ftyp` (box signature `0x66 0x74 0x79 0x70` at offset 4)
  - PNG: `\x89PNG\r\n\x1a\n` (`0x89 0x50 0x4E 0x47`)
  - JPEG: `\xFF\xD8\xFF`
  - WebP: `RIFF....WEBP`
- Rejection of SVG executable scripts (`<script>`, `onload=`, `javascript:` URI).
- Filenames randomized via UUID v4 to prevent server-side path traversal and direct reference guessing.

### 4.5 AI Endpoint Defenses
- Gemini API key strictly retained on server runtime (never prefixed with `NEXT_PUBLIC_`).
- Prompt text treated as untrusted user string with strict token boundaries.
- Rate-limited per user ID and IP address (e.g. 20 requests per hour).
- Output sanitized through Zod schema validation; raw markdown or HTML from model is safely escaped.

---

## 5. Security Checklist & Verification Matrix

| Area | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :---: |
| **Auth** | Unified non-leaky credential error messages | Unit / E2E test | **PASSED** |
| **Auth** | Password policy: >= 10 chars, weak blocklist, email/name check | Zod schema unit test | **PASSED** |
| **Auth** | Disposable email blocklist on signup | Unit tests with test domains | **PASSED** |
| **Auth** | TOTP MFA with AAL2 requirement on admin paths | Middleware & Auth tests | **PASSED** |
| **Auth** | Session sign-out-all & active session view | Supabase Auth API tests | **PASSED** |
| **Auth** | Password reset invalidates existing sessions | Unit test flow | **PASSED** |
| **Auth** | Email verification banner with resend cooldown | UI & handler integration | **PASSED** |
| **Auth** | Rate limiting on login, signup, reset | Token bucket limiter test | **PASSED** |
| **AuthZ** | Centralized permission matrix (`/lib/auth/permissions.ts`)| Typed policy tests | **PASSED** |
| **AuthZ** | IDOR prevention (return 404 for unauthorized items)| API route tests | **PASSED** |
| **AuthZ** | RLS enforcement on all tables | Vitest RLS simulator suite | **PASSED** |
| **AuthZ** | Prevention of privilege escalation (role/badges) | Database trigger test | **PASSED** |
| **AppSec** | XSS sanitization on bio, briefs, and chat | Payload injection tests | **PASSED** |
| **AppSec** | Security headers (CSP, HSTS, X-Frame-Options) | Header verification test | **PASSED** |
| **AppSec** | Magic-byte file validation for uploads | Binary signature test | **PASSED** |
| **AppSec** | Contact-info detection in early chat (anti-disintermediation) | Regex scanner test | **PASSED** |
| **AppSec** | Account soft-delete (7-day grace period) & data export | API integration test | **PASSED** |

---

## 6. Known Limitations & Operational Recommendations
1. **Live Supabase Turnstile**: When deployed in production, set `NEXT_PUBLIC_ENABLE_CAPTCHA=true` with valid Cloudflare Turnstile keys to enforce bot mitigation.
2. **Upstash Redis**: For multi-region serverless scaling, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for distributed atomic rate limiting; in local/dev environments, the in-memory token bucket operates seamlessly.
3. **Audit Log Retention**: Audit logs are immutable in Postgres; for enterprise SOC 2 compliance, configure an automated daily S3/GCS immutable export with WORM (Write Once Read Many) retention.
