"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Legal & IP",
    question: "How does CacheFlow guarantee commercial copyright clearance and indemnification?",
    answer:
      "All verified creators agree to our Base Model Policy. Deliverables must be generated exclusively using commercially indemnified or permissive open checkpoints (such as FLUX.1 [dev/schnell], SDXL commercial licenses, or licensed studio models). CacheFlow issues a timestamped provenance receipt containing the checkpoint hash, LoRA training manifest, and commercial buyout certificate upon project handover.",
  },
  {
    category: "Technical DAG",
    question: "What is ComfyUI DAG node graph handover and why is it essential?",
    answer:
      "Traditional marketplaces deliver only an opaque MP4 or PNG file. If your brand needs to adjust lighting or swap a product color 6 months later, you must start from scratch. CacheFlow creators handover the exact ComfyUI workflow (.json), character LoRA weights, seed tables, and prompt manifests. This guarantees your internal team can reproduce and iterate on any frame indefinitely.",
  },
  {
    category: "Smart Escrow",
    question: "How does milestone escrow protect both brands and creators?",
    answer:
      "When a creative brief is awarded, the agreed project budget is locked into CacheFlow Escrow. Funds are never released until the brand reviews and approves milestone deliverables (e.g. Milestone 1: Character LoRA test; Milestone 2: Rough cut 30s; Milestone 3: 4K Master + DAG Handover). Creators are guaranteed payment upon approval with zero chargeback risk.",
  },
  {
    category: "Deterministic Vetting",
    question: "What vetting tests must creators pass to earn the Verified badge?",
    answer:
      "Creators must pass our 3-part verification protocol: (1) Identity & business entity KYC; (2) Deterministic pipeline audit where our automated test runner re-generates frames from their submitted ComfyUI DAG to verify consistency; and (3) Commercial clearance inspection verifying no copyrighted IP was used in custom model checkpoints.",
  },
  {
    category: "Transparent Pricing",
    question: "What are the platform fees for hiring AI creators?",
    answer:
      "Posting briefs and browsing the talent directory is completely free. CacheFlow charges a transparent 5% platform fee on funded escrow milestones for brands. Creators keep 95% of their project earnings with automated milestone payouts in USD or EUR.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="relative py-28 px-6 border-b border-white/[0.08] bg-[#0E1114]/50 backdrop-blur-xl overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-10 right-1/3 w-[500px] h-[500px] bg-[#38F2C7]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-14 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#D8FD38] backdrop-blur-md">
            <HelpCircle className="h-3.5 w-3.5 text-[#D8FD38]" />
            <span className="tracking-widest uppercase">Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-white tracking-tight leading-[1.08]">
            Clear answers on <br />
            <span className="font-serif italic font-normal text-[#D8FD38]">rights, code, &amp; payouts</span>.
          </h2>

          <p className="text-sm sm:text-base text-white/60 font-light max-w-xl mx-auto leading-relaxed">
            Everything you need to know about commissioning commercial generative media safely and reproducibly.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <GlassSurface
                key={idx}
                tier={isOpen ? "regular" : "thin"}
                rounded="20"
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-[#D8FD38]/40 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(216,253,56,0.08)]"
                    : "hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#38F2C7]">
                      {item.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-display font-medium text-white">
                      {item.question}
                    </h3>
                  </div>

                  <div className={`p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[#D8FD38]/10 border-[#D8FD38]/30 text-[#D8FD38]" : "text-white/60"
                  }`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-white/70 leading-relaxed font-light border-t border-white/[0.06] bg-black/20">
                    <p>{item.answer}</p>
                  </div>
                )}
              </GlassSurface>
            );
          })}
        </div>
      </div>
    </section>
  );
}
