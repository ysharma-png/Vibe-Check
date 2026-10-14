/**
 * 25 Search Scenarios Verification Suite
 * Executes real filter queries against the generated dataset and prints a structured Markdown / ASCII table.
 */

import { SeededPRNG } from "./prng";
import { generateCreators } from "./generators/creators";
import { generatePortfolioItems } from "./generators/portfolio";
import { applyFilters, FilterState } from "@/lib/discovery/filter";

const prng = new SeededPRNG();
const creatorsWithMeta = generateCreators(prng);
const CREATORS = creatorsWithMeta.map((c) => c.creator);
const PORTFOLIO_ITEMS = generatePortfolioItems(creatorsWithMeta, prng);

export interface ScenarioDefinition {
  id: number;
  name: string;
  filters: Partial<FilterState>;
  minExpected: number;
  maxExpected?: number;
  expectEmpty?: boolean;
}

const DEFAULT_FILTER_STATE: FilterState = {
  query: "",
  tools: [],
  toolMatch: "any",
  specializations: [],
  aspectRatios: [],
  deliverableTypes: [],
  styleTags: [],
  verification: {
    commercialLicense: false,
    reproduciblePipeline: false,
  },
  availability: [],
  maxStartingRateUsd: null,
  sort: "best_match",
};

export const SCENARIOS: readonly ScenarioDefinition[] = [
  { id: 1, name: "Broad Query: 'cinematic'", filters: { query: "cinematic" }, minExpected: 15 },
  { id: 2, name: "Broad Query: 'fashion'", filters: { query: "fashion" }, minExpected: 10 },
  { id: 3, name: "Tool: ComfyUI", filters: { tools: ["comfy-ui"] }, minExpected: 30 },
  { id: 4, name: "Tool: Runway Gen-3", filters: { tools: ["runway-gen3"] }, minExpected: 20 },
  { id: 5, name: "Tool: FLUX.1 [dev]", filters: { tools: ["flux-1-dev"] }, minExpected: 25 },
  { id: 6, name: "Specialization: Product Ads", filters: { specializations: ["product ads"] }, minExpected: 8 },
  { id: 7, name: "Specialization: AI Animation", filters: { specializations: ["AI animation (2D/3D/anime)"] }, minExpected: 8 },
  { id: 8, name: "Specialization: Brand Mascots", filters: { specializations: ["brand mascots/characters"] }, minExpected: 8 },
  { id: 9, name: "Specialization: Architecture", filters: { specializations: ["architecture/real estate visualization"] }, minExpected: 8 },
  { id: 10, name: "Verified Commercial License", filters: { verification: { commercialLicense: true, reproduciblePipeline: false } }, minExpected: 50 },
  { id: 11, name: "Verified ComfyUI DAGs", filters: { verification: { commercialLicense: false, reproduciblePipeline: true } }, minExpected: 30 },
  { id: 12, name: "Dual Verification (Both Cleared)", filters: { verification: { commercialLicense: true, reproduciblePipeline: true } }, minExpected: 15 },
  { id: 13, name: "Rate Band: Budget (<= $75/hr)", filters: { maxStartingRateUsd: 75 }, minExpected: 25 },
  { id: 14, name: "Rate Band: Mid (<= $150/hr)", filters: { maxStartingRateUsd: 150 }, minExpected: 60 },
  { id: 15, name: "Combo: AI Film + Runway Gen-3", filters: { specializations: ["AI film/short film"], tools: ["runway-gen3"] }, minExpected: 3 },
  { id: 16, name: "Combo: Product Ads + Flux Dev", filters: { specializations: ["product ads"], tools: ["flux-1-dev"] }, minExpected: 3 },
  { id: 17, name: "Combo: Fashion + Midjourney", filters: { specializations: ["fashion/lookbook"], tools: ["midjourney-v7"] }, minExpected: 3 },
  { id: 18, name: "Combo: VFX + Topaz + Commercial", filters: { specializations: ["VFX/upscaling/restoration"], tools: ["topaz-video-ai"], verification: { commercialLicense: true, reproduciblePipeline: false } }, minExpected: 3 },
  { id: 19, name: "Niche A: Lip-Sync + Anime + 9:16", filters: { specializations: ["AI animation (2D/3D/anime)"], tools: ["live-portrait"], aspectRatios: ["9:16"] }, minExpected: 3 },
  { id: 20, name: "Niche B: LoRA + Fashion Lookbook", filters: { query: "lora", specializations: ["fashion/lookbook"] }, minExpected: 3 },
  { id: 21, name: "Niche C: ComfyUI + Camera Motion", filters: { tools: ["comfy-ui"], query: "camera", aspectRatios: ["16:9"] }, minExpected: 3 },
  { id: 22, name: "Availability: Open Only", filters: { availability: ["open"] }, minExpected: 40 },
  { id: 23, name: "Deliberate Void 1: Arch Viz <= $25", filters: { specializations: ["architecture/real estate visualization"], maxStartingRateUsd: 25 }, minExpected: 0, maxExpected: 0, expectEmpty: true },
  { id: 24, name: "Deliberate Void 2: Podcast + 3D", filters: { specializations: ["podcast/audio and voice"], tools: ["nerf-studio"] }, minExpected: 0, maxExpected: 0, expectEmpty: true },
  { id: 25, name: "Deliberate Void 3: Unicorn Search", filters: { specializations: ["game assets/concept art"], query: "unobtainable-unicorn-string" }, minExpected: 0, maxExpected: 0, expectEmpty: true },
];

export function runSearchScenarios() {
  console.log("==========================================================================================");
  console.log("CACHEFLOW: 25 SEARCH SCENARIOS VERIFICATION");
  console.log("==========================================================================================");
  console.log(`Dataset size: ${CREATORS.length} creators, ${PORTFOLIO_ITEMS.length} portfolio items.\n`);

  let allPassed = true;
  const rows: Array<{
    id: number;
    name: string;
    actualCount: number;
    expected: string;
    verdict: string;
  }> = [];

  for (const sc of SCENARIOS) {
    const fullFilterState: FilterState = {
      ...DEFAULT_FILTER_STATE,
      ...sc.filters,
      verification: {
        ...DEFAULT_FILTER_STATE.verification,
        ...(sc.filters.verification ?? {}),
      },
    };

    const matches = applyFilters(CREATORS, PORTFOLIO_ITEMS, fullFilterState);
    const count = matches.length;

    let passed = false;
    let expectedStr = "";

    if (sc.expectEmpty) {
      passed = count === 0;
      expectedStr = "0 (Void)";
    } else {
      passed = count >= sc.minExpected;
      expectedStr = `>= ${sc.minExpected}`;
    }

    if (!passed) allPassed = false;

    rows.push({
      id: sc.id,
      name: sc.name,
      actualCount: count,
      expected: expectedStr,
      verdict: passed ? "PASS" : "FAIL",
    });
  }

  // Print Formatted Table
  console.log("| #  | Scenario Description                        | Result Count | Target Expected | Status |");
  console.log("|:---|:--------------------------------------------|:------------:|:---------------:|:------:|");
  for (const r of rows) {
    const num = r.id.toString().padStart(2, "0");
    const name = r.name.padEnd(43);
    const count = r.actualCount.toString().padStart(12);
    const target = r.expected.padEnd(15);
    const status = r.verdict === "PASS" ? "✓ PASS " : "✗ FAIL ";
    console.log(`| ${num} | ${name} | ${count} | ${target} | ${status}|`);
  }

  console.log("==========================================================================================");
  if (allPassed) {
    console.log("VERIFICATION RESULT: ALL 25 SCENARIOS PASSED WITH PERFECT FIDELITY.");
  } else {
    console.error("VERIFICATION RESULT: SOME SCENARIOS FAILED.");
  }

  return allPassed;
}

if (require.main === module) {
  const ok = runSearchScenarios();
  process.exit(ok ? 0 : 1);
}
