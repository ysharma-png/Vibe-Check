"use client";

import React, { useState } from "react";
import { Sparkles, Check, Info } from "lucide-react";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";

interface FieldProvenanceProps {
  readonly confidence?: ConfidenceLevel;
  readonly evidence?: string;
  readonly fieldName: string;
  readonly onConfirm?: () => void;
}

export function FieldProvenance({
  confidence,
  evidence,
  fieldName,
  onConfirm,
}: FieldProvenanceProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!evidence && !confidence) {
    return null;
  }

  const confidenceBadge = {
    high: {
      color: "text-verified bg-verified/10 border-verified/30",
      dot: "bg-verified",
      label: "High Confidence",
    },
    medium: {
      color: "text-accent bg-accent/10 border-accent/30",
      dot: "bg-accent",
      label: "Medium Confidence",
    },
    low: {
      color: "text-content-muted bg-surface-muted border-surface-border",
      dot: "bg-content-muted",
      label: "Low Confidence",
    },
  }[confidence ?? "medium"];

  return (
    <div className="relative inline-flex items-center ml-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={`Inference details for ${fieldName}`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-sans border transition-colors ${confidenceBadge.color} hover:brightness-110`}
      >
        <Sparkles className="h-3 w-3" />
        <span className="hidden sm:inline">AI Inferred</span>
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 rounded-2xl border border-surface-border bg-surface shadow-2xl backdrop-blur-md text-xs text-content-primary pointer-events-auto"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between pb-2 border-b border-surface-border mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${confidenceBadge.dot}`} />
              <span className="font-medium text-content-primary">{confidenceBadge.label}</span>
            </div>
            {onConfirm && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-[10px] text-content-muted hover:text-verified transition-colors"
                title="Confirm value and clear AI badge"
              >
                <Check className="h-3 w-3" />
                <span>Confirm</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-content-faint uppercase tracking-wider font-sans">
              Trigger Quote
            </div>
            <div className="text-[11px] text-accent bg-surface-subtle p-2 rounded-xl border border-surface-border break-words font-sans">
              {evidence || "Inferred from prompt semantics"}
            </div>
          </div>

          <div className="mt-2 text-[10px] text-content-faint italic flex items-center gap-1">
            <Info className="h-2.5 w-2.5 shrink-0" />
            Editing this field locks it as human-confirmed.
          </div>
        </div>
      )}
    </div>
  );
}
