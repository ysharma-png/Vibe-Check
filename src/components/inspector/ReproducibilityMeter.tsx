"use client";

import React, { useState } from "react";
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PortfolioItem, ReproducibilityStatus } from "@/types/schema";

interface ReproducibilityMeterProps {
  readonly reproducibility?: ReproducibilityStatus;
  readonly item?: PortfolioItem;
  readonly itemId?: string;
}

export function ReproducibilityMeter({
  reproducibility: propRepro,
  item,
  itemId = "item",
}: ReproducibilityMeterProps) {
  const reproducibility = propRepro ?? item?.reproducibility ?? { kind: "unverified" };

  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);

  const handleSimulateRerun = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setProgress(20);
    setSimulatedScore(null);

    const step1 = setTimeout(() => setProgress(50), 400);
    const step2 = setTimeout(() => setProgress(85), 900);
    const step3 = setTimeout(() => {
      setProgress(100);
      setIsVerifying(false);
      if (reproducibility.kind === "verified_deterministic") {
        setSimulatedScore(reproducibility.rerunMatchScore);
      } else if (reproducibility.kind === "partially_reproducible") {
        setSimulatedScore(0.88);
      } else {
        setSimulatedScore(0.65);
      }
    }, 1500);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  const currentScore =
    simulatedScore !== null
      ? simulatedScore
      : reproducibility.kind === "verified_deterministic"
      ? reproducibility.rerunMatchScore
      : null;

  return (
    <div className="space-y-4 text-xs">
      {/* Radial Gauge or Score Meter */}
      <div className="rounded-2xl border border-surface-border bg-surface-subtle p-4 flex flex-col sm:flex-row items-center gap-5">
        {/* Simple SVG Radial Arc */}
        <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-surface stroke-current"
              strokeWidth="3.5"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`stroke-current transition-all duration-700 ${
                currentScore !== null && currentScore >= 0.95
                  ? "text-verified"
                  : currentScore !== null
                  ? "text-caution"
                  : "text-content-faint"
              }`}
              strokeDasharray={`${(currentScore ?? 0) * 100}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-sm font-semibold text-content-primary">
              {currentScore !== null ? `${Math.round(currentScore * 100)}%` : "—"}
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-1 text-center sm:text-left min-w-0">
          <div className="text-xs font-medium text-content-primary">
            {reproducibility.kind === "verified_deterministic"
              ? "Seed-locked deterministic execution"
              : reproducibility.kind === "partially_reproducible"
              ? "Partially reproducible (hosted SaaS video stages)"
              : "Unverified generation pipeline"}
          </div>
          <p className="text-[11px] text-content-muted leading-relaxed">
            {reproducibility.kind === "verified_deterministic"
              ? `Re-run hashes verified on ${new Date(reproducibility.verifiedAt).toLocaleDateString()}. Re-executing produces identical frame matrices.`
              : reproducibility.kind === "partially_reproducible"
              ? reproducibility.note
              : "Creator has not submitted seed logs for server audit verification."}
          </p>
        </div>
      </div>

      {/* Simulated Re-run Action Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleSimulateRerun}
          disabled={isVerifying}
          className="w-full py-2 px-3 rounded-xl border border-surface-border bg-surface hover:bg-surface-subtle text-xs text-content-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <RotateCcw className={`h-3.5 w-3.5 text-accent ${isVerifying ? "animate-spin" : ""}`} />
          <span>{isVerifying ? `Simulating test execution (${progress}%)...` : "Re-run verification test"}</span>
        </button>

        <p className="text-[10px] text-content-faint text-center">
          Demo simulation tests seed-locked DAG execution against golden frames in 1.5s.
        </p>
      </div>
    </div>
  );
}
