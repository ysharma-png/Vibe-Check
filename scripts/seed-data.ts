/**
 * Seed Data Generator
 * Provides 40 realistic creators, 120 portfolio items with pipeline stages,
 * 25 creative briefs, proposals, and engagements.
 */

export interface SeedCreator {
  id: string;
  email: string;
  role: "creator" | "brand" | "admin";
  fullName: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  avatarGradient: [string, string];
  bio: string;
  location: string;
  website: string;
  verifiedIdentity: boolean;
  deterministicPipeline: boolean;
  commercialClearanceCleared: boolean;
  rating: number;
  reviewCount: number;
  completedProjects: number;
  repeatHireRate: number;
  hourlyRateUsd: number;
  dayRateUsd: number;
  primaryTools: string[];
  specializations: string[];
  portfolioScore: number;
}

export interface SeedPipelineStage {
  id: string;
  stageOrder: number;
  stageName: string;
  toolName: string;
  modelHash: string;
  seed: number;
  prompt: string;
  negativePrompt: string;
  loraWeights: { name: string; weight: number }[];
  durationSec: number;
  costUsd: number;
  outputPreviewCaption: string;
}

export interface SeedPortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  aspectRatio: "9:16" | "16:9" | "1:1" | "4:5" | "21:9";
  videoUrl: string;
  thumbnailUrl: string;
  posterGradient: [string, string];
  baseModels: string[];
  tools: string[];
  reproducibilityScore: number;
  reproducibilityKind: "verified_deterministic" | "partially_reproducible" | "exploratory";
  commercialClearanceStatus: "cleared" | "flagged" | "pending_review";
  copyrightedIpScan: "clean" | "flagged";
  nodeGraphData: {
    nodesCount: number;
    edgesCount: number;
    downloadable: boolean;
    workflowFile: string;
  };
  stages: SeedPipelineStage[];
}

export interface SeedBrief {
  id: string;
  brandId: string;
  brandName: string;
  brandAvatar: string;
  brandAvatarGradient: [string, string];
  title: string;
  description: string;
  objective: string;
  targetAudience: string;
  aspectRatios: string[];
  durationSec: number;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;
  status: "draft" | "published" | "in_review" | "awarded" | "completed";
  baseModelPolicy: "indemnified_only" | "permissive_open" | "any_commercial";
  requiredTools: string[];
  negativeConstraints: { label: string; severity: "hard" | "soft"; reason: string }[];
  deliverables: { format: string; resolution: string; count: number }[];
  milestones: { title: string; percentage: number; amountUsd: number }[];
}

export interface SeedProposal {
  id: string;
  briefId: string;
  creatorId: string;
  pitchText: string;
  proposedBudget: number;
  proposedTimelineDays: number;
  status: "submitted" | "shortlisted" | "accepted" | "declined";
}

export interface SeedEngagement {
  id: string;
  briefId: string;
  proposalId: string;
  brandId: string;
  creatorId: string;
  title: string;
  totalAmount: number;
  escrowFunded: number;
  status: "active" | "in_review" | "completed" | "disputed";
  currentMilestoneIndex: number;
  milestones: { title: string; percentage: number; amount: number; status: string }[];
  messages: { senderId: string; message: string; createdAt: string }[];
}

// -------------------------------------------------------------
// 3 DEMO ACCOUNTS
// -------------------------------------------------------------
export const DEMO_ACCOUNTS = {
  creator: {
    id: "00000000-0000-0000-0000-000000000001",
    email: process.env.DEMO_CREATOR_EMAIL || "creator@cacheflow.ai",
    password: process.env.DEMO_CREATOR_PASSWORD || "Creator123!",
    role: "creator" as const,
    fullName: "Alex Rivera",
    displayName: "Alex Rivera",
    handle: "alex_rivera",
  },
  brand: {
    id: "00000000-0000-0000-0000-000000000002",
    email: process.env.DEMO_BRAND_EMAIL || "brand@cacheflow.ai",
    password: process.env.DEMO_BRAND_PASSWORD || "Brand123!",
    role: "brand" as const,
    fullName: "Nike Studios Global",
    displayName: "Nike Studios",
    handle: "nike_studios",
  },
  admin: {
    id: "00000000-0000-0000-0000-000000000003",
    email: process.env.DEMO_ADMIN_EMAIL || "admin@cacheflow.ai",
    password: process.env.DEMO_ADMIN_PASSWORD || "Admin123!",
    role: "admin" as const,
    fullName: "CacheFlow Platform Admin",
    displayName: "Admin",
    handle: "admin",
  },
};

// -------------------------------------------------------------
// 40 REALISTIC CREATORS
// -------------------------------------------------------------
const CITIES = [
  "Tokyo, Japan", "Berlin, Germany", "London, UK", "San Francisco, CA", "Montreal, Canada",
  "Seoul, South Korea", "São Paulo, Brazil", "Paris, France", "Austin, TX", "Brooklyn, NY",
  "Stockholm, Sweden", "Amsterdam, Netherlands", "Melbourne, Australia", "Singapore",
  "Copenhagen, Denmark", "Toronto, Canada", "Barcelona, Spain", "Taipei, Taiwan"
];

const TOOLS_POOL = [
  "comfyui", "flux_1_dev", "runway_gen3", "kling_v1_5", "luma_dream_machine",
  "midjourney_v6", "topaz_video_ai", "elevenlabs", "liveportrait", "stable_video_diffusion"
];

const SPECS_POOL = [
  "Camera Motion Control", "Consistent Character", "Lip-Sync", "Product Visualization",
  "Style Transfer", "AI Cinematic Video", "Motion Graphics", "3D / NeRF", "Vertical Social Shorts"
];

const NAMES_POOL = [
  ["Alex Rivera", "alex_rivera"],
  ["Elena Rostova", "elena_rostova"],
  ["Kenji Takahashi", "kenji_takahashi"],
  ["Chloe Mercier", "chloe_mercier"],
  ["Marcus Vance", "marcus_vance"],
  ["Sora Tanaka", "sora_tanaka"],
  ["Mateo Silva", "mateo_silva"],
  ["Ingrid Lindqvist", "ingrid_lind"],
  ["Liam O'Connor", "liam_oconnor"],
  ["Amara Okafor", "amara_okafor"],
  ["Dmitri Volkov", "dmitri_volkov"],
  ["Nadia Chen", "nadia_chen"],
  ["Julian Becker", "julian_becker"],
  ["Freja Hansen", "freja_hansen"],
  ["Tariq Al-Mansoor", "tariq_almansoor"],
  ["Maya Lin", "maya_lin"],
  ["Gabriel Santos", "gabriel_santos"],
  ["Zoe Sterling", "zoe_sterling"],
  ["Kaito Endo", "kaito_endo"],
  ["Camille Dupont", "camille_dupont"],
  ["Oliver Wright", "oliver_wright"],
  ["Hana Kim", "hana_kim"],
  ["Lucas Meyer", "lucas_meyer"],
  ["Aria Thorne", "aria_thorne"],
  ["Vikram Patel", "vikram_patel"],
  ["Sofia Rossi", "sofia_rossi"],
  ["Felix Zhang", "felix_zhang"],
  ["Astrid Berg", "astrid_berg"],
  ["Rene Laurent", "rene_laurent"],
  ["Kofi Mensah", "kofi_mensah"],
  ["Isla MacDonald", "isla_macdonald"],
  ["Dante Alighieri", "dante_ai"],
  ["Mia Novak", "mia_novak"],
  ["Arjun Sharma", "arjun_sharma"],
  ["Chiara Conti", "chiara_conti"],
  ["Soren Møller", "soren_moller"],
  ["Fatima Zahra", "fatima_zahra"],
  ["Elias Lind", "elias_lind"],
  ["Harper Reed", "harper_reed"],
  ["Yuki Sato", "yuki_sato"]
];

export function generateSeedCreators(): SeedCreator[] {
  const creators: SeedCreator[] = [];

  for (let i = 0; i < 40; i++) {
    const isDemo = i === 0;
    const id = isDemo ? DEMO_ACCOUNTS.creator.id : `10000000-0000-0000-0000-${(i + 1).toString().padStart(12, "0")}`;
    const namePair = NAMES_POOL[i] ?? [`Creator ${i + 1}`, `creator_${i + 1}`];
    const fullName = isDemo ? DEMO_ACCOUNTS.creator.fullName : namePair[0]!;
    const handle = isDemo ? DEMO_ACCOUNTS.creator.handle : namePair[1]!;
    const email = isDemo ? DEMO_ACCOUNTS.creator.email : `${handle}@cacheflow.ai`;

    const city = CITIES[i % CITIES.length]!;
    const tools = [
      TOOLS_POOL[i % TOOLS_POOL.length]!,
      TOOLS_POOL[(i + 1) % TOOLS_POOL.length]!,
      TOOLS_POOL[(i + 3) % TOOLS_POOL.length]!,
    ];
    const specs = [
      SPECS_POOL[i % SPECS_POOL.length]!,
      SPECS_POOL[(i + 2) % SPECS_POOL.length]!,
    ];

    const hourlyRate = 75 + (i % 15) * 15;
    const dayRate = hourlyRate * 8;
    const rating = Math.round((4.75 + (i % 5) * 0.05) * 100) / 100;
    const completedProjects = 12 + (i * 3) % 40;
    const reviewCount = Math.floor(completedProjects * 0.85);
    const repeatHireRate = 70 + (i * 7) % 28;

    creators.push({
      id,
      email,
      role: "creator",
      fullName,
      displayName: fullName,
      handle,
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + i * 1000}?w=150&auto=format&fit=crop&q=80`,
      avatarGradient: ["#8B93FF", "#06B6D4"],
      bio: `Award-winning AI director specializing in ${specs[0]} & ComfyUI nodes. Trusted by global fashion & automotive brands.`,
      location: city,
      website: `https://${handle}.studio`,
      verifiedIdentity: true,
      deterministicPipeline: i % 3 !== 0,
      commercialClearanceCleared: i % 4 !== 0,
      rating: Math.min(5.0, rating),
      reviewCount,
      completedProjects,
      repeatHireRate,
      hourlyRateUsd: hourlyRate,
      dayRateUsd: dayRate,
      primaryTools: tools,
      specializations: specs,
      portfolioScore: 82 + (i % 17),
    });
  }

  return creators;
}

// -------------------------------------------------------------
// 120 PORTFOLIO ITEMS (3 PER CREATOR)
// -------------------------------------------------------------
const ASSET_THEMES = [
  "Sub-Zero Cyberpunk Turntable",
  "Fluid Silk Commercial Spot",
  "Kinetic Sneakers Volumetric Jump",
  "Hyperreal Botanical Macro Sequence",
  "Isometric Architecture Dreamscape",
  "Anime Noir Kinetic Chase",
  "Liquid Gold Perfume Packshot",
  "Zero-G Astronaut Emotional Close-Up",
  "Electric Supercar Mountain Drifting",
  "Retro-Futuristic Hologram Fashion Film"
];

const ASPECT_RATIOS: ("16:9" | "9:16" | "1:1" | "4:5" | "21:9")[] = ["16:9", "9:16", "1:1", "4:5", "21:9"];

export function generateSeedPortfolioItems(creators: SeedCreator[]): SeedPortfolioItem[] {
  const items: SeedPortfolioItem[] = [];

  creators.forEach((creator, cIdx) => {
    for (let pIdx = 0; pIdx < 3; pIdx++) {
      const globalIdx = cIdx * 3 + pIdx;
      const itemId = `20000000-0000-0000-0000-${(globalIdx + 1).toString().padStart(12, "0")}`;
      const theme = ASSET_THEMES[(cIdx + pIdx) % ASSET_THEMES.length]!;
      const ratio = ASPECT_RATIOS[(cIdx + pIdx) % ASPECT_RATIOS.length]!;
      const reproScore = 80 + ((cIdx * 5 + pIdx * 7) % 21);

      const stages: SeedPipelineStage[] = [
        {
          id: `30000000-0000-0000-0000-${(globalIdx * 3 + 1).toString().padStart(12, "0")}`,
          stageOrder: 1,
          stageName: "Diffusion Base Generation",
          toolName: "FLUX.1 Dev",
          modelHash: `sha256:d84f9b8c0a23e1f7749b5c${cIdx}${pIdx}aa1b`,
          seed: 492048201 + globalIdx * 31,
          prompt: `Cinematic volumetric lighting of ${theme}, 8k raw octane render, Hasselblad 80mm lens, photorealistic studio lighting`,
          negativePrompt: "oversaturated, plastic texture, blur, compression artifacts, watermark",
          loraWeights: [{ name: "studio_lighting_v2", weight: 0.75 }],
          durationSec: 12.4,
          costUsd: 0.08,
          outputPreviewCaption: "Raw 2K Master Keyframe",
        },
        {
          id: `30000000-0000-0000-0000-${(globalIdx * 3 + 2).toString().padStart(12, "0")}`,
          stageOrder: 2,
          stageName: "Camera Trajectory & Motion Synthesis",
          toolName: "Runway Gen-3 Alpha",
          modelHash: `sha256:4a0c8e2b9f71d530aa882c${cIdx}${pIdx}ef3c`,
          seed: 881920491 + globalIdx * 43,
          prompt: `Smooth orbital dolly zoom camera motion across ${theme}, perfect temporal coherence, no jitter`,
          negativePrompt: "morphing artifacts, rubber limbs, jitter, camera shudder",
          loraWeights: [],
          durationSec: 28.5,
          costUsd: 0.45,
          outputPreviewCaption: "Motion Latent Interpolation",
        },
        {
          id: `30000000-0000-0000-0000-${(globalIdx * 3 + 3).toString().padStart(12, "0")}`,
          stageOrder: 3,
          stageName: "Temporal Upscale & Film Grain",
          toolName: "Topaz Video AI 5",
          modelHash: `sha256:7b1e4f9c0018d4591a3c7e${cIdx}${pIdx}02dd`,
          seed: 104829014 + globalIdx * 19,
          prompt: "4K DCI upscale with Proteus fine-tune, 35mm Kodak 5219 subtle grain injection",
          negativePrompt: "",
          loraWeights: [],
          durationSec: 45.0,
          costUsd: 0.12,
          outputPreviewCaption: "4K DCI Final Master Deliverable",
        },
      ];

      items.push({
        id: itemId,
        creatorId: creator.id,
        title: `${theme} #${pIdx + 1}`,
        description: `High-fidelity production asset created using a deterministic ComfyUI pipeline with verified commercial copyright clearance.`,
        aspectRatio: ratio,
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
        thumbnailUrl: `https://images.unsplash.com/photo-${1618005182384 + globalIdx * 200}?w=600&auto=format&fit=crop&q=80`,
        posterGradient: ["#16161A", "#8B93FF"],
        baseModels: ["flux", "sdxl"],
        tools: creator.primaryTools,
        reproducibilityScore: reproScore,
        reproducibilityKind: reproScore > 90 ? "verified_deterministic" : "partially_reproducible",
        commercialClearanceStatus: creator.commercialClearanceCleared ? "cleared" : "pending_review",
        copyrightedIpScan: "clean",
        nodeGraphData: {
          nodesCount: 14,
          edgesCount: 19,
          downloadable: true,
          workflowFile: `workflow_${theme.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.json`,
        },
        stages,
      });
    }
  });

  return items;
}

// -------------------------------------------------------------
// 25 CREATIVE BRIEFS
// -------------------------------------------------------------
const BRAND_NAMES = [
  "Nike Global Studio", "Red Bull Media House", "Oatly Creative Lab", "Spotify Studios",
  "Apple TV+ Campaigns", "Arc Browser", "Balenciaga Vision", "Patagonia Works",
  "Dyson Design Lab", "Porsche Motorsport", "Aesop Botanical", "Polestar Automotive",
  "Sonos Sound Lab", "Acne Studios", "Rimowa Travel", "Notion Creative",
  "Figma Community", "Moncler Genius", "Lululemon Movement", "Sephora Beauty Hub",
  "Bose Sound", "Bang & Olufsen", "On Running", "Breville Design", "Herman Miller"
];

const BRIEF_TOPICS = [
  "Futuristic Kinetic Runner Campaign",
  "Extreme Sports Drone Sequence",
  "Sustainable Oat Milk Surreal 3D Spot",
  "Personalized Rhythm Audio Visualizer",
  "Sci-Fi Cinematic Title Sequence",
  "Minimalist Browser Speed Manifesto",
  "Haute Couture Avatars Runway Spot",
  "Alpine Environmental Documentary Teaser",
  "Supersonic Airflow Packshot Commercial",
  "Electric GT Hypercar Night Showcase"
];

export function generateSeedBriefs(): SeedBrief[] {
  const briefs: SeedBrief[] = [];

  for (let i = 0; i < 25; i++) {
    const isDemoBrand = i === 0;
    const briefId = `40000000-0000-0000-0000-${(i + 1).toString().padStart(12, "0")}`;
    const brandId = isDemoBrand
      ? DEMO_ACCOUNTS.brand.id
      : `50000000-0000-0000-0000-${(i + 1).toString().padStart(12, "0")}`;

    const brandName = isDemoBrand ? DEMO_ACCOUNTS.brand.displayName : BRAND_NAMES[i % BRAND_NAMES.length]!;
    const title = `${BRIEF_TOPICS[i % BRIEF_TOPICS.length]} — ${brandName}`;
    const budgetMin = 4000 + (i % 8) * 2500;
    const budgetMax = budgetMin + 6000 + (i % 5) * 3000;

    const statuses: ("published" | "in_review" | "awarded" | "completed")[] = [
      "published", "published", "in_review", "awarded", "completed"
    ];

    briefs.push({
      id: briefId,
      brandId,
      brandName,
      brandAvatar: `https://images.unsplash.com/photo-${1516257984 + i * 500}?w=100&auto=format&fit=crop&q=80`,
      brandAvatarGradient: ["#8B93FF", "#06B6D4"],
      title,
      description: `Seeking an expert AI filmmaker to craft a cinematic campaign deliverable with complete parameter reproducibility and enterprise legal indemnification guarantees.`,
      objective: "Drive viral awareness and brand authority with cutting-edge visual craft.",
      targetAudience: "Global gen-z and millennial digital natives valuing innovation and authenticity.",
      aspectRatios: ["16:9", "9:16"],
      durationSec: 30,
      budgetMin,
      budgetMax,
      currency: "USD",
      deadline: new Date(Date.now() + (14 + i * 3) * 86400000).toISOString(),
      status: statuses[i % statuses.length]!,
      baseModelPolicy: i % 2 === 0 ? "indemnified_only" : "any_commercial",
      requiredTools: ["flux_1_dev", "runway_gen3"],
      negativeConstraints: [
        { label: "No uncanny valley faces", severity: "hard", reason: "Must maintain photorealistic skin textures" },
        { label: "No jittery camera pans", severity: "soft", reason: "Maintain smooth fluid dolly motion" },
      ],
      deliverables: [
        { format: "MP4 ProRes Master", resolution: "4K DCI", count: 1 },
        { format: "9:16 Vertical Social Cut", resolution: "1080x1920", count: 2 },
      ],
      milestones: [
        { title: "Keyframe Aesthetics & Style Exploration", percentage: 30, amountUsd: Math.round(budgetMax * 0.3) },
        { title: "Motion Generation Rough Cut", percentage: 40, amountUsd: Math.round(budgetMax * 0.4) },
        { title: "Final 4K Master & ComfyUI Graph Handover", percentage: 30, amountUsd: Math.round(budgetMax * 0.3) },
      ],
    });
  }

  return briefs;
}

// -------------------------------------------------------------
// PROPOSALS & ENGAGEMENTS
// -------------------------------------------------------------
export function generateSeedProposalsAndEngagements(
  creators: SeedCreator[],
  briefs: SeedBrief[]
): { proposals: SeedProposal[]; engagements: SeedEngagement[] } {
  const proposals: SeedProposal[] = [];
  const engagements: SeedEngagement[] = [];

  briefs.forEach((brief, bIdx) => {
    // Generate 2-3 proposals for each brief from various creators
    for (let pIdx = 0; pIdx < 3; pIdx++) {
      const creator = creators[(bIdx * 2 + pIdx) % creators.length]!;
      const proposalId = `60000000-0000-0000-0000-${(bIdx * 3 + pIdx + 1).toString().padStart(12, "0")}`;
      const isAccepted = (brief.status === "awarded" || brief.status === "completed") && pIdx === 0;

      proposals.push({
        id: proposalId,
        briefId: brief.id,
        creatorId: creator.id,
        pitchText: `We have built over 40 commercial spots utilizing our deterministic ComfyUI pipeline. We guarantee commercial copyright clearance and under 10-day turnaround.`,
        proposedBudget: Math.round((brief.budgetMin + brief.budgetMax) / 2),
        proposedTimelineDays: 10 + (bIdx % 5) * 2,
        status: isAccepted ? "accepted" : pIdx === 1 ? "shortlisted" : "submitted",
      });

      // If accepted, create an active/completed engagement
      if (isAccepted) {
        const engagementId = `70000000-0000-0000-0000-${(bIdx + 1).toString().padStart(12, "0")}`;
        const total = Math.round((brief.budgetMin + brief.budgetMax) / 2);

        engagements.push({
          id: engagementId,
          briefId: brief.id,
          proposalId: proposalId,
          brandId: brief.brandId,
          creatorId: creator.id,
          title: brief.title,
          totalAmount: total,
          escrowFunded: total,
          status: brief.status === "completed" ? "completed" : "active",
          currentMilestoneIndex: brief.status === "completed" ? 2 : 1,
          milestones: [
            { title: "Keyframe Aesthetics Approval", percentage: 30, amount: Math.round(total * 0.3), status: "approved" },
            { title: "Motion Rough Cut Review", percentage: 40, amount: Math.round(total * 0.4), status: brief.status === "completed" ? "approved" : "in_progress" },
            { title: "4K Master Delivery & Escrow Release", percentage: 30, amount: Math.round(total * 0.3), status: brief.status === "completed" ? "approved" : "pending" },
          ],
          messages: [
            {
              senderId: brief.brandId,
              message: "Welcome aboard! Escrow has been funded. Looking forward to reviewing the first keyframe batch.",
              createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            },
            {
              senderId: creator.id,
              message: "Thanks! We are spinning up our FLUX.1 LoRA workflows now. First review link will be uploaded within 48 hours.",
              createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            },
          ],
        });
      }
    }
  });

  return { proposals, engagements };
}

// -------------------------------------------------------------
// ENGAGEMENT LAYER SEED GENERATOR
// -------------------------------------------------------------
export function generateSeedEngagementLayer(
  creators: SeedCreator[],
  briefs: SeedBrief[]
) {
  const notifications = [
    {
      id: "90000000-0000-0000-0000-000000000001",
      userId: DEMO_ACCOUNTS.creator.id,
      type: "brief_match",
      title: "96% Brief Match Detected",
      body: "Nike Studios Global posted 'Pulse Energy 2026: Hyper-Speed Social Shorts' matching your ComfyUI stack.",
      data: { briefId: briefs[0]?.id || "brief-1", matchScore: 96, actionUrl: "/briefs" },
      read: false,
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: "90000000-0000-0000-0000-000000000002",
      userId: DEMO_ACCOUNTS.brand.id,
      type: "proposal_received",
      title: "Proposal Received for Review",
      body: "Elena Rostova submitted a methodology proposal for your 'Cyberpunk Brand Spot'.",
      data: { actionUrl: "/dashboard/brand" },
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "90000000-0000-0000-0000-000000000003",
      userId: DEMO_ACCOUNTS.creator.id,
      type: "creator_verified",
      title: "Badge Awarded: Verified Workflow",
      body: "Your ComfyUI DAG pipeline passed our automated determinism regression tests.",
      data: { badgeId: "verified_workflow", actionUrl: "/dashboard/creator" },
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const follows = [
    {
      followerId: DEMO_ACCOUNTS.brand.id,
      followingId: creators[0]?.id || DEMO_ACCOUNTS.creator.id,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      followerId: DEMO_ACCOUNTS.brand.id,
      followingId: creators[1]?.id || "creator-2",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      followerId: DEMO_ACCOUNTS.creator.id,
      followingId: creators[2]?.id || "creator-3",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const boards = [
    {
      id: "80000000-0000-0000-0000-000000000001",
      userId: DEMO_ACCOUNTS.brand.id,
      title: "Hyperreal Footwear & 3D ComfyUI",
      description: "Collection of top verified deterministic character and product animation pipelines.",
      isPublic: true,
      items: [
        { itemType: "creator", itemId: creators[0]?.id || DEMO_ACCOUNTS.creator.id, notes: "Top ComfyUI expert" },
        { itemType: "creator", itemId: creators[1]?.id || "creator-2", notes: "Photoreal specialist" },
      ],
    },
    {
      id: "80000000-0000-0000-0000-000000000002",
      userId: DEMO_ACCOUNTS.creator.id,
      title: "Inspiration & Lighting Studies",
      description: "References for upcoming cinematic campaign pitches.",
      isPublic: false,
      items: [
        { itemType: "brief", itemId: briefs[0]?.id || "brief-1", notes: "Target pitch" },
      ],
    },
  ];

  const events = [
    {
      userId: DEMO_ACCOUNTS.creator.id,
      eventType: "feed_viewed",
      targetType: "brief",
      targetId: "home_feed",
      metadata: { role: "creator" },
    },
    {
      userId: DEMO_ACCOUNTS.creator.id,
      eventType: "showcase_liked",
      targetType: "portfolio_item",
      targetId: "port-amara-1",
      metadata: { liked: true },
    },
  ];

  return { notifications, follows, boards, events };
}

