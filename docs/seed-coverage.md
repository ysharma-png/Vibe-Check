# CacheFlow Seed Dataset Coverage Matrix

This document defines the formal coverage matrix, distributions, referential constraints, and verification scenarios for the synthetic demo seed dataset. The seed dataset ensures every search, filter, and faceted exploration pathway in CacheFlow returns rich, production-grade results while validating deliberate zero-result empty states.

---

## 1. Matrix Overview & High-Level Targets

All profiles in this dataset represent **fictional creators** generated with deterministic PRNG algorithms (`SEED` environment variable). Every seeded profile is tagged with `is_demo: true`.

| Dimension | Target Specification | Minimum Threshold |
| :--- | :--- | :--- |
| **Total Fictional Creators** | 140 creators | $\ge 130$ |
| **Portfolio Items** | ~700 items (4 to 8 per creator) | $\ge 520$ |
| **Pipeline Stages** | ~2,800 stages (3 to 6 per item) | $\ge 2,000$ |
| **Fictional Brands** | 40 brands/agencies | $\ge 40$ |
| **Creative Briefs** | 60 briefs (draft, published, awarded, completed) | $\ge 60$ |
| **Proposals & Engagements** | 90+ proposals, 35+ active/completed engagements | Realistic escrow lifecycle |

---

## 2. Specializations Matrix ($\ge 8$ Creators Each)

CacheFlow categorizes AI creators into 12 core production specializations. Every specialization is backed by at least 8 vetted creators:

| Specialization ID | Display Name | Target Count | Pipeline Focus |
| :--- | :--- | :---: | :--- |
| `ai-film` | AI film / short film | 18 | Cinematic shot continuity, multi-scene narrative pacing, audio scoring |
| `ai-animation` | AI animation (2D/3D/anime) | 16 | Frame-to-frame temporal stability, Anime checkpoint LoRAs, cel shading |
| `product-ads` | Product ads | 20 | Clean product CAD-to-diffusion, photorealistic lighting, brand packshots |
| `music-videos` | Music videos | 12 | Audio reactive beat-sync, surreal transitions, aesthetic style transfer |
| `fashion-lookbook` | Fashion / lookbook | 15 | Fabric texture fidelity, consistent haute-couture models, drape motion |
| `social-shorts` | Social shorts | 22 | Viral hooks, vertical 9:16 framing, punchy captions, high turnaround |
| `explainer-edu` | Explainer / educational | 12 | Motion graphics typography, avatar speech sync, diagrammatic overlays |
| `game-concept` | Game assets / concept art | 14 | Isometric sprites, environment keys, character turnarounds, sprite sheets |
| `arch-viz` | Architecture / real estate viz | 11 | Spatial photorealism, daylight cycle transitions, camera fly-throughs |
| `brand-mascots` | Brand mascots / characters | 15 | Multi-pose consistency, turnarounds, facial expression LoRAs |
| `podcast-audio` | Podcast / audio and voice | 11 | Neural voice cloning, phoneme cadence, spatial room-tone SFX |
| `vfx-restoration` | VFX / upscaling / restoration | 14 | 4K neural super-resolution, artifact de-flicker, archival colorization |

*Total specialization assignments across 140 creators: ~180 (creators can hold primary + secondary specializations).*

---

## 3. Tool Catalog & Pairing Matrix ($\ge 10$ Creators Each)

Every tool in the CacheFlow catalog is used by $\ge 10$ creators with realistic real-world pipelines:

| Tool ID | Vendor / Model | Category | Min Count | Typical Production Pairings |
| :--- | :--- | :--- | :---: | :--- |
| `flux-1-dev` | Black Forest Labs | `image_gen` | 38 | ComfyUI + ControlNet + Topaz |
| `flux-1-pro` | Black Forest Labs | `image_gen` | 24 | Runway Gen-3 + DaVinci Resolve |
| `sdxl-base` | Stability AI | `image_gen` | 32 | ComfyUI + AnimateDiff + Custom LoRA |
| `midjourney-v7` | Midjourney | `image_gen` | 42 | Runway Gen-4 + Topaz Video AI |
| `runway-gen3` | Runway | `video_gen` | 34 | Midjourney + ElevenLabs + DaVinci |
| `runway-gen4` | Runway | `video_gen` | 26 | Flux Pro + Topaz Video AI |
| `kling-1-5` | Kuaishou | `video_gen` | 28 | Midjourney + LivePortrait |
| `luma-dream-machine` | Luma AI | `video_gen` | 22 | Camera Control + ElevenLabs |
| `veo-2` | Google DeepMind | `video_gen` | 16 | Flux Pro + DaVinci Resolve |
| `pika-2` | Pika Labs | `video_gen` | 18 | Midjourney + LivePortrait |
| `animatediff` | Open Source | `video_gen` | 20 | ComfyUI + SDXL + ControlNet |
| `comfy-ui` | Comfy Org | `workflow_engine`| 54 | Flux Dev + ControlNet + SDXL |
| `forge-webui` | lllyasviel | `workflow_engine`| 14 | SDXL + LoRA Training |
| `invoke-ai` | Invoke | `workflow_engine`| 12 | Canvas Inpainting + SDXL |
| `topaz-video-ai` | Topaz Labs | `upscaler` | 48 | Runway Gen-3/4 + Kling + AnimateDiff |
| `elevenlabs` | ElevenLabs | `audio` | 40 | HeyGen + LivePortrait + Runway |
| `live-portrait` | KwaiVGI | `lipsync` | 24 | ElevenLabs + ComfyUI + Flux |
| `heygen` | HeyGen | `lipsync` | 16 | ElevenLabs + Midjourney |
| `nerf-studio` | Nerfstudio Team | `3d` | 14 | Blender + ComfyUI + DaVinci |
| `davinci-resolve` | Blackmagic Design| `editing` | 46 | Runway + Flux + Topaz Video AI |

---

## 4. Skills Taxonomy & Proficiency ($\ge 12$ Creators Each)

Every skill appears on at least 12 creators with a balanced spread across `Intermediate`, `Advanced`, and `Expert`:

| Skill Name | Min Creators | Intermediate | Advanced | Expert |
| :--- | :---: | :---: | :---: | :---: |
| `Prompt Engineering & Latent Guidance` | 55 | 15 | 22 | 18 |
| `LoRA Training & Character Fine-Tuning` | 28 | 6 | 12 | 10 |
| `Consistent Multi-Shot Character Rigging` | 32 | 8 | 14 | 10 |
| `ComfyUI Node Graph Architecture` | 40 | 10 | 18 | 12 |
| `ControlNet (Depth / Canny / OpenPose)` | 35 | 9 | 15 | 11 |
| `Audio-Driven Lip-Sync & Phoneme Mapping`| 24 | 6 | 11 | 7 |
| `Neural Frame Interpolation & Upscaling` | 38 | 10 | 16 | 12 |
| `Camera Path Choreography & Motion Vectors`| 30 | 7 | 14 | 9 |
| `3D Gaussian Splatting & NeRF Capture` | 16 | 4 | 7 | 5 |
| `Neural Voice Cloning & Sound Design` | 26 | 6 | 12 | 8 |
| `IP-Adapter & Reference Conditioning` | 28 | 7 | 12 | 9 |
| `Post-Production Grading & Compositing` | 42 | 11 | 18 | 13 |

---

## 5. Creator Distribution Breakdown

### 5.1 Experience Levels (Pyramid)
- **Rising Talent**: 55% (~77 creators) — $35 - $85/hr, 5-25 projects, 94-98% on-time.
- **Pro Verified**: 35% (~49 creators) — $90 - $175/hr, 25-70 projects, 97-99% on-time.
- **Elite Studio**: 10% (~14 creators) — $180 - $350/hr, 70-150 projects, 99-100% on-time.

### 5.2 Availability
- `open` (Available now): 50% (~70 creators)
- `limited` (Accepting select briefs): 35% (~49 creators)
- `booked` (Fully booked this month): 15% (~21 creators)

### 5.3 Turnaround Times
- Fast turnaround (2–5 days): 25%
- Standard turnaround (6–14 days): 55%
- Long-form / Complex DAG (15–30 days): 20%

### 5.4 Compliance & Verification Signals
- **Commercial-Ready Clearance**: 60% (~84 creators) with 100% indemnified base models.
- **Reproducible Pipeline (ComfyUI DAG)**: 35% (~49 creators) with verifiable seeds and model hashes.
- **Identity Verified**: 45% (~63 creators).

### 5.5 Geographic & Cultural Diversity
- **24 Countries**: Japan, Germany, United Kingdom, United States, Canada, South Korea, Brazil, France, Sweden, Netherlands, Australia, Singapore, Denmark, Spain, Taiwan, Italy, Nigeria, India, Mexico, Norway, Argentina, Poland, South Africa, Ireland.
- **16 Timezones**: UTC-8 to UTC+10.
- **14 Languages**: English, Japanese, German, French, Portuguese, Spanish, Korean, Mandarin, Swedish, Italian, Dutch, Hindi, Danish, Polish.

---

## 6. Two-Filter Combinations & Niche Guarantees

### 6.1 Guarantee: Plausible 2-Filter Combinations ($\ge 3$ Creators)
The generator explicitly satisfies a minimum of 3 matching creators for all standard intersections:
1. `Specialization x Tool` (e.g. AI film + Runway Gen-3; Product ads + Flux Dev; Fashion + Midjourney; Mascots + ComfyUI).
2. `Skill x Aspect Ratio` (e.g. Consistent Character + 9:16; Camera Motion + 16:9; Lip-sync + 9:16).
3. `Content Type x Commercial-Ready` (e.g. Commercial spot + Cleared; Social short + Cleared; Animation + Cleared).

### 6.2 Niche Combinations ($\ge 3$ Creators Guaranteed)
- **Combo A (Lip-Sync + Anime + Vertical 9:16)**: Creators specializing in anime animation using LivePortrait/ElevenLabs with 9:16 social deliverables.
- **Combo B (LoRA Training + Fashion Lookbook)**: Creators with trained haute-couture LoRAs for garment drape consistency.
- **Combo C (ComfyUI + Camera Motion Control + 16:9 4K)**: Technical directors delivering deterministic 4K cinematic camera paths.
- **Combo D (Brand Mascots + 3D / NeRF + 1:1)**: Creators producing multi-angle 3D avatar assets for social branding.
- **Combo E (Voice Synthesis + Educational Explainer)**: Creators delivering voice-cloned narration with synchronized kinetic typography.

### 6.3 Deliberately Empty Combinations (Zero-Result Test Cases)
The following filter queries are intentionally left void in the seed data to guarantee and demonstrate graceful zero-result handling:
- **Void 1**: `Architecture Viz` + `Aspect Ratio 9:16` + `Max Rate $25/hr` + `Unverified`. (Real estate viz creators never price under $35/hr and require horizontal ratios).
- **Void 2**: `Podcast / Voice` + `3D / NeRF` + `Aspect Ratio 21:9`. (Audio specialists do not produce panoramic 3D NeRF assets).
- **Void 3**: `Game Assets` + `Lip-Sync` + `Aspect Ratio 9:16` + `Starting Rate > $400/hr`. (No game asset creator charges above $350 or pairs lip-sync with portrait ratios).

---

## 7. The 25 Verification Scenarios

| # | Scenario Name | Filter Criteria | Expected Result |
| :-: | :--- | :--- | :--- |
| **01** | Broad Query: "cinematic" | `query: "cinematic"` | $\ge 20$ creators |
| **02** | Broad Query: "fashion" | `query: "fashion"` | $\ge 12$ creators |
| **03** | Tool Filter: ComfyUI | `tools: ["comfy-ui"]` | $\ge 40$ creators |
| **04** | Tool Filter: Runway Gen-3 | `tools: ["runway-gen3"]` | $\ge 25$ creators |
| **05** | Tool Filter: FLUX.1 [dev] | `tools: ["flux-1-dev"]` | $\ge 30$ creators |
| **06** | Specialization: Product Ads | `specializations: ["product ads"]` | $\ge 15$ creators |
| **07** | Specialization: AI Animation | `specializations: ["AI animation (2D/3D/anime)"]` | $\ge 12$ creators |
| **08** | Specialization: Brand Mascots | `specializations: ["brand mascots/characters"]` | $\ge 12$ creators |
| **09** | Specialization: Architecture | `specializations: ["architecture/real estate visualization"]` | $\ge 9$ creators |
| **10** | Verified Commercial Clearance | `verification.commercialLicense: true` | $\ge 70$ creators |
| **11** | Verified ComfyUI DAGs | `verification.reproduciblePipeline: true` | $\ge 40$ creators |
| **12** | Dual Verification (Both Cleared) | `commercialLicense: true` AND `reproduciblePipeline: true` | $\ge 25$ creators |
| **13** | Rate Band: Budget ($\le \$75/hr$) | `maxStartingRateUsd: 75` | $\ge 30$ creators |
| **14** | Rate Band: Mid ($\le \$150/hr$) | `maxStartingRateUsd: 150` | $\ge 80$ creators |
| **15** | Combo: AI Film + Runway Gen-3 | `specializations: ["AI film/short film"]`, `tools: ["runway-gen3"]` | $\ge 6$ creators |
| **16** | Combo: Product Ads + Flux Dev | `specializations: ["product ads"]`, `tools: ["flux-1-dev"]` | $\ge 8$ creators |
| **17** | Combo: Fashion + Midjourney | `specializations: ["fashion/lookbook"]`, `tools: ["midjourney-v7"]` | $\ge 6$ creators |
| **18** | Combo: VFX + Topaz + Commercial | `specializations: ["VFX/upscaling/restoration"]`, `tools: ["topaz-video-ai"]`, `commercialLicense: true` | $\ge 5$ creators |
| **19** | Niche A: Lip-Sync + Anime + 9:16 | `specializations: ["AI animation (2D/3D/anime)"]`, `tools: ["live-portrait"]`, `aspectRatios: ["9:16"]` | $\ge 3$ creators |
| **20** | Niche B: LoRA + Fashion | `query: "LoRA"`, `specializations: ["fashion/lookbook"]` | $\ge 3$ creators |
| **21** | Niche C: ComfyUI + Camera Motion | `tools: ["comfy-ui"]`, `query: "camera motion"`, `aspectRatios: ["16:9"]` | $\ge 3$ creators |
| **22** | Availability: Open only | `availability: ["open"]` | $\ge 60$ creators |
| **23** | **Deliberate Void 1 (Arch + $25/hr)**| `specializations: ["architecture/real estate visualization"]`, `maxStartingRateUsd: 25` | **0 (Empty state)** |
| **24** | **Deliberate Void 2 (Podcast + 3D)** | `specializations: ["podcast/audio and voice"]`, `tools: ["nerf-studio"]`, `aspectRatios: ["21:9"]` | **0 (Empty state)** |
| **25** | **Deliberate Void 3 (High Rate Game)**| `specializations: ["game assets/concept art"]`, `tools: ["live-portrait"]`, `query: "unobtainable-unicorn-term"` | **0 (Empty state)** |

---

## 8. Idempotency & Lifecycle Commands

1. `npm run seed:demo` — Deterministically generates and inserts 140 demo creators, 700 portfolio items, 40 brands, and 60 briefs with seeds and DAGs.
2. `npm run seed:wipe-demo` — Atomically purges all rows flagged with `is_demo: true` without touching any non-demo client accounts.
3. `npm run seed:report` — Performs an automated matrix audit against all targets above, printing green PASS checks and flagging any cell below threshold.
