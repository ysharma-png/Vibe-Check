"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Sparkles, Video, Image as ImageIcon, Volume2, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

interface ToolSpec {
  id: string;
  name: string;
  category: "video" | "image" | "upscale" | "audio";
  categoryLabel: string;
  description: string;
  creatorCount: number;
  licenseStatus: "indemnified" | "permissive" | "audit_required";
  licenseLabel: string;
  featuredBadge?: string;
  tagline: string;
  versionBadge: string;
}

const TOOLS_CATALOG: ToolSpec[] = [
  {
    id: "comfy-ui",
    name: "ComfyUI Node DAGs",
    category: "upscale",
    categoryLabel: "Graph Pipeline",
    description: "Modular node-based diffusion graphs. Full JSON workflow handover ensures 100% reproducible frames across studio environments.",
    creatorCount: 38,
    licenseStatus: "indemnified",
    licenseLabel: "Deterministic Handover",
    featuredBadge: "Core Standard",
    tagline: "Deterministic Graph Handover",
    versionBadge: "v0.3.14",
  },
  {
    id: "flux-1-dev",
    name: "FLUX.1 [dev]",
    category: "image",
    categoryLabel: "Latent Checkpoint",
    description: "State-of-the-art 12B parameter flow transformer with unmatched prompt typography and spatial anatomy fidelity.",
    creatorCount: 34,
    licenseStatus: "permissive",
    licenseLabel: "Permissive Non-Comm",
    featuredBadge: "Industry Benchmark",
    tagline: "Photoreal Anatomic Fidelity",
    versionBadge: "12B BFL",
  },
  {
    id: "runway-gen-3",
    name: "Runway Gen-3 Alpha",
    category: "video",
    categoryLabel: "Camera Motion",
    description: "High-fidelity kinematic video diffusion supporting director-controlled orbits, crane pan-zooms, and dolly shots.",
    creatorCount: 29,
    licenseStatus: "indemnified",
    licenseLabel: "Indemnified",
    featuredBadge: "Cinematic Standard",
    tagline: "Director-Controlled Motion",
    versionBadge: "Turbo 4K",
  },
  {
    id: "animatediff",
    name: "AnimateDiff Motion",
    category: "video",
    categoryLabel: "Latent Video",
    description: "Motion module injection into ComfyUI pipelines for character-consistent 24fps narrative animation with temporal lock.",
    creatorCount: 24,
    licenseStatus: "indemnified",
    licenseLabel: "Indemnified",
    tagline: "Character-Locked Keyframes",
    versionBadge: "v3 Beta",
  },
  {
    id: "topaz-video-ai",
    name: "Topaz Video AI 5",
    category: "upscale",
    categoryLabel: "ProRes 4K Master",
    description: "Neural frame interpolation to 60fps and 4K/8K resolution enhancement calibrated specifically for commercial broadcast.",
    creatorCount: 31,
    licenseStatus: "indemnified",
    licenseLabel: "Indemnified",
    tagline: "Broadcast Quality Upscale",
    versionBadge: "ProRes 4444",
  },
  {
    id: "midjourney-v6",
    name: "Midjourney v6.1",
    category: "image",
    categoryLabel: "Aesthetic Direction",
    description: "High-texture aesthetic synthesis for moodboards, lookbooks, and luxury commercial concepting before 3D video passes.",
    creatorCount: 27,
    licenseStatus: "permissive",
    licenseLabel: "Commercial Rights",
    tagline: "Luxury Creative Concepting",
    versionBadge: "v6.1 RAW",
  },
  {
    id: "kling-ai",
    name: "Kling AI 1.5",
    category: "video",
    categoryLabel: "Physical Dynamics",
    description: "Realistic fluid and fabric physics simulation with up to 10-second continuous temporal coherence and prompt precision.",
    creatorCount: 19,
    licenseStatus: "indemnified",
    licenseLabel: "Indemnified",
    tagline: "Fluid & Fabric Dynamics",
    versionBadge: "1080p Pro",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Voice & SFX",
    category: "audio",
    categoryLabel: "Voice & Sound Design",
    description: "Studio-grade neural voice synthesis and procedural sound effects mapped to video timestamps and emotional arcs.",
    creatorCount: 22,
    licenseStatus: "indemnified",
    licenseLabel: "Indemnified",
    tagline: "Timestamped SFX & Voice",
    versionBadge: "Multilingual v2",
  },
  {
    id: "luma-dream",
    name: "Luma Dream Machine",
    category: "video",
    categoryLabel: "Rapid Prototyping",
    description: "Fast multi-shot camera generation for animatics, lighting studies, and client pitch deck interactive pre-viz.",
    creatorCount: 16,
    licenseStatus: "audit_required",
    licenseLabel: "Audit Required",
    tagline: "Rapid Pitch Deck Animatics",
    versionBadge: "Ray 1.6",
  },
];

type CategoryFilter = "all" | "video" | "image" | "upscale" | "audio";

export function LandingToolsWall() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const filteredTools = selectedCategory === "all"
    ? TOOLS_CATALOG
    : TOOLS_CATALOG.filter((t) => t.category === selectedCategory);

  return (
    <section className="relative py-28 px-6 border-b border-white/[0.08] bg-[#08090B] overflow-hidden">
      {/* Background Optical Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-[#38F2C7]/5 via-[#D8FD38]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-14 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#D8FD38] backdrop-blur-md">
              <Cpu className="h-3.5 w-3.5 text-[#D8FD38]" />
              <span className="tracking-widest uppercase">Verified Toolchains &amp; Pipelines</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-white tracking-tight leading-[1.08]">
              The <span className="font-serif italic font-normal text-[#D8FD38]">Generative Engine</span> Wall
            </h2>

            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Filter creators by their deterministic production stack. From raw ComfyUI node DAGs and FLUX transformers to Topaz 4K broadcast mastering.
            </p>
          </div>

          {/* Category Filter Pills — macOS Segmented Dock Capsule */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-glass">
            {(
              [
                { id: "all", label: "All Engines" },
                { id: "video", label: "Video Diffusion" },
                { id: "image", label: "Image & LoRA" },
                { id: "upscale", label: "Graphs & 4K" },
                { id: "audio", label: "Audio & SFX" },
              ] as const
            ).map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 font-sans ${
                    active
                      ? "text-black font-semibold bg-[#D8FD38] shadow-[0_0_20px_rgba(216,253,56,0.35)]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid with Glass Surfaces */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/about?tools=${encodeURIComponent(tool.id)}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D8FD38]"
            >
              <GlassSurface
                tier="regular"
                rounded="24"
                className="h-full p-6 flex flex-col justify-between space-y-6 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#D8FD38]/40 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_30px_rgba(216,253,56,0.12)]"
              >
                {/* Top Bar with Traffic Lights & Chips */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <MacTrafficLights size="sm" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60">
                        {tool.versionBadge}
                      </span>
                      {tool.featuredBadge && (
                        <span className="text-[10px] font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#D8FD38]/10 text-[#D8FD38] border border-[#D8FD38]/25">
                          {tool.featuredBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tool Identity */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#38F2C7]">
                        {tool.categoryLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-semibold text-white group-hover:text-[#D8FD38] transition-colors mt-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs font-mono text-white/50 mt-1">
                      {tool.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/70 line-clamp-3 leading-relaxed font-light">
                    {tool.description}
                  </p>
                </div>

                {/* Footer with Verified Studios & Arrow */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38F2C7] animate-pulse" />
                    <span className="text-xs font-mono text-white/80">
                      <strong className="text-white font-semibold">{tool.creatorCount}</strong> studios verified
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8FD38] group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </GlassSurface>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
