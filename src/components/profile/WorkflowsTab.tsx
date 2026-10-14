"use client";

import React, { useState } from "react";
import {
  GitFork,
  Download,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Hash,
  Terminal,
} from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { NodeGraphView } from "@/components/inspector/NodeGraphView";

interface WorkflowsTabProps {
  readonly items: readonly PortfolioItem[];
  readonly onOpenInspector: (itemId: string) => void;
}

export function WorkflowsTab({ items, onOpenInspector }: WorkflowsTabProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const currentItem = items[selectedItemIndex] ?? items[0] ?? null;

  if (!currentItem) {
    return (
      <div className="p-12 text-center text-xs text-content-muted">
        No workflow DAGs published yet.
      </div>
    );
  }

  const handleDownloadWorkflow = () => {
    const dummyWorkflow = {
      client: "CacheFlow ComfyUI Export",
      version: "1.0",
      itemTitle: currentItem.title,
      nodes: currentItem.nodeGraph?.nodes ?? [],
      edges: currentItem.nodeGraph?.edges ?? [],
      stages: currentItem.pipeline,
    };

    const blob = new Blob([JSON.stringify(dummyWorkflow, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comfyui_workflow_${currentItem.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Selector & Header */}
      <div className="p-6 rounded-3xl bg-surface border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <GitFork className="h-4 w-4 text-accent" />
            <span>Reproducible ComfyUI Pipeline Architectures</span>
          </h2>
          <p className="text-xs text-content-muted font-light">
            Fully deterministic node graphs with audited seeds, model checkpoint hashes, and LoRA weights.
          </p>
        </div>

        {/* Workflow Dropdown Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedItemIndex}
            onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
            className="px-3.5 py-2 rounded-2xl border border-surface-border bg-surface-subtle text-xs text-content-primary focus:outline-none focus:border-accent"
          >
            {items.map((it, idx) => (
              <option key={it.id} value={idx}>
                {it.title} ({it.pipeline.length} stages)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDownloadWorkflow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-subtle hover:bg-surface border border-surface-border text-xs font-medium text-content-primary transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .json</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workflow Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ComfyUI Node Graph Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-accent" />
                <span>Interactive Node Graph DAG</span>
              </h3>
              <span className="text-[11px] text-content-muted">
                {currentItem.nodeGraph?.nodes.length ?? 8} Nodes • {currentItem.nodeGraph?.edges.length ?? 12} Connections
              </span>
            </div>

            {/* Embedded ComfyUI SVG Graph Viewer */}
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-surface-border bg-background/50">
              <NodeGraphView
                nodeGraph={currentItem.nodeGraph}
                itemTitle={currentItem.title}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Stage Provenance & RNG Seeds */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
            <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              <span>Pipeline Stage Parameters</span>
            </h3>

            <div className="space-y-3">
              {currentItem.pipeline.map((stage) => {
                const tool = getToolById(stage.toolId);
                return (
                  <div
                    key={stage.id}
                    className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-content-primary text-[11px]">
                        Stage {stage.order}: {stage.label}
                      </span>
                      <span className="text-[10px] text-accent font-mono">
                        {stage.durationSec}s
                      </span>
                    </div>

                    <div className="text-[11px] text-content-muted">
                      {tool?.name || stage.toolId} • {stage.modelVersion}
                    </div>

                    {stage.checkpointHash && (
                      <div className="text-[10px] text-content-faint font-mono truncate">
                        Hash: {stage.checkpointHash}
                      </div>
                    )}

                    {stage.seed !== null && (
                      <div className="text-[10px] text-content-faint font-mono">
                        RNG Seed: {stage.seed}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onOpenInspector(currentItem.id)}
              className="w-full py-2.5 rounded-2xl bg-accent text-background text-xs font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-sm"
            >
              <span>Open in Workflow Inspector</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
