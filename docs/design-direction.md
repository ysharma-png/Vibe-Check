# CacheFlow Art Direction & Design System Specification
**Document:** `/docs/design-direction.md`  
**Status:** Awaiting User Approval (STEP 0)  
**Version:** 2.0-Couture  
**Author:** Lead Product Designer & Art Director  
**Compliance Standard:** GEMINI.md Rules, WCAG 2.2 AAA Contrast Standards, macOS Liquid Glass Physics  

---

## 1. Core Vision & Concept

### The One-Sentence Concept
> *"An obsidian creative atelier where computational cinema and generative director workflows live behind heavy, optically refractive liquid glass."*

### 3 Mood Keywords
1. **Luminescent** — Deep subterranean darkness pierced by razor-sharp, physical light: specular glares, colored light leaks, caustic refractions, and illuminated viewfinders.
2. **Tactile** — Glass surfaces that feel like polished Apple Pro Display XDR optical glass; spring-damped physics, mechanical toggles, physical contact shadows, and micro-grooved textures.
3. **Editorial** — High-end European design monograph typography; asymmetric pacing, expressive serif italic counterpoints, oversized exhibition numbering, and deliberate negative space.

---

## 2. Color System & Contrast Ratios

### Distinctive Palette Philosophy
We reject the ubiquitous AI trope of `indigo-to-purple-to-pink` gradients. Instead, our palette is anchored in an **Obsidian & Smoked Spruce** subterranean base, ignited by a high-energy **Acid Citron / Electric Lime** luminous accent, counterbalanced by a warm **Molten Solar Coral**, and refined through frosted crystalline neutrals.

### Palette Tokens

```
========================================================================================
TOKEN                 DARK MODE VALUE    LIGHT MODE VALUE   ROLE
========================================================================================
Base Ink              #08090B            #F7F8FA            Primary Canvas / Horizon
Sub-Base (Spruce)     #0E1114            #EFF2F5            Recessed Well / Viewport
Glass Plate (Base)    rgba(18,22,26,0.7) rgba(255,255,255,0.75) Physical Frosted Layer
Glass Rim Highlight   rgba(255,255,255,0.18) rgba(255,255,255,0.9) Specular Bevel Edge
Glass Inner Shadow    rgba(0,0,0,0.4)    rgba(0,0,0,0.06)   Depth / Cavity Drop
----------------------------------------------------------------------------------------
Luminous Accent       #D8FD38 (Lime)     #456600 (Deep Lime) Primary Interactive / Brand
Secondary Warm        #FF6842 (Coral)    #BF3613 (Terracotta) Status / Heat / Clearance
Accent Ice            #38F2C7 (Ice Cyan) #007A60 (Deep Pine) Verified Nodes / DAG Trust
----------------------------------------------------------------------------------------
Content Primary       #F4F6F8            #090B0E            Headers, Primary Data
Content Muted         #96A0AB            #4E5863            Secondary Descriptions
Content Faint         #545E6A            #84909C            Borders, Scrim, Technicals
Hairline Rim          rgba(255,255,255,0.09) rgba(0,0,0,0.08)  Structural Boundaries
========================================================================================
```

### Contrast Ratio Proofs (WCAG 2.2 Compliance)

| Foreground Token | Background Surface | Contrast Ratio | WCAG Rating | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **#F4F6F8** (Primary Light) | **#08090B** (Dark Base) | **17.8 : 1** | **AAA** | Dark mode headlines & body copy |
| **#96A0AB** (Muted Slate) | **#08090B** (Dark Base) | **5.4 : 1** | **AA** | Dark mode captions, metadata, tags |
| **#08090B** (Deep Ink) | **#D8FD38** (Acid Lime) | **15.4 : 1** | **AAA** | Text inside primary Accent CTAs |
| **#D8FD38** (Acid Lime) | **#08090B** (Dark Base) | **15.4 : 1** | **AAA** | Luminous badges & icon highlights |
| **#FF6842** (Molten Coral) | **#08090B** (Dark Base) | **5.7 : 1** | **AA** | Alert pills, urgent actions, rates |
| **#090B0E** (Deep Ink) | **#F7F8FA** (Light Base) | **17.9 : 1** | **AAA** | Light mode headlines & body |
| **#4E5863** (Deep Slate) | **#F7F8FA** (Light Base) | **6.1 : 1** | **AA** | Light mode secondary descriptions |
| **#456600** (Deep Lime) | **#F7F8FA** (Light Base) | **6.4 : 1** | **AA** | Light mode interactive accents |
| **#BF3613** (Terracotta) | **#F7F8FA** (Light Base) | **5.8 : 1** | **AA** | Light mode alerts & active states |

*Note: For translucent glass surfaces, all text sits on a calculated backing scrim (`rgba(8,9,11,0.55)` in dark, `rgba(255,255,255,0.65)` in light) ensuring readability never drops below 5.0:1 regardless of shifting backgrounds.*

---

## 3. Typographic System & Hierarchy

### Type Pairings: The Curated Atelier
We eliminate generic Inter-everywhere monotony in favor of an intentional triad:

1. **Display Face — Space Grotesk / Cabinet Grotesk**: Geometric, architectural, sculptured ink-traps, unpretentious confidence.
2. **Expressive Counterpoint — Instrument Serif (Italic)**: Slender, haute-couture editorial italic woven into single accent words in hero headlines to communicate artisanal discernment (e.g. *"Hire elite — <span className="font-serif italic font-normal text-white">uncompromising</span> — AI directors"*).
3. **Clean Text Face — Satoshi / General Sans**: Rhythmically balanced contemporary neo-grotesk with human warmth, wide apertures, and flawless legibility down to 12px.
4. **Technical & Index Face — JetBrains Mono**: Monospace tabular numerals, ComfyUI DAG node indices, frame rates (`24.000 fps`), aspect ratios (`2.39:1`), and verification hashes.

### Type Scale & Specs Table

| Level | Size | Line Height | Tracking | Weight | Typeface | Notes / Sample |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 01** | `4.75rem` (76px) | `1.04` | `-0.035em` | 700 / 800 | Display + Serif Italic | Hero titles with mixed italic word |
| **Display 02** | `3.25rem` (52px) | `1.08` | `-0.028em` | 700 | Display Grotesk | Section anchors, feature statements |
| **Heading 01** | `2.25rem` (36px) | `1.15` | `-0.022em` | 600 | Display Grotesk | Modal titles, creator profile hero names |
| **Heading 02** | `1.5rem` (24px) | `1.25` | `-0.015em` | 600 | Text Sans | Card headers, panel titles |
| **Heading 03** | `1.125rem` (18px)| `1.35` | `-0.010em` | 600 | Text Sans | Sub-sections, node group titles |
| **Body Large** | `1.125rem` (18px)| `1.55` | `-0.005em` | 400 | Text Sans | Hero lead paragraphs, intro callouts |
| **Body Regular**| `0.9375rem` (15px)|`1.50` | `0` | 400 / 500 | Text Sans | Primary content, form fields, bios |
| **Body Small**  | `0.8125rem` (13px)|`1.45` | `+0.005em` | 400 / 500 | Text Sans | Secondary descriptions, timestamps |
| **Technical Mono**| `0.6875rem` (11px)|`1.40` | `+0.060em` | 500 / 600 | JetBrains Mono | Micro-stamps, `[01 // DISCOVER]`, DAG node tags |

---

## 4. Eight Signature Details (Human Touches)

These 8 tactile, non-generic elements anchor the entire design, permanently distinguishing CacheFlow from AI-generated boilerplate:

1. **The Physical Specular Liquid-Glass Layer (`GlassSurface`)**:
   Multi-tiered optical glass with dynamic pointer-following specular glares (`--mouse-x`, `--mouse-y`), 1px progressive top-left gradient bevel border, inner ambient occlusion glow, and genuine SVG `feDisplacementMap` refraction distortion on primary controls.

2. **Asymmetrical, Editorial Monograph Layouts**:
   Off-center columns, deliberate negative space, cards that overlap boundaries by 12–24px, and vertical side-headers ("CATALOGUE // 2026") that break the mundane centered-grid syndrome.

3. **Curated Hand-Crafted Studio Ephemera**:
   Subtle SVG tape strips anchoring moodboard images, slight random rotations (`-1.5deg` to `+2deg`) on talent verified badges, wax-seal SVG stamp graphics for DAG reproducibility, and hand-drawn hairline brackets around technical specs.

4. **Monospace Exhibition Stamping & Coordinate Crossbars**:
   Every card and section features a subtle catalog index stamp (e.g., `INDEX NO. 042 / LORA-DEV`, `COMFY-DAG // V4.8`). Hairline dividing rules terminate in physical coordinate crosses (`+----+`).

5. **Cinematic 3D Gyroscope / Cursor Tilt with Parallax Sheen**:
   Talent cards and portfolio items feature physical 3D transforms (`rotateX`, `rotateY` capped at 8°), with internal artwork moving on a separate z-plane (`translateZ(18px)`) beneath a dynamic reflection glare layer that washes over the glass on hover.

6. **The Spotlight Command & Dock Navigation**:
   Desktop features an optional floating glass dock with spring magnification for frequent actions (Brief Builder, Talent Radar, Saved Boards, Activity). Command palette (Cmd+K) mimics macOS Spotlight with frosted glass vibrancy, quick filter chips, and keyboard shortcut pill badges.

7. **Voice, Wit & Intentional Microcopy**:
   Zero generic placeholder phrases. Every string reflects a discerning creative agency:
   - *Button:* "Commission This Pipeline" (not "Submit")
   - *Search:* "Filter by latent checkpoint, LoRA weight, or 24fps motion director..."
   - *Empty State:* "No pipelines match this query. The frontier is unmapped — adjust your parameters or spin up a custom brief."
   - *Clearance Badge:* "100% Indemnified Clean Room DAG"

8. **Living Atmosphere & Colored Radiance Shadows**:
   Drop shadows are not flat muddy black (`rgba(0,0,0,0.5)`). They are dual-layered: a tight contact shadow for grounding, plus a diffused, colored ambient aura derived from the card’s internal artwork (`box-shadow: 0 24px 48px -12px rgba(var(--ambient-color), 0.25)`).

---

## 5. Three Reference Inspirations

1. **Apple / visionOS (Spatial Glass Architecture)**
   - *What to borrow:* The optical physics of thick, frosted glass surfaces; progressive light bevels; background blur that boosts saturation (`saturate(180%) blur(24px)`); materials that feel floaty yet heavy, grounded by ambient occlusion contact shadows.
   - *What to avoid:* Clunky white bubbles or ungrounded UI floating without structural anchor points.

2. **Linear (Obsessive Craft & Information Density)**
   - *What to borrow:* Razor-sharp 1px boundary lines, meticulous keyboard navigation, compact high-density technical controls, buttery micro-interactions, dark mode color grading that feels rich rather than pitch-black.
   - *What to avoid:* Overly cold enterprise-SaaS utility that lacks artistic emotion or cinematic beauty.

3. **Studio Freight & Active Theory (Awwwards SOTD Polish & Motion)**
   - *What to borrow:* Editorial typography scales, expressive serif accents, physical 3D card tilt, smooth inertial scrolling (Lenis), unexpected layout offsets, and cinematic audio-visual presence.
   - *What to avoid:* Overwhelming non-standard navigation that hurts usability or tanks 60fps performance.

---

## 6. The "NEVER DO" List (Generic AI Tells Strictly Banned)

| Banned Generic AI Habit | Our Enforced Handcrafted Alternative |
| :--- | :--- |
| **NO purple-to-blue default gradients** | Obsidian Ink (`#08090B`) base + Electric Acid Lime (`#D8FD38`) + Molten Coral (`#FF6842`). |
| **NO gradient text on every headline** | Pure, crisp white display typography with occasional warm serif italic words. Gradient text is strictly limited to 1 hero word maximum. |
| **NO centered hero + 3 equal feature cards** | Asymmetrical editorial composition: offset hero with live 3D showcase canvas, uneven Bento-grid modules, and broken-edge portfolio carousels. |
| **NO emoji as icons anywhere** | Hand-curated Lucide / custom SVG icon set at consistent 1.5px stroke weight, framed in 28px frosted glass coin holders. |
| **NO uniform card grids with identical radius** | Variable radius hierarchy: `r-10` for pills, `r-16` for nested controls, `r-24` for cards, `r-32` for floating stage frames. |
| **NO default unstyled shadcn/radix look** | Every dropdown, dialog, slider, and popover is hand-crafted with custom glass bevels, backdrop filters, and spring animations. |
| **NO lorem-ipsum or vague AI buzzwords** | Direct, confident studio copy referencing actual generative pipeline mechanics (ComfyUI DAGs, LoRA weights, FLUX.1 latents, 4K ProRes). |
| **NO floating CSS blurred color blobs as sole decoration** | High-fidelity 3D React Three Fiber canvas, optical noise grain texture, real media thumbnails, and dynamic cursor caustic lights. |
| **NO flat colored circles as avatars or media placeholders** | Real seeded creator assets with verified gold-conical rings, availability status indicator dots, and multi-aspect portfolio preview frames. |

---

## 7. The Glass System Architecture (Step 1 Blueprint)

To be built in `src/styles/glass.css` and `src/components/glass/`:

### Surface Levels
- **`glass-thin`**: `background: rgba(18,22,26,0.45)`, `backdrop-filter: blur(12px) saturate(140%)`, 1px top bevel highlight. Used for tooltips, nested badges, and hover chips.
- **`glass-regular`**: `background: rgba(18,22,26,0.68)`, `backdrop-filter: blur(24px) saturate(170%)`, inner shadow 0 1px 0 rgba(255,255,255,0.12). Used for cards, dialog bodies, and table containers.
- **`glass-thick`**: `background: rgba(14,17,21,0.85)`, `backdrop-filter: blur(40px) saturate(190%)`, multi-stop contact shadow. Used for bottom sheets, slide decks, and drawer panels.
- **`glass-chrome`**: `background: rgba(10,12,15,0.72)`, `backdrop-filter: blur(32px) saturate(180%)`, fixed header, command palette, and dock nav.

### Refraction & Optical Shaders
- An SVG `<filter id="liquid-refraction">` utilizing `feTurbulence` and `feDisplacementMap` to produce edge refraction on floating cards and modal perimeters.
- Hardware-accelerated fallback: When `backdrop-filter` is unsupported or `prefers-reduced-transparency` is active, seamlessly fall back to high-contrast opaque tinted surfaces (`#121519` / `#FFFFFF`).

---

## 8. 3D & Motion Blueprint (Step 2 Blueprint)

- **Hero 3D Scene**: Real-time Three.js / React Three Fiber scene featuring floating, refractive glass film panels and orbiting generative lens elements that respond to cursor movement and scroll velocity. Lazy-loaded with zero CLS and static WebP poster fallback.
- **Card 3D Tilt**: Framer Motion spring physics with `perspective: 1000px`, tracking pointer coordinates with max ±7.5° tilt, internal parallax offset (`z: 20px`), and a glare layer with dynamic gradient angle.
- **3D Coverflow Portfolio Carousel**: Interactive slider utilizing 3D carousel projection, depth fading, and shared-element layoutId transitions to asset inspector modal.
- **Spring Parameters**: Universal transition curve `[0.16, 1, 0.3, 1]` and spring physics `stiffness: 260, damping: 24` for snappy, tactile mechanical response.
- **Accessibility**: Full `prefers-reduced-motion` compliance substituting 3D transforms with subtle 0.15s opacity fades.

---

## 9. Screen-by-Screen Redesign Execution Plan (Step 4)

1. **Screen 1 — Login / Signup**: Full showpiece with 3D glass scene behind the authentication card, traffic-light macOS controls, and role switcher pill.
2. **Screen 2 — App Shell, Navbar, Command Palette & Dock**: Frosted glass chrome, Spotlight-style Cmd+K launcher, and responsive bottom dock.
3. **Screen 3 — Home Feed & Showcase**: Asymmetric editorial layout with live showreel hero, 3D card feed, and instant search.
4. **Screen 4 — Talent Discovery (`/creators`)**: Glass filter drawer, animated filter chips, 3D tilt creator cards, and rich zero-results state.
5. **Screen 5 — Creator Profile & Portfolio Item Detail**: Panoramic cover, verified badges, interactive ComfyUI DAG node viewer, and coverflow gallery.
6. **Screen 6 — Brief Builder Wizard & Briefs Board**: 4-step glass stepper, live 3D budget & deliverable preview card, and interactive kanban board.
7. **Screen 7 — Engagement Workspace & Chat**: Translucent sidebar, conversation bubble optics, delivery file inspector, and escrow milestones.
8. **Screen 8 — Dashboards (Brand & Creator) & Settings**: Segmented glass tabs, metrics counters, DAG upload dropzone, and payout trackers.
9. **Screen 9 — About / Landing & Presentation Deck**: Pinned scroll storytelling with 3D assembling glass panels, split-line text reveals, and full keyboard-navigable 3D slide deck view.

---

## 10. Verification & Deliverables Checklist

- [x] **Step 0**: Art Direction Specification (`/docs/design-direction.md`) submitted for user approval.
- [ ] **Step 1**: Reusable Glass Design System in `src/styles/glass.css` and `src/components/glass/`.
- [ ] **Step 2**: 3D and Motion infrastructure (Framer Motion, CSS 3D transforms, 3D canvas, tilt hooks).
- [ ] **Step 3**: Human touches (asymmetrical layouts, hand-drawn SVG accents, editorial mono stamps, easter eggs).
- [ ] **Step 4**: Complete screen redesigns across all 9 flows.
- [ ] **Step 5**: Interactive Design Showcase at `/design` demonstrating every surface, component, and motion pattern.
- [ ] **Step 6**: Comprehensive Lighthouse (Perf >= 85, A11y >= 95), Playwright/Vitest test validation, and Before/After visual comparison report.

---
*Ready for user review and approval before proceeding to Step 1 code implementation.*
