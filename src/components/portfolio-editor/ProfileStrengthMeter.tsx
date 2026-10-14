"use client";

import React from "react";
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

interface Suggestion {
  id: string;
  label: string;
  points: number;
  completed: boolean;
  actionText: string;
}

interface ProfileStrengthMeterProps {
  readonly score: number;
  readonly suggestions: Suggestion[];
  readonly onActionClick?: (suggestionId: string) => void;
}

export function ProfileStrengthMeter({
  score,
  suggestions,
  onActionClick,
}: ProfileStrengthMeterProps) {
  const level = score >= 90 ? "Platinum Verified" : score >= 75 ? "Gold Certified" : "Silver Talent";

  return (
    <div className="p-6 rounded-3xl bg-surface border border-surface-border shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider font-sans">
              AI Portfolio Strength &amp; Trust Index
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-accent/15 text-accent border border-accent/25 font-medium">
              {level}
            </span>
          </div>
          <p className="text-xs text-content-muted font-light">
            Profiles scoring 90%+ receive 3.4x more brand invitations and instant escrow clearance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-2xl font-light text-content-primary">{score}%</span>
          <div className="h-10 w-10 rounded-full border-2 border-surface-border flex items-center justify-center p-1">
            <div
              className="h-full w-full rounded-full transition-all"
              style={{
                background: `conic-gradient(var(--accent, #8B93FF) ${score * 3.6}deg, transparent 0deg)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Actionable Suggestions */}
      <div className="space-y-2 pt-2">
        <span className="text-[10px] text-content-faint uppercase tracking-wider block font-sans">
          Actionable Trust Enhancements
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                sug.completed
                  ? "bg-surface-subtle/50 border-surface-border/50 text-content-muted"
                  : "bg-surface-subtle border-surface-border text-content-primary hover:border-surface-border-strong"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {sug.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-verified shrink-0" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-dashed border-accent flex items-center justify-center text-[10px] text-accent shrink-0">
                    +
                  </span>
                )}
                <span className={`truncate text-xs ${sug.completed ? "line-through text-content-faint" : ""}`}>
                  {sug.label}
                </span>
              </div>

              {!sug.completed && (
                <button
                  type="button"
                  onClick={() => onActionClick?.(sug.id)}
                  className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline shrink-0 font-medium"
                >
                  <span>{sug.actionText}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
