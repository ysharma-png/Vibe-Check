# CacheFlow Compliant Creator Ingestion & Data Sources Legal Architecture

This document sets forth the comprehensive legal basis, data minimization controls, copyright policies, and platform compliance rules governing how creators and creator media are brought onto the CacheFlow platform.

---

## 1. Core Principles

1. **Strict Prohibition on Scraping**: CacheFlow strictly prohibits unauthorized web scraping, headless browser harvesting, CAPTCHA bypassing, or crawling behind authenticated walls. All data ingestion must proceed through official APIs, permitted oEmbed endpoints, authorized Open Graph metadata, or direct creator opt-in.
2. **No Re-Hosting of Creator Media**: CacheFlow never downloads, re-encodes, or re-hosts third-party video or image files imported from external networks without explicit licensing agreements. All media is displayed exclusively via official, sandboxed platform embed players (`<iframe>` from YouTube, Vimeo, etc.) or direct hyperlinks, preserving original platform advertising, view counts, and rights management.
3. **Attribution & Provenance**: Every imported work must prominently display author attribution, the source platform badge, and a direct "View original on [Platform]" hyperlink.
4. **Data Minimization (GDPR Art. 5(1)(c))**: Only public fields necessary for discovery and portfolio display are ingested (display name, public handle, profile URL, public media titles/embeds). Private contact information (email addresses, phone numbers, exact physical addresses) is strictly excluded from public listings.
5. **Immediate Right to Erasure & Permanent Suppression**: Any creator has the absolute, unconditioned right to remove their listing at any time via `/remove-my-profile` or invitation one-click links. Removed identities are added to an immutable suppression list to prevent future re-import.

---

## 2. Source Catalog & Legal Basis Matrix

| Source Platform | Integration Mechanism | Data Ingested | Hosting Model | Legal Basis | Terms & Policy Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Creator-Owned: YouTube** | YouTube Data API v3 & Embedded Player API | Title, description, thumbnail URL, duration, embed link, channel ID | **Zero Re-Hosting**: Sandboxed YouTube iframe (`youtube-nocookie.com`) | **GDPR Art. 6(1)(a)** (Explicit Consent) via Creator Dashboard | [YouTube API Services Terms of Service](https://developers.google.com/youtube/terms/api-services-terms-of-service) & Google Privacy Policy |
| **Creator-Owned: Vimeo** | Vimeo oEmbed API & Developer REST API | Title, description, duration, thumbnail URL, player embed URL | **Zero Re-Hosting**: Vimeo Player iframe (`player.vimeo.com`) | **GDPR Art. 6(1)(a)** (Explicit Consent) | [Vimeo API Terms of Use](https://vimeo.com/api/terms) |
| **Creator-Owned: Behance & ArtStation** | Public oEmbed & Open Graph Protocol | Title, project URL, cover thumbnail, creator attribution | **Zero Re-Hosting**: Deep link & authorized social card thumbnail | **GDPR Art. 6(1)(a)** (Explicit Consent) | [Adobe Terms of Use](https://www.adobe.com/legal/terms.html) / [Epic Games ArtStation TOS](https://www.artstation.com/tos) |
| **Creator-Owned: Instagram & TikTok** | Official oEmbed / Web Embed Widgets | Embed code, permalink, author name | **Zero Re-Hosting**: Official client widget | **GDPR Art. 6(1)(a)** (Explicit Consent) | Meta Platform Terms / TikTok Developer Terms |
| **Creator-Owned: Civitai & Hugging Face** | Official Public REST APIs | Model name, base model, weights tag, license string, link to repo | Metadata only; models downloaded by users directly from source | **GDPR Art. 6(1)(a)** (Explicit Consent) | Open Source Model Licenses (Apache 2.0, OpenRAIL, CreativeML) |
| **Unclaimed: Discovered Creators** *(Optional, `ENABLE_DISCOVERED=false`)* | Public API metadata from creative platforms | Display name, public handle, profile link, up to 3 public embeds | **Zero Re-Hosting**: Public embeds only | **GDPR Art. 6(1)(f)** (Legitimate Interests) + **Art. 21** (Right to Object) | EU CDSM Directive Art. 4; CJEU C-466/12 *Svensson* (Linking Exception) |

---

## 3. Legal Analysis by Framework

### 3.1 General Data Protection Regulation (GDPR - EU/UK)

1. **Creator-Owned Imports (Primary Path)**:
   - **Legal Basis**: **Article 6(1)(a) Consent**. The creator must review a disclosure modal listing every field to be imported, the absence of media re-hosting, and account disconnection rights. Consent is logged with a cryptographically verifiable timestamp in `ingestion_logs`.
   - **Right to Erasure (Art. 17)**: Deleting an imported item or disconnecting a connected account expunges the record immediately.
2. **Discovered Creator Listings (Secondary / Optional Path)**:
   - **Legal Basis**: **Article 6(1)(f) Legitimate Interests**. CacheFlow has a legitimate interest in indexing publicly available artistic portfolios to facilitate commercial creator discovery and direct client opportunities.
   - **Legitimate Interests Assessment (LIA)**:
     - *Purpose Test*: Indexing publicly shared work of professional generative artists.
     - *Necessity Test*: Only public handle, display name, and up to 3 embeds are stored; no intrusive private data is fetched.
     - *Balancing Test*: Creators retain full economic benefit; no defamatory claims or pricing are attached; listings clearly identify that the creator has not yet joined; a prominent, zero-friction opt-out is provided.
   - **Right to Object (Art. 21)**: Honored instantly via `/remove-my-profile` without requiring account creation. Suppressed entities are hashed and stored in `suppression_list` to guarantee they are never reintroduced.

### 3.2 Copyright & Embedding Jurisprudence (US & EU)

1. **CJEU *Svensson* (Case C-466/12) & *GS Media* (Case C-160/15)**: Under EU copyright law, hyperlinking or embedding content that is already freely accessible on another website with the consent of the copyright holder does not constitute a "communication to the public" under Article 3(1) of Directive 2001/29/EC, provided technical restrictions are not circumvented.
2. **US 9th Circuit *Perfect 10 v. Amazon* & Server Rule**: The "server test" establishes that embedding content hosted on a third-party server does not violate the copyright owner's display or distribution rights because CacheFlow does not store the underlying media file on its servers.
3. **DMCA Safe Harbor (17 U.S.C. § 512(c))**: CacheFlow maintains an active designated DMCA copyright agent, expeditious notice-and-takedown procedures, and repeat-infringer termination policies.

---

## 4. Technical Guardrails & Compliance Architecture

### 4.1 Ingestion Logs (`ingestion_logs`)
Every programmatic ingestion operation creates an immutable audit log containing:
- `source`: API identifier (`youtube_api_v3`, `vimeo_oembed`, etc.)
- `timestamp`: UTC ISO-8601 string
- `legal_basis`: Legal foundation string
- `admin_id`: Authenticated admin user or creator UID
- `target_handle`: Creator handle
- `records_count`: Number of items imported
- `metadata`: Platform-specific payload (sanitized)

### 4.2 Permanent Suppression List (`suppression_list`)
When a creator opts out via `/remove-my-profile` or an invitation footer:
1. The unclaimed profile and associated items are deleted within 24 hours.
2. A cryptographic hash (`sha256(platform + ":" + handle)`) and normalized URL are recorded in `suppression_list`.
3. The ingestion tool executes an index check against `suppression_list` before any API call. Suppressed entities are rejected with error `IDENTITY_SUPPRESSED`.

### 4.3 Outreach & Invitation Rate Limiting
- **Strict Single-Invitation Policy**: The platform will never send more than ONE invitation to any discovered creator.
- **Brand Privacy Isolation**: Brands requesting an introduction never receive creator contact details. Invitations are delivered solely by the platform through public social links or platform-generated invitation URLs.
- **Unsubscribe / Opt-Out Link**: Every communication includes an instant, single-click removal link.

### 4.4 Data Retention Policy
- Unclaimed profiles not claimed within 180 days are automatically archived or purged.
- Log records in `ingestion_logs` are retained for 3 years to demonstrate regulatory compliance and audit trails.
- Suppression records are retained indefinitely to respect the creator's permanent choice.

---

## 5. Contact & Regulatory Inquiries

- **Data Protection Officer (DPO)**: `dpo@cacheflow.test`
- **DMCA / Copyright Agent**: `dmca@cacheflow.test`
- **Data Subject Rights Request Portal**: [`/privacy#dsar`](file:///e:/Cache%20Flow/src/app/privacy/page.tsx) or `/api/privacy/dsar`
