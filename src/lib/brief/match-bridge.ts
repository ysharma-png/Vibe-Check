import { CreativeBrief } from "@/types/schema";
import { applyFilters, FilterState } from "@/lib/discovery/filter";
import { serializeFilterState, DEFAULT_FILTER_STATE } from "@/lib/discovery/url-state";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";

/**
 * Bridges a CreativeBrief specification to the Discovery FilterState.
 * This connects the Brief Builder directly to Discovery & Filtering.
 */
export function briefToFilterState(brief: Partial<CreativeBrief>): FilterState {
  return {
    ...DEFAULT_FILTER_STATE,
    aspectRatios: brief.aspectRatios && brief.aspectRatios.length > 0 ? brief.aspectRatios : [],
    deliverableTypes: brief.deliverableType ? [brief.deliverableType] : [],
    tools:
      brief.toolRequirements && brief.toolRequirements.requiredToolIds.length > 0
        ? brief.toolRequirements.requiredToolIds
        : [],
    toolMatch: "any",
    verification: {
      commercialLicense: Boolean(brief.commercialTerms?.requiresVerifiedLicense),
      reproduciblePipeline: Boolean(brief.commercialTerms?.requiresReproduciblePipeline),
    },
    maxStartingRateUsd:
      typeof brief.totalBudgetUsd === "number" && brief.totalBudgetUsd > 0
        ? brief.totalBudgetUsd
        : null,
    styleTags: brief.styleReferences && brief.styleReferences.length > 0 ? brief.styleReferences : [],
    query: "",
    sort: "best_match",
  };
}

/**
 * Computes how many creators in the real dataset match the brief's current requirements.
 */
export function countMatchingCreators(brief: Partial<CreativeBrief>): number {
  const filterState = briefToFilterState(brief);
  const matches = applyFilters(CREATORS, PORTFOLIO_ITEMS, filterState);
  return matches.length;
}

/**
 * Generates the serialized Discovery URL query string for the brief's parameters.
 */
export function buildDiscoveryUrlForBrief(brief: Partial<CreativeBrief>): string {
  const filterState = briefToFilterState(brief);
  const query = serializeFilterState(filterState);
  return query ? `/${query}` : "/";
}

/**
 * Computes real-time dataset verification statistics for live copy in CommercialTermsSection.
 */
export function getVerificationStats() {
  const totalCreators = CREATORS.length;
  const verifiedLicenseCount = CREATORS.filter((c) => c.verified.commercialLicense).length;
  const reproduciblePipelineCount = CREATORS.filter((c) => c.verified.reproduciblePipeline).length;

  return {
    totalCreators,
    verifiedLicenseCount,
    reproduciblePipelineCount,
  };
}
