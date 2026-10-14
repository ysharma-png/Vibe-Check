"use client";

import React from "react";
import { ToolRequirements, TOOL_CATEGORIES, ToolCategory } from "@/types/schema";
import { TOOLS } from "@/lib/taxonomy";
import { FieldProvenance } from "./FieldProvenance";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";
import { Cpu, Sparkles, Check } from "lucide-react";

interface ToolRequirementsSectionProps {
  readonly toolRequirements: ToolRequirements;
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly onUpdateToolRequirements: (req: ToolRequirements) => void;
  readonly onClearProvenance: (field: string) => void;
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  image_gen: "Image Diffusion",
  video_gen: "Video Diffusion",
  workflow_engine: "Workflow & Node Graph",
  upscaler: "Upscaling & Enhancement",
  audio: "Voice & Sound",
  lipsync: "Lip-Sync & Motion Sync",
  "3d": "3D & NeRF",
  editing: "Post-Production",
};

const BASE_MODEL_POLICY_CONFIG = [
  {
    id: "any",
    title: "Flexible (Creator Choice)",
    description: "Permits creator to choose any generation toolchain best suited for aesthetic output.",
    badge: "Maximum Freedom",
    badgeColor: "bg-surface-subtle text-content-muted border-surface-border",
  },
  {
    id: "permissive_only",
    title: "Permissive Open Weights Only",
    description: "Restricts to open-weights models (e.g. FLUX.1 Dev, SDXL) for complete parameter transparency.",
    badge: "Open Weights",
    badgeColor: "bg-accent/10 text-accent border-accent/30",
  },
  {
    id: "indemnified_only",
    title: "Enterprise Indemnified Only",
    description: "Strict enterprise standard: only models backed by commercial copyright indemnification guarantees.",
    badge: "Enterprise Legal Guard",
    badgeColor: "bg-verified/10 text-verified border-verified/30",
  },
] as const;

export function ToolRequirementsSection({
  toolRequirements,
  confidence,
  evidence,
  onUpdateToolRequirements,
  onClearProvenance,
}: ToolRequirementsSectionProps) {
  const isRequiredMode = toolRequirements.mode === "required_tools";

  const handleToggleMode = (mode: "open_to_creator_choice" | "required_tools") => {
    onClearProvenance("toolRequirements");
    onUpdateToolRequirements({
      ...toolRequirements,
      mode,
    });
  };

  const handleToggleTool = (toolId: string) => {
    onClearProvenance("toolRequirements");
    const current = toolRequirements.requiredToolIds;
    const next = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];

    onUpdateToolRequirements({
      ...toolRequirements,
      requiredToolIds: next,
    });
  };

  const handleSelectPolicy = (policy: "any" | "permissive_only" | "indemnified_only") => {
    onClearProvenance("toolRequirements");
    onUpdateToolRequirements({
      ...toolRequirements,
      baseModelPolicy: policy,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toolchain Selection Mode */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-content-primary">
            Toolchain Mandate
            <FieldProvenance
              confidence={confidence.toolRequirements}
              evidence={evidence.toolRequirements}
              fieldName="Toolchain Mandate"
              onConfirm={() => onClearProvenance("toolRequirements")}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleToggleMode("open_to_creator_choice")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              !isRequiredMode
                ? "bg-accent/10 border-accent/60 text-content-primary shadow-sm"
                : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-content-primary">Open to Creator Choice</span>
            </div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Creator selects their preferred tools and ComfyUI pipelines based on project needs.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleToggleMode("required_tools")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              isRequiredMode
                ? "bg-accent/10 border-accent/60 text-content-primary shadow-sm"
                : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Cpu className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-content-primary">Specific Required Tools</span>
            </div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Mandate specific generation engines (e.g. FLUX.1, Runway Gen-3, Topaz, ComfyUI).
            </p>
          </button>
        </div>
      </div>

      {/* Tool Picker by Category (Visible when in required mode) */}
      {isRequiredMode && (
        <div className="p-4 rounded-2xl border border-surface-border bg-surface-subtle space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-content-primary">
              Select Required Tools ({toolRequirements.requiredToolIds.length} selected)
            </span>
            {toolRequirements.requiredToolIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearProvenance("toolRequirements");
                  onUpdateToolRequirements({ ...toolRequirements, requiredToolIds: [] });
                }}
                className="text-[11px] text-content-muted hover:text-content-primary transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-3">
            {TOOL_CATEGORIES.map((cat) => {
              const toolsInCat = TOOLS.filter((t) => t.category === cat);
              if (toolsInCat.length === 0) return null;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="text-[10px] text-content-faint uppercase tracking-wider font-sans">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {toolsInCat.map((tool) => {
                      const isSelected = toolRequirements.requiredToolIds.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => handleToggleTool(tool.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-sans border transition-all ${
                            isSelected
                              ? "bg-accent text-background border-accent shadow-sm font-medium"
                              : "bg-surface border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          <span>{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Base Model Policy */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-content-primary">
            Foundation Model Compliance Policy
          </label>
          <span className="text-xs text-content-faint">Legal governance standard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BASE_MODEL_POLICY_CONFIG.map((policy) => {
            const isSelected = toolRequirements.baseModelPolicy === policy.id;

            return (
              <button
                key={policy.id}
                type="button"
                onClick={() => handleSelectPolicy(policy.id)}
                className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-surface-muted border-accent/70 shadow-sm text-content-primary"
                    : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-content-primary">{policy.title}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                  </div>
                  <p className="text-[11px] text-content-muted leading-relaxed">
                    {policy.description}
                  </p>
                </div>

                <div className="mt-3.5">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-sans border ${policy.badgeColor}`}>
                    {policy.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
