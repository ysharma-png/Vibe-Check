"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Lock, Award, Sparkles, Building2, Flame } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";

const ENTERPRISE_BRANDS = [
  { name: "Nike Studios", role: "Athletic Generative Film" },
  { name: "Pulse Energy", role: "Hyper-Speed Social Shorts" },
  { name: "CyberArts Global", role: "Sci-Fi Series Worldbuilding" },
  { name: "Horizon Media", role: "Interactive 3D Visualizer" },
  { name: "Apex Motion", role: "Virtual Production Commercials" },
];

export function LandingTrustStrip() {
  return (
    <section className="relative border-b border-white/[0.08] bg-[#08090B] py-16 px-6 overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E1114]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Core Metric Counters as Glass Capsules */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <GlassSurface
            tier="thin"
            rounded="20"
            className="p-5.5 text-center space-y-2 hover:border-[#D8FD38]/30 transition-all duration-300 group"
          >
            <div className="text-3xl sm:text-4xl font-display font-light text-white tracking-tight">
              $450k<span className="text-[#D8FD38] font-normal group-hover:drop-shadow-[0_0_12px_rgba(216,253,56,0.6)] transition-all">+</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50">
              Escrow Volume Paid
            </div>
          </GlassSurface>

          <GlassSurface
            tier="thin"
            rounded="20"
            className="p-5.5 text-center space-y-2 hover:border-[#38F2C7]/30 transition-all duration-300 group"
          >
            <div className="text-3xl sm:text-4xl font-display font-light text-white tracking-tight">
              100<span className="text-[#38F2C7] font-normal group-hover:drop-shadow-[0_0_12px_rgba(56,242,199,0.6)] transition-all">%</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50">
              Deterministic Audited
            </div>
          </GlassSurface>

          <GlassSurface
            tier="thin"
            rounded="20"
            className="p-5.5 text-center space-y-2 hover:border-[#D8FD38]/30 transition-all duration-300 group"
          >
            <div className="text-3xl sm:text-4xl font-display font-light text-white tracking-tight">
              40<span className="text-[#D8FD38] font-normal group-hover:drop-shadow-[0_0_12px_rgba(216,253,56,0.6)] transition-all">+</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50">
              Elite Vetted Studios
            </div>
          </GlassSurface>

          <GlassSurface
            tier="thin"
            rounded="20"
            className="p-5.5 text-center space-y-2 hover:border-[#38F2C7]/30 transition-all duration-300 group"
          >
            <div className="text-3xl sm:text-4xl font-display font-light text-white tracking-tight">
              0<span className="text-[#38F2C7] font-normal group-hover:drop-shadow-[0_0_12px_rgba(56,242,199,0.6)] transition-all"> Claims</span>
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50">
              IP Infringement Record
            </div>
          </GlassSurface>
        </div>

        {/* Enterprise Brand Trust Row */}
        <div className="pt-2 text-center space-y-5">
          <p className="text-[11px] uppercase font-mono tracking-widest text-white/40">
            Trusted by Commercial Directors &amp; Generative Producers At
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            {ENTERPRISE_BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default group"
              >
                <Building2 className="h-4 w-4 text-white/40 group-hover:text-[#D8FD38] transition-colors" />
                <span className="text-xs sm:text-sm font-display font-medium text-white/70 tracking-wider uppercase group-hover:text-white transition-colors">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Bar — Obsidian Glass Ribbon */}
        <GlassSurface
          tier="thin"
          rounded="24"
          className="p-4.5 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-mono text-[#38F2C7] border-[#38F2C7]/20 shadow-[0_0_30px_rgba(56,242,199,0.06)]"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#38F2C7] shrink-0" />
            <span className="text-white/80">Clean Base Model Licensing Only (Zero Scraped IP)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#38F2C7] shrink-0" />
            <span className="text-white/80">Full ComfyUI DAG Node-Graph &amp; LoRA Source Handover</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#38F2C7] shrink-0" />
            <span className="text-white/80">Milestone Escrow Protection via CacheFlow Smart Contract</span>
          </div>
        </GlassSurface>
      </div>
    </section>
  );
}
