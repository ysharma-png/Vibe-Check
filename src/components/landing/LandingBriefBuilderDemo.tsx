"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { parseBriefDeterministic } from "@/lib/brief/parse-nl";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MagneticButton } from "@/components/common/MagneticButton";

const DEMO_PRESET_BRIEFS = [
  {
    id: "preset-1",
    label: "Nike Cyberpunk Sprint (9:16)",
    text: "Looking for an AI director to produce a high-octane 30s social short for our futuristic running sneaker. Must be 9:16 vertical 4K with character consistency across 10 camera angles. Required tools: ComfyUI, FLUX.1 [dev], and Runway Gen-3. Budget $8,000.",
  },
  {
    id: "preset-2",
    label: "Luxury Skincare 3D Teaser (16:9)",
    text: "Need a photorealistic 16:9 widescreen 4K commercial spot highlighting iridescent glass serum droplet physics. Fluid dynamics and macro realism required using Midjourney v6.1 and Topaz upscale. Budget $12,000.",
  },
  {
    id: "preset-3",
    label: "Anime Worldbuilding Pilot",
    text: "Production studio seeking an AI animator for a 60s pilot sequence. Anime style with cel-shading LoRA and AnimateDiff motion modules in ComfyUI. Deliverable: animation in 1080p. Budget $5,500.",
  },
];

export function LandingBriefBuilderDemo() {
  const initialText = DEMO_PRESET_BRIEFS[0]?.text ?? "";
  const [inputText, setInputText] = useState(initialText);
  const [parsedResult, setParsedResult] = useState(() =>
    parseBriefDeterministic(initialText)
  );

  const handlePresetClick = (text: string) => {
    setInputText(text);
    setParsedResult(parseBriefDeterministic(text));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setParsedResult(parseBriefDeterministic(val));
  };

  const fields = parsedResult.fields;

  return (
    <section className="py-24 px-6 border-b border-white/10 bg-[#08090B]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <GlassSurface tier="thin" rounded="32" className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-mono text-[#D8FD38] border-[#D8FD38]/30">
            <Zap className="h-3.5 w-3.5 text-[#D8FD38]" />
            <span>INTERACTIVE BRIEF PARSER DEMO</span>
          </GlassSurface>
          <h2 className="text-3xl sm:text-5xl font-display font-light text-white tracking-tight">
            See how your brief is <span className="font-serif italic font-normal text-[#D8FD38]">structured in real-time</span>.
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Test CacheFlow&apos;s natural language extraction engine. Type any campaign idea or select a preset to see technical parameters extracted instantly.
          </p>
        </div>

        {/* Demo Widget Box */}
        <GlassSurface tier="thick" rounded="32" className="max-w-5xl mx-auto border-white/15 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8">
          {/* Top Bar with Mac Traffic Lights & Preset Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider mr-2">
                Try Preset:
              </span>
              {DEMO_PRESET_BRIEFS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetClick(p.text)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    inputText === p.text
                      ? "border border-[#D8FD38]/50 bg-[#D8FD38]/15 text-[#D8FD38] shadow-sm"
                      : "border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <MacTrafficLights title="brief_deterministic_parser.wasm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Textarea */}
            <div className="lg:col-span-6 space-y-3">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60 flex items-center justify-between">
                <span>Natural Language Campaign Prompt</span>
                <span className="text-[10px] text-[#D8FD38] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D8FD38] animate-ping" />
                  Live Parsing Active
                </span>
              </label>

              <textarea
                rows={7}
                value={inputText}
                onChange={handleInputChange}
                placeholder="Describe your generative video campaign..."
                className="w-full p-4 rounded-2xl border border-white/10 bg-white/[0.03] text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.06] font-sans leading-relaxed resize-none shadow-inner transition-all"
              />

              <p className="text-[11px] text-white/40 font-mono">
                Tip: Mention aspect ratios (9:16, 16:9), target tools (FLUX.1, ComfyUI, Runway), deliverables, and target budget.
              </p>
            </div>

            {/* Right: Parsed Technical Parameters Spec Card */}
            <GlassSurface tier="regular" rounded="24" className="lg:col-span-6 p-6 border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#D8FD38]" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Structured Parameter Output
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/25">
                  Ready to Match
                </span>
              </div>

              {/* Grid of Parsed Fields */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase">Deliverable</div>
                  <div className="font-semibold text-white capitalize truncate">
                    {(fields?.deliverableType || "Commercial spot").replace(/_/g, " ")}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase">Aspect Ratio</div>
                  <div className="font-semibold text-[#D8FD38] font-mono">
                    {fields?.aspectRatios?.join(", ") || "16:9, 9:16"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase">Resolution Target</div>
                  <div className="font-semibold text-white font-mono">
                    {fields?.resolution || "4K"} Master
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase">Budget Allocated</div>
                  <div className="font-semibold text-[#38F2C7] font-mono">
                    {fields?.totalBudgetUsd
                      ? `$${fields.totalBudgetUsd.toLocaleString()} USD`
                      : "$5,000 - $10,000 (Estimate)"}
                  </div>
                </div>
              </div>

              {/* Required Tools */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs">
                <div className="text-[10px] font-mono text-white/50 uppercase">
                  Inferred Toolchain Requirements
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(fields?.toolRequirements?.requiredToolIds?.length ?? 0) > 0 ? (
                    fields!.toolRequirements!.requiredToolIds.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/10 font-mono text-[11px] text-[#D8FD38]"
                      >
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40 text-[11px] font-mono">
                      Open to creator&apos;s verified toolchain choice
                    </span>
                  )}
                </div>
              </div>

              {/* Post Button */}
              <MagneticButton strength={0.25}>
                <Link
                  href="/briefs/new"
                  className="w-full py-3 px-4 rounded-xl bg-[#D8FD38] hover:bg-[#D8FD38]/90 text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D8FD38]/20 transition-all font-mono"
                >
                  <span>Publish This Brief &amp; Receive Proposals</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticButton>
            </GlassSurface>
          </div>
        </GlassSurface>
      </div>
    </section>
  );
}
