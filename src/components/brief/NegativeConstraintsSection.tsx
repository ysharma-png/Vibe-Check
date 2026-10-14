"use client";

import React, { useState } from "react";
import { NegativeConstraint } from "@/types/schema";
import { AI_VIDEO_NEGATIVE_LIBRARY, NegativeLibraryItem } from "@/lib/brief/defaults";
import { FieldProvenance } from "./FieldProvenance";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";
import { Shield, AlertTriangle, Plus, Trash2, Check } from "lucide-react";

interface NegativeConstraintsSectionProps {
  readonly negativeConstraints: NegativeConstraint[];
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly onUpdateNegativeConstraints: (constraints: NegativeConstraint[]) => void;
  readonly onClearProvenance: (field: string) => void;
}

export function NegativeConstraintsSection({
  negativeConstraints,
  confidence,
  evidence,
  onUpdateNegativeConstraints,
  onClearProvenance,
}: NegativeConstraintsSectionProps) {
  const [customInput, setCustomInput] = useState("");
  const [customSeverity, setCustomSeverity] = useState<"hard" | "soft">("hard");

  const handleToggleSeverity = (id: string) => {
    onClearProvenance("negativeConstraints");
    onUpdateNegativeConstraints(
      negativeConstraints.map((c) =>
        c.id === id ? { ...c, severity: c.severity === "hard" ? "soft" : "hard" } : c
      )
    );
  };

  const handleRemove = (id: string) => {
    onClearProvenance("negativeConstraints");
    onUpdateNegativeConstraints(negativeConstraints.filter((c) => c.id !== id));
  };

  const handleAddFromLibrary = (item: NegativeLibraryItem) => {
    onClearProvenance("negativeConstraints");
    const exists = negativeConstraints.some(
      (c) => c.label.toLowerCase() === item.label.toLowerCase()
    );
    if (!exists) {
      onUpdateNegativeConstraints([
        ...negativeConstraints,
        {
          id: `nc-lib-${Date.now()}-${item.id}`,
          label: item.label,
          severity: item.defaultSeverity,
        },
      ]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    onClearProvenance("negativeConstraints");
    onUpdateNegativeConstraints([
      ...negativeConstraints,
      {
        id: `nc-custom-${Date.now()}`,
        label: trimmed,
        severity: customSeverity,
      },
    ]);
    setCustomInput("");
  };

  return (
    <div className="space-y-6">
      {/* Active Constraints */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-content-primary">
            Active Negative Constraints & Brand Safeguards ({negativeConstraints.length})
            <FieldProvenance
              confidence={confidence.negativeConstraints}
              evidence={evidence.negativeConstraints}
              fieldName="Negative Constraints"
              onConfirm={() => onClearProvenance("negativeConstraints")}
            />
          </label>
          <span className="text-xs text-content-faint">Enforced during review</span>
        </div>

        {negativeConstraints.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-surface-border text-center text-xs text-content-muted">
            No constraints added. Add presets from the AI video library below or write custom requirements.
          </div>
        ) : (
          <div className="space-y-2">
            {negativeConstraints.map((item) => {
              const isHard = item.severity === "hard";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-surface-border bg-surface-subtle hover:border-surface-border-strong transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSeverity(item.id)}
                      title={`Click to switch to ${isHard ? "Soft Preference" : "Hard Guard"}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-sans border transition-all ${
                        isHard
                          ? "bg-flagged/10 border-flagged/30 text-flagged font-medium"
                          : "bg-surface-muted border-surface-border text-content-muted font-normal"
                      }`}
                    >
                      {isHard ? (
                        <>
                          <Shield className="h-3 w-3" />
                          <span>HARD GUARD</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3" />
                          <span>SOFT PREF</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs text-content-primary truncate">{item.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove constraint ${item.label}`}
                    className="p-1.5 rounded-lg text-content-muted hover:text-flagged hover:bg-surface transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preset Library for AI Video */}
      <div className="p-4 rounded-2xl border border-surface-border bg-surface-subtle space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-content-primary">
            AI Video Defect & Artifact Library
          </span>
          <span className="text-[11px] text-content-faint">One-click to add to brief</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {AI_VIDEO_NEGATIVE_LIBRARY.map((item) => {
            const isAdded = negativeConstraints.some(
              (c) => c.label.toLowerCase() === item.label.toLowerCase()
            );

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAddFromLibrary(item)}
                disabled={isAdded}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-sans border transition-all ${
                  isAdded
                    ? "bg-surface-muted/50 border-surface-border/50 text-content-faint cursor-default"
                    : "bg-surface border-surface-border text-content-muted hover:border-accent hover:text-content-primary"
                }`}
              >
                {isAdded ? (
                  <Check className="h-3 w-3 text-verified" />
                ) : (
                  <Plus className="h-3 w-3 text-content-faint" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Constraint Form */}
      <div>
        <label className="text-xs font-medium text-content-primary block mb-2">
          Add Custom Constraint or Style Exclusion
        </label>
        <form onSubmit={handleAddCustom} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Can't look like claymation, no neon green lighting..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs text-content-primary placeholder-content-faint focus:border-accent focus:outline-none"
          />

          <select
            value={customSeverity}
            onChange={(e) => setCustomSeverity(e.target.value as "hard" | "soft")}
            className="px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-xs text-content-primary focus:border-accent focus:outline-none"
          >
            <option value="hard">Hard Guard</option>
            <option value="soft">Soft Preference</option>
          </select>

          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-40 text-xs font-medium text-background transition-colors"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
