import { describe, it, expect } from "vitest";
import { parseBriefDeterministic } from "../parse-nl";

describe("parseBriefDeterministic (Engine A)", () => {
  // Test 1: Vertical social shorts
  it("parses vertical social paragraph into 9:16, 15s duration, and social_short_form", () => {
    const text =
      "We need high-impact 9:16 vertical shorts for TikTok and Reels to launch Pulse Energy drink for Gen-Z athletes. Pacing must be kinetic and fast, 15 seconds duration, with crisp particle splash physics and neon typography. Budget is $4,500 with delivery in 3 weeks. No distorted hands or uncanny facial artifacts, avoid generic synth music, and no competitor beverage logos. We need the project files and prompt manifests.";

    const result = parseBriefDeterministic(text);

    expect(result.fields.aspectRatios).toContain("9:16");
    expect(result.fields.durationSec).toBe(15);
    expect(result.fields.deliverableType).toBe("social_short_form");
    expect(result.fields.totalBudgetUsd).toBe(4500);
    expect(result.fields.deadline).toBeDefined();
    expect(result.confidence.aspectRatios).toBe("high");
    expect(result.confidence.totalBudgetUsd).toBe("high");
    expect(result.evidence.aspectRatios).toContain("vertical");
  });

  // Test 2: Enterprise commercial with legal caution
  it("parses enterprise commercial spot with strict legal indemnification constraints", () => {
    const text =
      "Apex Motors is launching the Apex GT electric supercar hero campaign. We require a 30-second 4K broadcast commercial spot for television and YouTube widescreen 16:9. Because of corporate broadcast standards, our legal team is strict: we demand 100% indemnified models only, verified commercial subscriptions, and a worldwide perpetual buyout. Budget is $12,000 USD, deadline by December 15. Hand over all project files, prompts and seeds.";

    const result = parseBriefDeterministic(text);

    expect(result.fields.aspectRatios).toContain("16:9");
    expect(result.fields.resolution).toBe("4K");
    expect(result.fields.durationSec).toBe(30);
    expect(result.fields.deliverableType).toBe("commercial_spot");
    expect(result.fields.totalBudgetUsd).toBe(12000);
    expect(result.fields.toolRequirements?.baseModelPolicy).toBe("indemnified_only");
    expect(result.fields.commercialTerms?.requiresVerifiedLicense).toBe(true);
    expect(result.fields.commercialTerms?.rightsModel).toBe("perpetual_buyout");
    expect(result.fields.commercialTerms?.territory).toBe("worldwide");
  });

  // Test 3: Vague one-liner produces questions rather than hallucinating budget or deadline
  it("handles vague one-liner without inventing missing budget or deadline, generating clarifying questions", () => {
    const text =
      "Need some cool AI visuals for our new fashion line launch next month, maybe video maybe pics, nothing cheesy or cheap looking.";

    const result = parseBriefDeterministic(text);

    // Crucial rule: Never invent budget when not stated
    expect(result.fields.totalBudgetUsd).toBeUndefined();
    expect(result.confidence.totalBudgetUsd).toBe("low");
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.questions.some((q) => q.toLowerCase().includes("budget"))).toBe(true);
    expect(result.fields.negativeConstraints?.some((nc) => /cheesy/i.test(nc.label))).toBe(true);
  });

  // Test 4: Multi-currency budget parsing & stated conversion
  it("parses and converts multi-currency budgets (INR lakh, EUR, GBP, USD)", () => {
    // INR Lakh conversion
    const inrText =
      "Need a 30s product visual for our Mumbai launch. Budget is INR 4 lakh with delivery in 2 weeks.";
    const inrResult = parseBriefDeterministic(inrText);
    expect(inrResult.fields.totalBudgetUsd).toBeGreaterThan(4500);
    expect(inrResult.fields.totalBudgetUsd).toBeLessThan(5200);
    expect(inrResult.evidence.totalBudgetUsd).toContain("INR 4 lakh");

    // EUR conversion
    const eurText = "Campaign for Berlin fashion week, hero video spot, budget of 10,000 EUR in 1 month.";
    const eurResult = parseBriefDeterministic(eurText);
    expect(eurResult.fields.totalBudgetUsd).toBe(10800); // 10000 * 1.08

    // GBP conversion
    const gbpText = "London retail launch commercial, total spend is £5k.";
    const gbpResult = parseBriefDeterministic(gbpText);
    expect(gbpResult.fields.totalBudgetUsd).toBe(6500); // 5000 * 1.30
  });

  // Test 5: Conflicting signals (TikTok AND cinema trailer) extracts both aspect ratios
  it("extracts multiple aspect ratios when text mentions both TikTok and cinema trailer", () => {
    const text =
      "Multi-channel campaign: we need hero video assets formatted for TikTok and a cinema trailer for theatrical distribution. Budget is $8k.";

    const result = parseBriefDeterministic(text);

    expect(result.fields.aspectRatios).toContain("9:16");
    expect(result.fields.aspectRatios).toContain("16:9");
    expect(result.fields.aspectRatios?.length).toBe(2);
    expect(result.evidence.aspectRatios).toContain("vertical");
    expect(result.evidence.aspectRatios).toContain("cinematic");
  });

  // Test 6: Negative phrasing extraction
  it("extracts custom negative constraints from various negative phrasing patterns", () => {
    const text =
      "Cyberpunk city scene. No logos, avoid uncanny faces, can't look like Pixar, and without watermarks.";

    const result = parseBriefDeterministic(text);
    const labels = (result.fields.negativeConstraints ?? []).map((nc) => nc.label.toLowerCase());

    expect(labels.some((l) => l.includes("no logos"))).toBe(true);
    expect(labels.some((l) => l.includes("avoid uncanny faces"))).toBe(true);
    expect(labels.some((l) => l.includes("pixar"))).toBe(true);
    expect(labels.some((l) => l.includes("without watermarks"))).toBe(true);
  });
});
