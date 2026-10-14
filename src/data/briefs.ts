import { CreativeBrief } from "@/types/schema";

export const BRIEFS: readonly CreativeBrief[] = [
  // ==========================================================================
  // BRIEF 1: Social Vertical (9:16) Campaign
  // ==========================================================================
  {
    id: "brief-pulse-social",
    campaignTitle: "Pulse Energy 2026: Hyper-Speed Social Shorts",
    description:
      "High-impact 9:16 vertical video shorts promoting the new zero-sugar citrus energy drink for Gen Z athletes and mobile gamers. Needs kinetic pacing, crisp particle splash physics, and bold punchy typography.",
    brandName: "Pulse Nutrition Lab",
    deliverableType: "social_short_form",
    aspectRatios: ["9:16"],
    resolution: "1080p",
    durationSec: 15,
    styleReferences: [
      "Cyberpunk athletic sprint",
      "Hyper-kinetic kinetic typography",
      "High-contrast neon rain and lens flares",
    ],
    toolRequirements: {
      mode: "open_to_creator_choice",
      requiredToolIds: [],
      baseModelPolicy: "any",
    },
    negativeConstraints: [
      {
        id: "nc-p1",
        label: "No distorted hands or uncanny facial artifacts in high-speed motion",
        severity: "hard",
      },
      {
        id: "nc-p2",
        label: "Avoid generic electronic synth music stems or canned audio",
        severity: "soft",
      },
      {
        id: "nc-p3",
        label: "No competitor beverage cans or identifiable energy drink logos",
        severity: "hard",
      },
    ],
    commercialTerms: {
      rightsModel: "term_license",
      termMonths: 12,
      territory: "regional",
      regions: ["North America", "Western Europe", "Australia"],
      exclusivity: true,
      sourceHandover: ["prompts_and_seeds", "project_files"],
      requiresVerifiedLicense: true,
      requiresReproduciblePipeline: false,
    },
    milestones: [
      {
        id: "m-p1",
        name: "Visual Directions & Prompt Manifests",
        description: "3 distinct aesthetic moodboards with initial keyframes",
        percentOfBudget: 25,
        deliverable: "Style Deck PDF + 4K Keyframe Renders",
      },
      {
        id: "m-p2",
        name: "Kinetic Motion Cut & Sound Design",
        description: "15s vertical animatic with synchronized sound",
        percentOfBudget: 45,
        deliverable: "1080p Video Rough Cut Draft",
      },
      {
        id: "m-p3",
        name: "Master Delivery & Topaz Upscale",
        description: "Polished color grade, 60fps smoothing, and asset archive",
        percentOfBudget: 30,
        deliverable: "1080p Master MP4 + Asset Bundle",
      },
    ],
    totalBudgetUsd: 4500,
    deadline: "2026-11-15T00:00:00.000Z",
  },

  // ==========================================================================
  // BRIEF 2: 16:9 Commercial Spot (Indemnified-Only Policy)
  // ==========================================================================
  {
    id: "brief-apex-commercial",
    campaignTitle: "Apex GT Electric Supercar: Global Cinematic Reveal",
    description:
      "30-second broadcast and digital hero spot showcasing aerodynamic carbon architecture and futuristic city flythroughs. Strict enterprise IP protection requires 100% indemnified foundation models.",
    brandName: "Apex Motors AG",
    deliverableType: "commercial_spot",
    aspectRatios: ["16:9"],
    resolution: "4K",
    durationSec: 30,
    styleReferences: [
      "Architectural brutalism",
      "Anamorphic blue lens flares",
      "Photorealistic carbon fiber sheen under studio lighting",
    ],
    toolRequirements: {
      mode: "required_tools",
      requiredToolIds: ["flux-1-pro", "midjourney-v7", "topaz-video-ai"],
      baseModelPolicy: "indemnified_only",
    },
    negativeConstraints: [
      {
        id: "nc-a1",
        label: "Zero unverified or non-commercial open checkpoints permitted",
        severity: "hard",
      },
      {
        id: "nc-a2",
        label: "No competitor vehicle geometry, badges, or silhouettes",
        severity: "hard",
      },
      {
        id: "nc-a3",
        label: "Motion must not exhibit visual warping or temporal flickering",
        severity: "hard",
      },
    ],
    commercialTerms: {
      rightsModel: "perpetual_buyout",
      territory: "worldwide",
      exclusivity: true,
      sourceHandover: [
        "node_graph",
        "prompts_and_seeds",
        "lora_weights",
        "project_files",
      ],
      requiresVerifiedLicense: true,
      requiresReproduciblePipeline: false,
    },
    milestones: [
      {
        id: "m-a1",
        name: "Concept Car CAD & Turnaround Sheets",
        description: "Vehicle angle validation and lighting studies",
        percentOfBudget: 20,
        deliverable: "8-angle 4K Contact Sheet",
      },
      {
        id: "m-a2",
        name: "30-Second Sequence Storyboard & Motion",
        description: "Full sequence assembly with dynamic camera transitions",
        percentOfBudget: 40,
        deliverable: "4K Draft Video Sequence",
      },
      {
        id: "m-a3",
        name: "Broadcast Master Grade & Legal Proof",
        description:
          "Enterprise indemnification warranty proof + ProRes 4444 delivery",
        percentOfBudget: 40,
        deliverable: "ProRes 4444 4K Master + Vendor Indemnity Certificate",
      },
    ],
    totalBudgetUsd: 12000,
    deadline: "2026-12-01T00:00:00.000Z",
  },

  // ==========================================================================
  // BRIEF 3: Product Still-Asset Campaign (Reproducible Pipeline)
  // ==========================================================================
  {
    id: "brief-lumina-product",
    campaignTitle: "Lumina Sound: Sphere-One Audiophile Headphone Stills",
    description:
      "Suite of ultra-macro still assets for e-commerce, billboard, and print featuring brushed aluminum, acoustic mesh textures, and precision acoustic geometry. Requires fully reproducible ComfyUI node graph handoff.",
    brandName: "Lumina Audio Copenhagen",
    deliverableType: "still_assets",
    aspectRatios: ["1:1", "4:5", "16:9"],
    resolution: "4K",
    durationSec: 1,
    styleReferences: [
      "Scandinavian minimalism",
      "Studio softbox rim lighting",
      "Macro material tactile fidelity with millimeter depth of field",
    ],
    toolRequirements: {
      mode: "open_to_creator_choice",
      requiredToolIds: [],
      baseModelPolicy: "permissive_only",
    },
    negativeConstraints: [
      {
        id: "nc-l1",
        label: "No floating or mechanically impossible headband joints or screws",
        severity: "hard",
      },
      {
        id: "nc-l2",
        label: "Strict adherence to Pantone 419C matte black and satin silver finish",
        severity: "soft",
      },
    ],
    commercialTerms: {
      rightsModel: "perpetual_buyout",
      territory: "worldwide",
      exclusivity: false,
      sourceHandover: ["node_graph", "prompts_and_seeds"],
      requiresVerifiedLicense: true,
      requiresReproduciblePipeline: true,
    },
    milestones: [
      {
        id: "m-l1",
        name: "Material & Lighting Explorations",
        description: "Material texture tests on headband and ear cups",
        percentOfBudget: 30,
        deliverable: "6 proof contact sheets with material swatches",
      },
      {
        id: "m-l2",
        name: "Final 12-Shot Master Renders & Graph Handover",
        description:
          "12 full 4K clean passes with ComfyUI deterministic workflow.json",
        percentOfBudget: 70,
        deliverable: "12x 4K TIFF images + ComfyUI workflow JSON file",
      },
    ],
    totalBudgetUsd: 3800,
    deadline: "2026-11-20T00:00:00.000Z",
  },
] as const;
