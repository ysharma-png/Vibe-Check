/**
 * Seed Dataset Coverage Report & Audit
 * Evaluates generated dataset against all matrix thresholds defined in /docs/seed-coverage.md.
 */

import { SeededPRNG } from "./prng";
import { generateCreators } from "./generators/creators";
import { generatePortfolioItems } from "./generators/portfolio";
import { generateBriefsAndEngagements } from "./generators/briefs";
import {
  MARKETPLACE_SPECIALIZATIONS,
  CATALOG_TOOLS,
  PLATFORM_SKILLS,
  SEED_BRANDS,
} from "./constants";

export function auditSeedDataset(): boolean {
  console.log("==================================================================");
  console.log("CACHEFLOW SEED DATASET COVERAGE AUDIT");
  console.log("==================================================================");

  const prng = new SeededPRNG();
  const creatorsWithMeta = generateCreators(prng);
  const creators = creatorsWithMeta.map((c) => c.creator);
  const portfolioItems = generatePortfolioItems(creatorsWithMeta, prng);
  const { briefs, proposals, engagements } = generateBriefsAndEngagements(
    creatorsWithMeta,
    prng
  );

  let hasFailures = false;

  function check(label: string, actual: number, target: number, condition: ">=" | "==" = ">=") {
    const passed = condition === ">=" ? actual >= target : actual === target;
    if (!passed) hasFailures = true;
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    const conditionStr = condition === ">=" ? `>= ${target}` : `== ${target}`;
    console.log(
      `  [${mark}] ${label.padEnd(46)}: ${actual.toString().padStart(4)} (Target: ${conditionStr})`
    );
  }

  // 1. Creator Entity Counts
  console.log("\n1. ENTITY TOTALS");
  check("Total Fictional Demo Creators", creators.length, 130);
  check("Total Portfolio Items", portfolioItems.length, 520);
  check("Total Fictional Brands", SEED_BRANDS.length, 40);
  check("Total Creative Briefs", briefs.length, 60);
  check("Total Pitched Proposals", proposals.length, 60);
  check("Total Escrow Engagements", engagements.length, 20);

  // 2. Specializations (Min 8 each)
  console.log("\n2. SPECIALIZATIONS COVERAGE (Min 8 creators each)");
  for (const spec of MARKETPLACE_SPECIALIZATIONS) {
    const count = creators.filter((c) => c.specializations.includes(spec)).length;
    check(spec, count, 8);
  }

  // 3. Tools in Catalog (Min 10 creators each)
  console.log("\n3. TOOLS CATALOG COVERAGE (Min 10 creators each)");
  for (const tool of CATALOG_TOOLS) {
    const count = creators.filter((c) => c.primaryTools.includes(tool.id)).length;
    check(`${tool.name} (${tool.id})`, count, 10);
  }

  // 4. Skills Taxonomy (Min 12 creators each)
  console.log("\n4. PLATFORM SKILLS COVERAGE (Min 12 creators each)");
  for (const skill of PLATFORM_SKILLS) {
    const count = creators.filter((c) => c.skills?.includes(skill)).length;
    check(skill, count, 12);
  }

  // 5. Geographic & Cultural Diversity
  console.log("\n5. GEOGRAPHIC & CULTURAL DIVERSITY");
  const uniqueCountries = new Set(creatorsWithMeta.map((c) => c.country));
  const uniqueTimezones = new Set(creators.map((c) => c.timezone));
  const uniqueLanguages = new Set(creatorsWithMeta.map((c) => c.language));

  check("Unique Sovereign Countries", uniqueCountries.size, 20);
  check("Unique Timezones", uniqueTimezones.size, 12);
  check("Working Languages", uniqueLanguages.size, 10);

  // 6. Experience Pyramid & Distributions
  console.log("\n6. EXPERIENCE PYRAMID & RATE BANDS");
  const risingCount = creatorsWithMeta.filter((c) => c.level === "Rising").length;
  const proCount = creatorsWithMeta.filter((c) => c.level === "Pro").length;
  const eliteCount = creatorsWithMeta.filter((c) => c.level === "Elite").length;

  check("Rising Talent (Level Pyramid ~55%)", risingCount, 65);
  check("Pro Verified (Level Pyramid ~35%)", proCount, 40);
  check("Elite Studios (Level Pyramid ~10%)", eliteCount, 10);

  const budgetCount = creators.filter((c) => c.startingRateUsd <= 75).length;
  const midCount = creators.filter((c) => c.startingRateUsd > 75 && c.startingRateUsd <= 160).length;
  const premiumCount = creators.filter((c) => c.startingRateUsd > 160).length;

  check("Budget Band ($35 - $75/hr)", budgetCount, 30);
  check("Mid Band ($80 - $160/hr)", midCount, 40);
  check("Premium Band ($175 - $350/hr)", premiumCount, 12);

  // 7. Commercial Safety & Workflow Verification
  console.log("\n7. VERIFICATION & SAFETY COVERAGE");
  const commercialReady = creators.filter((c) => c.verified.commercialLicense).length;
  const commercialPercent = Math.round((commercialReady / creators.length) * 100);
  check("Commercial-Ready Rate (% of pool)", commercialPercent, 55);

  const reproducibleCount = creators.filter((c) => c.verified.reproduciblePipeline).length;
  const reproduciblePercent = Math.round((reproducibleCount / creators.length) * 100);
  check("Reproducible Workflow Rate (% of pool)", reproduciblePercent, 30);

  // 8. Niche Combinations & Deliberate Voids
  console.log("\n8. NICHE COMBINATIONS & INTENTIONAL ZERO-RESULT VOIDS");

  // Niche A: Lip-sync + anime + vertical 9:16
  const nicheA = creators.filter(
    (c) =>
      c.specializations.includes("AI animation (2D/3D/anime)") &&
      (c.primaryTools.includes("live-portrait") || c.primaryTools.includes("elevenlabs"))
  ).length;
  check("Niche A: Lip-Sync + Anime Animation", nicheA, 3);

  // Niche B: LoRA training + Fashion lookbook
  const nicheB = creators.filter(
    (c) =>
      c.specializations.includes("fashion/lookbook") &&
      c.skills?.includes("LoRA Training & Character Fine-Tuning")
  ).length;
  check("Niche B: LoRA Training + Fashion Lookbook", nicheB, 3);

  // Niche C: ComfyUI + Camera Motion Control
  const nicheC = creators.filter(
    (c) =>
      c.primaryTools.includes("comfy-ui") &&
      c.skills?.includes("Camera Path Choreography & Motion Vectors")
  ).length;
  check("Niche C: ComfyUI + Camera Motion Vectors", nicheC, 3);

  // Void 1: Architecture Viz + Starting Rate <= $25
  const void1 = creators.filter(
    (c) =>
      c.specializations.includes("architecture/real estate visualization") &&
      c.startingRateUsd <= 25
  ).length;
  check("Void 1: Architecture Viz <= $25/hr (Empty State)", void1, 0, "==");

  // Void 2: Podcast + 3D / NeRF
  const void2 = creators.filter(
    (c) =>
      c.specializations.includes("podcast/audio and voice") &&
      c.primaryTools.includes("nerf-studio")
  ).length;
  check("Void 2: Podcast/Voice + 3D NeRF (Empty State)", void2, 0, "==");

  console.log("\n==================================================================");
  if (hasFailures) {
    console.error("OVERALL STATUS: FAILED — One or more matrix cells were below target threshold.");
    return false;
  } else {
    console.log("OVERALL STATUS: PASSED — All matrix targets and distributions satisfied perfectly.");
    return true;
  }
}

if (require.main === module) {
  const success = auditSeedDataset();
  process.exit(success ? 0 : 1);
}
