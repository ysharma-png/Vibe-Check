"use client";

import React from "react";
import { Clock, DollarSign } from "lucide-react";
import { PipelineStage } from "@/types/schema";
import { CopyableMono } from "./CopyableMono";
import { getToolById } from "@/lib/taxonomy";

interface StageDetailPanelProps {
  readonly stage: PipelineStage;
}

export function StageDetailPanel({ stage }: StageDetailPanelProps) {
  const tool = getToolById(stage.toolId);

  return (
    <div className="space-y-4 text-xs">
      {/* Prompts Section */}
      <div className="space-y-2.5">
        <CopyableMono
          label="Generation prompt"
          text={stage.prompt}
          clampLines={2}
        />

        {stage.negativePrompt.trim().length > 0 && (
          <CopyableMono
            label="Negative prompt"
            text={stage.negativePrompt}
            clampLines={2}
          />
        )}
      </div>

      {/* Determinism & Checkpoint Verification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Seed */}
        <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5 space-y-1">
          <span className="text-[10px] text-content-muted block">
            RNG seed
          </span>
          {stage.seed !== null ? (
            <div className="font-mono text-xs text-content-primary flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
              <span>{stage.seed}</span>
            </div>
          ) : (
            <div className="text-[11px] text-content-muted flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-caution" />
              <span>Non-deterministic SaaS tool</span>
            </div>
          )}
        </div>

        {/* Checkpoint Hash */}
        <div className="rounded-xl border border-surface-border bg-surface-subtle p-2.5 space-y-1">
          <span className="text-[10px] text-content-muted block">
            Checkpoint hash
          </span>
          {stage.checkpointHash ? (
            <div className="font-mono text-xs text-content-primary truncate">
              {stage.checkpointHash}
            </div>
          ) : (
            <span className="text-[11px] text-content-muted">Cloud managed</span>
          )}
        </div>
      </div>

      {/* Sampler, Steps, CFG */}
      {(stage.sampler || stage.steps || stage.cfg) && (
        <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl border border-surface-border bg-surface-subtle text-[11px] font-mono text-content-muted">
          {stage.sampler && (
            <span>
              Sampler: <strong className="text-content-primary font-normal">{stage.sampler}</strong>
            </span>
          )}
          {stage.steps && (
            <span>
              Steps: <strong className="text-content-primary font-normal">{stage.steps}</strong>
            </span>
          )}
          {stage.cfg && (
            <span>
              CFG: <strong className="text-content-primary font-normal">{stage.cfg}</strong>
            </span>
          )}
        </div>
      )}

      {/* LoRAs with weight bars (Hidden when 0) */}
      {stage.loras && stage.loras.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-content-muted block">
            Active LoRAs ({stage.loras.length})
          </span>
          <div className="space-y-1.5">
            {stage.loras.map((lora, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-surface-subtle border border-surface-border text-[11px]"
              >
                <span className="font-mono text-content-primary truncate">
                  {lora.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, lora.weight * 100))}%` }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-content-muted min-w-[28px] text-right">
                    {lora.weight.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ControlNets with strength (Hidden when 0) */}
      {stage.controlNets && stage.controlNets.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-content-muted block">
            ControlNets ({stage.controlNets.length})
          </span>
          <div className="space-y-1.5">
            {stage.controlNets.map((cn, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2 rounded-xl bg-surface-subtle border border-surface-border text-[11px]"
              >
                <span className="capitalize font-mono text-content-primary">
                  {cn.type}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, cn.strength * 100))}%` }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-content-muted min-w-[28px] text-right">
                    {cn.strength.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
