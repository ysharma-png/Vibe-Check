import { describe, it, expect } from "vitest";
import {
  validateDataset,
  CREATORS,
  PORTFOLIO_ITEMS,
  BRIEFS,
  TOOLS,
} from "../index";
import { getEquivalents, getToolById } from "@/lib/taxonomy";
import { CreativeBriefSchema } from "@/types/schema";

describe("Dataset Integrity & Taxonomy Verification", () => {
  it("passes comprehensive Zod validation and referential integrity checks", () => {
    const result = validateDataset();
    expect(result.valid).toBe(true);
    expect(result.creatorsCount).toBe(6);
    expect(result.portfolioCount).toBeGreaterThanOrEqual(14);
    expect(result.briefsCount).toBe(3);
    expect(result.toolsCount).toBeGreaterThanOrEqual(16);
    expect(result.reproducibleCreatorsCount).toBeGreaterThanOrEqual(2);
    expect(result.unverifiedLicenseCreatorsCount).toBeGreaterThanOrEqual(1);
    expect(result.partiallyReproducibleItemsCount).toBeGreaterThanOrEqual(1);
    expect(result.flaggedIpItemsCount).toBeGreaterThanOrEqual(1);
    expect(result.unusedTools).toContain("luma-dream-machine");
  });

  it("verifies taxonomy equivalence graph returns factually defensible substitutes", () => {
    const fluxEquivalents = getEquivalents("flux-1-dev");
    expect(fluxEquivalents.length).toBeGreaterThan(0);
    expect(fluxEquivalents[0]?.toolId).toBe("flux-1-pro");
    expect(fluxEquivalents[0]?.similarity).toBeGreaterThanOrEqual(0.9);
    expect(fluxEquivalents[0]?.reason).toContain("rectified flow");

    const runwayEquivalents = getEquivalents("runway-gen3");
    expect(runwayEquivalents.some((e) => e.toolId === "kling-1-5")).toBe(true);
    expect(runwayEquivalents.some((e) => e.toolId === "luma-dream-machine")).toBe(
      true
    );
  });

  it("confirms creative brief refinements reject invalid milestone sums and missing terms", () => {
    const sampleBrief = BRIEFS[0];
    expect(sampleBrief).toBeDefined();
    if (!sampleBrief) return;

    // Reject milestone sum != 100
    const invalidMilestones = {
      ...sampleBrief,
      milestones: [
        {
          id: "m-invalid",
          name: "Invalid",
          description: "Does not sum to 100",
          percentOfBudget: 60,
          deliverable: "None",
        },
      ],
    };
    const milestoneCheck = CreativeBriefSchema.safeParse(invalidMilestones);
    expect(milestoneCheck.success).toBe(false);

    // Reject regional brief without regions array
    const invalidRegional = {
      ...sampleBrief,
      commercialTerms: {
        ...sampleBrief.commercialTerms,
        territory: "regional" as const,
        regions: [],
      },
    };
    const regionalCheck = CreativeBriefSchema.safeParse(invalidRegional);
    expect(regionalCheck.success).toBe(false);
  });

  it("ensures all creator references and tools resolve correctly", () => {
    for (const creator of CREATORS) {
      expect(creator.portfolioItemIds.length).toBeGreaterThan(0);
      for (const toolId of creator.primaryTools) {
        expect(getToolById(toolId)).toBeDefined();
      }
    }
  });

  it("verifies pipeline deterministic hash format", () => {
    for (const item of PORTFOLIO_ITEMS) {
      for (const stage of item.pipeline) {
        if (stage.checkpointHash) {
          expect(stage.checkpointHash).toMatch(/^[a-f0-9]{12}$/);
        }
      }
    }
  });
});
