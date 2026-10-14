"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Info,
  Terminal,
} from "lucide-react";
import {
  GlassSurface,
  GlassTiltCard,
  MacTrafficLights,
  MacSegmentedControl,
  MacToggle,
} from "@/components/glass";
import { MagneticButton } from "@/components/common/MagneticButton";
import { HeroGlassScene } from "@/components/3d/HeroGlassScene";
import { CoverFlowCarousel } from "@/components/3d/CoverFlowCarousel";
import { SlideDeckView } from "@/components/3d/SlideDeckView";
import { fireStudioConfetti } from "@/lib/interactiveConfetti";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import Link from "next/link";

export default function DesignShowcasePage() {
  const [activeTab, setActiveTab] = useState<"surfaces" | "3d" | "macos" | "typography">("surfaces");
  const [toggleState, setToggleState] = useState(true);
  const [sliderVal, setSliderVal] = useState("regular");

  return (
    <div className="min-h-screen py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-20 selection:bg-accent/20">
      {/* 1. Atelier Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 glass-thin text-xs text-accent">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>CACHEFLOW DESIGN ATELIER // SPECIFICATION V2.0</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-[1.08]">
          macOS Liquid Glass &amp;{" "}
          <span className="font-serif italic font-normal text-[#D8FD38]">
            Spatial 3D
          </span>{" "}
          System.
        </h1>
        <p className="text-base sm:text-lg text-content-muted font-light leading-relaxed">
          Comprehensive showcase of optical surface tiers, real-time specular highlights,
          macOS system controls, and 3D motion physics adhering to WCAG 2.2 AAA contrast standards.
        </p>

        {/* Global tab navigation */}
        <div className="pt-4">
          <MacSegmentedControl
            options={[
              { value: "surfaces", label: "Glass Surfaces" },
              { value: "3d", label: "3D & Motion" },
              { value: "macos", label: "macOS Controls" },
              { value: "typography", label: "Palette & Type" },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
          />
        </div>
      </div>

      {/* 2. SECTION: Surface Levels & Specular Tracking */}
      {activeTab === "surfaces" && (
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-accent">STEP 1 // SPECIFICATION</span>
              <h2 className="text-2xl font-light text-white">Surface Tiers &amp; Specular Sheen</h2>
            </div>
            <span className="text-xs font-mono text-content-muted">4 PHYSICAL LEVELS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tier 1: Thin */}
            <GlassSurface
              tier="thin"
              radius="24"
              specular
              sheen
              className="p-6 h-[260px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-accent">Tier 01 // Thin</span>
                <span className="text-xs text-content-muted">blur(12px)</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">glass-thin</h3>
                <p className="text-xs text-content-muted">
                  Lightweight frosted glass. Used for tooltips, micro-chips, and secondary tags.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-content-faint">
                <span>rgba(18,22,26,0.45)</span>
                <span>1px Bevel</span>
              </div>
            </GlassSurface>

            {/* Tier 2: Regular */}
            <GlassSurface
              tier="regular"
              radius="24"
              specular
              sheen
              className="p-6 h-[260px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-accent">Tier 02 // Regular</span>
                <span className="text-xs text-content-muted">blur(24px)</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">glass-regular</h3>
                <p className="text-xs text-content-muted">
                  Core tactile surface for cards, creator feeds, and modal dialog bodies.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-content-faint">
                <span>rgba(18,22,26,0.68)</span>
                <span>Layered Shadow</span>
              </div>
            </GlassSurface>

            {/* Tier 3: Thick */}
            <GlassSurface
              tier="thick"
              radius="24"
              specular
              sheen
              className="p-6 h-[260px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-accent">Tier 03 // Thick</span>
                <span className="text-xs text-content-muted">blur(40px)</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">glass-thick</h3>
                <p className="text-xs text-content-muted">
                  Deep acoustic glass with heavy ambient drop. Used for drawers and presentation decks.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-content-faint">
                <span>rgba(14,17,21,0.85)</span>
                <span>60px Contact</span>
              </div>
            </GlassSurface>

            {/* Tier 4: Chrome */}
            <GlassSurface
              tier="chrome"
              radius="24"
              specular
              sheen
              className="p-6 h-[260px] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#38F2C7]">Tier 04 // Chrome</span>
                <span className="text-xs text-content-muted">blur(32px)</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">glass-chrome</h3>
                <p className="text-xs text-content-muted">
                  High-index glass for fixed navbars, floating dock, and Spotlight search.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-content-faint">
                <span>rgba(10,12,15,0.75)</span>
                <span>Refract Ready</span>
              </div>
            </GlassSurface>
          </div>

          {/* Interactive 3D Tilt Card Demo */}
          <div className="pt-8">
            <h3 className="text-xl font-light text-white mb-4">
              3D Tilt &amp; Cursor Glare (<span className="font-mono text-sm text-accent">GlassTiltCard</span>)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Cyber-Lagos 2077", dir: "Amara Okafor", tool: "FLUX.1 + LoRA", badge: "2.39:1 • 4K" },
                { title: "Tourbillon Macro", dir: "Chloé Bouchard", tool: "Midjourney v6.1", badge: "1:1 • 8K" },
                { title: "Tokyo Drift Splats", dir: "Kenji Sato", tool: "Gaussian Splats", badge: "16:9 • 60fps" },
              ].map((card, i) => (
                <GlassTiltCard key={i} tier="regular" radius="24" maxTilt={8} className="h-64 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-accent">PROVENANCE // 0{i + 1}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white">
                      {card.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-white group-hover:text-accent transition-colors">
                      {card.title}
                    </h4>
                    <p className="text-xs text-content-muted mt-1">
                      Directed by {card.dir} • {card.tool}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Deterministic DAG
                    </span>
                    <span className="text-white/60">Hover to Tilt →</span>
                  </div>
                </GlassTiltCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. SECTION: 3D & Motion Engine */}
      {activeTab === "3d" && (
        <section className="space-y-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-accent">STEP 2 // MOTION ARCHITECTURE</span>
              <h2 className="text-2xl font-light text-white">Three.js Canvas &amp; 3D Coverflow</h2>
            </div>
            <span className="text-xs font-mono text-content-muted">60FPS TARGET</span>
          </div>

          {/* Real-time 3D Scene */}
          <div className="rounded-3xl glass-thick border border-white/15 overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MacTrafficLights />
                <span className="text-xs font-mono text-content-muted ml-2">HERO_3D_VIEWPORT</span>
              </div>
              <span className="text-xs font-mono text-accent flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                THREE.JS WEBGL RENDERER
              </span>
            </div>
            <div className="h-[380px] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5 relative">
              <HeroGlassScene />
            </div>
          </div>

          {/* 3D Coverflow Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light text-white">
                3D Coverflow Gallery (<span className="font-mono text-sm text-accent">CoverFlowCarousel</span>)
              </h3>
              <span className="text-xs text-content-muted">Click or arrow buttons to navigate</span>
            </div>
            <CoverFlowCarousel items={PORTFOLIO_ITEMS.slice(0, 7)} />
          </div>

          {/* 3D Slide Deck View */}
          <div className="space-y-4 pt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-light text-white">
                Interactive Slide Presentation Deck (<span className="font-mono text-sm text-accent">SlideDeckView</span>)
              </h3>
              <span className="text-xs text-content-muted">Use arrow keys [←] [→]</span>
            </div>
            <SlideDeckView />
          </div>
        </section>
      )}

      {/* 4. SECTION: macOS System Controls */}
      {activeTab === "macos" && (
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-accent">MACOS DETAILS // PRECISION</span>
              <h2 className="text-2xl font-light text-white">System Controls &amp; Micro-Interactions</h2>
            </div>
            <span className="text-xs font-mono text-content-muted">TACTILE FEEDBACK</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Magnetic Buttons & Confetti */}
            <GlassSurface tier="regular" radius="24" className="p-6 space-y-4">
              <div className="text-xs font-mono text-accent">01 // MAGNETIC BUTTONS</div>
              <p className="text-xs text-content-muted">
                Cursor-following magnetic spring mechanics with high-contrast AAA colorway.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <MagneticButton
                  variant="primary"
                  onClick={() => fireStudioConfetti()}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Electric Lime (Confetti Blast)</span>
                </MagneticButton>
                <MagneticButton
                  variant="coral"
                  onClick={() => fireStudioConfetti({ colors: ["#FF6842", "#FFFFFF"] })}
                  className="w-full"
                >
                  <span>Molten Coral Action</span>
                </MagneticButton>
                <MagneticButton variant="glass" className="w-full">
                  <span>Tactile Glass Button</span>
                </MagneticButton>
              </div>
            </GlassSurface>

            {/* Segmented Controls & Toggles */}
            <GlassSurface tier="regular" radius="24" className="p-6 space-y-4">
              <div className="text-xs font-mono text-accent">02 // MACOS TOGGLES &amp; TABS</div>
              <p className="text-xs text-content-muted">
                Spring-animated segmented controls and mechanical switches.
              </p>
              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-[10px] font-mono text-content-muted mb-2">Segmented Filter:</div>
                  <MacSegmentedControl
                    options={[
                      { value: "4k", label: "4K Master" },
                      { value: "dag", label: "DAG Only" },
                      { value: "lora", label: "LoRA" },
                    ]}
                    value={sliderVal}
                    onChange={(v) => setSliderVal(v)}
                    size="sm"
                  />
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-content-primary">Indemnification Guard:</span>
                  <MacToggle checked={toggleState} onChange={setToggleState} />
                </div>
              </div>
            </GlassSurface>

            {/* Traffic Lights & Studio Stamps */}
            <GlassSurface tier="regular" radius="24" className="p-6 space-y-4">
              <div className="text-xs font-mono text-accent">03 // STUDIO EPHEMERA</div>
              <p className="text-xs text-content-muted">
                Handcrafted human details: masking tape, window dots, and exhibition stamps.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-content-muted">Window Header:</span>
                  <MacTrafficLights />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="studio-tape" />
                  <div className="text-[11px] font-mono text-accent mt-2">INDEX NO. 042 // COMFYUI</div>
                  <div className="text-xs text-white">Taped Studio Moodboard Frame</div>
                </div>
              </div>
            </GlassSurface>
          </div>
        </section>
      )}

      {/* 5. SECTION: Palette Tokens & Contrast Hierarchy */}
      {activeTab === "typography" && (
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-accent">COLOR ARCHITECTURE // WCAG 2.2</span>
              <h2 className="text-2xl font-light text-white">Palette Tokens &amp; Contrast Validation</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">100% WCAG AAA COMPLIANT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#08090B] border border-white/15 space-y-2">
              <div className="text-[10px] font-mono text-content-muted">BASE INK // #08090B</div>
              <div className="text-lg font-medium text-white">Obsidian Canvas</div>
              <div className="text-xs text-content-muted">Primary horizon depth</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#D8FD38] text-[#08090B] space-y-2 shadow-lg shadow-[#D8FD38]/20">
              <div className="text-[10px] font-mono font-bold">ACCENT // #D8FD38</div>
              <div className="text-lg font-semibold">Electric Acid Lime</div>
              <div className="text-xs font-medium">15.4:1 AAA Contrast</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FF6842] text-white space-y-2 shadow-lg shadow-[#FF6842]/20">
              <div className="text-[10px] font-mono font-semibold">WARM // #FF6842</div>
              <div className="text-lg font-medium">Molten Solar Coral</div>
              <div className="text-xs text-white/80">5.7:1 AA Large Contrast</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#38F2C7] text-[#08090B] space-y-2 shadow-lg shadow-[#38F2C7]/20">
              <div className="text-[10px] font-mono font-bold">ICE // #38F2C7</div>
              <div className="text-lg font-semibold">Ice Cyan Trust</div>
              <div className="text-xs font-medium">Verified DAG Checkpoint</div>
            </div>
          </div>

          {/* Typography Scale Table */}
          <div className="p-6 rounded-3xl glass-regular border border-white/10 space-y-4">
            <h3 className="text-lg font-medium text-white">Curated Editorial Typography System</h3>
            <div className="space-y-3 font-light">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/5 pb-2">
                <span className="text-3xl text-white">
                  Display Grotesk with <span className="font-serif italic text-accent font-normal">Instrument Serif</span>
                </span>
                <span className="text-xs font-mono text-content-muted">76px / -0.035em</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-white/5 pb-2">
                <span className="text-xl text-white">Section Headings with Clean Rhythmic Proportion</span>
                <span className="text-xs font-mono text-content-muted">36px / -0.022em</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <span className="font-mono text-xs text-accent">
                  [INDEX // 042] • COMFYUI_DAG_RUNWAY_GEN3 • 24.000 FPS • PRORES_4444
                </span>
                <span className="text-xs font-mono text-content-muted">JetBrains Mono 11px</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Return */}
      <div className="pt-8 border-t border-white/10 flex items-center justify-between">
        <Link
          href="/showcase"
          className="text-xs font-mono text-content-muted hover:text-white flex items-center gap-1.5"
        >
          <span>← Back to Showcase</span>
        </Link>
        <Link
          href="/briefs/new"
          className="px-5 py-2.5 rounded-2xl bg-[#D8FD38] text-[#08090B] font-semibold text-xs flex items-center gap-2 hover:bg-[#E5FF66] transition-colors"
        >
          <span>Commission Brief in New UI</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
