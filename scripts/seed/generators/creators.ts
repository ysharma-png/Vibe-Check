/**
 * Fictional Creator Generator
 * Generates 140 diverse fictional demo creators strictly meeting the coverage matrix.
 */

import { CreatorProfile, CreatorProfileSchema, Specialization } from "@/types/schema";
import { SeededPRNG } from "../prng";
import {
  CULTURAL_HUBS,
  MARKETPLACE_SPECIALIZATIONS,
  PLATFORM_SKILLS,
  CATALOG_TOOLS,
  REALISTIC_TOOL_PAIRINGS,
  BIO_ARCHETYPES,
  GRADIENT_PALETTES,
} from "../constants";

export interface GeneratedCreatorWithMetadata {
  creator: CreatorProfile;
  level: "Rising" | "Pro" | "Elite";
  language: string;
  country: string;
  skillsWithLevels: { name: string; level: "Intermediate" | "Advanced" | "Expert" }[];
}

export function generateCreators(prng: SeededPRNG): GeneratedCreatorWithMetadata[] {
  const TOTAL_CREATORS = 140;
  const results: GeneratedCreatorWithMetadata[] = [];
  const usedHandles = new Set<string>();

  // Helper to generate unique handle
  function getUniqueHandle(first: string, last: string, idx: number): string {
    const cleanFirst = first.toLowerCase().replace(/[^a-z]/g, "");
    const cleanLast = last.toLowerCase().replace(/[^a-z]/g, "");
    const base = `${cleanFirst}_${cleanLast}`;
    if (!usedHandles.has(base)) {
      usedHandles.add(base);
      return base;
    }
    const numbered = `${base}_${idx}`;
    usedHandles.add(numbered);
    return numbered;
  }

  // Pre-calculate distributions
  // Levels: ~55% Rising (77), ~35% Pro (49), ~10% Elite (14)
  const levels: ("Rising" | "Pro" | "Elite")[] = [];
  for (let i = 0; i < 77; i++) levels.push("Rising");
  for (let i = 0; i < 49; i++) levels.push("Pro");
  for (let i = 0; i < 14; i++) levels.push("Elite");
  prng.shuffle(levels);

  // Guarantee minimum specializations:
  // Each of the 12 specializations assigned to at least 10 creators directly
  const specBuckets: Specialization[][] = Array.from({ length: TOTAL_CREATORS }, () => []);
  MARKETPLACE_SPECIALIZATIONS.forEach((spec, sIdx) => {
    // Assign to at least 11 creators
    for (let k = 0; k < 11; k++) {
      const creatorIndex = (sIdx * 11 + k) % TOTAL_CREATORS;
      if (!specBuckets[creatorIndex]!.includes(spec)) {
        specBuckets[creatorIndex]!.push(spec);
      }
    }
  });

  // Guarantee minimum tool usage:
  // Every tool in catalog appears on at least 12 creators
  const toolBuckets: string[][] = Array.from({ length: TOTAL_CREATORS }, () => []);
  CATALOG_TOOLS.forEach((tool, tIdx) => {
    for (let k = 0; k < 13; k++) {
      const creatorIndex = (tIdx * 13 + k) % TOTAL_CREATORS;
      if (!toolBuckets[creatorIndex]!.includes(tool.id)) {
        toolBuckets[creatorIndex]!.push(tool.id);
      }
    }
  });

  // Guarantee skills:
  // Every skill appears on at least 15 creators across varied levels
  const skillBuckets: { name: string; level: "Intermediate" | "Advanced" | "Expert" }[][] =
    Array.from({ length: TOTAL_CREATORS }, () => []);

  PLATFORM_SKILLS.forEach((skill, skIdx) => {
    const proficiencies: ("Intermediate" | "Advanced" | "Expert")[] = [
      "Intermediate",
      "Intermediate",
      "Advanced",
      "Advanced",
      "Advanced",
      "Expert",
      "Expert",
    ];
    for (let k = 0; k < 16; k++) {
      const creatorIndex = (skIdx * 16 + k) % TOTAL_CREATORS;
      const prof = proficiencies[k % proficiencies.length]!;
      skillBuckets[creatorIndex]!.push({ name: skill, level: prof });
    }
  });

  // Niche combination guarantees:
  // Niche A: Lip-Sync + Anime + Vertical 9:16 (Creators 0, 1, 2, 3)
  for (let i = 0; i < 4; i++) {
    if (!specBuckets[i]!.includes("AI animation (2D/3D/anime)")) {
      specBuckets[i]!.push("AI animation (2D/3D/anime)");
    }
    if (!toolBuckets[i]!.includes("live-portrait")) {
      toolBuckets[i]!.push("live-portrait");
    }
    if (!toolBuckets[i]!.includes("elevenlabs")) {
      toolBuckets[i]!.push("elevenlabs");
    }
    skillBuckets[i]!.push({
      name: "Audio-Driven Lip-Sync & Phoneme Mapping",
      level: "Expert",
    });
  }

  // Niche B: LoRA training + Fashion (Creators 4, 5, 6, 7)
  for (let i = 4; i < 8; i++) {
    if (!specBuckets[i]!.includes("fashion/lookbook")) {
      specBuckets[i]!.push("fashion/lookbook");
    }
    if (!toolBuckets[i]!.includes("comfy-ui")) {
      toolBuckets[i]!.push("comfy-ui");
    }
    if (!toolBuckets[i]!.includes("flux-1-dev")) {
      toolBuckets[i]!.push("flux-1-dev");
    }
    skillBuckets[i]!.push({
      name: "LoRA Training & Character Fine-Tuning",
      level: "Expert",
    });
  }

  // Niche C: ComfyUI + Camera Motion (Creators 8, 9, 10, 11, 12)
  for (let i = 8; i < 13; i++) {
    if (!specBuckets[i]!.includes("AI film/short film")) {
      specBuckets[i]!.push("AI film/short film");
    }
    if (!toolBuckets[i]!.includes("comfy-ui")) {
      toolBuckets[i]!.push("comfy-ui");
    }
    if (!toolBuckets[i]!.includes("runway-gen3")) {
      toolBuckets[i]!.push("runway-gen3");
    }
    skillBuckets[i]!.push({
      name: "Camera Path Choreography & Motion Vectors",
      level: "Expert",
    });
  }

  // Combo 18: VFX + Topaz + Commercial (Creators 13, 14, 15, 16, 17)
  for (let i = 13; i < 18; i++) {
    if (!specBuckets[i]!.includes("VFX/upscaling/restoration")) {
      specBuckets[i]!.push("VFX/upscaling/restoration");
    }
    if (!toolBuckets[i]!.includes("topaz-video-ai")) {
      toolBuckets[i]!.push("topaz-video-ai");
    }
  }

  // Ensure plenty of FLUX.1 [dev] and Runway Gen-3
  for (let i = 18; i < 55; i++) {
    if (!toolBuckets[i]!.includes("flux-1-dev")) {
      toolBuckets[i]!.push("flux-1-dev");
    }
  }
  for (let i = 30; i < 62; i++) {
    if (!toolBuckets[i]!.includes("runway-gen3")) {
      toolBuckets[i]!.push("runway-gen3");
    }
  }

  // Main generator loop
  for (let i = 0; i < TOTAL_CREATORS; i++) {
    const hub = CULTURAL_HUBS[i % CULTURAL_HUBS.length]!;
    const firstName = hub.firstNames[i % hub.firstNames.length]!;
    const lastName = hub.lastNames[(i + 3) % hub.lastNames.length]!;
    const fullName = `${firstName} ${lastName}`;
    const handle = getUniqueHandle(firstName, lastName, i + 1);
    const id = `creator-${(i + 1).toString().padStart(4, "0")}`;

    const level = levels[i]!;

    // Rates based on level
    let startingRateUsd: number;
    let projectsCompleted: number;
    let onTimeRate: number;
    let avgTurnaroundDays: number;
    let repeatClientRate: number;

    if (level === "Rising") {
      startingRateUsd = prng.randInt(35, 75);
      projectsCompleted = prng.randInt(8, 25);
      onTimeRate = prng.randFloat(0.94, 0.98);
      avgTurnaroundDays = prng.randInt(3, 8);
      repeatClientRate = prng.randFloat(0.55, 0.75);
    } else if (level === "Pro") {
      startingRateUsd = prng.randInt(80, 160);
      projectsCompleted = prng.randInt(26, 70);
      onTimeRate = prng.randFloat(0.96, 0.99);
      avgTurnaroundDays = prng.randInt(5, 14);
      repeatClientRate = prng.randFloat(0.70, 0.88);
    } else {
      // Elite
      startingRateUsd = prng.randInt(175, 340);
      projectsCompleted = prng.randInt(71, 145);
      onTimeRate = prng.randFloat(0.98, 1.0);
      avgTurnaroundDays = prng.randInt(8, 24);
      repeatClientRate = prng.randFloat(0.85, 0.96);
    }

    // Availability distribution: 50% open, 35% limited, 15% booked
    const availRand = prng.next();
    const availability: "open" | "limited" | "booked" =
      availRand < 0.5 ? "open" : availRand < 0.85 ? "limited" : "booked";

    // Commercial ready: strictly 60% across the dataset
    // Verified workflow: strictly 35%
    const isCommercial = i < Math.floor(TOTAL_CREATORS * 0.60);
    const isReproducible = i >= 20 && i < 20 + Math.floor(TOTAL_CREATORS * 0.35);
    const isIdentity = i % 2 === 0;

    // Specializations: primary + secondary
    const specs = specBuckets[i]!;
    if (specs.length === 0) {
      specs.push(MARKETPLACE_SPECIALIZATIONS[i % MARKETPLACE_SPECIALIZATIONS.length]!);
    }
    // Also include a realistic secondary pairing if only 1
    if (specs.length === 1) {
      const sec = MARKETPLACE_SPECIALIZATIONS[(i + 4) % MARKETPLACE_SPECIALIZATIONS.length]!;
      if (!specs.includes(sec)) specs.push(sec);
    }

    // Tools: mix pre-assigned + realistic pairing
    const toolsSet = new Set<string>(toolBuckets[i]!);
    const pairing = REALISTIC_TOOL_PAIRINGS[i % REALISTIC_TOOL_PAIRINGS.length]!;
    pairing.forEach((t) => toolsSet.add(t));
    const primaryTools = Array.from(toolsSet).slice(0, 5);

    // Style tags
    const styleTags = [
      specs[0]!.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      primaryTools[0]!,
      level.toLowerCase(),
      isCommercial ? "commercial-cleared" : "editorial-only",
    ];

    // Bio tailored to specialization in a distinct voice
    const bioIndex = (i >= 8 && i <= 12) ? 2 : (i % BIO_ARCHETYPES.length);
    const bio: string = BIO_ARCHETYPES[bioIndex]!;

    const avatarGradient = GRADIENT_PALETTES[i % GRADIENT_PALETTES.length]! as [string, string];

    const creatorData: CreatorProfile = {
      id,
      name: fullName,
      handle: `@${handle}`,
      bio,
      avatarGradient,
      location: hub.city,
      timezone: hub.timezone,
      specializations: specs,
      primaryTools,
      styleTags,
      skills: skillBuckets[i]!.map((s) => s.name),
      verified: {
        commercialLicense: isCommercial,
        reproduciblePipeline: isReproducible,
        identity: isIdentity,
      },
      stats: {
        projectsCompleted,
        onTimeRate,
        avgTurnaroundDays,
        repeatClientRate,
      },
      startingRateUsd,
      availability,
      portfolioItemIds: [], // Populated by portfolio generator
      isDemo: true,
      is_demo: true,
    };

    // Strict validation against Zod schema
    const parsed = CreatorProfileSchema.parse(creatorData);

    results.push({
      creator: parsed,
      level,
      language: hub.primaryLanguage,
      country: hub.country,
      skillsWithLevels: skillBuckets[i]!,
    });
  }

  // Ensure deliberate empty states remain 0:
  // Void 1: Architecture Viz + Starting rate <= $25
  results.forEach((r) => {
    if (r.creator.specializations.includes("architecture/real estate visualization")) {
      if (r.creator.startingRateUsd < 35) {
        r.creator.startingRateUsd = 45;
      }
    }
  });

  // Void 2: Podcast/audio + nerf-studio + 21:9
  // Ensure no podcast creator has nerf-studio
  results.forEach((r) => {
    if (r.creator.specializations.includes("podcast/audio and voice")) {
      r.creator.primaryTools = r.creator.primaryTools.filter((t) => t !== "nerf-studio");
    }
  });

  return results;
}
