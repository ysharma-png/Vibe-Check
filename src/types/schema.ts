import { z } from "zod";

// ============================================================================
// 1. Taxonomy Enums & Tool Definitions
// ============================================================================

export const TOOL_CATEGORIES = [
  "image_gen",
  "video_gen",
  "workflow_engine",
  "upscaler",
  "audio",
  "lipsync",
  "3d",
  "editing",
] as const;

export const ToolCategorySchema = z.enum(TOOL_CATEGORIES);
export type ToolCategory = z.infer<typeof ToolCategorySchema>;

export const BASE_MODEL_FAMILIES = [
  "flux",
  "sdxl",
  "midjourney",
  "runway",
  "kling",
  "luma",
  "veo",
  "pika",
  "comfy_graph",
  "other",
] as const;

export const BaseModelFamilySchema = z.enum(BASE_MODEL_FAMILIES);
export type BaseModelFamily = z.infer<typeof BaseModelFamilySchema>;

export const LICENSE_CLASSES = [
  "permissive_open",
  "commercial_saas",
  "restricted_noncommercial",
] as const;

export const LicenseClassSchema = z.enum(LICENSE_CLASSES);
export type LicenseClass = z.infer<typeof LicenseClassSchema>;

export const ToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: ToolCategorySchema,
  vendor: z.string().min(1),
  baseModelFamily: BaseModelFamilySchema,
  licenseClass: LicenseClassSchema,
});
export type Tool = z.infer<typeof ToolSchema>;

export const SPECIALIZATIONS = [
  "Consistent Character",
  "Camera Motion Control",
  "Lip-Sync",
  "Product Visualization",
  "Style Transfer",
  "AI Cinematic Video",
  "Motion Graphics",
  "Vertical Social Shorts",
  "3D / NeRF",
  "Upscale & Restoration",
  // 12 marketplace coverage specializations
  "AI film/short film",
  "AI animation (2D/3D/anime)",
  "product ads",
  "music videos",
  "fashion/lookbook",
  "social shorts",
  "explainer/educational",
  "game assets/concept art",
  "architecture/real estate visualization",
  "brand mascots/characters",
  "podcast/audio and voice",
  "VFX/upscaling/restoration",
] as const;

export const SpecializationSchema = z.enum(SPECIALIZATIONS);
export type Specialization = z.infer<typeof SpecializationSchema>;

export const ASPECT_RATIOS = ["9:16", "16:9", "1:1", "4:5", "21:9"] as const;
export const AspectRatioSchema = z.enum(ASPECT_RATIOS);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

export const DELIVERABLE_TYPES = [
  "social_short_form",
  "commercial_spot",
  "animation",
  "still_assets",
  "product_visual",
  "music_video",
] as const;

export const DeliverableTypeSchema = z.enum(DELIVERABLE_TYPES);
export type DeliverableType = z.infer<typeof DeliverableTypeSchema>;

export const RESOLUTIONS = ["1080p", "2K", "4K"] as const;
export const ResolutionSchema = z.enum(RESOLUTIONS);
export type Resolution = z.infer<typeof ResolutionSchema>;

// Known SaaS tool IDs where generation is server-managed and seed may be non-deterministic / null
export const SAAS_TOOL_IDS = new Set<string>([
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
]);

export function isSaasTool(toolId: string): boolean {
  return SAAS_TOOL_IDS.has(toolId);
}

// ============================================================================
// 2. Provenance & Pipeline Schemas
// ============================================================================

export const CONTROL_NET_TYPES = [
  "depth",
  "canny",
  "openpose",
  "ipadapter",
  "tile",
] as const;

export const ControlNetTypeSchema = z.enum(CONTROL_NET_TYPES);
export type ControlNetType = z.infer<typeof ControlNetTypeSchema>;

export const ControlNetSchema = z.object({
  type: ControlNetTypeSchema,
  strength: z.number().min(0).max(2),
});
export type ControlNet = z.infer<typeof ControlNetSchema>;

export const LoraSchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(-2).max(2),
});
export type Lora = z.infer<typeof LoraSchema>;

export const OutputPreviewSchema = z.object({
  gradient: z.tuple([z.string(), z.string()]),
  caption: z.string().min(1),
});
export type OutputPreview = z.infer<typeof OutputPreviewSchema>;

export const PipelineStageRawSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  label: z.string().min(1),
  toolId: z.string().min(1),
  modelVersion: z.string().min(1),
  checkpointHash: z
    .string()
    .regex(/^[a-f0-9]{12}$/i, "Checkpoint hash must be 12 hex characters")
    .optional(),
  loras: z.array(LoraSchema),
  controlNets: z.array(ControlNetSchema),
  prompt: z.string(),
  negativePrompt: z.string(),
  seed: z.number().int().nullable(),
  sampler: z.string().optional(),
  steps: z.number().int().positive().optional(),
  cfg: z.number().positive().optional(),
  inputStageIds: z.array(z.string()),
  durationSec: z.number().nonnegative(),
  costUsd: z.number().nonnegative(),
  outputPreview: OutputPreviewSchema,
});

export const PipelineStageSchema = PipelineStageRawSchema.refine(
  (stage) => {
    const isSaas = isSaasTool(stage.toolId);
    if (!isSaas) {
      return stage.seed !== null && typeof stage.seed === "number";
    }
    return true; // SaaS tools allow null or integer
  },
  {
    message:
      "Deterministic non-SaaS tools require an explicit integer seed. Seed may only be null for commercial SaaS tools.",
    path: ["seed"],
  }
);
export type PipelineStage = z.infer<typeof PipelineStageRawSchema>;

export const NodeGraphSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string().min(1),
      type: z.string().min(1),
      label: z.string().min(1),
      x: z.number(),
      y: z.number(),
    })
  ),
  edges: z.array(
    z.object({
      from: z.string().min(1),
      to: z.string().min(1),
    })
  ),
  downloadable: z.boolean(),
  workflowJsonFilename: z.string().optional(),
});
export type NodeGraph = z.infer<typeof NodeGraphSchema>;

export const ReproducibilityStatusSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("verified_deterministic"),
    verifiedAt: z.string().datetime({ offset: true }),
    rerunMatchScore: z.number().min(0).max(1),
  }),
  z.object({
    kind: z.literal("partially_reproducible"),
    nonDeterministicStageIds: z.array(z.string()),
    note: z.string().min(1),
  }),
  z.object({
    kind: z.literal("unverified"),
  }),
]);
export type ReproducibilityStatus = z.infer<typeof ReproducibilityStatusSchema>;

// ============================================================================
// 3. Commercial Safety Schemas
// ============================================================================

export const CommercialSafetySchema = z.object({
  baseModelCompliance: z.enum([
    "permissive",
    "licensed_dataset",
    "unknown",
    "restricted",
  ]),
  indemnified: z.boolean(),
  indemnityProvider: z.string().optional(),
  subscriptionTier: z.string().min(1),
  subscriptionVerified: z.boolean(),
  subscriptionVerifiedAt: z.string().datetime({ offset: true }).optional(),
  copyrightedIpScan: z.enum(["clean", "flagged", "not_scanned"]),
  usageRightsNotes: z.string().min(1),
});
export type CommercialSafety = z.infer<typeof CommercialSafetySchema>;

// ============================================================================
// 4. Core Entities: Portfolio, Creator, Brief
// ============================================================================

export const ImportPlatformSchema = z.enum([
  "youtube",
  "vimeo",
  "behance",
  "artstation",
  "instagram",
  "tiktok",
  "civitai",
  "huggingface",
  "manual",
]);
export type ImportPlatform = z.infer<typeof ImportPlatformSchema>;

export const PortfolioItemSchema = z.object({
  id: z.string().min(1),
  creatorId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  mediaType: z.enum(["video", "image", "3d"]),
  mediaUrl: z.string().nullable(),
  posterGradient: z.tuple([z.string(), z.string(), z.string()]),
  aspectRatio: AspectRatioSchema,
  resolution: ResolutionSchema,
  durationSec: z.number().positive().optional(),
  deliverableType: DeliverableTypeSchema,
  styleTags: z.array(z.string().min(1)),
  toolchain: z.array(z.string().min(1)),
  pipeline: z.array(PipelineStageSchema),
  nodeGraph: NodeGraphSchema.nullable(),
  reproducibility: ReproducibilityStatusSchema,
  commercialSafety: CommercialSafetySchema,
  clientOutcome: z.string().optional(),
  viewCount: z.number().int().nonnegative().optional(),
  isDemo: z.boolean().optional(),
  is_demo: z.boolean().optional(),
  isImported: z.boolean().optional(),
  sourceUrl: z.string().optional(),
  platform: ImportPlatformSchema.optional(),
  embedUrl: z.string().optional(),
  attribution: z
    .object({
      creatorName: z.string().optional(),
      sourceProfileUrl: z.string().optional(),
      license: z.string().optional(),
    })
    .optional(),
});
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

export const CreatorProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  bio: z.string().min(1),
  avatarGradient: z.tuple([z.string(), z.string()]),
  location: z.string().min(1),
  timezone: z.string().min(1),
  specializations: z.array(SpecializationSchema),
  primaryTools: z.array(z.string().min(1)),
  styleTags: z.array(z.string().min(1)),
  skills: z.array(z.string()).optional(),
  verified: z.object({
    commercialLicense: z.boolean(),
    reproduciblePipeline: z.boolean(),
    identity: z.boolean(),
  }),
  stats: z.object({
    projectsCompleted: z.number().int().nonnegative(),
    onTimeRate: z.number().min(0).max(1),
    avgTurnaroundDays: z.number().positive(),
    repeatClientRate: z.number().min(0).max(1),
  }),
  startingRateUsd: z.number().positive(),
  availability: z.enum(["open", "limited", "booked"]),
  portfolioItemIds: z.array(z.string().min(1)),
  isDemo: z.boolean().optional(),
  is_demo: z.boolean().optional(),
  isClaimed: z.boolean().optional(),
  claimStatus: z.enum(["unclaimed", "pending_verification", "claimed"]).optional(),
  claimVerificationCode: z.string().optional(),
  sourcePlatform: z.string().optional(),
  sourceProfileUrl: z.string().optional(),
});
export type CreatorProfile = z.infer<typeof CreatorProfileSchema>;

export const MilestoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  percentOfBudget: z.number().min(0).max(100),
  deliverable: z.string().min(1),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const NegativeConstraintSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  severity: z.enum(["hard", "soft"]),
});
export type NegativeConstraint = z.infer<typeof NegativeConstraintSchema>;

export const CommercialTermsRawSchema = z.object({
  rightsModel: z.enum(["perpetual_buyout", "term_license", "usage_based"]),
  termMonths: z.number().int().positive().optional(),
  territory: z.enum(["worldwide", "regional"]),
  regions: z.array(z.string().min(1)).optional(),
  exclusivity: z.boolean(),
  sourceHandover: z.array(
    z.enum(["node_graph", "prompts_and_seeds", "lora_weights", "project_files"])
  ),
  requiresVerifiedLicense: z.boolean(),
  requiresReproduciblePipeline: z.boolean(),
});
export type CommercialTerms = z.infer<typeof CommercialTermsRawSchema>;

export const ToolRequirementsSchema = z.object({
  mode: z.enum(["open_to_creator_choice", "required_tools"]),
  requiredToolIds: z.array(z.string().min(1)),
  baseModelPolicy: z.enum(["any", "permissive_only", "indemnified_only"]),
});
export type ToolRequirements = z.infer<typeof ToolRequirementsSchema>;

export const CreativeBriefRawSchema = z.object({
  id: z.string().min(1),
  campaignTitle: z.string().min(1),
  description: z.string().min(1),
  brandName: z.string().min(1),
  deliverableType: DeliverableTypeSchema,
  aspectRatios: z.array(AspectRatioSchema).min(1),
  resolution: ResolutionSchema,
  durationSec: z.number().positive(),
  styleReferences: z.array(z.string().min(1)),
  toolRequirements: ToolRequirementsSchema,
  negativeConstraints: z.array(NegativeConstraintSchema),
  commercialTerms: CommercialTermsRawSchema,
  milestones: z.array(MilestoneSchema).min(1),
  totalBudgetUsd: z.number().positive(),
  deadline: z.string().datetime({ offset: true }),
  isDemo: z.boolean().optional(),
  is_demo: z.boolean().optional(),
});

export const CreativeBriefSchema = CreativeBriefRawSchema.refine(
  (brief) => {
    const totalPercent = brief.milestones.reduce(
      (sum, m) => sum + m.percentOfBudget,
      0
    );
    return Math.abs(totalPercent - 100) < 0.001;
  },
  {
    message: "Milestone percentOfBudget values must sum exactly to 100%",
    path: ["milestones"],
  }
)
  .refine(
    (brief) => {
      if (brief.commercialTerms.rightsModel === "term_license") {
        return (
          typeof brief.commercialTerms.termMonths === "number" &&
          brief.commercialTerms.termMonths > 0
        );
      }
      return true;
    },
    {
      message:
        "termMonths is required and must be > 0 when rightsModel is 'term_license'",
      path: ["commercialTerms", "termMonths"],
    }
  )
  .refine(
    (brief) => {
      if (brief.commercialTerms.territory === "regional") {
        return (
          Array.isArray(brief.commercialTerms.regions) &&
          brief.commercialTerms.regions.length > 0
        );
      }
      return true;
    },
    {
      message:
        "regions array is required and must not be empty when territory is 'regional'",
      path: ["commercialTerms", "regions"],
    }
  );

export type CreativeBrief = z.infer<typeof CreativeBriefRawSchema>;

// ============================================================================
// 5. Ingestion, Compliance, Suppression, and DSAR Schemas
// ============================================================================

export const IngestionLogSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
  legalBasis: z.string().min(1),
  adminId: z.string().min(1),
  targetHandle: z.string().min(1),
  recordsCount: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional(),
});
export type IngestionLog = z.infer<typeof IngestionLogSchema>;

export const SuppressionRecordSchema = z.object({
  id: z.string().min(1),
  identityHash: z.string().min(1),
  sourcePlatform: z.string().min(1),
  sourceProfileUrl: z.string().min(1),
  optOutTimestamp: z.string().datetime({ offset: true }),
  reason: z.string().min(1),
  status: z.literal("suppressed"),
});
export type SuppressionRecord = z.infer<typeof SuppressionRecordSchema>;

export const CreatorInvitationSchema = z.object({
  id: z.string().min(1),
  creatorProfileId: z.string().min(1),
  targetContactChannel: z.string().min(1),
  inviteToken: z.string().min(1),
  sentAt: z.string().datetime({ offset: true }),
  status: z.enum(["sent", "accepted", "declined"]),
  lastActivityAt: z.string().datetime({ offset: true }).optional(),
});
export type CreatorInvitation = z.infer<typeof CreatorInvitationSchema>;

export const DsarRequestSchema = z.object({
  id: z.string().min(1),
  requesterEmail: z.string().email(),
  requestType: z.enum(["access", "rectification", "erasure"]),
  status: z.enum(["pending", "processing", "completed"]),
  details: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).nullable().optional(),
});
export type DsarRequest = z.infer<typeof DsarRequestSchema>;
