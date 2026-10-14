import { describe, it, expect } from "vitest";
import {
  autoBalanceMilestones,
  calculateMilestoneAmounts,
  validateMilestonesSum,
} from "../budget";
import {
  briefToFilterState,
  buildDiscoveryUrlForBrief,
  countMatchingCreators,
  getVerificationStats,
} from "../match-bridge";
import { validateBrief } from "../validate";
import { CreativeBrief, Milestone } from "@/types/schema";
import { DEFAULT_COMMERCIAL_TERMS, COPYRIGHT_NEGATIVE_CONSTRAINT } from "../defaults";

describe("Brief Core Logic & Budget Escrow", () => {
  it("validates milestone percentages summing to 100%", () => {
    const validMilestones: Milestone[] = [
      { id: "m1", name: "Concept", description: "Deck", percentOfBudget: 25, deliverable: "PDF" },
      { id: "m2", name: "Rough Cut", description: "Cut", percentOfBudget: 50, deliverable: "MP4" },
      { id: "m3", name: "Master", description: "4K", percentOfBudget: 25, deliverable: "Archive" },
    ];

    const check = validateMilestonesSum(validMilestones);
    expect(check.valid).toBe(true);
    expect(check.sum).toBe(100);
    expect(check.diff).toBe(0);

    const invalidMilestones: Milestone[] = [
      { id: "m1", name: "Concept", description: "Deck", percentOfBudget: 20, deliverable: "PDF" },
      { id: "m2", name: "Rough Cut", description: "Cut", percentOfBudget: 50, deliverable: "MP4" },
    ];
    const invalidCheck = validateMilestonesSum(invalidMilestones);
    expect(invalidCheck.valid).toBe(false);
    expect(invalidCheck.sum).toBe(70);
    expect(invalidCheck.diff).toBe(30);
  });

  it("auto-balances uneven milestone percentages to strictly 100%", () => {
    const uneven: Milestone[] = [
      { id: "m1", name: "Phase 1", description: "", percentOfBudget: 30, deliverable: "" },
      { id: "m2", name: "Phase 2", description: "", percentOfBudget: 30, deliverable: "" },
      { id: "m3", name: "Phase 3", description: "", percentOfBudget: 30, deliverable: "" },
    ];

    const balanced = autoBalanceMilestones(uneven);
    const sum = balanced.reduce((acc, m) => acc + m.percentOfBudget, 0);
    expect(sum).toBe(100);
  });

  it("calculates exact USD escrow amounts per milestone", () => {
    const milestones: Milestone[] = [
      { id: "m1", name: "Concept", description: "", percentOfBudget: 20, deliverable: "" },
      { id: "m2", name: "Production", description: "", percentOfBudget: 50, deliverable: "" },
      { id: "m3", name: "Delivery", description: "", percentOfBudget: 30, deliverable: "" },
    ];

    const withAmounts = calculateMilestoneAmounts(milestones, 10000);
    expect(withAmounts[0]?.amountUsd).toBe(2000);
    expect(withAmounts[1]?.amountUsd).toBe(5000);
    expect(withAmounts[2]?.amountUsd).toBe(3000);
  });

  it("bridges brief parameters into discovery FilterState and serializes URL", () => {
    const mockBrief: Partial<CreativeBrief> = {
      campaignTitle: "Pulse Energy Sprint",
      aspectRatios: ["9:16"],
      deliverableType: "social_short_form",
      toolRequirements: {
        mode: "required_tools",
        requiredToolIds: ["flux-1-dev", "runway-gen3"],
        baseModelPolicy: "permissive_only",
      },
      commercialTerms: {
        ...DEFAULT_COMMERCIAL_TERMS,
        requiresVerifiedLicense: true,
        requiresReproduciblePipeline: true,
      },
      totalBudgetUsd: 5000,
    };

    const filterState = briefToFilterState(mockBrief);
    expect(filterState.aspectRatios).toEqual(["9:16"]);
    expect(filterState.deliverableTypes).toEqual(["social_short_form"]);
    expect(filterState.tools).toEqual(["flux-1-dev", "runway-gen3"]);
    expect(filterState.verification.commercialLicense).toBe(true);
    expect(filterState.verification.reproduciblePipeline).toBe(true);
    expect(filterState.maxStartingRateUsd).toBe(5000);

    const url = buildDiscoveryUrlForBrief(mockBrief);
    expect(url).toContain("aspect=9%3A16");
    expect(url).toContain("deliverable=social_short_form");
    expect(url).toContain("tools=flux-1-dev%2Crunway-gen3");
    expect(url).toContain("verified=1");
    expect(url).toContain("reproducible=1");
  });

  it("computes live creator qualification counts", () => {
    const stats = getVerificationStats();
    expect(stats.totalCreators).toBe(6);
    expect(stats.verifiedLicenseCount).toBeGreaterThan(0);
    expect(stats.reproduciblePipelineCount).toBeGreaterThan(0);
  });

  it("validates full brief against CreativeBrief schema", () => {
    const validBrief: CreativeBrief = {
      id: "brief-test-1",
      campaignTitle: "Test Campaign",
      description: "Test description for validation",
      brandName: "Acme Corp",
      deliverableType: "social_short_form",
      aspectRatios: ["9:16"],
      resolution: "1080p",
      durationSec: 15,
      styleReferences: ["Kinetic"],
      toolRequirements: {
        mode: "open_to_creator_choice",
        requiredToolIds: [],
        baseModelPolicy: "any",
      },
      negativeConstraints: [COPYRIGHT_NEGATIVE_CONSTRAINT],
      commercialTerms: DEFAULT_COMMERCIAL_TERMS,
      milestones: [
        { id: "m1", name: "Concept", description: "Style", percentOfBudget: 50, deliverable: "PDF" },
        { id: "m2", name: "Master", description: "Video", percentOfBudget: 50, deliverable: "MP4" },
      ],
      totalBudgetUsd: 5000,
      deadline: "2026-12-01T00:00:00.000Z",
    };

    const result = validateBrief(validBrief);
    expect(result.success).toBe(true);
    expect(result.missingFields).toHaveLength(0);

    // Invalid when milestone sum != 100
    const invalidBrief = {
      ...validBrief,
      milestones: [
        { id: "m1", name: "Concept", description: "Style", percentOfBudget: 40, deliverable: "PDF" },
      ],
    };
    const invalidResult = validateBrief(invalidBrief);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.missingFields.length).toBeGreaterThan(0);
  });
});
