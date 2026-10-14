"use client";

import React, { useState } from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { ParsedBrief } from "@/lib/brief/parse-nl";

import { GlassSurface } from "@/components/glass/GlassSurface";
import { MagneticButton } from "@/components/common/MagneticButton";

export const SAMPLE_PROMPTS = [
  {
    id: "social-vertical",
    title: "Vertical social (TikTok/Reels)",
    text: "We need high-impact 9:16 vertical shorts for TikTok and Reels to launch Pulse Energy drink for Gen-Z athletes. Pacing must be kinetic and fast, 15 seconds duration, with crisp particle splash physics and neon typography. Budget is $4,500 with delivery in 3 weeks. No distorted hands or uncanny facial artifacts, avoid generic synth music, and no competitor beverage logos. We need the project files and prompt manifests.",
  },
  {
    id: "enterprise-commercial",
    title: "Enterprise 4K hero commercial",
    text: "Apex Motors is launching the Apex GT electric supercar hero campaign. We require a 30-second 4K broadcast commercial spot for television and YouTube widescreen 16:9. Because of corporate broadcast standards, our legal team is strict: we demand 100% indemnified models only, verified commercial subscriptions, and a worldwide perpetual buyout. Budget is $12,000 USD, deadline by December 15. Hand over all project files, prompts and seeds.",
  },
  {
    id: "vague-line",
    title: "Vague / unstructured request",
    text: "Need some cool AI visuals for our new fashion line launch next month, maybe video maybe pics, nothing cheesy or cheap looking.",
  },
] as const;

const PARSE_STAGES = [
  "Reading campaign intent & extracting requirements...",
  "Detecting distribution formats & aspect ratios...",
  "Checking commercial & IP compliance risk...",
  "Drafting balanced escrow milestone schedule...",
] as const;

interface AiBriefAssistantProps {
  readonly onBriefParsed: (parsed: ParsedBrief) => void;
  readonly questions: readonly string[];
  readonly engineUsed?: "deterministic" | "llm";
}

export function AiBriefAssistant({
  onBriefParsed,
  questions,
  engineUsed,
}: AiBriefAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const handleSelectSample = (text: string) => {
    setInputText(text);
  };

  const handleStructureBrief = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setStageIndex(0);

    const stageTimer1 = setTimeout(() => setStageIndex(1), 350);
    const stageTimer2 = setTimeout(() => setStageIndex(2), 700);
    const stageTimer3 = setTimeout(() => setStageIndex(3), 1050);

    try {
      const res = await fetch("/api/brief/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const parsed: ParsedBrief = await res.json();

      setTimeout(() => {
        onBriefParsed(parsed);
        setIsProcessing(false);
      }, 1400);
    } catch {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1400);
    } finally {
      () => {
        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        clearTimeout(stageTimer3);
      };
    }
  };

  return (
    <GlassSurface
      tier="thick"
      rounded="32"
      className="p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-display font-medium text-white">
              AI Brief Assistant
            </h2>
            {engineUsed && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-white/60 border border-white/10">
                {engineUsed === "llm" ? "AI (Claude)" : "Deterministic Rules"}
              </span>
            )}
          </div>
          <p className="text-xs text-white/60 mt-1 font-light">
            Describe your campaign in natural language to automatically extract technical specs, formats, and escrow phases.
          </p>
        </div>

        {/* Sample chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-white/40">Try sample:</span>
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.text)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white transition-all backdrop-blur-md"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative group">
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe your campaign (e.g. format, brand, budget, deadline, style references, and legal requirements)..."
          className="w-full px-4 py-3.5 rounded-2xl border border-white/10 bg-black/40 text-xs sm:text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none transition-colors leading-relaxed font-sans backdrop-blur-md"
        />
      </div>

      {/* Action Button & Staged Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-white/50 font-mono">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>{PARSE_STAGES[stageIndex]}</span>
            </div>
          ) : (
            <span>Extracts aspect ratios, negative constraints, budget escrow, and commercial terms.</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleStructureBrief}
          disabled={isProcessing || !inputText.trim()}
          className="h-10 px-6 rounded-2xl bg-accent hover:bg-accent/90 disabled:opacity-40 text-xs font-mono font-semibold text-[#08090B] transition-all flex items-center justify-center gap-2 shrink-0 shadow-glow-lime hover:scale-[1.02]"
        >
          {isProcessing ? (
            <>
              <div className="h-3 w-3 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin" />
              <span>Structuring brief...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Structure my brief</span>
            </>
          )}
        </button>
      </div>

      {/* Needs Confirmation / Questions Drawer */}
      {questions && questions.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Needs your confirmation ({questions.length})</span>
          </div>
          <ul className="text-xs text-white/70 space-y-1 list-disc list-inside font-light">
            {questions.map((q, idx) => (
              <li key={idx} className="leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassSurface>
  );
}
