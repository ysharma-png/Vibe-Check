import {
  Tool,
  ToolCategory,
  ToolSchema,
} from "@/types/schema";

// ============================================================================
// 1. Tool Taxonomy (>= 16 verified entries)
// ============================================================================

export const TOOLS: readonly Tool[] = [
  {
    id: "flux-1-dev",
    name: "FLUX.1 [dev]",
    category: "image_gen",
    vendor: "Black Forest Labs",
    baseModelFamily: "flux",
    licenseClass: "restricted_noncommercial",
  },
  {
    id: "flux-1-pro",
    name: "FLUX.1 [pro]",
    category: "image_gen",
    vendor: "Black Forest Labs",
    baseModelFamily: "flux",
    licenseClass: "commercial_saas",
  },
  {
    id: "sdxl-base",
    name: "SDXL 1.0",
    category: "image_gen",
    vendor: "Stability AI",
    baseModelFamily: "sdxl",
    licenseClass: "permissive_open",
  },
  {
    id: "midjourney-v7",
    name: "Midjourney v7",
    category: "image_gen",
    vendor: "Midjourney",
    baseModelFamily: "midjourney",
    licenseClass: "commercial_saas",
  },
  {
    id: "runway-gen3",
    name: "Runway Gen-3 Alpha",
    category: "video_gen",
    vendor: "Runway",
    baseModelFamily: "runway",
    licenseClass: "commercial_saas",
  },
  {
    id: "runway-gen4",
    name: "Runway Gen-4",
    category: "video_gen",
    vendor: "Runway",
    baseModelFamily: "runway",
    licenseClass: "commercial_saas",
  },
  {
    id: "kling-1-5",
    name: "Kling 1.5",
    category: "video_gen",
    vendor: "Kuaishou",
    baseModelFamily: "kling",
    licenseClass: "commercial_saas",
  },
  {
    id: "luma-dream-machine",
    name: "Luma Dream Machine",
    category: "video_gen",
    vendor: "Luma AI",
    baseModelFamily: "luma",
    licenseClass: "commercial_saas",
  },
  {
    id: "veo-2",
    name: "Veo 2",
    category: "video_gen",
    vendor: "Google DeepMind",
    baseModelFamily: "veo",
    licenseClass: "commercial_saas",
  },
  {
    id: "pika-2",
    name: "Pika 2.0",
    category: "video_gen",
    vendor: "Pika Labs",
    baseModelFamily: "pika",
    licenseClass: "commercial_saas",
  },
  {
    id: "animatediff",
    name: "AnimateDiff",
    category: "video_gen",
    vendor: "Guanying Chen et al.",
    baseModelFamily: "sdxl",
    licenseClass: "permissive_open",
  },
  {
    id: "comfy-ui",
    name: "ComfyUI",
    category: "workflow_engine",
    vendor: "Comfy Org",
    baseModelFamily: "comfy_graph",
    licenseClass: "permissive_open",
  },
  {
    id: "forge-webui",
    name: "SD WebUI Forge",
    category: "workflow_engine",
    vendor: "lllyasviel",
    baseModelFamily: "other",
    licenseClass: "permissive_open",
  },
  {
    id: "invoke-ai",
    name: "InvokeAI",
    category: "workflow_engine",
    vendor: "Invoke",
    baseModelFamily: "other",
    licenseClass: "permissive_open",
  },
  {
    id: "topaz-video-ai",
    name: "Topaz Video AI",
    category: "upscaler",
    vendor: "Topaz Labs",
    baseModelFamily: "other",
    licenseClass: "commercial_saas",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Voice & SFX",
    category: "audio",
    vendor: "ElevenLabs",
    baseModelFamily: "other",
    licenseClass: "commercial_saas",
  },
  {
    id: "live-portrait",
    name: "LivePortrait",
    category: "lipsync",
    vendor: "KwaiVGI",
    baseModelFamily: "other",
    licenseClass: "permissive_open",
  },
  {
    id: "nerf-studio",
    name: "Nerfstudio",
    category: "3d",
    vendor: "Nerfstudio Team",
    baseModelFamily: "other",
    licenseClass: "permissive_open",
  },
  {
    id: "heygen",
    name: "HeyGen AI",
    category: "lipsync",
    vendor: "HeyGen",
    baseModelFamily: "other",
    licenseClass: "commercial_saas",
  },
  {
    id: "davinci-resolve",
    name: "DaVinci Resolve Studio",
    category: "editing",
    vendor: "Blackmagic Design",
    baseModelFamily: "other",
    licenseClass: "commercial_saas",
  },
] as const;

// Ensure every tool strictly matches schema at compile & runtime
for (const tool of TOOLS) {
  ToolSchema.parse(tool);
}

const TOOLS_BY_ID = new Map<string, Tool>(TOOLS.map((t) => [t.id, t]));

export function getToolById(toolId: string): Tool | undefined {
  return TOOLS_BY_ID.get(toolId);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

// ============================================================================
// 2. Equivalence Graph & Groups
// ============================================================================

export interface EquivalencePair {
  readonly a: string;
  readonly b: string;
  readonly similarity: number;
  readonly reason: string;
}

export interface EquivalenceGroup {
  readonly id: string;
  readonly name: string;
  readonly category: ToolCategory;
  readonly toolIds: readonly string[];
  readonly pairs: readonly EquivalencePair[];
}

export const EQUIVALENCE_GROUPS: readonly EquivalenceGroup[] = [
  {
    id: "eq-image-diffusion",
    name: "Foundation Image Diffusion & Flow Models",
    category: "image_gen",
    toolIds: ["flux-1-dev", "flux-1-pro", "sdxl-base", "midjourney-v7"],
    pairs: [
      {
        a: "flux-1-dev",
        b: "flux-1-pro",
        similarity: 0.95,
        reason:
          "Both share the 12B parameter rectified flow transformer architecture; Pro adds enterprise API throughput while Dev provides open weights for local pipelines.",
      },
      {
        a: "flux-1-dev",
        b: "sdxl-base",
        similarity: 0.7,
        reason:
          "Both are open-weights diffusion/flow models with native support for custom LoRA fine-tuning and ControlNet structural guidance.",
      },
      {
        a: "flux-1-dev",
        b: "midjourney-v7",
        similarity: 0.75,
        reason:
          "Both deliver top-tier photorealism and complex prompt comprehension; Midjourney operates as a managed service whereas FLUX.1 [dev] allows exact node-level reproducibility.",
      },
      {
        a: "flux-1-pro",
        b: "midjourney-v7",
        similarity: 0.8,
        reason:
          "Both are premier commercial SaaS image generators with enterprise indemnification and curated aesthetic fidelity.",
      },
      {
        a: "flux-1-pro",
        b: "sdxl-base",
        similarity: 0.65,
        reason:
          "Both serve as high-resolution image foundation models, though SDXL is locally hosted open weights while FLUX [pro] is a high-throughput commercial API.",
      },
      {
        a: "sdxl-base",
        b: "midjourney-v7",
        similarity: 0.6,
        reason:
          "Both provide rich cinematic styling and text-to-image capabilities, though SDXL supports custom ControlNet passes while Midjourney operates via proprietary prompt parsing.",
      },
    ],
  },
  {
    id: "eq-video-foundation",
    name: "Generative Video Foundation Models",
    category: "video_gen",
    toolIds: [
      "runway-gen3",
      "runway-gen4",
      "kling-1-5",
      "luma-dream-machine",
      "veo-2",
      "pika-2",
      "animatediff",
    ],
    pairs: [
      {
        a: "runway-gen3",
        b: "runway-gen4",
        similarity: 0.92,
        reason:
          "Direct generational upgrade within Runway's video suite, sharing motion brush ergonomics and camera control syntax with improved temporal stability in Gen-4.",
      },
      {
        a: "runway-gen3",
        b: "kling-1-5",
        similarity: 0.8,
        reason:
          "Both are high-fidelity video diffusion models with robust camera motion control, prompt steering, and realistic human kinematics simulation.",
      },
      {
        a: "runway-gen3",
        b: "luma-dream-machine",
        similarity: 0.75,
        reason:
          "Both are commercial video generators specializing in dynamic cinematic framing, physics-informed motion, and rapid iterative video generation.",
      },
      {
        a: "runway-gen3",
        b: "veo-2",
        similarity: 0.7,
        reason:
          "Both are state-of-the-art video foundation models capable of photorealistic lighting, cinematic focal length rendering, and extended scene continuity.",
      },
      {
        a: "kling-1-5",
        b: "luma-dream-machine",
        similarity: 0.76,
        reason:
          "Both offer cloud-rendered text-to-video and image-to-video generation with strong motion dynamics and camera trajectory presets.",
      },
      {
        a: "kling-1-5",
        b: "veo-2",
        similarity: 0.72,
        reason:
          "Both excel at high-resolution video synthesis with fluid temporal consistency and complex multi-object scene coherence.",
      },
      {
        a: "luma-dream-machine",
        b: "veo-2",
        similarity: 0.7,
        reason:
          "Both offer cinematic text/image-to-video synthesis with high dynamic range color science and smooth camera pans.",
      },
      {
        a: "runway-gen3",
        b: "pika-2",
        similarity: 0.65,
        reason:
          "Both are SaaS video synthesis suites with motion control features, though Runway targets longer cinematic takes while Pika focuses on short social loops.",
      },
      {
        a: "kling-1-5",
        b: "animatediff",
        similarity: 0.6,
        reason:
          "Both generate motion from image/prompt seeds, though AnimateDiff executes locally on SD checkpoints while Kling operates as an advanced hosted model.",
      },
    ],
  },
  {
    id: "eq-workflow-engines",
    name: "Modular Diffusion Workflow Engines",
    category: "workflow_engine",
    toolIds: ["comfy-ui", "forge-webui", "invoke-ai"],
    pairs: [
      {
        a: "comfy-ui",
        b: "forge-webui",
        similarity: 0.82,
        reason:
          "Both are locally hosted execution environments built on PyTorch for running SDXL, FLUX, and custom LoRA/ControlNet pipelines without vendor lock-in.",
      },
      {
        a: "comfy-ui",
        b: "invoke-ai",
        similarity: 0.78,
        reason:
          "Both are workstation-grade environments supporting node-based orchestration, canvas inpainting, and deterministic seed management.",
      },
      {
        a: "forge-webui",
        b: "invoke-ai",
        similarity: 0.75,
        reason:
          "Both offer local workstation control over diffusion model weights, LoRA adapters, sampler selection, and deterministic image generation.",
      },
    ],
  },
] as const;

export interface EquivalentResult {
  toolId: string;
  similarity: number;
  reason: string;
}

/**
 * Returns all functionally substitutable tools for a given toolId,
 * ordered by similarity descending.
 */
export function getEquivalents(toolId: string): EquivalentResult[] {
  const matches: EquivalentResult[] = [];

  for (const group of EQUIVALENCE_GROUPS) {
    for (const pair of group.pairs) {
      if (pair.a === toolId) {
        matches.push({
          toolId: pair.b,
          similarity: pair.similarity,
          reason: pair.reason,
        });
      } else if (pair.b === toolId) {
        matches.push({
          toolId: pair.a,
          similarity: pair.similarity,
          reason: pair.reason,
        });
      }
    }
  }

  // Deduplicate if multiple groups define links, keeping the highest similarity
  const uniqueMap = new Map<string, EquivalentResult>();
  for (const match of matches) {
    const existing = uniqueMap.get(match.toolId);
    if (!existing || match.similarity > existing.similarity) {
      uniqueMap.set(match.toolId, match);
    }
  }

  return Array.from(uniqueMap.values()).sort(
    (a, b) => b.similarity - a.similarity
  );
}
