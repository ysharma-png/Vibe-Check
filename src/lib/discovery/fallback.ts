import {
  AspectRatio,
  CreatorProfile,
  PortfolioItem,
  Specialization,
} from "@/types/schema";
import { getEquivalents, getToolById } from "@/lib/taxonomy";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { applyFilters, CreatorMatch, FilterState } from "./filter";

export type RelaxationStepKind =
  | "tool_substitution"
  | "specialization_adjacent"
  | "format_flex"
  | "drop_soft";

export interface RelaxationStep {
  readonly kind: RelaxationStepKind;
  readonly description: string;
  readonly original: string;
  readonly substitute: string;
  readonly similarity?: number;
}

export type DiscoveryResult =
  | { readonly kind: "exact"; readonly matches: readonly CreatorMatch[] }
  | {
      readonly kind: "relaxed";
      readonly matches: readonly CreatorMatch[];
      readonly relaxation: readonly RelaxationStep[];
      readonly narrative: string;
    }
  | {
      readonly kind: "nothing_close";
      readonly popular: readonly CreatorMatch[];
      readonly narrative: string;
    };

export const SPECIALIZATION_ADJACENCY: Record<
  Specialization,
  readonly Specialization[]
> = {
  "Consistent Character": [
    "AI Cinematic Video",
    "Lip-Sync",
    "Style Transfer",
  ],
  "Camera Motion Control": [
    "AI Cinematic Video",
    "Product Visualization",
    "3D / NeRF",
  ],
  "Lip-Sync": [
    "Consistent Character",
    "Style Transfer",
    "Vertical Social Shorts",
  ],
  "Product Visualization": [
    "Camera Motion Control",
    "Upscale & Restoration",
    "3D / NeRF",
  ],
  "Style Transfer": [
    "Motion Graphics",
    "Consistent Character",
    "AI Cinematic Video",
  ],
  "AI Cinematic Video": [
    "Camera Motion Control",
    "Consistent Character",
    "Motion Graphics",
  ],
  "Motion Graphics": [
    "Style Transfer",
    "Vertical Social Shorts",
    "AI Cinematic Video",
  ],
  "Vertical Social Shorts": [
    "Camera Motion Control",
    "Motion Graphics",
    "AI Cinematic Video",
  ],
  "3D / NeRF": [
    "Camera Motion Control",
    "Product Visualization",
    "AI Cinematic Video",
  ],
  "Upscale & Restoration": [
    "Product Visualization",
    "AI Cinematic Video",
  ],
  "AI film/short film": [
    "AI Cinematic Video",
    "Camera Motion Control",
    "music videos",
  ],
  "AI animation (2D/3D/anime)": [
    "Consistent Character",
    "Lip-Sync",
    "brand mascots/characters",
  ],
  "product ads": [
    "Product Visualization",
    "social shorts",
    "architecture/real estate visualization",
  ],
  "music videos": [
    "AI film/short film",
    "AI Cinematic Video",
    "Style Transfer",
  ],
  "fashion/lookbook": [
    "Style Transfer",
    "product ads",
    "social shorts",
  ],
  "social shorts": [
    "Vertical Social Shorts",
    "product ads",
    "Lip-Sync",
  ],
  "explainer/educational": [
    "Motion Graphics",
    "podcast/audio and voice",
    "social shorts",
  ],
  "game assets/concept art": [
    "3D / NeRF",
    "brand mascots/characters",
    "Consistent Character",
  ],
  "architecture/real estate visualization": [
    "3D / NeRF",
    "Product Visualization",
    "Camera Motion Control",
  ],
  "brand mascots/characters": [
    "Consistent Character",
    "AI animation (2D/3D/anime)",
    "game assets/concept art",
  ],
  "podcast/audio and voice": [
    "explainer/educational",
    "Lip-Sync",
    "AI film/short film",
  ],
  "VFX/upscaling/restoration": [
    "Upscale & Restoration",
    "AI film/short film",
    "Camera Motion Control",
  ],
};

export const ASPECT_RATIO_ADJACENCY: Record<
  AspectRatio,
  readonly AspectRatio[]
> = {
  "9:16": ["4:5", "1:1"],
  "4:5": ["9:16", "1:1"],
  "1:1": ["4:5", "9:16", "16:9"],
  "16:9": ["21:9", "1:1"],
  "21:9": ["16:9"],
};

function buildRelaxationNarrative(
  steps: readonly RelaxationStep[],
  matchCount: number,
  filters: FilterState
): string {
  const narrativeParts: string[] = [];

  const toolStep = steps.find((s) => s.kind === "tool_substitution");
  const specStep = steps.find((s) => s.kind === "specialization_adjacent");
  const formatStep = steps.find((s) => s.kind === "format_flex");
  const dropStep = steps.find((s) => s.kind === "drop_soft");

  const verifRequirements: string[] = [];
  if (filters.verification.commercialLicense) {
    verifRequirements.push("verified commercial license");
  }
  if (filters.verification.reproduciblePipeline) {
    verifRequirements.push("reproducible pipeline");
  }
  const verifClause =
    verifRequirements.length > 0
      ? ` and satisfy your ${verifRequirements.join(" and ")} requirement`
      : "";

  if (toolStep) {
    narrativeParts.push(
      `No creators currently list ${toolStep.original}. ${matchCount} verified specialists work in comparable pipelines (${toolStep.substitute})${verifClause}.`
    );
  } else if (specStep) {
    narrativeParts.push(
      `No creators currently offer ${specStep.original}${verifClause}. Found ${matchCount} specialists with adjacent expertise in ${specStep.substitute}.`
    );
  } else if (dropStep) {
    narrativeParts.push(
      `No creators currently match your rate ceiling of $${filters.maxStartingRateUsd ?? "N/A"}${verifClause}. Found ${matchCount} creators by expanding to market rates.`
    );
  } else if (formatStep) {
    narrativeParts.push(
      `No creators list native ${formatStep.original} masters. Found ${matchCount} specialists able to reframe from ${formatStep.substitute}${verifClause}.`
    );
  } else {
    narrativeParts.push(
      `Expanded query constraints to surface ${matchCount} matching specialists${verifClause}.`
    );
  }

  return narrativeParts.join(" ");
}

/**
 * Resolves a discovery search by executing exact filtering, or progressively
 * walking down the 4-step relaxation ladder. Stops at the first step yielding >= 3 matches.
 *
 * HARD CONSTRAINTS (commercialLicense & reproduciblePipeline) ARE NEVER RELAXED.
 */
export function resolveDiscovery(
  filters: FilterState,
  creators: readonly CreatorProfile[] = CREATORS,
  items: readonly PortfolioItem[] = PORTFOLIO_ITEMS
): DiscoveryResult {
  // 1. Exact Match Attempt
  const exactMatches = applyFilters(creators, items, filters);
  if (exactMatches.length > 0) {
    return {
      kind: "exact",
      matches: exactMatches,
    };
  }

  // Ladder state accumulators
  let currentFilters: FilterState = { ...filters };
  let currentSubstitutions = new Map<
    string,
    { substituteId: string; similarity: number; reason: string }
  >();
  const cumulativeSteps: RelaxationStep[] = [];

  let bestMatches: CreatorMatch[] = [];
  let bestSteps: RelaxationStep[] = [];

  // ==========================================================================
  // LADDER STEP 1: TOOL SUBSTITUTION
  // ==========================================================================
  if (filters.tools.length > 0) {
    const substSteps: RelaxationStep[] = [];
    const substitutions = new Map<
      string,
      { substituteId: string; similarity: number; reason: string }
    >();

    for (const toolId of filters.tools) {
      const equivalents = getEquivalents(toolId);
      if (equivalents.length > 0) {
        const top = equivalents[0];
        if (top) {
          substitutions.set(toolId, {
            substituteId: top.toolId,
            similarity: top.similarity,
            reason: top.reason,
          });
          const origName = getToolById(toolId)?.name ?? toolId;
          const subName = getToolById(top.toolId)?.name ?? top.toolId;
          substSteps.push({
            kind: "tool_substitution",
            description: `Substituted ${origName} with ${subName} (${Math.round(top.similarity * 100)}% similarity)`,
            original: origName,
            substitute: subName,
            similarity: top.similarity,
          });
        }
      }
    }

    if (substitutions.size > 0) {
      currentSubstitutions = substitutions;
      cumulativeSteps.push(...substSteps);

      const matches = applyFilters(
        creators,
        items,
        currentFilters,
        currentSubstitutions
      );
      if (matches.length >= 3) {
        return {
          kind: "relaxed",
          matches,
          relaxation: [...cumulativeSteps],
          narrative: buildRelaxationNarrative(
            cumulativeSteps,
            matches.length,
            filters
          ),
        };
      }
      if (matches.length > bestMatches.length) {
        bestMatches = matches;
        bestSteps = [...cumulativeSteps];
      }
    }
  }

  // ==========================================================================
  // LADDER STEP 2: SPECIALIZATION ADJACENT
  // ==========================================================================
  if (filters.specializations.length > 0) {
    const expandedSpecs = new Set<Specialization>(filters.specializations);
    const addedSpecs: Specialization[] = [];

    for (const spec of filters.specializations) {
      const adjacent = SPECIALIZATION_ADJACENCY[spec] ?? [];
      for (const adj of adjacent) {
        if (!expandedSpecs.has(adj)) {
          expandedSpecs.add(adj);
          addedSpecs.push(adj);
        }
      }
    }

    if (addedSpecs.length > 0) {
      currentFilters = {
        ...currentFilters,
        specializations: Array.from(expandedSpecs),
      };
      cumulativeSteps.push({
        kind: "specialization_adjacent",
        description: `Broadened specializations to include: ${addedSpecs.join(", ")}`,
        original: filters.specializations.join(", "),
        substitute: addedSpecs.join(", "),
        similarity: 0.75,
      });

      const matches = applyFilters(
        creators,
        items,
        currentFilters,
        currentSubstitutions
      );
      if (matches.length >= 3) {
        return {
          kind: "relaxed",
          matches,
          relaxation: [...cumulativeSteps],
          narrative: buildRelaxationNarrative(
            cumulativeSteps,
            matches.length,
            filters
          ),
        };
      }
      if (matches.length > bestMatches.length) {
        bestMatches = matches;
        bestSteps = [...cumulativeSteps];
      }
    }
  }

  // ==========================================================================
  // LADDER STEP 3: FORMAT FLEX (ASPECT RATIOS)
  // ==========================================================================
  if (filters.aspectRatios.length > 0) {
    const expandedAspects = new Set<AspectRatio>(filters.aspectRatios);
    const addedAspects: AspectRatio[] = [];

    for (const aspect of filters.aspectRatios) {
      const adjacent = ASPECT_RATIO_ADJACENCY[aspect] ?? [];
      for (const adj of adjacent) {
        if (!expandedAspects.has(adj)) {
          expandedAspects.add(adj);
          addedAspects.push(adj);
        }
      }
    }

    if (addedAspects.length > 0) {
      currentFilters = {
        ...currentFilters,
        aspectRatios: Array.from(expandedAspects),
      };
      cumulativeSteps.push({
        kind: "format_flex",
        description: `Allowing reframing from adjacent formats: ${addedAspects.join(", ")}`,
        original: filters.aspectRatios.join(", "),
        substitute: addedAspects.join(", "),
        similarity: 0.85,
      });

      const matches = applyFilters(
        creators,
        items,
        currentFilters,
        currentSubstitutions
      );
      if (matches.length >= 3) {
        return {
          kind: "relaxed",
          matches,
          relaxation: [...cumulativeSteps],
          narrative: buildRelaxationNarrative(
            cumulativeSteps,
            matches.length,
            filters
          ),
        };
      }
      if (matches.length > bestMatches.length) {
        bestMatches = matches;
        bestSteps = [...cumulativeSteps];
      }
    }
  }

  // ==========================================================================
  // LADDER STEP 4: DROP SOFT CONSTRAINTS (RATES & STYLES)
  // ==========================================================================
  const hadSoftConstraints =
    filters.maxStartingRateUsd !== null || filters.styleTags.length > 0;

  if (hadSoftConstraints) {
    currentFilters = {
      ...currentFilters,
      styleTags: [],
      maxStartingRateUsd: null,
    };
    cumulativeSteps.push({
      kind: "drop_soft",
      description: "Relaxed budget ceiling and specific aesthetic tags",
      original: `Rate: ${filters.maxStartingRateUsd ? `$${filters.maxStartingRateUsd}` : "Any"}, Styles: ${filters.styleTags.join(", ") || "None"}`,
      substitute: "Open Market Rates & Broader Aesthetics",
    });

    const matches = applyFilters(
      creators,
      items,
      currentFilters,
      currentSubstitutions
    );
    if (matches.length >= 3) {
      return {
        kind: "relaxed",
        matches,
        relaxation: [...cumulativeSteps],
        narrative: buildRelaxationNarrative(
          cumulativeSteps,
          matches.length,
          filters
        ),
      };
    }
    if (matches.length > bestMatches.length) {
      bestMatches = matches;
      bestSteps = [...cumulativeSteps];
    }
  }

  // If exhausted ladder and best step yielded at least 1 match:
  if (bestMatches.length >= 1) {
    return {
      kind: "relaxed",
      matches: bestMatches,
      relaxation: bestSteps,
      narrative: buildRelaxationNarrative(bestSteps, bestMatches.length, filters),
    };
  }

  // ==========================================================================
  // NOTHING CLOSE FALLBACK (Still never empty)
  // Hard verification constraints are strictly preserved.
  // ==========================================================================
  const fallbackFilter: FilterState = {
    query: "",
    tools: [],
    toolMatch: "any",
    specializations: [],
    aspectRatios: [],
    deliverableTypes: [],
    styleTags: [],
    verification: {
      commercialLicense: filters.verification.commercialLicense,
      reproduciblePipeline: filters.verification.reproduciblePipeline,
    },
    availability: [],
    maxStartingRateUsd: null,
    sort: "reliability",
  };

  const popular = applyFilters(creators, items, fallbackFilter);

  const verifNotes: string[] = [];
  if (filters.verification.commercialLicense) {
    verifNotes.push("commercial license verification");
  }
  if (filters.verification.reproduciblePipeline) {
    verifNotes.push("reproducible pipeline verification");
  }

  const verifPhrase =
    verifNotes.length > 0
      ? ` who strictly meet your ${verifNotes.join(" & ")} criteria`
      : "";

  return {
    kind: "nothing_close",
    popular: popular.slice(0, 4),
    narrative: `No creators matched this specific criteria even after relaxing tools, specializations, and budget limits. Here are the top vetted creators${verifPhrase}.`,
  };
}
