import {
  CommercialTerms,
  DeliverableType,
  Milestone,
  NegativeConstraint,
} from "@/types/schema";

/**
 * Standard copyright negative constraint always pre-added to protect brands.
 */
export const COPYRIGHT_NEGATIVE_CONSTRAINT: NegativeConstraint = {
  id: "nc-copyright-default",
  label: "No copyrighted characters, logos or celebrity likeness",
  severity: "hard",
};

/**
 * Curated negative constraint library for AI generative media.
 * Offered as one-click toggles in the Brief Builder.
 */
export interface NegativeLibraryItem {
  readonly id: string;
  readonly label: string;
  readonly defaultSeverity: "hard" | "soft";
  readonly description: string;
}

export const AI_VIDEO_NEGATIVE_LIBRARY: readonly NegativeLibraryItem[] = [
  {
    id: "lib-uncanny-faces",
    label: "Uncanny facial artifacts & distorted hands",
    defaultSeverity: "hard",
    description: "Rejects deformed digits, asynchronous eye blinks, and unnatural skin plastic sheen.",
  },
  {
    id: "lib-temporal-flicker",
    label: "Temporal flicker and inter-frame strobing",
    defaultSeverity: "hard",
    description: "Requires consistent optical flow and temporal stability across video diffusion passes.",
  },
  {
    id: "lib-morphing",
    label: "Uncontrolled morphing and phantom objects",
    defaultSeverity: "hard",
    description: "Prevents geometry warping, dissolving limbs, and background geometry shifts.",
  },
  {
    id: "lib-text-gibberish",
    label: "AI pseudo-text & illegible glyphs",
    defaultSeverity: "hard",
    description: "Rejects hallucinated lettering in background signage or product packaging.",
  },
  {
    id: "lib-watermarks",
    label: "Watermarks, tool logos, and UI stamps",
    defaultSeverity: "hard",
    description: "Guarantees output is free from model attribution badges or dataset watermarks.",
  },
  {
    id: "lib-audio-desync",
    label: "Lip-sync drift or robotic voice artifacts",
    defaultSeverity: "soft",
    description: "Ensures natural speech prosody and alignment with visual phonemes.",
  },
  {
    id: "lib-generic-stock",
    label: "Generic AI aesthetic / over-smoothed lighting",
    defaultSeverity: "soft",
    description: "Avoids generic Midjourney v5 lighting, favoring authentic camera color profiles.",
  },
];

/**
 * Conservative enterprise defaults for commercial rights terms.
 */
export const DEFAULT_COMMERCIAL_TERMS: CommercialTerms = {
  rightsModel: "perpetual_buyout",
  territory: "worldwide",
  exclusivity: true,
  sourceHandover: ["prompts_and_seeds", "project_files"],
  requiresVerifiedLicense: true,
  requiresReproduciblePipeline: false,
};

/**
 * Plain-English rationale for commercial defaults.
 */
export const COMMERCIAL_TERMS_EXPLANATIONS = {
  perpetual_buyout:
    "You will own all rights worldwide in perpetuity. No renewals, expirations, or recurring royalty fees.",
  term_license:
    "Time-bound license for a specific campaign flight. Creator retains underlying master ownership.",
  usage_based:
    "License scoped to specific distribution channels, impressions, or geographic territories.",
  indemnified_only:
    "Mandatory for enterprise broadcast: creator must use models backed by enterprise legal indemnification.",
  permissive_only:
    "Restricts to open-weights architectures (e.g. FLUX, SDXL) to preserve independent auditability.",
  any:
    "Permits creator to choose any generation toolchain best suited for optimal creative output.",
  sourceHandover:
    "Creator hands over all prompt manifests, seeds, and editable project compositions upon final payout.",
} as const;

/**
 * Predefined balanced escrow milestone schedules by deliverable type.
 * Every schedule is strictly verified to sum to exactly 100%.
 */
export function getDefaultMilestonesForDeliverable(
  deliverableType: DeliverableType
): Milestone[] {
  switch (deliverableType) {
    case "commercial_spot":
      return [
        {
          id: "m-cs-1",
          name: "Treatment & Visual Prompts",
          description: "3 visual style directions, prompt manifests, and keyframe stills",
          percentOfBudget: 20,
          deliverable: "Visual Treatment PDF + 4K Keyframe Renders",
        },
        {
          id: "m-cs-2",
          name: "Hero Shot Generation & Rough Cut",
          description: "First video generation pass, editorial animatic, and temp audio",
          percentOfBudget: 40,
          deliverable: "1080p Rough Cut Video Draft",
        },
        {
          id: "m-cs-3",
          name: "Client Revisions & Conforming",
          description: "Second generation pass, timing tweaks, and color stabilization",
          percentOfBudget: 20,
          deliverable: "Revised Video Cut MP4",
        },
        {
          id: "m-cs-4",
          name: "4K Master Delivery & Source Handover",
          description: "Final Topaz upscale, audio master, and project files bundle",
          percentOfBudget: 20,
          deliverable: "4K Master Video + Complete Generation Archive",
        },
      ];

    case "animation":
    case "music_video":
      return [
        {
          id: "m-an-1",
          name: "Concept Art & LoRA Exploration",
          description: "Character turnaround sheets, LoRA fine-tuning, and moodboard",
          percentOfBudget: 25,
          deliverable: "Character Model Sheets + LoRA Checkpoints",
        },
        {
          id: "m-an-2",
          name: "Animatic & Motion Passes",
          description: "Full sequence blockout, audio sync, and camera path tests",
          percentOfBudget: 35,
          deliverable: "Complete Motion Animatic",
        },
        {
          id: "m-an-3",
          name: "Lighting & Composite Pass",
          description: "Deflickering, inpainting corrections, and optical grading",
          percentOfBudget: 20,
          deliverable: "Full Color Review Cut",
        },
        {
          id: "m-an-4",
          name: "Master Render & Asset Delivery",
          description: "Final upscale, 60fps interpolation, and workflow handover",
          percentOfBudget: 20,
          deliverable: "Final Master Delivery Archive",
        },
      ];

    case "still_assets":
    case "product_visual":
      return [
        {
          id: "m-st-1",
          name: "Art Direction & Lighting Moodboard",
          description: "Lighting references, angle mockups, and prompt setup",
          percentOfBudget: 25,
          deliverable: "Moodboard + 4 Exploratory Render Batches",
        },
        {
          id: "m-st-2",
          name: "High-Resolution Render Generation",
          description: "Full resolution generation passes, ControlNet alignments",
          percentOfBudget: 45,
          deliverable: "High-Res Raw Image Selections",
        },
        {
          id: "m-st-3",
          name: "Retouching, Grading & Asset Delivery",
          description: "Defect cleanup, aspect format crops, and layered deliverables",
          percentOfBudget: 30,
          deliverable: "4K Final TIFF/PNG Bundle + Seed Manifests",
        },
      ];

    case "social_short_form":
    default:
      return [
        {
          id: "m-soc-1",
          name: "Concept & Style Direction",
          description: "Style frames, typography palette, and visual references",
          percentOfBudget: 20,
          deliverable: "Style Deck PDF + 3 Visual Test Frames",
        },
        {
          id: "m-soc-2",
          name: "Motion Generation Pass",
          description: "Full vertical video generation and audio synchronization",
          percentOfBudget: 40,
          deliverable: "9:16 Video Rough Cut MP4",
        },
        {
          id: "m-soc-3",
          name: "Feedback Revisions & Polish",
          description: "Timing refinements, visual corrections, and captions",
          percentOfBudget: 20,
          deliverable: "Polished Second Cut",
        },
        {
          id: "m-soc-4",
          name: "Final Master & Handover",
          description: "Final 60fps upscale, audio mastering, and source prompt files",
          percentOfBudget: 20,
          deliverable: "1080p Master MP4 + Generation Manifest",
        },
      ];
  }
}
