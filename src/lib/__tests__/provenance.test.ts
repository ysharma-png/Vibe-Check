import { describe, it, expect } from "vitest";
import { assessCommercialClearance } from "../provenance";
import { PortfolioItem } from "@/types/schema";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";

describe("Commercial Clearance Risk Assessment", () => {
  const baseItem: PortfolioItem = PORTFOLIO_ITEMS[0]!;

  it("marks fully indemnified clean items as 'cleared'", () => {
    // Elena's automotive item (fully indemnified BFL Enterprise)
    const elenaItem = PORTFOLIO_ITEMS.find((it) => it.id === "port-elena-1");
    expect(elenaItem).toBeDefined();
    if (!elenaItem) return;

    const result = assessCommercialClearance(elenaItem);
    expect(result.level).toBe("cleared");
    expect(result.summary).toBe("Cleared for commercial use");
    expect(result.reasons.some((r) => r.includes("Indemnified by"))).toBe(true);
  });

  it("marks flagged-IP items as 'not_cleared' with critical copyright risk reason", () => {
    // Kenji's mecha item (flagged for Gundam silhouette match)
    const mechaItem = PORTFOLIO_ITEMS.find((it) => it.id === "port-kenji-2");
    expect(mechaItem).toBeDefined();
    if (!mechaItem) return;

    const result = assessCommercialClearance(mechaItem);
    expect(result.level).toBe("not_cleared");
    expect(result.summary).toBe("Not cleared for commercial use");
    expect(result.reasons.some((r) => r.includes("Copyright Risk"))).toBe(true);
  });

  it("marks unverified-subscription items as 'conditional'", () => {
    // Kenji's NeRF item (subscriptionVerified: false)
    const nerfItem = PORTFOLIO_ITEMS.find((it) => it.id === "port-kenji-1");
    expect(nerfItem).toBeDefined();
    if (!nerfItem) return;

    const result = assessCommercialClearance(nerfItem);
    expect(result.level).toBe("conditional");
    expect(result.summary).toBe("Cleared with conditions");
    expect(
      result.reasons.some((r) => r.includes("Subscription Unverified"))
    ).toBe(true);
  });

  it("marks restricted base model without indemnity as 'not_cleared'", () => {
    const restrictedItem: PortfolioItem = {
      ...baseItem,
      commercialSafety: {
        ...baseItem.commercialSafety,
        baseModelCompliance: "restricted",
        indemnified: false,
        copyrightedIpScan: "clean",
      },
    };

    const result = assessCommercialClearance(restrictedItem);
    expect(result.level).toBe("not_cleared");
    expect(result.summary).toBe("Not cleared for commercial use");
    expect(result.reasons.some((r) => r.includes("License Breach Risk"))).toBe(
      true
    );
  });

  it("marks partially reproducible pipelines as 'conditional'", () => {
    // Min-Jun's Sora virtual idol item with ElevenLabs non-deterministic pass
    const soraItem = PORTFOLIO_ITEMS.find((it) => it.id === "port-minjun-2");
    expect(soraItem).toBeDefined();
    if (!soraItem) return;

    const result = assessCommercialClearance(soraItem);
    expect(result.level).toBe("conditional");
    expect(result.summary).toBe("Cleared with conditions");
    expect(
      result.reasons.some((r) => r.includes("Non-Deterministic Stages"))
    ).toBe(true);
  });
});
