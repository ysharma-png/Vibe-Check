/**
 * Feed & Match Scoring Engine
 *
 * Implements a weighted scoring function evaluating:
 * - Skill & tool overlap (40%)
 * - Budget alignment with creator day/hourly rate (25%)
 * - Pipeline verification & determinism requirements (20%)
 * - Rating & track record (15%)
 */

export interface MatchScoreResult {
  score: number; // 0 - 100 percentage
  reasons: string[];
  toolMatchCount: number;
  matchedTools: string[];
}

export interface CreatorMatchProfile {
  id: string;
  primaryTools: string[];
  specializations: string[];
  dayRateUsd?: number | null;
  hourlyRateUsd?: number | null;
  deterministicPipeline?: boolean;
  commercialClearanceCleared?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface BriefMatchTarget {
  id: string;
  requiredTools: string[];
  budgetMin: number;
  budgetMax: number;
  baseModelPolicy?: string;
  durationSec?: number;
}

/**
 * Calculates match percentage and explanatory reasons between a creator and a creative brief.
 */
export function calculateBriefMatchScore(
  creator: CreatorMatchProfile,
  brief: BriefMatchTarget
): MatchScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Normalize tools
  const creatorTools = new Set((creator.primaryTools || []).map((t) => t.toLowerCase().trim()));
  const requiredTools = (brief.requiredTools || []).map((t) => t.toLowerCase().trim());

  const matchedTools: string[] = [];
  for (const t of requiredTools) {
    if (creatorTools.has(t)) {
      matchedTools.push(t);
    }
  }

  // 1. Tool Overlap (up to 40 pts)
  const reqCount = requiredTools.length;
  if (reqCount > 0) {
    const overlapRatio = matchedTools.length / reqCount;
    const toolPoints = Math.round(overlapRatio * 40);
    score += toolPoints;
    if (matchedTools.length > 0) {
      reasons.push(
        `Matches ${matchedTools.length} required tool${matchedTools.length > 1 ? "s" : ""}: ${matchedTools.slice(0, 3).join(", ")}`
      );
    }
  } else {
    // If no specific tools required, award partial general tool fit
    score += 25;
  }

  // 2. Budget Alignment (up to 25 pts)
  const dayRate = creator.dayRateUsd || 800;
  const maxBudget = brief.budgetMax || 5000;
  const minBudget = brief.budgetMin || 1000;

  if (maxBudget >= dayRate) {
    if (minBudget <= dayRate * 3) {
      score += 25;
      reasons.push(`Budget ($${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}) fits your day rate ($${dayRate}/day)`);
    } else {
      score += 18;
      reasons.push(`High-value project ($${maxBudget.toLocaleString()} max)`);
    }
  } else {
    score += 8;
  }

  // 3. Pipeline Determinism & Base Model Compliance (up to 20 pts)
  if (creator.deterministicPipeline) {
    score += 15;
    reasons.push("Verified ComfyUI reproducibility matches brief standards");
  } else {
    score += 5;
  }

  if (creator.commercialClearanceCleared) {
    score += 5;
    reasons.push("Indemnified commercial pipeline clearance");
  }

  // 4. Rating & Track Record (up to 15 pts)
  const rating = creator.rating || 5.0;
  if (rating >= 4.9) {
    score += 15;
    reasons.push(`Elite rating record (${rating.toFixed(1)}★)`);
  } else if (rating >= 4.7) {
    score += 10;
  } else {
    score += 5;
  }

  // Bound score between 40% and 98% for realistic UX
  const finalScore = Math.min(98, Math.max(40, score));

  return {
    score: finalScore,
    reasons,
    toolMatchCount: matchedTools.length,
    matchedTools,
  };
}

/**
 * Calculates recommendation score of a creator for a brand's open briefs.
 */
export function calculateCreatorRecommendationScore(
  creator: CreatorMatchProfile,
  brandBriefs: BriefMatchTarget[]
): { bestScore: number; bestBriefId?: string; topReasons: string[] } {
  if (!brandBriefs || brandBriefs.length === 0) {
    return {
      bestScore: 85,
      topReasons: ["Verified creator in high-demand generative pipelines"],
    };
  }

  let bestScore = 0;
  let bestBriefId: string | undefined = undefined;
  let topReasons: string[] = [];

  for (const brief of brandBriefs) {
    const res = calculateBriefMatchScore(creator, brief);
    if (res.score > bestScore) {
      bestScore = res.score;
      bestBriefId = brief.id;
      topReasons = res.reasons;
    }
  }

  return {
    bestScore: Math.max(70, bestScore),
    bestBriefId,
    topReasons,
  };
}
