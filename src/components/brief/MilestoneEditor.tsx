"use client";

import React from "react";
import { Milestone } from "@/types/schema";
import {
  autoBalanceMilestones,
  calculateMilestoneAmounts,
  formatUsd,
  validateMilestonesSum,
} from "@/lib/brief/budget";
import { FieldProvenance } from "./FieldProvenance";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";
import { Plus, Trash2, Wand2, Check, AlertTriangle } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";

interface MilestoneEditorProps {
  readonly milestones: Milestone[];
  readonly totalBudgetUsd: number;
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly onUpdateMilestones: (milestones: Milestone[]) => void;
  readonly onClearProvenance: (field: string) => void;
}

export function MilestoneEditor({
  milestones,
  totalBudgetUsd,
  confidence,
  evidence,
  onUpdateMilestones,
  onClearProvenance,
}: MilestoneEditorProps) {
  const sumCheck = validateMilestonesSum(milestones);
  const milestonesWithAmounts = calculateMilestoneAmounts(milestones, totalBudgetUsd);

  const handleUpdateMilestone = (index: number, partial: Partial<Milestone>) => {
    onClearProvenance("milestones");
    const next = [...milestones];
    const current = next[index];
    if (current) {
      next[index] = { ...current, ...partial };
      onUpdateMilestones(next);
    }
  };

  const handleRemoveMilestone = (index: number) => {
    onClearProvenance("milestones");
    if (milestones.length <= 1) return;
    const next = milestones.filter((_, i) => i !== index);
    onUpdateMilestones(next);
  };

  const handleAddMilestone = () => {
    onClearProvenance("milestones");
    const newMilestone: Milestone = {
      id: `m-custom-${Date.now()}`,
      name: `Phase ${milestones.length + 1}`,
      description: "Intermediate delivery review and asset handoff",
      percentOfBudget: 0,
      deliverable: "Draft Assets & Review Link",
    };
    onUpdateMilestones([...milestones, newMilestone]);
  };

  const handleAutoBalance = () => {
    onClearProvenance("milestones");
    const balanced = autoBalanceMilestones(milestones);
    onUpdateMilestones(balanced);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-content-primary">
              Escrow Milestone Schedule ({milestones.length} Stages)
            </h4>
            <FieldProvenance
              confidence={confidence.milestones}
              evidence={evidence.milestones}
              fieldName="Escrow Milestones"
              onConfirm={() => onClearProvenance("milestones")}
            />
          </div>
          <p className="text-xs text-content-muted mt-0.5">
            Funds are locked in escrow and released only upon client approval of each phase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoBalance}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8FD38]/30 bg-[#D8FD38]/10 hover:bg-[#D8FD38]/20 text-[#D8FD38] text-xs font-medium transition-all shrink-0 self-start sm:self-auto shadow-sm"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Auto-Balance to 100%
        </button>
      </div>

      {/* Progress & Validation Meter */}
      <GlassSurface tier="regular" rounded="16" className="p-4 space-y-2.5 border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            {sumCheck.valid ? (
              <span className="flex items-center gap-1 text-[#38F2C7] font-medium">
                <Check className="h-3.5 w-3.5" />
                Valid: Sums to exactly 100%
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                {sumCheck.diff > 0
                  ? `${sumCheck.diff}% remaining to allocate`
                  : `${Math.abs(sumCheck.diff)}% over allocated`}
              </span>
            )}
          </div>
          <span className="font-mono text-white text-xs font-semibold">{sumCheck.sum}% / 100%</span>
        </div>

        <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden flex border border-white/5">
          {milestones.map((m, idx) => {
            const colors = [
              "bg-[#D8FD38]",
              "bg-[#38F2C7]",
              "bg-[#FF6842]",
              "bg-[#F59E0B]",
              "bg-[#A78BFA]",
            ];
            const color = colors[idx % colors.length];

            return (
              <div
                key={m.id}
                style={{ width: `${Math.max(0, m.percentOfBudget)}%` }}
                className={`h-full ${color} transition-all duration-300 shadow-sm`}
                title={`${m.name}: ${m.percentOfBudget}%`}
              />
            );
          })}
        </div>
      </GlassSurface>

      {/* Milestone Cards */}
      <div className="space-y-3">
        {milestonesWithAmounts.map((m, idx) => {
          return (
            <GlassSurface
              key={m.id}
              tier="thin"
              rounded="20"
              className="p-4 border-white/10 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] text-white/70 font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => handleUpdateMilestone(idx, { name: e.target.value })}
                    placeholder="Milestone phase title..."
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#D8FD38]/60 focus:bg-white/[0.07]"
                  />
                </div>

                {/* Percentage & USD Pill */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/10">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={m.percentOfBudget}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleUpdateMilestone(idx, {
                          percentOfBudget: isNaN(val) ? 0 : Math.max(0, Math.min(100, val)),
                        });
                      }}
                      className="w-10 bg-transparent text-right text-xs font-mono font-medium text-[#D8FD38] focus:outline-none"
                    />
                    <span className="text-xs text-white/50 font-mono">%</span>
                  </div>

                  <span className="text-xs text-[#38F2C7] font-mono font-medium min-w-16 text-right">
                    {formatUsd(m.amountUsd)}
                  </span>

                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      aria-label={`Remove milestone ${m.name}`}
                      className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Deliverable description */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="text"
                  value={m.deliverable}
                  onChange={(e) => handleUpdateMilestone(idx, { deliverable: e.target.value })}
                  placeholder="Required deliverable artifact (e.g. 4K Keyframe Renders, Rough Cut MP4)..."
                  className="flex-1 px-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70 placeholder-white/30 focus:outline-none focus:border-[#D8FD38]/40 focus:bg-white/[0.05]"
                />
              </div>
            </GlassSurface>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddMilestone}
        className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-[#D8FD38]/40 bg-white/[0.02] hover:bg-white/[0.05] text-xs text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 font-mono"
      >
        <Plus className="h-3.5 w-3.5 text-[#D8FD38]" />
        Add Escrow Milestone Phase
      </button>
    </div>
  );
}
