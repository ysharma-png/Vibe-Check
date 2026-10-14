/**
 * Portfolio Items Generator
 * Generates 4 to 8 rich portfolio items per creator (~700 items total)
 * with complete workflow provenance DAGs, technical specs, and commercial safety.
 */

import {
  AspectRatio,
  DeliverableType,
  NodeGraph,
  PipelineStage,
  PortfolioItem,
  PortfolioItemSchema,
  Resolution,
} from "@/types/schema";
import { SeededPRNG } from "../prng";
import { GeneratedCreatorWithMetadata } from "./creators";
import { GRADIENT_PALETTES } from "../constants";

const TITLES_BY_SPEC: Record<string, string[]> = {
  "AI film/short film": [
    "Echoes of Elysium: Cinematic Sci-Fi Teaser",
    "Midnight Drift: Neo-Tokyo Highway Narrative",
    "Chronicles of the Deep: Underwater Expedition",
    "The Forgotten Oasis: Solitary Desert Journey",
    "Aethelgard: Medieval Fantasy Lore Intro",
    "Solitude 2088: Atmospheric Dystopian Short",
  ],
  "AI animation (2D/3D/anime)": [
    "Cyber Ronin: Anime Action Choreography",
    "Spirited Canopy: Studio Ghibli Aesthetic Loop",
    "Mecha Awakening: Frame-Interpolated Pilot",
    "Solaris Shonen: High-Paced Combat Sequence",
    "Moonlit Sakura: Lofi Anime Chill Narrative",
    "Starlight Valkyrie: 2D Cel-Shaded Transformation",
  ],
  "product ads": [
    "Luminaire Watch: Planar Titanium Commercial",
    "Aura Botanicals: Organic Serum Droplet Packshot",
    "Velocity Hypercar: Carbon Fiber Aerodynamics",
    "Kinetix Headphones: Spatial Driver Exploded View",
    "Saffron Elixir: Macro Luxury Bottle Reveal",
    "Pulse Canister: Dynamic Condensation Splash Spot",
  ],
  "music videos": [
    "Kaleidoscope Dreams: Hyper-Pop Visualizer",
    "Sub-Bass Eclipse: Synthwave Cyberpunk Journey",
    "Astral Drift: Ambient Lo-Fi Vinyl Companion",
    "Neon Requiem: Darkwave Club Lighting Story",
    "Echoing Heights: Indie Rock Ethereal Montage",
    "Vortex BPM: Hardstyle Beat-Synchronized Motion",
  ],
  "fashion/lookbook": [
    "Solstice Drape: Haute Couture Silk Motion",
    "Atelier Monochrome: High-Fashion Winter Lookbook",
    "Velvet Noir: Runway Model Consistency Study",
    "Prism Iris: Editorial Eyewear Chromatic Shoot",
    "Aurora Woolens: Scandinavian Knitwear Campaign",
    "Ethereal Linen: Mediterranean Resort Collection",
  ],
  "social shorts": [
    "Instant Viral Hook: 3-Second Retention Reel",
    "Creator Growth Playbook: Fast Vertical Short",
    "AI Tech Roundup: 9:16 Punchy Micro-Documentary",
    "Micro-Workout Energy: TikTok High-Paced Edit",
    "Product Unbox Magic: 9:16 Satisfying Workflow",
    "DTC Dropship Velocity: Conversion Story Video",
  ],
  "explainer/educational": [
    "Neural Network Architecture: Visual Guide",
    "Quantum Computing Principles in 60 Seconds",
    "Photosynthesis Visualized: Micro-Cellular 3D",
    "Global Supply Chains: Kinetic Typography Map",
    "Clean Fusion Energy: Technical Breakdown",
    "Blockchain Consensus: Diagrammatic Explainer",
  ],
  "game assets/concept art": [
    "Obsidian Citadel: AAA Dark Fantasy Keyframe",
    "Sci-Fi Armory: Modular Hard-Surface Weapon Sheet",
    "Pixel Village: 16-Bit Isometric RPG Tileset",
    "Cybernetic Mercenary: 360 Character Turnaround",
    "Ancient Dungeon Props: PBR Texture Asset Pack",
    "Bioluminescent Cavern: Unreal Engine 5 Matte",
  ],
  "architecture/real estate visualization": [
    "Villa Horizon: Mediterranean Cliffside Walkthrough",
    "Nordic Forest Pavilion: Daylight Sun-Study 4K",
    "Tokyo Penthouse: Minimalist Japandi Interior",
    "The Glass Spire: Skyscraper Twilight Render",
    "Casa del Sol: Brutalist Concrete Courtyard Tour",
    "Boutique Alpine Chalet: Seasonal Snow Transition",
  ],
  "brand mascots/characters": [
    "Pip the Cyber Penguin: Episodic Brand Mascot",
    "Boba Bear: 3D Turnaround & Emotion Expression Sheet",
    "Aero Fox: High-Octane Energy Drink Spokes-Animal",
    "Gobi the Robot: Friendly Fintech Assistant Rig",
    "Mochi Sprite: App Onboarding Character Sprites",
    "Captain Cascade: Sustainable Hydration Hero",
  ],
  "podcast/audio and voice": [
    "The Deep Frequency: Spatial Audio Trailer",
    "Neural Voiceover: Bilingual Audio Documentary",
    "Lost Expeditions: Immersive Binaural Drama",
    "Midnight Musings: Calming Bedtime Soundscape",
    "Synthesized Dialogue: Multi-Speaker Conversation",
    "Heavy Industrial Foley: Cyberpunk Sound Pack",
  ],
  "VFX/upscaling/restoration": [
    "Archival 1920 Film: 4K Neural Super-Resolution",
    "Artifact Erasure: AI Temporal De-Flicker Pass",
    "Vintage Travelogue: Historical Color Restoration",
    "Low-Res Cellphone Shot: 4K Cinema Upscale",
    "Digital De-Noise & Master Grain Layering",
    "VFX Plate Cleanup: Wire Removal & Lighting Match",
  ],
};

const CLIENT_OUTCOMES = [
  "Generated 4.2M impressions and 18% engagement on TikTok and Instagram Reels.",
  "Delivered 4K DCI broadcast master files with zero revisions within 48 hours.",
  "Boosted direct-to-consumer store conversion rate by 24% following campaign debut.",
  "Featured in the official Tribeca Generative Film Festival 2026 showcase.",
  "Client reported a 3.4x reduction in total production overhead compared to live filming.",
  "Turnaround completed in 4 days with complete ComfyUI node graphs handed over.",
  "Exceeded launch benchmark by 140% with over 85,000 organic shares.",
];

export function generatePortfolioItems(
  creatorsWithMeta: GeneratedCreatorWithMetadata[],
  prng: SeededPRNG
): PortfolioItem[] {
  const allItems: PortfolioItem[] = [];
  let itemCounter = 1;

  for (const { creator } of creatorsWithMeta) {
    const itemCount = prng.randInt(4, 6);
    const creatorItemIds: string[] = [];

    for (let k = 0; k < itemCount; k++) {
      const itemId = `item-${itemCounter.toString().padStart(5, "0")}`;
      itemCounter++;
      creatorItemIds.push(itemId);

      const primarySpec = creator.specializations[k % creator.specializations.length]!;
      const titlePool = TITLES_BY_SPEC[primarySpec] ?? [
        "Synthetic Cinema Project",
        "Generative Vision Showcase",
        "Kinetic Workflow Exploration",
      ];
      const title = titlePool[k % titlePool.length]!;

      // Media type & Deliverable Type mapping
      let mediaType: "video" | "image" | "3d" = "video";
      let deliverableType: DeliverableType = "commercial_spot";

      if (primarySpec.includes("social")) {
        deliverableType = "social_short_form";
      } else if (primarySpec.includes("animation")) {
        deliverableType = "animation";
      } else if (primarySpec.includes("game") || primarySpec.includes("mascot")) {
        deliverableType = "still_assets";
        mediaType = k % 2 === 0 ? "image" : "video";
      } else if (primarySpec.includes("product") || primarySpec.includes("arch")) {
        deliverableType = "product_visual";
      } else if (primarySpec.includes("music")) {
        deliverableType = "music_video";
      }

      // Aspect ratio distribution
      let aspectRatio: AspectRatio;
      if (primarySpec.includes("social")) {
        aspectRatio = "9:16";
      } else if (primarySpec.includes("arch") || primarySpec.includes("film")) {
        aspectRatio = k % 3 === 0 ? "21:9" : "16:9";
      } else if (primarySpec.includes("product") || primarySpec.includes("game")) {
        aspectRatio = k % 2 === 0 ? "1:1" : "4:5";
      } else {
        const ratios: AspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];
        aspectRatio = ratios[k % ratios.length]!;
      }

      const resolution: Resolution = k % 3 === 0 ? "4K" : k % 2 === 0 ? "2K" : "1080p";
      const durationSec = mediaType === "video" ? prng.randInt(12, 45) : undefined;

      const palette = GRADIENT_PALETTES[(k + creatorItemIds.length) % GRADIENT_PALETTES.length]!;
      const posterGradient: [string, string, string] = [palette[0], palette[1], "#0D0E12"];

      // Tools used in this item
      const itemTools = creator.primaryTools.slice(0, 3);
      if (itemTools.length === 0) itemTools.push("flux-1-dev");

      // 3 to 5 Pipeline Stages
      const stageCount = prng.randInt(3, 5);
      const stages: PipelineStage[] = [];

      for (let s = 0; s < stageCount; s++) {
        const stageId = `stage-${itemId}-${s + 1}`;
        const toolId = itemTools[s % itemTools.length]!;
        const isSaas = [
          "flux-1-pro",
          "midjourney-v7",
          "runway-gen3",
          "runway-gen4",
          "kling-1-5",
          "luma-dream-machine",
          "veo-2",
          "pika-2",
          "topaz-video-ai",
          "elevenlabs",
          "heygen",
          "davinci-resolve",
        ].includes(toolId);

        const stageSeed = isSaas && s % 2 === 0 ? null : prng.randInt(10000000, 99999999);
        const prevStageIds = s > 0 ? [stages[s - 1]!.id] : [];

        stages.push({
          id: stageId,
          order: s + 1,
          label:
            s === 0
              ? "Base Keyframe & Latent Conditioning"
              : s === 1
              ? "Temporal Motion Synthesis"
              : s === 2
              ? "Neural Refinement & Color Grade"
              : "Final Neural 4K Master Upscale",
          toolId,
          modelVersion: "v1.2-commercial",
          checkpointHash: "a1b2c3d4e5f6",
          loras: s === 0 ? [{ name: "photoreal_v3.safetensors", weight: 0.85 }] : [],
          controlNets: s === 1 ? [{ type: "depth", strength: 0.75 }] : [],
          prompt: `Cinematic ${primarySpec.toLowerCase()}, 35mm lens, master lighting, volumetric atmosphere`,
          negativePrompt: "blurry, low resolution, artifacts, watermarks, bad anatomy",
          seed: stageSeed,
          inputStageIds: prevStageIds,
          durationSec: prng.randFloat(1.2, 8.5),
          costUsd: prng.randFloat(0.04, 0.45),
          outputPreview: {
            gradient: [palette[0], palette[1]],
            caption: `Stage ${s + 1} milestone output`,
          },
        });
      }

      // Reproducibility node graph
      let nodeGraph: NodeGraph | null = null;
      if (creator.verified.reproduciblePipeline) {
        nodeGraph = {
          nodes: [
            { id: "node-1", type: "LoadCheckpoint", label: "FLUX.1 Dev Base", x: 100, y: 150 },
            { id: "node-2", type: "CLIPTextEncode", label: "Positive Conditioning", x: 350, y: 100 },
            { id: "node-3", type: "KSampler", label: "Euler KSampler (30 steps)", x: 650, y: 150 },
            { id: "node-4", type: "VAEDecode", label: "High-Res VAE Output", x: 900, y: 150 },
          ],
          edges: [
            { from: "node-1", to: "node-2" },
            { from: "node-2", to: "node-3" },
            { from: "node-3", to: "node-4" },
          ],
          downloadable: true,
          workflowJsonFilename: `${itemId}-comfyui-dag.json`,
        };
      }

      const clientOutcome = CLIENT_OUTCOMES[k % CLIENT_OUTCOMES.length];
      const viewCount = prng.randInt(2500, 185000);

      const portfolioItemData: PortfolioItem = {
        id: itemId,
        creatorId: creator.id,
        title,
        description: `Production case study for ${title}. Implemented ${stages.length} granular generation stages utilizing ${itemTools.join(", ")} to achieve peak aesthetic fidelity. Delivered with audited commercial indemnification.`,
        mediaType,
        mediaUrl: `/samples/videos/${itemId}.mp4`,
        posterGradient,
        aspectRatio,
        resolution,
        durationSec,
        deliverableType,
        styleTags: [
          primarySpec.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          aspectRatio,
          resolution,
          creator.verified.commercialLicense ? "commercial-cleared" : "editorial",
        ],
        toolchain: [...creator.primaryTools],
        pipeline: stages,
        nodeGraph,
        reproducibility: creator.verified.reproduciblePipeline
          ? {
              kind: "verified_deterministic",
              verifiedAt: new Date(Date.now() - prng.randInt(1, 30) * 86400000).toISOString(),
              rerunMatchScore: 0.99,
            }
          : { kind: "unverified" },
        commercialSafety: {
          baseModelCompliance: creator.verified.commercialLicense
            ? "permissive"
            : "licensed_dataset",
          indemnified: creator.verified.commercialLicense,
          subscriptionTier: "Enterprise Commercial Pro",
          subscriptionVerified: true,
          copyrightedIpScan: "clean",
          usageRightsNotes: "Full worldwide commercial buyout rights granted for digital and broadcast.",
        },
        clientOutcome,
        viewCount,
        isDemo: true,
        is_demo: true,
      };

      // Strict validation
      const parsedItem = PortfolioItemSchema.parse(portfolioItemData);
      allItems.push(parsedItem);
    }

    // Attach portfolio item IDs back to creator
    creator.portfolioItemIds = creatorItemIds;
  }

  return allItems;
}
