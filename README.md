# Vibe_Check (CacheFlow) ⚡

> **AI-native marketplace connecting generative creators and brands with verified workflow provenance, model-specific discovery, deterministic ComfyUI pipelines, and structured creative briefs.**

---

## 📌 Executive Summary

Legacy freelance marketplaces treat creative work as static deliverables without understanding AI-native production workflows. Brands face "prompt gambling," non-commercial copyright liabilities, and lack standardized methods to evaluate generative pipelines.

**Vibe_Check** is built from the ground up for the generative AI era. It empowers brands to discover creators with verified tools, evaluate repeatable pipelines (ComfyUI node graphs, character-locked LoRAs, seeds), turn rough concepts into structured briefs with an AI agent, and manage production through milestone deliverables.

---

## 🚀 Key Features

### 1. AI Creator Profiles & Workflow Provenance
- **Model & Toolstack Breakdown:** Profiles surface granular tools used across the stack (e.g., Midjourney, FLUX.1 [dev], Runway Gen-3, Kling, Topaz Video AI, ComfyUI).
- **Pipeline Transparency:** Each portfolio item includes step-by-step production breakdowns (Base Image Generation $\rightarrow$ Motion Control $\rightarrow$ Video Upscaling $\rightarrow$ Audio Synthesis).
- **Specialization Tagging:** Filter by consistent character animation, product placement, cinematic AI shorts, and photorealism.

### 2. Structured Brand Brief Definition
- **Technical Deliverables:** Aspect ratios (9:16 vertical, 16:9 widescreen, 1:1 square), target framerates, and resolutions.
- **Commercial & Legal Clarity:** Explicit terms for commercial buyouts, IP assignment, training data compliance, and source node graph handover.
- **Creative Constraints:** Strict guidelines, aesthetic keywords, and negative parameters to prevent unwanted generation artifacts.

### 3. Intelligent Discovery & Semantic Fallback
- **Granular Multi-Filter Engine:** Filter creators by exact tools, media formats, commercial certifications, and specializations.
- **Sensible Empty-State Handling:** When a specific tool query yields zero direct matches, the discovery engine suggests creators specializing in equivalent diffusion pipelines rather than dead-ending with a blank screen.

### 4. High-Trust UX & Milestone Delivery
- High-polish dark-mode interface built for creative technologists with frosted glass aesthetics.
- Deep-linked workflow inspector with DAG graph visualization.

---

## 🌟 Bonus Credit Implementations

### 🛡️ Creator Verification Signals (Trust Layer)
- **Verified Commercial Tooling:** Proof of commercial-tier subscriptions protecting brands against licensing disputes.
- **Reproducible Pipeline Badge:** Verification for creators who supply deterministic, reproducible node graphs (ComfyUI JSON export).

### 🤖 AI-Assisted Brief Builder
- Converts raw natural-language campaign prompts into complete, structured technical creative briefs with suggested toolstacks, format presets, and IP terms using the Google Gemini model.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **UI & Styling**: React 18, TailwindCSS, Vanilla CSS Tokens, Custom Frosted Glass & Liquid Crystal Filters
- **Motion & 3D**: Framer Motion, Three.js, Canvas-Confetti
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Storage Buckets, SSR Auth)
- **AI Intelligence**: Google Gemini API for generative creative brief parsing & automated proposal grading
- **Validation**: Zod, React Hook Form, Lucide React
- **Testing**: Vitest (14 test suites, 179 unit & integration tests)
- **CI/CD & Hosting**: GitHub Actions & [Vercel](https://vercel.com/) (Hobby Plan)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **Package Manager**: `npm`

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/som-14/Vibe_Check.git
   cd Vibe_Check
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example template to create your local `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your local or remote Supabase keys and Gemini API key as described in `.env.example`.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Environment Variables

Refer to [`.env.example`](./.env.example) for the full list of configuration options.

### Public Client Variables (`NEXT_PUBLIC_`)
- `NEXT_PUBLIC_SITE_URL`: Base application URL.
- `NEXT_PUBLIC_APP_URL`: Canonical app URL for OpenGraph and metadata.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project endpoint.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous client key (RLS-enforced).
- `NEXT_PUBLIC_DEMO_MODE`: Enables instant demo account shortcuts on `/login`.
- `NEXT_PUBLIC_ENABLE_CAPTCHA`: Toggles bot verification challenge.

### Server-Only Secrets (Never Expose to Browser)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase admin key for secure backend operations.
- `GEMINI_API_KEY`: Google AI Studio key for natural language brief parsing.
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`: Optional distributed rate limiting.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Compiles optimized production bundle |
| `npm run start` | Runs the compiled production server locally |
| `npm run lint` | Runs Next.js ESLint verification across `src/` |
| `npm test` | Executes full Vitest suite (179 tests across 14 suites) |
| `npm run db:seed` | Seeds remote Supabase database with realistic creators, briefs, and items |
| `npm run seed:demo` | Seeds local dataset fixtures |
| `npm run seed:wipe-demo` | Safely purges demo records (`is_demo = true`) while preserving real users |

---

## 👥 Demo Accounts & Seeding

For sandbox evaluations and reviewer walkthroughs, seed accounts (Brand Director, AI Creator, Platform Admin) are created during database seeding.

- **To generate or inspect demo accounts**: Run `npm run db:seed`.
- The credentials (emails, initial passwords, handles, and role permissions) are printed to the console output upon running the seed script.
- For security compliance, raw passwords are not hardcoded or committed to git.

---

## 🌐 Deployment to Vercel

1. Push your repository to GitHub (`main` branch).
2. Import the project into [Vercel](https://vercel.com/new).
3. Set the Framework Preset to **Next.js**.
4. Configure all environment variables listed in `.env.example`.
5. Deploy! Subsequent commits to `main` trigger automated preview & production deployments via CI/CD.

---

## 🔒 Security & Privacy

- Full Row Level Security (RLS) across all Supabase tables.
- Hardened Content Security Policy (CSP), Strict HSTS, X-Frame-Options (`DENY`), and Anti-CSRF protection.
- Fail-fast environment variable validation at runtime.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
