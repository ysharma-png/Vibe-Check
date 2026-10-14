import {
  CreatorProfile,
  CreatorProfileSchema,
  PortfolioItem,
  PortfolioItemSchema,
  CreativeBrief,
  CreativeBriefSchema,
  Tool,
  ToolSchema,
} from "@/types/schema";
import { TOOLS } from "@/lib/taxonomy";
import { CREATORS } from "./creators";
import { PORTFOLIO_ITEMS } from "./portfolio";
import { BRIEFS } from "./briefs";

export { CREATORS } from "./creators";
export { PORTFOLIO_ITEMS, deterministicHash } from "./portfolio";
export { BRIEFS } from "./briefs";
export { TOOLS } from "@/lib/taxonomy";

export interface DatasetValidationResult {
  readonly valid: boolean;
  readonly creatorsCount: number;
  readonly portfolioCount: number;
  readonly briefsCount: number;
  readonly toolsCount: number;
  readonly reproducibleCreatorsCount: number;
  readonly unverifiedLicenseCreatorsCount: number;
  readonly partiallyReproducibleItemsCount: number;
  readonly flaggedIpItemsCount: number;
  readonly unusedTools: readonly string[];
}

/**
 * Validates the entire mock dataset through Zod schemas and
 * performs comprehensive referential integrity & rubric coverage checks.
 *
 * Throws an Error with detailed diagnosis if any validation fails.
 */
export function validateDataset(): DatasetValidationResult {
  const errors: string[] = [];

  // 1. Zod Schema Validation
  const validTools: Tool[] = [];
  for (const tool of TOOLS) {
    const res = ToolSchema.safeParse(tool);
    if (!res.success) {
      errors.push(`Tool ${tool.id} failed schema: ${res.error.message}`);
    } else {
      validTools.push(res.data);
    }
  }

  const validCreators: CreatorProfile[] = [];
  for (const creator of CREATORS) {
    const res = CreatorProfileSchema.safeParse(creator);
    if (!res.success) {
      errors.push(`Creator ${creator.id} failed schema: ${res.error.message}`);
    } else {
      validCreators.push(res.data);
    }
  }

  const validItems: PortfolioItem[] = [];
  for (const item of PORTFOLIO_ITEMS) {
    const res = PortfolioItemSchema.safeParse(item);
    if (!res.success) {
      errors.push(`Portfolio item ${item.id} failed schema: ${res.error.message}`);
    } else {
      validItems.push(res.data);
    }
  }

  const validBriefs: CreativeBrief[] = [];
  for (const brief of BRIEFS) {
    const res = CreativeBriefSchema.safeParse(brief);
    if (!res.success) {
      errors.push(`Brief ${brief.id} failed schema: ${res.error.message}`);
    } else {
      validBriefs.push(res.data);
    }
  }

  // 2. Referential Integrity Maps
  const toolIds = new Set<string>(validTools.map((t) => t.id));
  const creatorIds = new Set<string>(validCreators.map((c) => c.id));
  const portfolioMap = new Map<string, PortfolioItem>(
    validItems.map((item) => [item.id, item])
  );

  // Check Creators
  for (const creator of validCreators) {
    for (const toolId of creator.primaryTools) {
      if (!toolIds.has(toolId)) {
        errors.push(
          `Creator ${creator.id} references non-existent primaryTool: ${toolId}`
        );
      }
    }
    for (const portId of creator.portfolioItemIds) {
      const item = portfolioMap.get(portId);
      if (!item) {
        errors.push(
          `Creator ${creator.id} references non-existent portfolio item: ${portId}`
        );
      } else if (item.creatorId !== creator.id) {
        errors.push(
          `Creator ${creator.id} portfolio item ${portId} has mismatched creatorId: ${item.creatorId}`
        );
      }
    }
  }

  // Check Portfolio Items
  const usedToolIds = new Set<string>();
  for (const item of validItems) {
    if (!creatorIds.has(item.creatorId)) {
      errors.push(
        `Portfolio item ${item.id} references non-existent creatorId: ${item.creatorId}`
      );
    }

    for (const toolId of item.toolchain) {
      usedToolIds.add(toolId);
      if (!toolIds.has(toolId)) {
        errors.push(
          `Portfolio item ${item.id} references non-existent tool in toolchain: ${toolId}`
        );
      }
    }

    const stageIdsInItem = new Set<string>();
    for (const stage of item.pipeline) {
      stageIdsInItem.add(stage.id);
      usedToolIds.add(stage.toolId);
      if (!toolIds.has(stage.toolId)) {
        errors.push(
          `Stage ${stage.id} in item ${item.id} references non-existent tool: ${stage.toolId}`
        );
      }
      for (const inputId of stage.inputStageIds) {
        if (!stageIdsInItem.has(inputId)) {
          errors.push(
            `Stage ${stage.id} references inputStageId ${inputId} not present before it in item ${item.id}`
          );
        }
      }
    }
  }

  // Check Briefs
  for (const brief of validBriefs) {
    for (const requiredTool of brief.toolRequirements.requiredToolIds) {
      if (!toolIds.has(requiredTool)) {
        errors.push(
          `Brief ${brief.id} requires non-existent toolId: ${requiredTool}`
        );
      }
    }
  }

  // 3. Rubric & Coverage Requirements
  if (validCreators.length < 6) {
    errors.push(`Expected at least 6 creators, found ${validCreators.length}`);
  }
  if (validItems.length < 14) {
    errors.push(`Expected at least 14 portfolio items, found ${validItems.length}`);
  }
  if (validBriefs.length < 3) {
    errors.push(`Expected at least 3 briefs, found ${validBriefs.length}`);
  }

  // At least 2 creators with reproduciblePipeline: true and full NodeGraph
  const reproducibleCreators = validCreators.filter((c) => {
    if (!c.verified.reproduciblePipeline) return false;
    const items = c.portfolioItemIds
      .map((id) => portfolioMap.get(id))
      .filter((it): it is PortfolioItem => it !== undefined);
    return items.some((it) => it.nodeGraph !== null);
  });
  if (reproducibleCreators.length < 2) {
    errors.push(
      `Expected at least 2 creators with reproduciblePipeline: true and a full NodeGraph, found ${reproducibleCreators.length}`
    );
  }

  // At least 1 creator with commercialLicense verified false
  const unverifiedLicenseCreators = validCreators.filter(
    (c) => !c.verified.commercialLicense
  );
  if (unverifiedLicenseCreators.length < 1) {
    errors.push(
      "Expected at least 1 creator with verified.commercialLicense === false"
    );
  }

  // At least 1 item whose reproducibility is 'partially_reproducible'
  const partiallyReproducibleItems = validItems.filter(
    (it) => it.reproducibility.kind === "partially_reproducible"
  );
  if (partiallyReproducibleItems.length < 1) {
    errors.push(
      "Expected at least 1 portfolio item with reproducibility.kind === 'partially_reproducible'"
    );
  }

  // At least 1 item with copyrightedIpScan 'flagged'
  const flaggedIpItems = validItems.filter(
    (it) => it.commercialSafety.copyrightedIpScan === "flagged"
  );
  if (flaggedIpItems.length < 1) {
    errors.push(
      "Expected at least 1 portfolio item with commercialSafety.copyrightedIpScan === 'flagged'"
    );
  }

  // At least one tool used by NO creator exactly (demo fallback)
  const unusedTools = Array.from(toolIds).filter(
    (id) =>
      !validCreators.some((c) => c.primaryTools.includes(id)) &&
      !usedToolIds.has(id)
  );
  if (unusedTools.length < 1) {
    errors.push(
      "Expected at least 1 tool in taxonomy unused by any creator (for zero-match fallback demo)"
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Dataset validation failed with ${errors.length} errors:\n- ` +
        errors.join("\n- ")
    );
  }

  return {
    valid: true,
    creatorsCount: validCreators.length,
    portfolioCount: validItems.length,
    briefsCount: validBriefs.length,
    toolsCount: validTools.length,
    reproducibleCreatorsCount: reproducibleCreators.length,
    unverifiedLicenseCreatorsCount: unverifiedLicenseCreators.length,
    partiallyReproducibleItemsCount: partiallyReproducibleItems.length,
    flaggedIpItemsCount: flaggedIpItems.length,
    unusedTools,
  };
}
