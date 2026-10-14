import {
  PipelineStage,
  PortfolioItem,
  ReproducibilityStatus,
} from "@/types/schema";

export type CommercialClearanceLevel = "cleared" | "conditional" | "not_cleared";

export interface CommercialClearanceAssessment {
  readonly level: CommercialClearanceLevel;
  readonly summary: string;
  readonly reasons: readonly string[];
}

/**
 * Pure framework-free function that evaluates the commercial safety and legal risk
 * profile of a portfolio item based on model licenses, copyright IP scan, and indemnity.
 */
export function assessCommercialClearance(
  item: PortfolioItem
): CommercialClearanceAssessment {
  const reasons: string[] = [];
  const safety = item.commercialSafety;

  // 1. Critical Disqualifiers -> "not_cleared"
  if (safety.copyrightedIpScan === "flagged") {
    reasons.push(
      "Copyright Risk: Automated scanner flagged substantial similarity to protected trademarked IP or silhouette."
    );
    return {
      level: "not_cleared",
      summary: "Not cleared for commercial use",
      reasons,
    };
  }

  if (safety.baseModelCompliance === "restricted" && !safety.indemnified) {
    reasons.push(
      "License Breach Risk: Non-commercial open weights base model used without enterprise conversion or commercial buyout agreement."
    );
    return {
      level: "not_cleared",
      summary: "Not cleared for commercial use",
      reasons,
    };
  }

  // 2. Conditional Warnings -> "conditional"
  let isConditional = false;

  if (!safety.subscriptionVerified) {
    isConditional = true;
    reasons.push(
      "Subscription Unverified: Creator has not uploaded verified enterprise subscription receipts."
    );
  }

  if (safety.baseModelCompliance === "unknown") {
    isConditional = true;
    reasons.push(
      "Data Transparency Notice: Training dataset provenance of the base model is unverified by third-party auditors."
    );
  }

  if (item.reproducibility.kind === "partially_reproducible") {
    isConditional = true;
    reasons.push(
      `Non-Deterministic Stages: Contains cloud API passes (${item.reproducibility.nonDeterministicStageIds.join(", ")}) that cannot be re-run bit-for-bit.`
    );
  }

  if (!safety.indemnified) {
    isConditional = true;
    reasons.push(
      "No Vendor Indemnity: Platform is not backed by vendor copyright indemnity insurance."
    );
  }

  if (isConditional) {
    return {
      level: "conditional",
      summary: "Cleared with conditions",
      reasons,
    };
  }

  // 3. Fully Cleared -> "cleared"
  reasons.push("Clean copyright IP audit: No matched third-party trademarks detected.");
  reasons.push(`Verified commercial subscription tier: ${safety.subscriptionTier}.`);
  if (safety.indemnified) {
    reasons.push(
      `Vendor legal warranty active: Indemnified by ${safety.indemnityProvider ?? "Enterprise Provider"}.`
    );
  }

  return {
    level: "cleared",
    summary: "Cleared for commercial use",
    reasons,
  };
}

export interface PipelineTotals {
  readonly totalDurationSec: number;
  readonly totalCostUsd: number;
  readonly stageCount: number;
}

/**
 * Calculates total compute latency, USD inference costs, and stage counts for a pipeline.
 */
export function calculatePipelineTotals(
  stages: readonly PipelineStage[]
): PipelineTotals {
  let totalDurationSec = 0;
  let totalCostUsd = 0;

  for (const stage of stages) {
    totalDurationSec += stage.durationSec;
    totalCostUsd += stage.costUsd;
  }

  return {
    totalDurationSec: Math.round(totalDurationSec * 10) / 10,
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    stageCount: stages.length,
  };
}
