"use client";

import React from "react";
import { CommercialTerms } from "@/types/schema";
import { FieldProvenance } from "./FieldProvenance";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";
import { getVerificationStats } from "@/lib/brief/match-bridge";
import { ShieldCheck, Check } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

interface CommercialTermsSectionProps {
  readonly commercialTerms: CommercialTerms;
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly onUpdateCommercialTerms: (terms: CommercialTerms) => void;
  readonly onClearProvenance: (field: string) => void;
}

const SOURCE_HANDOVER_OPTIONS = [
  {
    id: "prompts_and_seeds",
    label: "Prompts & Seeds Manifest",
    desc: "Complete parameter JSON, positive & negative prompt text, and RNG seeds.",
  },
  {
    id: "project_files",
    label: "Project Files & Compositions",
    desc: "Master timelines, layered PSD/TIFF, and audio stems.",
  },
  {
    id: "node_graph",
    label: "Executable Node Graph (ComfyUI)",
    desc: "Exportable workflow.json for local ComfyUI graph execution.",
  },
  {
    id: "lora_weights",
    label: "Trained LoRA Weights (.safetensors)",
    desc: "Trained style or character LoRAs generated during production.",
  },
] as const;

export function CommercialTermsSection({
  commercialTerms,
  confidence,
  evidence,
  onUpdateCommercialTerms,
  onClearProvenance,
}: CommercialTermsSectionProps) {
  const { totalCreators, verifiedLicenseCount, reproduciblePipelineCount } =
    getVerificationStats();

  const handleUpdate = (partial: Partial<CommercialTerms>) => {
    onClearProvenance("commercialTerms");
    onUpdateCommercialTerms({
      ...commercialTerms,
      ...partial,
    });
  };

  const handleToggleHandover = (
    item: "node_graph" | "prompts_and_seeds" | "lora_weights" | "project_files"
  ) => {
    onClearProvenance("commercialTerms");
    const current = commercialTerms.sourceHandover;
    const next = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    handleUpdate({ sourceHandover: next });
  };

  return (
    <GlassSurface tier="thick" rounded="32" className="p-6 sm:p-8 space-y-6 border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#D8FD38]/15 text-[#D8FD38] border border-[#D8FD38]/25 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Commercial terms &amp; legal governance
              </h3>
              <FieldProvenance
                confidence={confidence.commercialTerms}
                evidence={evidence.commercialTerms}
                fieldName="Commercial Terms"
                onConfirm={() => onClearProvenance("commercialTerms")}
              />
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Clear IP ownership structure, source handover mandates, and creator verification gates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/30 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#38F2C7] animate-pulse" />
            <span>Clearance ready</span>
          </span>
          <MacTrafficLights title="commercial_governance_v3.legal" />
        </div>
      </div>

      {/* Rights Model */}
      <div>
        <label className="text-xs font-medium text-content-primary block mb-2">
          Rights &amp; IP ownership model
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleUpdate({ rightsModel: "perpetual_buyout" })}
            className={`p-3.5 rounded-2xl border text-left transition-colors ${
              commercialTerms.rightsModel === "perpetual_buyout"
                ? "bg-accent/15 border-accent text-content-primary"
                : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-content-primary">Perpetual buyout</div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Full worldwide ownership in perpetuity. Creator transfers all master rights.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              handleUpdate({
                rightsModel: "term_license",
                termMonths: commercialTerms.termMonths ?? 12,
              })
            }
            className={`p-3.5 rounded-2xl border text-left transition-colors ${
              commercialTerms.rightsModel === "term_license"
                ? "bg-accent/15 border-accent text-content-primary"
                : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-content-primary">Term license</div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Time-bound campaign flight license. Creator retains underlying master IP.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleUpdate({ rightsModel: "usage_based" })}
            className={`p-3.5 rounded-2xl border text-left transition-colors ${
              commercialTerms.rightsModel === "usage_based"
                ? "bg-accent/15 border-accent text-content-primary"
                : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
            }`}
          >
            <div className="text-xs font-semibold mb-1 text-content-primary">Usage based</div>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Scoped strictly to specified media channels (e.g. digital paid ads only).
            </p>
          </button>
        </div>

        {commercialTerms.rightsModel === "term_license" && (
          <div className="mt-3 p-3 rounded-2xl bg-surface-subtle border border-surface-border flex items-center gap-3">
            <span className="text-xs text-content-primary">License duration:</span>
            <input
              type="number"
              min={1}
              max={60}
              value={commercialTerms.termMonths ?? 12}
              onChange={(e) =>
                handleUpdate({ termMonths: Math.max(1, parseInt(e.target.value, 10) || 12) })
              }
              className="w-16 px-2 py-1 rounded-lg bg-surface border border-surface-border text-xs font-mono text-content-primary focus:outline-none focus:border-accent"
            />
            <span className="text-xs text-content-muted">months from campaign delivery</span>
          </div>
        )}
      </div>

      {/* Territory & Exclusivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-content-primary block mb-1.5">
            Geographic territory
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleUpdate({ territory: "worldwide", regions: undefined })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                commercialTerms.territory === "worldwide"
                  ? "bg-accent/15 border-accent text-accent"
                  : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
              }`}
            >
              Worldwide
            </button>
            <button
              type="button"
              onClick={() =>
                handleUpdate({
                  territory: "regional",
                  regions: commercialTerms.regions ?? ["North America", "Europe"],
                })
              }
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                commercialTerms.territory === "regional"
                  ? "bg-accent/15 border-accent text-accent"
                  : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
              }`}
            >
              Regional
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-content-primary block mb-1.5">
            Competitive exclusivity
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleUpdate({ exclusivity: true })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                commercialTerms.exclusivity
                  ? "bg-accent/15 border-accent text-accent"
                  : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
              }`}
            >
              Exclusive
            </button>
            <button
              type="button"
              onClick={() => handleUpdate({ exclusivity: false })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                !commercialTerms.exclusivity
                  ? "bg-accent/15 border-accent text-accent"
                  : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
              }`}
            >
              Non-exclusive
            </button>
          </div>
        </div>
      </div>

      {/* Source Handover */}
      <div>
        <label className="text-xs font-medium text-content-primary block mb-2">
          Source material handover mandates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SOURCE_HANDOVER_OPTIONS.map((opt) => {
            const isChecked = commercialTerms.sourceHandover.includes(opt.id);

            return (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors ${
                  isChecked
                    ? "bg-accent/10 border-accent/40 text-content-primary"
                    : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-hover"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleHandover(opt.id)}
                  className="mt-0.5 rounded border-surface-border bg-surface text-accent focus:ring-accent"
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-content-primary">{opt.label}</div>
                  <div className="text-[11px] text-content-muted mt-0.5 leading-snug">{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Platform Verification Requirements with Live Consequence Stats */}
      <div className="border-t border-surface-border/60 pt-4 space-y-3">
        <label className="text-xs font-medium text-content-primary block">
          Platform verification requirements
        </label>

        {/* Require Verified License */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-surface-border bg-surface-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-content-primary">
                Require verified commercial subscriptions
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface border border-surface-border text-verified">
                Recommended
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-0.5">
              Only creators with an audited paid enterprise license can apply.
            </p>
            <div className="text-[11px] text-accent mt-1">
              Impact: {verifiedLicenseCount} of {totalCreators} current platform creators qualify.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={commercialTerms.requiresVerifiedLicense}
              onChange={(e) => handleUpdate({ requiresVerifiedLicense: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-content-muted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:after:bg-surface border border-surface-border" />
          </label>
        </div>

        {/* Require Reproducible Pipeline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-surface-border bg-surface-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-content-primary">
                Require 100% deterministic reproducibility
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-0.5">
              Demands seed-locked ComfyUI nodes with verified re-run hashes for auditability.
            </p>
            <div className="text-[11px] text-accent mt-1">
              Impact: {reproduciblePipelineCount} of {totalCreators} current platform creators qualify.
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={commercialTerms.requiresReproduciblePipeline}
              onChange={(e) => handleUpdate({ requiresReproduciblePipeline: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-content-muted after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent peer-checked:after:bg-surface border border-surface-border" />
          </label>
        </div>
      </div>
    </GlassSurface>
  );
}
