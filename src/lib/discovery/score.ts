import {
  CreatorProfile,
  PortfolioItem,
} from "@/types/schema";
import { FilterState, getItemTools } from "./filter";

export const SCORING_WEIGHTS = {
  toolSpecFit: 0.4,
  verification: 0.2,
  reliability: 0.2,
  formatFit: 0.1,
  availability: 0.1,
} as const;

/**
 * Calculates a normalized match score (0-100) for a creator based on weighted criteria.
 * Exact matches always outrank substituted ones via tool substitution similarity penalty.
 *
 * Pure framework-free function with unit-testable signature.
 */
export function calculateCreatorScore(
  creator: CreatorProfile,
  matchedItems: readonly PortfolioItem[],
  filters: FilterState,
  toolSubstitutions?: ReadonlyMap<
    string,
    { readonly substituteId: string; readonly similarity: number; readonly reason: string }
  >
): number {
  // 1. Tool & Specialization Fit (Weight: 40%)
  let toolFitScore = 1.0;
  if (filters.tools.length > 0) {
    let toolScoreSum = 0;
    const creatorTools = new Set<string>();
    for (const item of matchedItems) {
      for (const t of Array.from(getItemTools(item))) {
        creatorTools.add(t);
      }
    }
    for (const pt of creator.primaryTools) {
      creatorTools.add(pt);
    }

    for (const requestedTool of filters.tools) {
      const sub = toolSubstitutions?.get(requestedTool);
      if (sub) {
        if (creatorTools.has(sub.substituteId)) {
          // Substituted match penalized by similarity (0 < similarity < 1)
          toolScoreSum += Math.min(1, Math.max(0, sub.similarity));
        }
      } else if (creatorTools.has(requestedTool)) {
        // Exact match receives full credit
        toolScoreSum += 1.0;
      }
    }
    toolFitScore = toolScoreSum / filters.tools.length;
  }

  let specFitScore = 1.0;
  if (filters.specializations.length > 0) {
    const matchedSpecs = filters.specializations.filter((spec) =>
      creator.specializations.includes(spec)
    );
    specFitScore = matchedSpecs.length / filters.specializations.length;
  }

  const toolSpecFit = (toolFitScore + specFitScore) / 2;

  // 2. Verification Signals (Weight: 20%)
  let verificationScore = 0;
  if (creator.verified.identity) verificationScore += 0.2;
  if (creator.verified.commercialLicense) verificationScore += 0.4;
  if (creator.verified.reproduciblePipeline) verificationScore += 0.4;

  // 3. Reliability Metrics (Weight: 20%)
  const reliabilityScore =
    creator.stats.onTimeRate * 0.6 + creator.stats.repeatClientRate * 0.4;

  // 4. Format & Deliverable Fit (Weight: 10%)
  let formatFitScore = 1.0;
  const hasFormatFilters =
    filters.aspectRatios.length > 0 || filters.deliverableTypes.length > 0;
  if (hasFormatFilters && matchedItems.length > 0) {
    let aspectMatches = 0;
    let deliverableMatches = 0;

    for (const item of matchedItems) {
      if (
        filters.aspectRatios.length === 0 ||
        filters.aspectRatios.includes(item.aspectRatio)
      ) {
        aspectMatches++;
      }
      if (
        filters.deliverableTypes.length === 0 ||
        filters.deliverableTypes.includes(item.deliverableType)
      ) {
        deliverableMatches++;
      }
    }

    const aspectRatioScore =
      filters.aspectRatios.length > 0
        ? aspectMatches / matchedItems.length
        : 1.0;
    const deliverableRatioScore =
      filters.deliverableTypes.length > 0
        ? deliverableMatches / matchedItems.length
        : 1.0;

    formatFitScore = (aspectRatioScore + deliverableRatioScore) / 2;
  }

  // 5. Availability Fit (Weight: 10%)
  let availabilityScore = 0.5;
  if (creator.availability === "open") {
    availabilityScore = 1.0;
  } else if (creator.availability === "limited") {
    availabilityScore = 0.6;
  } else if (creator.availability === "booked") {
    availabilityScore = 0.1;
  }

  // Composite Weighted Calculation
  const total =
    toolSpecFit * SCORING_WEIGHTS.toolSpecFit +
    verificationScore * SCORING_WEIGHTS.verification +
    reliabilityScore * SCORING_WEIGHTS.reliability +
    formatFitScore * SCORING_WEIGHTS.formatFit +
    availabilityScore * SCORING_WEIGHTS.availability;

  return Math.round(total * 1000) / 10; // Normalized 0-100 with 1 decimal place
}
