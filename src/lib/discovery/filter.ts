import {
  AspectRatio,
  CreatorProfile,
  DeliverableType,
  PortfolioItem,
  Specialization,
} from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { calculateCreatorScore } from "./score";

export type ToolMatchMode = "any" | "all";

export type SortOption =
  | "best_match"
  | "rate_asc"
  | "turnaround"
  | "reliability";

export interface FilterState {
  readonly query: string;
  readonly tools: readonly string[];
  readonly toolMatch: ToolMatchMode;
  readonly specializations: readonly Specialization[];
  readonly aspectRatios: readonly AspectRatio[];
  readonly deliverableTypes: readonly DeliverableType[];
  readonly styleTags: readonly string[];
  readonly verification: {
    readonly commercialLicense: boolean;
    readonly reproduciblePipeline: boolean;
  };
  readonly availability: readonly ("open" | "limited")[];
  readonly maxStartingRateUsd: number | null;
  readonly sort: SortOption;
}

export interface CreatorMatch {
  readonly creator: CreatorProfile;
  readonly matchedItems: readonly PortfolioItem[];
  readonly score: number;
  readonly matchReasons: readonly string[];
}

/**
 * Extracts all unique tools demonstrated in a portfolio item's pipeline & toolchain.
 */
export function getItemTools(item: PortfolioItem): Set<string> {
  const tools = new Set<string>(item.toolchain);
  for (const stage of item.pipeline) {
    tools.add(stage.toolId);
  }
  return tools;
}

/**
 * Tokenizes text into lowercase search terms for multi-keyword matching.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,._\-+/]+/)
    .filter((token) => token.length > 0);
}

/**
 * Evaluates whether a creator and their portfolio items match the given filter criteria.
 * Pure framework-free function with unit-testable signature.
 *
 * @param creators Full list of creator profiles
 * @param items Full list of portfolio items
 * @param filters Current active filters
 * @param toolSubstitutions Optional map of [originalToolId -> substituteToolId] with similarity & reasons
 */
export function applyFilters(
  creators: readonly CreatorProfile[],
  items: readonly PortfolioItem[],
  filters: FilterState,
  toolSubstitutions?: ReadonlyMap<
    string,
    { readonly substituteId: string; readonly similarity: number; readonly reason: string }
  >
): CreatorMatch[] {
  const itemMap = new Map<string, PortfolioItem>(
    items.map((it) => [it.id, it])
  );

  const queryTokens = tokenize(filters.query);

  const results: CreatorMatch[] = [];

  for (const creator of creators) {
    // 1. Hard Verification Filter
    if (
      filters.verification.commercialLicense &&
      !creator.verified.commercialLicense
    ) {
      continue;
    }
    if (
      filters.verification.reproduciblePipeline &&
      !creator.verified.reproduciblePipeline
    ) {
      continue;
    }

    // 2. Availability Filter
    if (
      filters.availability.length > 0 &&
      !filters.availability.includes(creator.availability as "open" | "limited")
    ) {
      continue;
    }

    // 3. Starting Rate Filter
    if (
      filters.maxStartingRateUsd !== null &&
      creator.startingRateUsd > filters.maxStartingRateUsd
    ) {
      continue;
    }

    // 4. Specialization Filter (creator-level)
    if (filters.specializations.length > 0) {
      const hasMatchingSpec = filters.specializations.some((spec) =>
        creator.specializations.includes(spec)
      );
      if (!hasMatchingSpec) {
        continue;
      }
    }

    // 5. Free-text search token matching
    if (queryTokens.length > 0) {
      const creatorToolNames = creator.primaryTools
        .map((tId) => getToolById(tId)?.name ?? tId)
        .join(" ");

      const searchableBlob = [
        creator.name,
        creator.handle,
        creator.bio,
        creator.location,
        creator.specializations.join(" "),
        creator.styleTags.join(" "),
        creatorToolNames,
      ]
        .join(" ")
        .toLowerCase();

      const matchesAllTokens = queryTokens.every((token) =>
        searchableBlob.includes(token)
      );
      if (!matchesAllTokens) {
        continue;
      }
    }

    // 6. Portfolio Items & Proof-of-Work Item Matching
    const creatorItems: PortfolioItem[] = [];
    for (const portId of creator.portfolioItemIds) {
      const it = itemMap.get(portId);
      if (it) {
        creatorItems.push(it);
      }
    }

    const matchedItems: PortfolioItem[] = [];
    const matchReasons: string[] = [];

    // Resolve target tool IDs (direct or substituted)
    const effectiveTargetTools = new Set<string>();
    const originalToSubMap = new Map<string, { substituteId: string; similarity: number; reason: string }>();

    for (const toolId of filters.tools) {
      const sub = toolSubstitutions?.get(toolId);
      if (sub) {
        effectiveTargetTools.add(sub.substituteId);
        originalToSubMap.set(toolId, sub);
      } else {
        effectiveTargetTools.add(toolId);
      }
    }

    for (const item of creatorItems) {
      const itemTools = getItemTools(item);

      // Tool matching against portfolio item
      let toolsMatch = true;
      if (filters.tools.length > 0) {
        if (filters.toolMatch === "any") {
          toolsMatch = Array.from(effectiveTargetTools).some((tId) =>
            itemTools.has(tId)
          );
        } else {
          // 'all' at item level or creator portfolio level
          toolsMatch = Array.from(effectiveTargetTools).some((tId) =>
            itemTools.has(tId)
          );
        }
      }

      // Aspect ratio matching against item
      let aspectMatch = true;
      if (filters.aspectRatios.length > 0) {
        aspectMatch = filters.aspectRatios.includes(item.aspectRatio);
      }

      // Deliverable type matching against item
      let deliverableMatch = true;
      if (filters.deliverableTypes.length > 0) {
        deliverableMatch = filters.deliverableTypes.includes(
          item.deliverableType
        );
      }

      // Style tag matching
      let styleMatch = true;
      if (filters.styleTags.length > 0) {
        const itemAndCreatorStyles = new Set([
          ...item.styleTags,
          ...creator.styleTags,
        ]);
        styleMatch = filters.styleTags.some((tag) =>
          itemAndCreatorStyles.has(tag)
        );
      }

      if (toolsMatch && aspectMatch && deliverableMatch && styleMatch) {
        matchedItems.push(item);
      }
    }

    // If item-level constraints were given (tools, aspect, deliverable) and none matched:
    const hasItemFilters =
      filters.tools.length > 0 ||
      filters.aspectRatios.length > 0 ||
      filters.deliverableTypes.length > 0;

    if (hasItemFilters && matchedItems.length === 0) {
      continue;
    }

    // If toolMatch === "all", verify creator's matched items jointly cover all required tools
    if (filters.tools.length > 0 && filters.toolMatch === "all") {
      const allMatchedTools = new Set<string>();
      for (const item of matchedItems) {
        for (const t of Array.from(getItemTools(item))) {
          allMatchedTools.add(t);
        }
      }
      const coversAll = Array.from(effectiveTargetTools).every((tId) =>
        allMatchedTools.has(tId)
      );
      if (!coversAll) {
        continue;
      }
    }

    // Compile human-readable match reasons
    if (filters.tools.length > 0) {
      for (const [origId, sub] of Array.from(originalToSubMap.entries())) {
        const origTool = getToolById(origId);
        const subTool = getToolById(sub.substituteId);
        const origName = origTool?.name ?? origId;
        const subName = subTool?.name ?? sub.substituteId;
        const simPct = Math.round(sub.similarity * 100);
        matchReasons.push(
          `Substituted ${origName} with ${subName} (${simPct}% similarity): ${sub.reason}`
        );
      }

      for (const tId of filters.tools) {
        if (!originalToSubMap.has(tId)) {
          const t = getToolById(tId);
          matchReasons.push(
            `Demonstrates verified work with ${t?.name ?? tId}`
          );
        }
      }
    }

    if (filters.specializations.length > 0) {
      const matching = filters.specializations.filter((s) =>
        creator.specializations.includes(s)
      );
      if (matching.length > 0) {
        matchReasons.push(`Specializes in ${matching.join(", ")}`);
      }
    }

    if (creator.verified.reproduciblePipeline) {
      matchReasons.push("Verified deterministic node graph reproducible on client hardware");
    }
    if (creator.verified.commercialLicense) {
      matchReasons.push("Enterprise commercial license & IP indemnification verified");
    }

    // Calculate score
    const score = calculateCreatorScore(
      creator,
      matchedItems,
      filters,
      toolSubstitutions
    );

    results.push({
      creator,
      matchedItems: matchedItems.length > 0 ? matchedItems : creatorItems,
      score,
      matchReasons,
    });
  }

  // 7. Sort Results
  return results.sort((a, b) => {
    switch (filters.sort) {
      case "rate_asc":
        return a.creator.startingRateUsd - b.creator.startingRateUsd;
      case "turnaround":
        return (
          a.creator.stats.avgTurnaroundDays -
          b.creator.stats.avgTurnaroundDays
        );
      case "reliability": {
        const relA =
          a.creator.stats.onTimeRate * 0.6 +
          a.creator.stats.repeatClientRate * 0.4;
        const relB =
          b.creator.stats.onTimeRate * 0.6 +
          b.creator.stats.repeatClientRate * 0.4;
        return relB - relA;
      }
      case "best_match":
      default:
        return b.score - a.score;
    }
  });
}
