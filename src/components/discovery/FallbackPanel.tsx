"use client";

import React, { useState } from "react";
import { Info, ArrowRight, ChevronDown } from "lucide-react";
import { DiscoveryResult } from "@/lib/discovery/fallback";
import { GlassSurface } from "@/components/glass/GlassSurface";

interface FallbackPanelProps {
  readonly discoveryResult: DiscoveryResult;
  readonly onSearchExact?: () => void;
}

export function FallbackPanel({ discoveryResult, onSearchExact }: FallbackPanelProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  if (discoveryResult.kind === "exact") {
    return null;
  }

  const isRelaxed = discoveryResult.kind === "relaxed";
  const relaxationSteps = isRelaxed ? discoveryResult.relaxation : [];
  const primaryStep = relaxationSteps[0];

  return (
    <div
      aria-label="Search suggestions"
      className="mx-auto mb-6 max-w-4xl px-4 sm:px-6"
    >
      <GlassSurface
        tier="regular"
        radius="24"
        specular
        className="p-4 text-xs border border-amber-500/30"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main message */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <p className="text-white leading-relaxed font-light">
              {discoveryResult.narrative}
            </p>
          </div>

          {/* Right actions: substitution visual & 'Why these?' */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            {primaryStep && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-white/10 glass-thin text-[11px] font-mono">
                <span className="line-through text-content-faint">{primaryStep.original}</span>
                <span className="text-content-faint">→</span>
                <span className="text-accent">{primaryStep.substitute}</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setWhyOpen(!whyOpen)}
              aria-expanded={whyOpen}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-content-muted hover:text-white transition-colors"
            >
              <span>Why these?</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${whyOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Expandable Disclosure Details */}
        {whyOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="text-[11px] text-content-muted leading-relaxed font-light">
              Our matching engine relaxed criteria in priority order to show active proof-of-work while preserving verified commercial license and reproducibility guards.
            </div>

            {relaxationSteps.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {relaxationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl glass-thin border border-white/10 text-[11px] font-mono"
                  >
                    <span className="text-content-muted">{step.original}</span>
                    <ArrowRight className="h-2.5 w-2.5 text-content-faint" />
                    <span className="text-white font-medium">{step.substitute}</span>
                    {step.description && (
                      <span className="text-content-faint">({step.description})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {onSearchExact && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onSearchExact}
                  className="text-[11px] font-mono text-accent hover:underline"
                >
                  Search strictly without relaxed models anyway
                </button>
              </div>
            )}
          </div>
        )}
      </GlassSurface>
    </div>
  );
}
