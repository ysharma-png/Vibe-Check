"use client";

import React from "react";
import { CreativeBrief } from "@/types/schema";
import { calculateMilestoneAmounts, formatUsd, validateMilestonesSum } from "@/lib/brief/budget";
import { countMatchingCreators } from "@/lib/brief/match-bridge";
import {
  ShieldCheck,
  Users,
  AlertCircle,
  ArrowRight,
  FileText,
  DollarSign,
} from "lucide-react";

import { GlassSurface } from "@/components/glass/GlassSurface";

interface BriefSummaryCardProps {
  readonly brief: Partial<CreativeBrief>;
  readonly missingFields: readonly string[];
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly onSubmit: () => void;
}

export function BriefSummaryCard({
  brief,
  missingFields,
  isValid,
  isSubmitting,
  onSubmit,
}: BriefSummaryCardProps) {
  const matchingCreatorsCount = countMatchingCreators(brief);
  const totalBudget = brief.totalBudgetUsd ?? 0;
  const milestones = brief.milestones ?? [];
  const milestoneAmounts = calculateMilestoneAmounts(milestones, totalBudget);

  // Generate plain-English rights summary
  const rightsText = (() => {
    const rights = brief.commercialTerms?.rightsModel;
    const territory = brief.commercialTerms?.territory === "worldwide" ? "worldwide" : "within regional territories";
    const handover = brief.commercialTerms?.sourceHandover ?? [];

    const handoverParts: string[] = [];
    if (handover.includes("prompts_and_seeds")) handoverParts.push("prompts & seeds");
    if (handover.includes("project_files")) handoverParts.push("project files");
    if (handover.includes("node_graph")) handoverParts.push("ComfyUI workflow graph");
    if (handover.includes("lora_weights")) handoverParts.push("LoRA model weights");

    const handoverStr =
      handoverParts.length > 0 ? `Creator hands over ${handoverParts.join(", ")}.` : "";

    if (rights === "perpetual_buyout") {
      return `You will own all rights ${territory} in perpetuity. ${handoverStr}`;
    } else if (rights === "term_license") {
      const months = brief.commercialTerms?.termMonths ?? 12;
      return `Exclusive ${months}-month flight license ${territory}. ${handoverStr}`;
    } else if (rights === "usage_based") {
      return `Usage-scoped commercial license ${territory}. ${handoverStr}`;
    }
    return `Commercial license ${territory}. ${handoverStr}`;
  })();

  return (
    <GlassSurface
      tier="thick"
      rounded="32"
      className="p-6 border border-white/10 shadow-2xl space-y-5 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">Campaign Spec Sheet</h3>
        <span className="text-[11px] font-mono text-accent">Live Draft</span>
      </div>

      {/* Campaign Details Snapshot */}
      <div>
        <div className="text-[11px] font-mono text-white/50">{brief.brandName || "Brand pending"}</div>
        <div className="text-base font-display font-medium text-white truncate mt-0.5">
          {brief.campaignTitle || "Untitled generative campaign"}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {brief.deliverableType && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-white/70 border border-white/10 capitalize">
              {brief.deliverableType.replace(/_/g, " ")}
            </span>
          )}
          {brief.aspectRatios && brief.aspectRatios.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent/20 border border-accent/40 text-accent font-semibold">
              {brief.aspectRatios.join(", ")}
            </span>
          )}
          {brief.resolution && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-white/70 border border-white/10">
              {brief.resolution}
            </span>
          )}
          {brief.durationSec && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-white/70 border border-white/10">
              {brief.durationSec}s
            </span>
          )}
        </div>
      </div>

      {/* Total Budget & Escrow */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-white/50">Total Budget</span>
          <span className="text-lg font-bold font-mono text-white">
            {totalBudget > 0 ? formatUsd(totalBudget) : "Unset"}
          </span>
        </div>

        {/* Milestone Schedule Mini-Table */}
        {milestones.length > 0 && (
          <div className="space-y-1.5 pt-2.5 border-t border-white/10">
            {milestoneAmounts.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-[11px] font-mono text-white/60"
              >
                <span className="truncate max-w-[140px]">{m.name}</span>
                <span className="text-white font-medium">
                  {m.percentOfBudget}% ({formatUsd(m.amountUsd)})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commercial Rights Summary */}
      <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1 backdrop-blur-md">
        <span className="text-[11px] font-mono font-medium text-white block">
          Rights &amp; Governance
        </span>
        <p className="text-[11px] text-white/60 leading-relaxed font-light">{rightsText}</p>
      </div>

      {/* Real-time Qualifying Creators Count */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
        <span className="text-xs font-mono text-white/70">Candidate Pool</span>
        <span className="text-xs font-bold text-accent font-mono">
          {matchingCreatorsCount} creator{matchingCreatorsCount === 1 ? "" : "s"} qualify
        </span>
      </div>

      {/* Missing Fields Gate */}
      {!isValid && missingFields.length > 0 && (
        <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-1 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Required to publish ({missingFields.length})</span>
          </div>
          <ul className="text-[11px] text-white/70 space-y-0.5 list-disc list-inside font-light">
            {missingFields.slice(0, 3).map((f) => (
              <li key={f} className="truncate">
                {f}
              </li>
            ))}
            {missingFields.length > 3 && (
              <li className="text-white/40">+{missingFields.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || !isValid}
        className={`w-full py-3 px-4 rounded-2xl font-mono font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
          isValid
            ? "bg-accent text-[#08090B] hover:bg-accent/90 shadow-glow-lime hover:scale-[1.01]"
            : "bg-white/[0.04] text-white/30 cursor-not-allowed border border-white/10"
        }`}
      >
        {isSubmitting ? (
          <span>Publishing brief...</span>
        ) : (
          <>
            <span>Post &amp; match creators</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </GlassSurface>
  );
}
