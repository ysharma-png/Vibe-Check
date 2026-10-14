"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, DollarSign } from "lucide-react";
import { PipelineStage, PortfolioItem } from "@/types/schema";
import { StageDetailPanel } from "./StageDetailPanel";
import { getToolById } from "@/lib/taxonomy";
import { calculatePipelineTotals } from "@/lib/provenance";

interface PipelineTimelineProps {
  readonly stages?: readonly PipelineStage[];
  readonly item?: PortfolioItem;
  readonly activeStageId: string | null;
  readonly onSelectStage: (stageId: string | null) => void;
}

export function PipelineTimeline({
  stages: propStages,
  item,
  activeStageId,
  onSelectStage,
}: PipelineTimelineProps) {
  const stages = propStages ?? item?.pipeline ?? [];

  const [expandedStageIds, setExpandedStageIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const firstStage = stages[0];
    if (firstStage) {
      initial.add(firstStage.id);
    }
    return initial;
  });

  const toggleExpand = (stageId: string) => {
    setExpandedStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  const totals = calculatePipelineTotals(stages);

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const isExpanded = expandedStageIds.has(stage.id);
        const isScrubberActive = activeStageId === stage.id;
        const tool = getToolById(stage.toolId);

        return (
          <div key={stage.id} className="relative">
            {/* Stage Accordion Card */}
            <div
              className={`rounded-2xl border transition-all ${
                isScrubberActive
                  ? "border-accent bg-surface shadow-soft ring-1 ring-accent/30"
                  : "border-surface-border bg-surface-subtle/50 hover:border-surface-border-hover"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  toggleExpand(stage.id);
                  onSelectStage(stage.id);
                }}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between p-3.5 text-left focus-visible:outline-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-surface border border-surface-border font-sans text-xs font-medium text-content-primary">
                    {stage.order + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-content-primary">
                        {stage.label}
                      </span>
                      <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-accent border border-surface-border">
                        {tool?.name ?? stage.toolId}
                      </span>
                    </div>
                    <p className="text-[11px] text-content-muted truncate mt-0.5">
                      {stage.outputPreview.caption}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-content-muted">
                    <span>{stage.durationSec}s</span>
                    <span>•</span>
                    <span className="text-content-primary">
                      ${stage.costUsd.toFixed(2)}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-content-muted transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Accordion Content with StageDetailPanel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-surface-border/60 bg-surface px-4 py-4"
                  >
                    <StageDetailPanel stage={stage} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
