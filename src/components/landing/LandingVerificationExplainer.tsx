"use client";

import React from "react";
import { Check, X, ShieldCheck, Cpu, Lock, FileCode, CheckCircle2, AlertTriangle } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

export function LandingVerificationExplainer() {
  const COMPARISON_ROWS = [
    {
      feature: "Workflow Reproducibility",
      traditional: "Black-box outputs. Cannot reproduce exact shot or camera angle if client requests revision.",
      cacheflow: "100% Deterministic ComfyUI DAG audit with locked seeds, model hashes, and LoRA weight tables.",
      isAdvantage: true,
    },
    {
      feature: "Commercial IP Indemnification",
      traditional: "No vetting of underlying checkpoints. Substantial risk of copyright infringement from unvetted scrapers.",
      cacheflow: "Base Model Clean Policy. Deliverables restricted exclusively to permissive and indemnified commercial checkpoints.",
      isAdvantage: true,
    },
    {
      feature: "Source Asset Handover",
      traditional: "Compressed final MP4 only. Creator retains prompt manifests, embeddings, and latent graph files.",
      cacheflow: "Complete source handover: JSON node workflows, trained character LoRAs, and seed manifests in studio vault.",
      isAdvantage: true,
    },
    {
      feature: "Payment Protection & Escrow",
      traditional: "Upfront deposits or high platform commissions (20-30%) with persistent chargeback and dispute risk.",
      cacheflow: "Milestone-backed smart escrow. Payouts trigger automatically upon technical deliverable approval.",
      isAdvantage: true,
    },
    {
      feature: "Talent Evaluation",
      traditional: "Subjective text reviews and easily fabricated static portfolios without source asset verification.",
      cacheflow: "Automated DAG inspection test runner with algorithmic Studio Portfolio Score (0-100).",
      isAdvantage: true,
    },
  ];

  return (
    <section className="relative py-28 px-6 border-b border-white/[0.08] bg-[#0E1114]/60 backdrop-blur-2xl overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#38F2C7]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#D8FD38]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#38F2C7] backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-[#38F2C7]" />
            <span className="tracking-widest uppercase">The CacheFlow Standard</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-white tracking-tight leading-[1.08]">
            Why commercial brands <br />
            <span className="font-serif italic font-normal text-[#38F2C7]">trust CacheFlow</span>.
          </h2>

          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Generative media demands rigorous technical accountability. Here is how our deterministic protocol eliminates production, legal, and delivery risks.
          </p>
        </div>

        {/* Comparison Matrix in macOS Glass Window */}
        <GlassSurface
          tier="thick"
          rounded="32"
          className="max-w-5xl mx-auto overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(56,242,199,0.08)]"
        >
          {/* macOS Window Header */}
          <div className="px-6 py-4.5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="text-xs font-mono text-white/40 tracking-wider uppercase ml-2 hidden sm:inline">
                Comparison Matrix • Technical Vetting Protocol
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#38F2C7] bg-[#38F2C7]/10 px-2.5 py-1 rounded-full border border-[#38F2C7]/20">
              <CheckCircle2 className="h-3 w-3" />
              <span>100% REPRODUCIBLE STANDARD</span>
            </div>
          </div>

          {/* Table Header Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-white/[0.08] bg-white/[0.02] text-xs font-mono">
            <div className="md:col-span-4 p-5 text-white/50 tracking-wider uppercase">
              Production Criteria
            </div>
            <div className="md:col-span-4 p-5 text-[#FF6842]/90 border-t md:border-t-0 md:border-l border-white/[0.08] tracking-wider uppercase flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-[#FF6842]" />
              <span>Traditional Marketplaces</span>
            </div>
            <div className="md:col-span-4 p-5 text-[#38F2C7] border-t md:border-t-0 md:border-l border-white/[0.08] bg-[#38F2C7]/[0.04] tracking-wider uppercase flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#38F2C7]" />
              <span>CacheFlow Verified Standard</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/[0.06]">
            {COMPARISON_ROWS.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 text-xs transition-colors hover:bg-white/[0.02]"
              >
                {/* Feature Label */}
                <div className="md:col-span-4 p-5.5 font-medium text-white flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-[#D8FD38] mt-1 shrink-0 shadow-[0_0_8px_rgba(216,253,56,0.5)]" />
                  <span className="font-display font-medium text-sm text-white/95">{row.feature}</span>
                </div>

                {/* Traditional Marketplace */}
                <div className="md:col-span-4 p-5.5 text-white/50 border-t md:border-t-0 md:border-l border-white/[0.08] flex items-start gap-3">
                  <div className="p-1 rounded-md bg-[#FF6842]/10 border border-[#FF6842]/20 shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-[#FF6842]" />
                  </div>
                  <span className="leading-relaxed font-light text-white/60">{row.traditional}</span>
                </div>

                {/* CacheFlow Standard */}
                <div className="md:col-span-4 p-5.5 text-white border-t md:border-t-0 md:border-l border-white/[0.08] bg-[#38F2C7]/[0.02] flex items-start gap-3">
                  <div className="p-1 rounded-md bg-[#38F2C7]/15 border border-[#38F2C7]/30 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[#38F2C7]" />
                  </div>
                  <span className="leading-relaxed font-normal text-white/90">{row.cacheflow}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassSurface>
      </div>
    </section>
  );
}
