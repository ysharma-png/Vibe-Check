import { describe, it, expect } from "vitest";
import { resolveDiscovery } from "../fallback";
import { applyFilters, FilterState } from "../filter";
import {
  DEFAULT_FILTER_STATE,
  parseSearchParams,
  serializeFilterState,
} from "../url-state";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";

describe("Discovery Filtering & Intelligent Fallback", () => {
  it("returns exact matches when matching criteria exist", () => {
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      tools: ["flux-1-dev"],
      specializations: ["Consistent Character"],
    };

    const result = resolveDiscovery(filters, CREATORS, PORTFOLIO_ITEMS);
    expect(result.kind).toBe("exact");
    if (result.kind === "exact") {
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches.some((m) => m.creator.id === "creator-amara")).toBe(
        true
      );
    }
  });

  it("handles Demo Trap 1: Luma Dream Machine tool substitution", () => {
    // Demo Trap 1: Requesting "luma-dream-machine" (which 0 creators have directly)
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      tools: ["luma-dream-machine"],
    };

    const result = resolveDiscovery(filters, CREATORS, PORTFOLIO_ITEMS);
    expect(result.kind).toBe("relaxed");
    if (result.kind === "relaxed") {
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
      expect(result.relaxation.length).toBeGreaterThan(0);
      expect(
        result.relaxation.some((s) => s.kind === "tool_substitution")
      ).toBe(true);
      expect(result.narrative).toContain("Luma Dream Machine");
      expect(result.narrative).toMatch(/Runway|Kling|Veo/i);
    }
  });

  it("handles Demo Trap 2: 3D / NeRF with verified commercial license", () => {
    // Demo Trap 2: Kenji is the only NeRF creator, but his commercialLicense is false.
    // Asking for 3D / NeRF + commercialLicense: true yields 0 exact matches.
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      specializations: ["3D / NeRF"],
      verification: {
        commercialLicense: true,
        reproduciblePipeline: false,
      },
    };

    const result = resolveDiscovery(filters, CREATORS, PORTFOLIO_ITEMS);
    expect(result.kind).toBe("relaxed");
    if (result.kind === "relaxed") {
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
      // Confirms all returned matches strictly hold commercialLicense === true
      for (const match of result.matches) {
        expect(match.creator.verified.commercialLicense).toBe(true);
      }
      expect(
        result.relaxation.some((s) => s.kind === "specialization_adjacent")
      ).toBe(true);
    }
  });

  it("handles Demo Trap 3: Consistent Character with tight budget ceiling", () => {
    // Demo Trap 3: Amara ($2,400) and Min-Jun ($1,800) exceed $1,500 budget cap.
    const filters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      specializations: ["Consistent Character"],
      maxStartingRateUsd: 1500,
      verification: {
        commercialLicense: false,
        reproduciblePipeline: true,
      },
    };

    const result = resolveDiscovery(filters, CREATORS, PORTFOLIO_ITEMS);
    expect(result.kind).toBe("relaxed");
    if (result.kind === "relaxed") {
      expect(result.matches.length).toBeGreaterThanOrEqual(1);
      // Hard reproduciblePipeline constraint is strictly maintained
      for (const match of result.matches) {
        expect(match.creator.verified.reproduciblePipeline).toBe(true);
      }
      expect(result.relaxation.some((s) => s.kind === "drop_soft")).toBe(true);
    }
  });

  it("never relaxes hard verification constraints under any circumstance", () => {
    // Impossible query with both hard verification constraints
    const impossibleFilters: FilterState = {
      ...DEFAULT_FILTER_STATE,
      tools: ["luma-dream-machine"],
      specializations: ["3D / NeRF"],
      verification: {
        commercialLicense: true,
        reproduciblePipeline: true,
      },
      maxStartingRateUsd: 500, // No creator exists at $500 with both verifications
    };

    const result = resolveDiscovery(
      impossibleFilters,
      CREATORS,
      PORTFOLIO_ITEMS
    );

    if (result.kind === "relaxed") {
      for (const match of result.matches) {
        expect(match.creator.verified.commercialLicense).toBe(true);
        expect(match.creator.verified.reproduciblePipeline).toBe(true);
      }
    } else if (result.kind === "nothing_close") {
      // popular creators returned MUST still satisfy hard verification
      for (const match of result.popular) {
        expect(match.creator.verified.commercialLicense).toBe(true);
        expect(match.creator.verified.reproduciblePipeline).toBe(true);
      }
    }
  });

  it("ensures nothing_close never returns an empty array", () => {
    const hyperConstrained: FilterState = {
      ...DEFAULT_FILTER_STATE,
      query: "nonexistent_term_xyz_12345",
      verification: {
        commercialLicense: true,
        reproduciblePipeline: true,
      },
    };

    const result = resolveDiscovery(
      hyperConstrained,
      CREATORS,
      PORTFOLIO_ITEMS
    );

    if (result.kind === "nothing_close") {
      expect(result.popular.length).toBeGreaterThan(0);
      expect(result.narrative.length).toBeGreaterThan(10);
    } else {
      expect(result.matches.length).toBeGreaterThan(0);
    }
  });

  it("supports URL state round-trip serialization and alias mapping", () => {
    const original: FilterState = {
      query: "cyberpunk",
      tools: ["luma-dream-machine", "flux-1-dev"],
      toolMatch: "any",
      specializations: ["Consistent Character"],
      aspectRatios: ["9:16"],
      deliverableTypes: ["social_short_form"],
      styleTags: ["Afrofuturism"],
      verification: {
        commercialLicense: true,
        reproduciblePipeline: false,
      },
      availability: ["open"],
      maxStartingRateUsd: 2500,
      sort: "reliability",
    };

    const url = serializeFilterState(original);
    expect(url).toContain("q=cyberpunk");
    expect(url).toContain("tools=luma-dream-machine%2Cflux-1-dev");
    expect(url).toContain("verified=1");
    expect(url).toContain("rate=2500");

    const parsed = parseSearchParams(new URLSearchParams(url.replace("?", "")));
    expect(parsed.query).toBe(original.query);
    expect(parsed.tools).toEqual(original.tools);
    expect(parsed.verification.commercialLicense).toBe(true);
    expect(parsed.maxStartingRateUsd).toBe(2500);
    expect(parsed.sort).toBe("reliability");
  });

  it("handles deep-link aliases like ?tools=luma&aspect=9:16&verified=1", () => {
    const query = new URLSearchParams("tools=luma&aspect=9:16&verified=1");
    const parsed = parseSearchParams(query);
    expect(parsed.tools).toContain("luma-dream-machine");
    expect(parsed.aspectRatios).toContain("9:16");
    expect(parsed.verification.commercialLicense).toBe(true);
  });

  it("gracefully falls back on garbage URL params without crashing", () => {
    const garbage = new URLSearchParams(
      "q=&tools=unknown-tool-foo&rate=-9999&aspect=33:77&sort=invalid_sort&verified=not_a_bool"
    );
    const parsed = parseSearchParams(garbage);
    expect(parsed.maxStartingRateUsd).toBeNull();
    expect(parsed.aspectRatios).toEqual([]);
    expect(parsed.sort).toBe("best_match");
    expect(parsed.verification.commercialLicense).toBe(false);
  });
});
