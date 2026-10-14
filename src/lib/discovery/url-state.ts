import { z } from "zod";
import {
  ASPECT_RATIOS,
  AspectRatio,
  DELIVERABLE_TYPES,
  DeliverableType,
  SPECIALIZATIONS,
  Specialization,
} from "@/types/schema";
import { FilterState, SortOption, ToolMatchMode } from "./filter";

export const DEFAULT_FILTER_STATE: FilterState = {
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

// Aliases for common user-typed or demo shorthand tool slugs
const TOOL_ALIASES: Readonly<Record<string, string>> = {
  luma: "luma-dream-machine",
  kling: "kling-1-5",
  flux: "flux-1-dev",
  "flux-dev": "flux-1-dev",
  "flux-pro": "flux-1-pro",
  runway: "runway-gen3",
  midjourney: "midjourney-v7",
  comfy: "comfy-ui",
  animatediff: "animatediff",
  elevenlabs: "elevenlabs",
  liveportrait: "live-portrait",
  nerf: "nerf-studio",
  topaz: "topaz-video-ai",
};

function normalizeToolId(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const alias = TOOL_ALIASES[trimmed];
  return alias ?? trimmed;
}

const SearchParamsSchema = z.object({
  q: z.string().optional().default(""),
  tools: z.string().optional().default(""),
  toolMatch: z.enum(["any", "all"]).optional().default("any"),
  specs: z.string().optional().default(""),
  aspect: z.string().optional().default(""),
  deliverable: z.string().optional().default(""),
  styles: z.string().optional().default(""),
  verified: z.string().optional(),
  reproducible: z.string().optional(),
  commercial: z.string().optional(),
  avail: z.string().optional().default(""),
  rate: z.string().optional(),
  sort: z
    .enum(["best_match", "rate_asc", "turnaround", "reliability"])
    .optional()
    .default("best_match"),
});

/**
 * Parses search parameters into a safe, valid FilterState.
 * Invalid values gracefully fall back to defaults without throwing errors.
 */
export function parseSearchParams(
  input: URLSearchParams | Record<string, string | string[] | undefined>
): FilterState {
  const rawObj: Record<string, string | undefined> = {};

  if (input instanceof URLSearchParams) {
    input.forEach((val, key) => {
      rawObj[key] = val;
    });
  } else {
    for (const [key, val] of Object.entries(input)) {
      if (Array.isArray(val)) {
        rawObj[key] = val[0];
      } else if (typeof val === "string") {
        rawObj[key] = val;
      }
    }
  }

  const parsed = SearchParamsSchema.safeParse(rawObj);
  const data = parsed.success ? parsed.data : SearchParamsSchema.parse({});

  // 1. Tools list
  const tools = data.tools
    .split(",")
    .map(normalizeToolId)
    .filter((t) => t.length > 0);

  // 2. Specializations
  const validSpecsSet = new Set<string>(SPECIALIZATIONS);
  const specializations: Specialization[] = [];
  for (const part of data.specs.split(",")) {
    const trimmed = part.trim();
    if (validSpecsSet.has(trimmed)) {
      specializations.push(trimmed as Specialization);
    }
  }

  // 3. Aspect Ratios
  const validAspectsSet = new Set<string>(ASPECT_RATIOS);
  const aspectRatios: AspectRatio[] = [];
  for (const part of data.aspect.split(",")) {
    const trimmed = part.trim();
    if (validAspectsSet.has(trimmed)) {
      aspectRatios.push(trimmed as AspectRatio);
    }
  }

  // 4. Deliverable Types
  const validDeliverablesSet = new Set<string>(DELIVERABLE_TYPES);
  const deliverableTypes: DeliverableType[] = [];
  for (const part of data.deliverable.split(",")) {
    const trimmed = part.trim();
    if (validDeliverablesSet.has(trimmed)) {
      deliverableTypes.push(trimmed as DeliverableType);
    }
  }

  // 5. Styles
  const styleTags = data.styles
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 6. Verification
  const isVerifiedTruthy = (v?: string) =>
    v === "1" || v === "true" || v === "yes";

  const commercialLicense =
    isVerifiedTruthy(data.verified) || isVerifiedTruthy(data.commercial);
  const reproduciblePipeline = isVerifiedTruthy(data.reproducible);

  // 7. Availability
  const availability: ("open" | "limited")[] = [];
  for (const a of data.avail.split(",")) {
    const trimmed = a.trim();
    if (trimmed === "open" || trimmed === "limited") {
      availability.push(trimmed);
    }
  }

  // 8. Max Rate
  let maxStartingRateUsd: number | null = null;
  if (data.rate) {
    const num = Number(data.rate);
    if (!isNaN(num) && num > 0) {
      maxStartingRateUsd = num;
    }
  }

  return {
    query: data.q.trim(),
    tools,
    toolMatch: data.toolMatch as ToolMatchMode,
    specializations,
    aspectRatios,
    deliverableTypes,
    styleTags,
    verification: {
      commercialLicense,
      reproduciblePipeline,
    },
    availability,
    maxStartingRateUsd,
    sort: data.sort as SortOption,
  };
}

/**
 * Serializes a FilterState into a clean URL query string.
 */
export function serializeFilterState(state: FilterState): string {
  const params = new URLSearchParams();

  if (state.query.trim().length > 0) {
    params.set("q", state.query.trim());
  }

  if (state.tools.length > 0) {
    params.set("tools", state.tools.join(","));
  }

  if (state.toolMatch !== "any") {
    params.set("toolMatch", state.toolMatch);
  }

  if (state.specializations.length > 0) {
    params.set("specs", state.specializations.join(","));
  }

  if (state.aspectRatios.length > 0) {
    params.set("aspect", state.aspectRatios.join(","));
  }

  if (state.deliverableTypes.length > 0) {
    params.set("deliverable", state.deliverableTypes.join(","));
  }

  if (state.styleTags.length > 0) {
    params.set("styles", state.styleTags.join(","));
  }

  if (state.verification.commercialLicense) {
    params.set("verified", "1");
  }

  if (state.verification.reproduciblePipeline) {
    params.set("reproducible", "1");
  }

  if (state.availability.length > 0) {
    params.set("avail", state.availability.join(","));
  }

  if (state.maxStartingRateUsd !== null && state.maxStartingRateUsd > 0) {
    params.set("rate", state.maxStartingRateUsd.toString());
  }

  if (state.sort !== "best_match") {
    params.set("sort", state.sort);
  }

  const str = params.toString();
  return str.length > 0 ? `?${str}` : "";
}
