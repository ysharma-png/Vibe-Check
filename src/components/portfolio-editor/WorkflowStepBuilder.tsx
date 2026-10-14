"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  Hash,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { TOOLS } from "@/lib/taxonomy";
import { PipelineStage, isSaasTool, CONTROL_NET_TYPES, ControlNetType } from "@/types/schema";

interface WorkflowStepBuilderProps {
  readonly stages: PipelineStage[];
  readonly onChange: (stages: PipelineStage[]) => void;
}

export function WorkflowStepBuilder({ stages, onChange }: WorkflowStepBuilderProps) {
  const [expandedStageId, setExpandedStageId] = useState<string | null>(stages[0]?.id ?? null);

  const handleAddStage = () => {
    const nextOrder = stages.length;
    const newId = `stage-${Date.now().toString(36)}`;
    const defaultTool = TOOLS[0]?.id ?? "flux-1-dev";

    const prevStage = nextOrder > 0 ? stages[nextOrder - 1] : undefined;

    const newStage: PipelineStage = {
      id: newId,
      order: nextOrder,
      label: `Pipeline Step ${nextOrder + 1}: Latent Node`,
      toolId: defaultTool,
      modelVersion: "v1.0",
      checkpointHash: "a1b2c3d4e5f6",
      loras: [],
      controlNets: [],
      prompt: "Ultra-detailed cinematic render, physically based lighting, 35mm film grain",
      negativePrompt: "blurry, low resolution, watermark, cartoonish, artifacts",
      seed: 42891024,
      sampler: "Euler a",
      steps: 30,
      cfg: 7.5,
      inputStageIds: prevStage ? [prevStage.id] : [],
      durationSec: 12,
      costUsd: 0.15,
      outputPreview: {
        gradient: ["#141E30", "#243B55"],
        caption: "Synthesized latent output",
      },
    };

    const updated = [...stages, newStage];
    onChange(updated);
    setExpandedStageId(newId);
  };

  const handleRemoveStage = (id: string) => {
    const filtered = stages.filter((s) => s.id !== id);
    const reordered = filtered.map((s, index) => ({ ...s, order: index }));
    onChange(reordered);
    if (expandedStageId === id) {
      setExpandedStageId(reordered[0]?.id ?? null);
    }
  };

  const handleMoveStage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const updated = [...stages];
    const current = updated[index];
    const target = updated[targetIndex];
    if (!current || !target) return;

    updated[index] = { ...target, order: index };
    updated[targetIndex] = { ...current, order: targetIndex };

    onChange(updated);
  };

  const handleUpdateStage = (id: string, updates: Partial<PipelineStage>) => {
    const updated = stages.map((s) => {
      if (s.id !== id) return s;
      const merged = { ...s, ...updates };

      // If tool changed to SaaS, handle seed requirements
      if (updates.toolId && isSaasTool(updates.toolId) && merged.seed === null) {
        // SaaS allows null
      } else if (updates.toolId && !isSaasTool(updates.toolId) && merged.seed === null) {
        // Non-SaaS requires integer seed
        merged.seed = 42891024;
      }

      return merged;
    });
    onChange(updated);
  };

  const handleAddLora = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    const newLoras = [...stage.loras, { name: "cinematic-lighting-v2", weight: 0.75 }];
    handleUpdateStage(stageId, { loras: newLoras });
  };

  const handleRemoveLora = (stageId: string, index: number) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    const newLoras = stage.loras.filter((_, i) => i !== index);
    handleUpdateStage(stageId, { loras: newLoras });
  };

  const handleAddControlNet = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    const newCns = [...stage.controlNets, { type: "depth" as ControlNetType, strength: 0.85 }];
    handleUpdateStage(stageId, { controlNets: newCns });
  };

  const handleRemoveControlNet = (stageId: string, index: number) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;
    const newCns = stage.controlNets.filter((_, i) => i !== index);
    handleUpdateStage(stageId, { controlNets: newCns });
  };

  const generateRandomHexHash = (stageId: string) => {
    const hex = Math.random().toString(16).substring(2, 14).padEnd(12, "0");
    handleUpdateStage(stageId, { checkpointHash: hex });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans">
            AI Pipeline DAG &amp; Stage Provenance ({stages.length} Nodes)
          </h4>
          <p className="text-[11px] text-content-muted">
            Ordered compute sequence allowing brands to inspect reproducibility and deterministic seeds.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddStage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Pipeline Node</span>
        </button>
      </div>

      {stages.length === 0 ? (
        <div className="p-8 rounded-3xl border border-dashed border-surface-border text-center space-y-3">
          <Layers className="h-8 w-8 text-content-faint mx-auto" />
          <p className="text-xs text-content-muted">No pipeline stages defined. Click &ldquo;Add Pipeline Node&rdquo; to start.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const isExpanded = expandedStageId === stage.id;
            const currentTool = TOOLS.find((t) => t.id === stage.toolId);
            const isSaas = isSaasTool(stage.toolId);

            return (
              <div
                key={stage.id}
                className="rounded-3xl border border-surface-border bg-surface overflow-hidden transition-all shadow-sm"
              >
                {/* Stage Header Summary */}
                <div className="p-3.5 flex items-center justify-between gap-3 bg-surface-subtle/50 hover:bg-surface-subtle transition-colors">
                  <button
                    type="button"
                    onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                    className="flex items-center gap-3 min-w-0 text-left flex-1"
                  >
                    <span className="h-6 w-6 rounded-full bg-accent/15 text-accent text-[11px] font-mono flex items-center justify-center shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-content-primary truncate">{stage.label}</span>
                        {isSaas ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/25">
                            Cloud SaaS
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Deterministic
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-content-muted flex items-center gap-2 font-mono">
                        <span>{currentTool?.name ?? stage.toolId}</span>
                        <span>•</span>
                        <span>{stage.durationSec}s</span>
                        <span>•</span>
                        <span>${stage.costUsd.toFixed(2)}</span>
                      </div>
                    </div>
                  </button>

                  {/* Stage actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStage(idx, "up")}
                      className="p-1 rounded-lg text-content-muted hover:text-content-primary disabled:opacity-30 disabled:pointer-events-none"
                      title="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === stages.length - 1}
                      onClick={() => handleMoveStage(idx, "down")}
                      className="p-1 rounded-lg text-content-muted hover:text-content-primary disabled:opacity-30 disabled:pointer-events-none"
                      title="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(stage.id)}
                      className="p-1.5 rounded-lg text-content-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Delete stage"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stage Detail Form */}
                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-surface-border bg-surface text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Stage Label</label>
                        <input
                          type="text"
                          value={stage.label}
                          onChange={(e) => handleUpdateStage(stage.id, { label: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Compute Tool / Model</label>
                        <select
                          value={stage.toolId}
                          onChange={(e) => handleUpdateStage(stage.id, { toolId: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                        >
                          {TOOLS.map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name} ({tool.vendor}) - {tool.category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Prompt & Negative Prompt */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] text-content-muted">Positive Prompt</label>
                          <span className="text-[10px] text-content-faint">Passed to sampler</span>
                        </div>
                        <textarea
                          rows={2}
                          value={stage.prompt}
                          onChange={(e) => handleUpdateStage(stage.id, { prompt: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Negative Prompt</label>
                        <input
                          type="text"
                          value={stage.negativePrompt}
                          onChange={(e) => handleUpdateStage(stage.id, { negativePrompt: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Checkpoint Hash & Seed & Version */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] text-content-muted">Checkpoint Hash</label>
                          <button
                            type="button"
                            onClick={() => generateRandomHexHash(stage.id)}
                            className="text-[10px] text-accent hover:underline"
                          >
                            Gen 12-Hex
                          </button>
                        </div>
                        <div className="relative">
                          <Hash className="h-3.5 w-3.5 absolute left-3 top-2.5 text-content-faint" />
                          <input
                            type="text"
                            maxLength={12}
                            value={stage.checkpointHash ?? ""}
                            onChange={(e) => handleUpdateStage(stage.id, { checkpointHash: e.target.value.toLowerCase() })}
                            placeholder="12-hex hash"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">
                          Deterministic Seed {isSaas && "(Optional for SaaS)"}
                        </label>
                        <input
                          type="number"
                          value={stage.seed ?? ""}
                          onChange={(e) =>
                            handleUpdateStage(stage.id, {
                              seed: e.target.value === "" ? null : parseInt(e.target.value, 10),
                            })
                          }
                          placeholder={isSaas ? "null (server-managed)" : "e.g. 42891024"}
                          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Sampler &amp; Steps</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={stage.sampler ?? "Euler a"}
                            onChange={(e) => handleUpdateStage(stage.id, { sampler: e.target.value })}
                            placeholder="Sampler"
                            className="w-2/3 px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
                          />
                          <input
                            type="number"
                            value={stage.steps ?? 25}
                            onChange={(e) => handleUpdateStage(stage.id, { steps: parseInt(e.target.value, 10) || 20 })}
                            placeholder="Steps"
                            className="w-1/3 px-2 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs text-center font-mono focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Stage Compute Duration (sec)</label>
                        <div className="relative">
                          <Clock className="h-3.5 w-3.5 absolute left-3 top-2.5 text-content-faint" />
                          <input
                            type="number"
                            value={stage.durationSec}
                            onChange={(e) => handleUpdateStage(stage.id, { durationSec: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-content-muted block mb-1">Stage Inference Cost ($USD)</label>
                        <div className="relative">
                          <DollarSign className="h-3.5 w-3.5 absolute left-3 top-2.5 text-content-faint" />
                          <input
                            type="number"
                            step="0.01"
                            value={stage.costUsd}
                            onChange={(e) => handleUpdateStage(stage.id, { costUsd: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* LoRAs and ControlNets subsections */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-border">
                      {/* LoRAs */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-content-primary">Attached LoRAs ({stage.loras.length})</span>
                          <button
                            type="button"
                            onClick={() => handleAddLora(stage.id)}
                            className="text-[10px] text-accent hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add LoRA
                          </button>
                        </div>
                        {stage.loras.map((lora, lIdx) => (
                          <div key={lIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={lora.name}
                              onChange={(e) => {
                                const newLoras = [...stage.loras];
                                if (newLoras[lIdx]) {
                                  newLoras[lIdx] = { ...lora, name: e.target.value };
                                  handleUpdateStage(stage.id, { loras: newLoras });
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs"
                            />
                            <input
                              type="number"
                              step="0.05"
                              value={lora.weight}
                              onChange={(e) => {
                                const newLoras = [...stage.loras];
                                if (newLoras[lIdx]) {
                                  newLoras[lIdx] = { ...lora, weight: parseFloat(e.target.value) || 0 };
                                  handleUpdateStage(stage.id, { loras: newLoras });
                                }
                              }}
                              className="w-16 px-2 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs text-center font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveLora(stage.id, lIdx)}
                              className="text-content-faint hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* ControlNets */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-content-primary">ControlNets ({stage.controlNets.length})</span>
                          <button
                            type="button"
                            onClick={() => handleAddControlNet(stage.id)}
                            className="text-[10px] text-accent hover:underline flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add ControlNet
                          </button>
                        </div>
                        {stage.controlNets.map((cn, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <select
                              value={cn.type}
                              onChange={(e) => {
                                const newCns = [...stage.controlNets];
                                if (newCns[cIdx]) {
                                  newCns[cIdx] = { ...cn, type: e.target.value as ControlNetType };
                                  handleUpdateStage(stage.id, { controlNets: newCns });
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs"
                            >
                              {CONTROL_NET_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step="0.05"
                              value={cn.strength}
                              onChange={(e) => {
                                const newCns = [...stage.controlNets];
                                if (newCns[cIdx]) {
                                  newCns[cIdx] = { ...cn, strength: parseFloat(e.target.value) || 0 };
                                  handleUpdateStage(stage.id, { controlNets: newCns });
                                }
                              }}
                              className="w-16 px-2 py-1.5 rounded-lg bg-surface-subtle border border-surface-border text-xs text-center font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveControlNet(stage.id, cIdx)}
                              className="text-content-faint hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
