/**
 * Creative Briefs, Proposals, and Engagements Generator
 * Generates 40 brands, 60 creative briefs in varied states, proposals, and engagements.
 */

import {
  AspectRatio,
  CreativeBrief,
  CreativeBriefSchema,
  DeliverableType,
  Resolution,
} from "@/types/schema";
import { SeededPRNG } from "../prng";
import { SEED_BRANDS, SeedBrand } from "../constants";
import { GeneratedCreatorWithMetadata } from "./creators";

export interface GeneratedBriefPayload {
  briefs: CreativeBrief[];
  proposals: Array<{
    id: string;
    briefId: string;
    creatorId: string;
    pitchText: string;
    proposedBudget: number;
    proposedTimelineDays: number;
    status: "submitted" | "shortlisted" | "accepted" | "declined";
    isDemo: boolean;
  }>;
  engagements: Array<{
    id: string;
    briefId: string;
    proposalId: string;
    brandId: string;
    creatorId: string;
    title: string;
    totalAmount: number;
    escrowFunded: number;
    status: "active" | "in_review" | "completed" | "disputed";
    isDemo: boolean;
  }>;
}

const BRIEF_TEMPLATES = [
  {
    title: "Global Commercial Launch Spot: 30s 4K",
    desc: "Seeking an experienced AI cinematic filmmaker to produce our flagship 30-second broadcast commercial. We require photorealistic lighting, consistent model appearance, and custom depth camera paths.",
    deliverableType: "commercial_spot" as DeliverableType,
    aspectRatios: ["16:9", "9:16"] as AspectRatio[],
    durationSec: 30,
    budgetMin: 4500,
    budgetMax: 9000,
  },
  {
    title: "Viral TikTok & Reels 9:16 Growth Campaign",
    desc: "Looking for a high-velocity creator to produce five vertical social ads with punchy retention hooks. Audio-reactive cuts, dynamic kinetic captions, and rapid 48-hour turnarounds required.",
    deliverableType: "social_short_form" as DeliverableType,
    aspectRatios: ["9:16"] as AspectRatio[],
    durationSec: 15,
    budgetMin: 2200,
    budgetMax: 5000,
  },
  {
    title: "Haute Couture Virtual Runway & Lookbook",
    desc: "Luxury apparel collection debut. Seeking an AI fashion specialist with trained silk/drape LoRAs to render 8 continuous editorial runway clips with consistent high-fashion models.",
    deliverableType: "commercial_spot" as DeliverableType,
    aspectRatios: ["4:5", "16:9"] as AspectRatio[],
    durationSec: 25,
    budgetMin: 6000,
    budgetMax: 12500,
  },
  {
    title: "Exploded 3D Packshot & Product Showcase",
    desc: "Architectural packshot and micro-droplet visualizer for our new flagship hardware device. Must incorporate CAD geometry or ControlNet depth to ensure exact dimensional accuracy.",
    deliverableType: "product_visual" as DeliverableType,
    aspectRatios: ["1:1", "16:9"] as AspectRatio[],
    durationSec: 20,
    budgetMin: 3500,
    budgetMax: 7000,
  },
  {
    title: "Episodic Brand Mascot Animation Series",
    desc: "Character design and animation for 3 animated episodes featuring our 3D corporate mascot. Demands strict multi-angle face and wardrobe consistency across all scenes.",
    deliverableType: "animation" as DeliverableType,
    aspectRatios: ["16:9"] as AspectRatio[],
    durationSec: 45,
    budgetMin: 5000,
    budgetMax: 11000,
  },
  {
    title: "Surreal Music Video & Visualizer Suite",
    desc: "Full 3-minute electronic visualizer synchronized to album stem tracks. Audio-reactive motion, dreamlike transitions, and cinematic color grade.",
    deliverableType: "music_video" as DeliverableType,
    aspectRatios: ["16:9", "21:9"] as AspectRatio[],
    durationSec: 60,
    budgetMin: 4000,
    budgetMax: 8500,
  },
];

export function generateBriefsAndEngagements(
  creatorsWithMeta: GeneratedCreatorWithMetadata[],
  prng: SeededPRNG
): GeneratedBriefPayload {
  const TOTAL_BRIEFS = 60;
  const briefs: CreativeBrief[] = [];
  const proposals: GeneratedBriefPayload["proposals"] = [];
  const engagements: GeneratedBriefPayload["engagements"] = [];

  const statuses: ("draft" | "published" | "in_review" | "awarded" | "completed")[] = [
    "published",
    "published",
    "in_review",
    "awarded",
    "awarded",
    "completed",
    "completed",
    "draft",
  ];

  for (let i = 0; i < TOTAL_BRIEFS; i++) {
    const briefId = `brief-${(i + 1).toString().padStart(4, "0")}`;
    const brand: SeedBrand = SEED_BRANDS[i % SEED_BRANDS.length]!;
    const template = BRIEF_TEMPLATES[i % BRIEF_TEMPLATES.length]!;
    const status = statuses[i % statuses.length]!;

    const totalBudgetUsd = prng.randInt(template.budgetMin, template.budgetMax);
    const deadlineDate = new Date(Date.now() + prng.randInt(7, 45) * 86400000).toISOString();

    const briefData: CreativeBrief = {
      id: briefId,
      campaignTitle: `${brand.name}: ${template.title}`,
      description: template.desc,
      brandName: brand.name,
      deliverableType: template.deliverableType,
      aspectRatios: template.aspectRatios,
      resolution: i % 2 === 0 ? "4K" : "1080p",
      durationSec: template.durationSec,
      styleReferences: [
        "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      ],
      toolRequirements: {
        mode: i % 3 === 0 ? "required_tools" : "open_to_creator_choice",
        requiredToolIds: i % 3 === 0 ? ["comfy-ui", "flux-1-dev"] : [],
        baseModelPolicy: i % 2 === 0 ? "indemnified_only" : "any",
      },
      negativeConstraints: [
        { id: "nc-1", label: "No anatomical hand defects or finger duplication", severity: "hard" },
        { id: "nc-2", label: "No temporal flicker or ungrounded floating artifacts", severity: "hard" },
        { id: "nc-3", label: "Avoid muddy low-contrast grading", severity: "soft" },
      ],
      commercialTerms: {
        rightsModel: i % 4 === 0 ? "term_license" : "perpetual_buyout",
        termMonths: i % 4 === 0 ? 12 : undefined,
        territory: "worldwide",
        exclusivity: true,
        sourceHandover: ["node_graph", "prompts_and_seeds"],
        requiresVerifiedLicense: true,
        requiresReproduciblePipeline: i % 3 === 0,
      },
      milestones: [
        {
          id: `m-${briefId}-1`,
          name: "Treatment, Moodboard & Style Frames",
          description: "Initial prompt exploration, color palette, and keyframe approval.",
          percentOfBudget: 30,
          deliverable: "PDF treatment + 10 approved 4K stills",
        },
        {
          id: `m-${briefId}-2`,
          name: "First Motion Rough Cut",
          description: "Synchronized animation pass with timing and pacing.",
          percentOfBudget: 40,
          deliverable: "1080p preview with scratch audio",
        },
        {
          id: `m-${briefId}-3`,
          name: "Final Master Delivery & Clean Workflow DAG",
          description: "Full resolution master files, color grade, and node graph handover.",
          percentOfBudget: 30,
          deliverable: "4K ProRes master + ComfyUI json",
        },
      ],
      totalBudgetUsd,
      deadline: deadlineDate,
      isDemo: true,
      is_demo: true,
    };

    const parsedBrief = CreativeBriefSchema.parse(briefData);
    briefs.push(parsedBrief);

    // Generate proposals and engagements for non-draft briefs
    if (status !== "draft") {
      const candidates = creatorsWithMeta.slice(i % 10, (i % 10) + 3);
      candidates.forEach((cand, cIdx) => {
        const proposalId = `prop-${briefId}-${cIdx + 1}`;
        const isAwarded = status === "awarded" || status === "completed";
        const isWinning = isAwarded && cIdx === 0;

        proposals.push({
          id: proposalId,
          briefId,
          creatorId: cand.creator.id,
          pitchText: `We have executed similar ${cand.creator.specializations[0]} campaigns with verified commercial clearance. We propose completing this milestone pipeline using ${cand.creator.primaryTools.join(", ")} with guaranteed temporal consistency.`,
          proposedBudget: totalBudgetUsd,
          proposedTimelineDays: prng.randInt(5, 14),
          status: isWinning ? "accepted" : cIdx === 1 ? "shortlisted" : "submitted",
          isDemo: true,
        });

        if (isWinning) {
          engagements.push({
            id: `eng-${briefId}`,
            briefId,
            proposalId,
            brandId: brand.id,
            creatorId: cand.creator.id,
            title: briefData.campaignTitle,
            totalAmount: totalBudgetUsd,
            escrowFunded: totalBudgetUsd,
            status: status === "completed" ? "completed" : "active",
            isDemo: true,
          });
        }
      });
    }
  }

  return { briefs, proposals, engagements };
}
