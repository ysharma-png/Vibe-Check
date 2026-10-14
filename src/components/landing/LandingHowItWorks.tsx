"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  GitPullRequest,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Lock,
} from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MagneticButton } from "@/components/common/MagneticButton";

const WORKFLOW_STEPS = [
  {
    step: "01",
    id: "brief",
    icon: FileText,
    title: "1. Structure the Brief",
    subtitle: "AI Natural Language Parser",
    description:
      "Paste your campaign vision in plain language. Our AI parser automatically extracts target deliverables (16:9 4K spot, 9:16 social reel), camera speed constraints, clean base-model policies, and budget bands in seconds.",
    bullets: [
      "Natural language requirements extraction",
      "Aspect ratio & resolution parameter lock",
      "Base model policy (FLUX permissive, indemnified-only)",
    ],
    badge: "Instant Brief Spec",
    gradient: ["#08090B", "#16281E"],
  },
  {
    step: "02",
    id: "match",
    icon: Sparkles,
    title: "2. Algorithmic Match",
    subtitle: "Quantitative Pipeline Scoring",
    description:
      "Skip unvetted portfolios. CacheFlow scores top directors by exact toolchain alignment (e.g., ComfyUI + AnimateDiff + Topaz), past on-time delivery rate, and verified LoRA training consistency.",
    bullets: [
      "Exact toolchain overlap matching",
      "Deterministic graph verification audit",
      "Clear day rates & escrow milestone breakdown",
    ],
    badge: "92%+ Match Confidence",
    gradient: ["#08090B", "#0E2428"],
  },
  {
    step: "03",
    id: "collaborate",
    icon: GitPullRequest,
    title: "3. Inspect & Collaborate",
    subtitle: "Deterministic Pipeline Review",
    description:
      "Review milestones with technical certainty. Creators share checkpoint seeds, LoRA weights, and ComfyUI workflow JSONs directly in the studio viewer. Test reproducibility before releasing milestone payments.",
    bullets: [
      "Seed & LoRA checkpoint inspection",
      "Watermark-free ProRes & 4K frame proofs",
      "Direct pipeline collaboration workspace",
    ],
    badge: "DAG Audit Trail",
    gradient: ["#08090B", "#261712"],
  },
  {
    step: "04",
    id: "deliver",
    icon: CheckCircle,
    title: "4. Escrow Handover",
    subtitle: "Full IP & Commercial Buyout",
    description:
      "Full IP buyout without legal friction. Milestone escrow automatically releases upon approval. You receive master video deliverables, clean training receipts, and complete ComfyUI source node graphs.",
    bullets: [
      "Perpetual worldwide commercial clearance",
      "Complete node graph (.json) source handover",
      "Escrow release with zero chargeback risk",
    ],
    badge: "100% Indemnified",
    gradient: ["#08090B", "#14281A"],
  },
];

export function LandingHowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = WORKFLOW_STEPS[activeStepIndex] ?? WORKFLOW_STEPS[0]!;

  return (
    <section id="how-it-works" className="py-24 px-6 border-b border-white/10 bg-[#08090B] relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <GlassSurface tier="thin" rounded="32" className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-mono text-[#D8FD38] border-[#D8FD38]/30">
            <Cpu className="h-3.5 w-3.5 text-[#D8FD38]" />
            <span>HOW CACHEFLOW WORKS</span>
          </GlassSurface>
          <h2 className="text-3xl sm:text-5xl font-display font-light text-white tracking-tight">
            From raw concept to <span className="font-serif italic font-normal text-[#D8FD38]">commercial master</span>.
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Unlike black-box freelance platforms, CacheFlow guarantees repeatable technical workflows, clean base model licensing, and source node graph handover.
          </p>
        </div>

        {/* 4 Step Nav Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStepIndex === idx;
            return (
              <GlassSurface
                key={s.id}
                as="button"
                tier={isActive ? "thick" : "thin"}
                rounded="20"
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-[#D8FD38]/50 shadow-lg shadow-[#D8FD38]/10 text-white"
                    : "border-white/10 text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-white/40">{s.step}</span>
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-white/40"}`} />
                </div>
                <div className="text-xs font-semibold">{s.title.split(". ")[1]}</div>
                <div className="text-[11px] text-white/50 truncate mt-0.5 font-mono">{s.subtitle}</div>
              </GlassSurface>
            );
          })}
        </div>

        {/* Active Step Feature Card */}
        <GlassSurface tier="thick" rounded="32" className="max-w-5xl mx-auto p-8 sm:p-12 border-white/15 shadow-2xl relative overflow-hidden">
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${activeStep.gradient[0]}, ${activeStep.gradient[1]})`,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#D8FD38]/10 text-[#D8FD38] border border-[#D8FD38]/25">
                  Step {activeStep.step} • {activeStep.badge}
                </span>
                <span className="text-xs text-white/50 font-mono">{activeStep.subtitle}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
                {activeStep.title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed font-light">
                {activeStep.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {activeStep.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#D8FD38]" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <MagneticButton strength={0.25}>
                  <Link
                    href="/briefs/new"
                    className="px-5 py-2.5 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shadow-md shadow-[#D8FD38]/20 flex items-center gap-2 font-mono"
                  >
                    <span>Post Brief in Step {activeStep.step}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </MagneticButton>

                <button
                  type="button"
                  onClick={() => setActiveStepIndex((prev) => (prev + 1) % WORKFLOW_STEPS.length)}
                  className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1 font-mono"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Right Visual Sandbox Display */}
            <GlassSurface tier="regular" rounded="24" className="lg:col-span-5 p-6 border-white/10 space-y-4 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MacTrafficLights title="pipeline_inspector.json" />
                  <span>PIPELINE INSPECTOR</span>
                </div>
                <span className="text-[#38F2C7]">VERIFIED PASS</span>
              </div>

              {activeStepIndex === 0 && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="text-[10px] text-white/40">INPUT PROMPT:</div>
                    <div className="text-white text-[11px]">
                      &quot;Need a 9:16 cyberpunk sneaker video with character consistency in 4K.&quot;
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#D8FD38]/10 border border-[#D8FD38]/20 space-y-1 text-[#D8FD38] text-[11px]">
                    <div>✓ DELIVERABLE: Social Short Form</div>
                    <div>✓ ASPECT RATIO: 9:16 Vertical</div>
                    <div>✓ TOOLS: ComfyUI, FLUX.1 [dev], Topaz</div>
                  </div>
                </div>
              )}

              {activeStepIndex === 1 && (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Amara Okafor (@amara_flow)</div>
                      <div className="text-[11px] text-white/50 font-mono">FLUX.1 + AnimateDiff Specialist</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#D8FD38]">98% Match</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Min-Jun Park (@minjun_seoul)</div>
                      <div className="text-[11px] text-white/50 font-mono">Runway Gen-3 + Motion Control</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#D8FD38]">94% Match</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 2 && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/50">Base Checkpoint:</span>
                    <span className="text-white">flux1-dev-fp8.safetensors</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/50">Character LoRA:</span>
                    <span className="text-[#38F2C7]">kemi_v2 (0.85 weight)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/50">Seed Recheck:</span>
                    <span className="text-[#D8FD38]">Deterministic Pass</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 3 && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#38F2C7]/10 border border-[#38F2C7]/25 text-[#38F2C7] space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="h-4 w-4 text-[#38F2C7]" />
                      <span>Commercial IP Certificate Cleared</span>
                    </div>
                    <p className="text-[11px] text-[#38F2C7]/80">
                      All deliverables indemnified under CacheFlow Smart Contract #CF-2026-88.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/60 text-[11px] font-mono">
                    Download package includes: .mp4 (ProRes), .json (DAG), LoRA weights, seed table.
                  </div>
                </div>
              )}
            </GlassSurface>
          </div>
        </GlassSurface>
      </div>
    </section>
  );
}
