/**
 * Unified Engagement Store
 *
 * Provides reactive, database-backed and seed-backed access to:
 * - Personalized Feeds (Creators & Brands)
 * - Showcase Feed (Vertical Swipe & Immersive Viewer)
 * - Notification Center & Realtime Alerts
 * - Following System & Followed Feeds
 * - Boards (Collections)
 * - Interaction Events & Dismissals
 */

import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { BRIEFS } from "@/data/briefs";
import { calculateBriefMatchScore, MatchScoreResult } from "./scoring";
import { computeCreatorGamification, CreatorGamificationResult } from "./gamification";
import { AppNotification } from "./notifications";
export type { AppNotification };
import { trackEvent } from "./analytics";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ScoredBriefItem {
  id: string;
  campaignTitle: string;
  description: string;
  brandName: string;
  deliverableType: string;
  aspectRatios: readonly string[];
  budgetMin: number;
  budgetMax: number;
  durationSec: number;
  deadline: string;
  requiredTools: string[];
  matchScore: number;
  matchReasons: string[];
  isNewThisWeek: boolean;
  dismissed: boolean;
}

export interface TrendingWorkflowItem {
  id: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarGradient: readonly [string, string];
  toolchain: readonly string[];
  stagesCount: number;
  reproducibilityScore: number;
  viewCount: number;
  posterGradient: readonly string[];
}

export interface ChallengeAnnouncement {
  id: string;
  title: string;
  sponsor: string;
  prizePool: string;
  deadline: string;
  toolRequirement: string;
  description: string;
  tag: string;
}

export interface PersonalizedCreatorFeed {
  matchedBriefs: ScoredBriefItem[];
  newBriefsThisWeek: ScoredBriefItem[];
  trendingWorkflows: TrendingWorkflowItem[];
  challenges: ChallengeAnnouncement[];
}

export interface RecommendedCreatorItem {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarGradient: readonly [string, string];
  location: string;
  rating: number;
  startingRateUsd: number;
  primaryTools: readonly string[];
  specializations: readonly string[];
  matchScore: number;
  recommendationReason: string;
  verifiedBadges: {
    identity: boolean;
    reproduciblePipeline: boolean;
    commercialLicense: boolean;
  };
  topThumbnails: Array<{ id: string; title: string; gradient: readonly string[] }>;
}

export interface PersonalizedBrandFeed {
  recommendedCreators: RecommendedCreatorItem[];
  recentlyVerified: RecommendedCreatorItem[];
  followedCreatorsWork: Array<{
    creator: { name: string; handle: string; avatarGradient: readonly [string, string] };
    item: { id: string; title: string; toolchain: readonly string[]; gradient: readonly string[] };
  }>;
  becauseYouViewed: {
    referenceName: string;
    creators: RecommendedCreatorItem[];
  };
}

export interface ShowcaseFeedItem {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  aspectRatio: string;
  posterGradient: readonly string[];
  toolchain: readonly string[];
  styleTags: readonly string[];
  creator: {
    id: string;
    name: string;
    handle: string;
    avatarGradient: readonly [string, string];
    rating: number;
    location: string;
  };
  stagesCount: number;
  reproducibilityScore: number;
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface UserBoard {
  id: string;
  userId: string;
  title: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  items: Array<{
    id: string;
    itemType: "portfolio_item" | "creator" | "brief";
    itemId: string;
    title: string;
    subtitle: string;
    gradient: readonly string[];
  }>;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// In-Memory & LocalStorage Backed State
// ---------------------------------------------------------------------------

const DISMISSED_SET = new Set<string>();
const FOLLOWED_CREATORS_SET = new Set<string>(["creator-amara", "creator-kenji"]);
const LIKED_PORTFOLIO_SET = new Set<string>(["port-amara-1", "port-kenji-1"]);

const SEEDED_BOARDS: UserBoard[] = [
  {
    id: "board-1",
    userId: "demo-user",
    title: "Cinematic AI Shorts & Teasers",
    description: "Curated 9:16 vertical and 16:9 cinematic narrative workflows with deterministic ComfyUI pipelines.",
    isPublic: true,
    itemCount: 3,
    items: [
      {
        id: "bi-1",
        itemType: "portfolio_item",
        itemId: "port-amara-1",
        title: "Chronicles of Eko 2077",
        subtitle: "@amara_flow • FLUX.1 + AnimateDiff",
        gradient: ["#4c1d95", "#831843", "#0f172a"],
      },
      {
        id: "bi-2",
        itemType: "portfolio_item",
        itemId: "port-kenji-1",
        title: "Kurogane Cyber-Sprint",
        subtitle: "@kenji_nerf • SDXL + Deforum",
        gradient: ["#1e1b4b", "#065f46", "#022c22"],
      },
      {
        id: "bi-3",
        itemType: "creator",
        itemId: "creator-amara",
        title: "Amara Okafor",
        subtitle: "Lagos, Nigeria • 4.9★",
        gradient: ["#8b5cf6", "#ec4899"],
      },
    ],
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "board-2",
    userId: "demo-user",
    title: "Product Renders & NeRF 3D",
    description: "Hyper-realistic e-commerce and commercial product visualization setups.",
    isPublic: true,
    itemCount: 2,
    items: [
      {
        id: "bi-4",
        itemType: "portfolio_item",
        itemId: "port-elena-1",
        title: "Aura Luminescence: Luxury Skincare",
        subtitle: "@elena_visual • Midjourney + FLUX",
        gradient: ["#042f2e", "#134e4a", "#0f172a"],
      },
      {
        id: "bi-5",
        itemType: "creator",
        itemId: "creator-elena",
        title: "Elena Rostova",
        subtitle: "Berlin, Germany • 5.0★",
        gradient: ["#10b981", "#06b6d4"],
      },
    ],
    createdAt: "2026-10-05T14:30:00Z",
  },
];

const SEEDED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    userId: "demo-user",
    type: "brief_match",
    title: "96% Brief Match Detected",
    body: "Nike Studios Global published 'Pulse Energy 2026: Hyper-Speed Social Shorts' matching your FLUX & ComfyUI stack.",
    data: { briefId: "brief-pulse-social", actionUrl: "/briefs/brief-pulse-social", matchScore: 96 },
    read: false,
    createdAt: "10 minutes ago",
  },
  {
    id: "notif-2",
    userId: "demo-user",
    type: "proposal_received",
    title: "Proposal Received for Review",
    body: "Elena Rostova submitted a methodology proposal for your 'Cyberpunk Brand Spot' campaign.",
    data: { proposalId: "prop-123", actionUrl: "/dashboard/brand" },
    read: false,
    createdAt: "1 hour ago",
  },
  {
    id: "notif-3",
    userId: "demo-user",
    type: "invite_received",
    title: "Direct Brief Invitation",
    body: "Acme Consumer Brands invited you to pitch on their upcoming Q4 Product Launch.",
    data: { actionUrl: "/dashboard/creator" },
    read: false,
    createdAt: "3 hours ago",
  },
  {
    id: "notif-4",
    userId: "demo-user",
    type: "creator_verified",
    title: "Badge Awarded: Verified Workflow",
    body: "Your ComfyUI DAG pipeline for 'Chronicles of Eko' passed the automated determinism test suite.",
    data: { badgeId: "verified_workflow", actionUrl: "/dashboard/creator" },
    read: true,
    createdAt: "Yesterday",
  },
  {
    id: "notif-5",
    userId: "demo-user",
    type: "stage_change",
    title: "Milestone Escrow Released",
    body: "Milestone 2 ($2,500) for 'Cyberpunk Athletic Sprint' has been approved and funded.",
    data: { actionUrl: "/dashboard/creator" },
    read: true,
    createdAt: "2 days ago",
  },
  {
    id: "notif-6",
    userId: "demo-user",
    type: "message",
    title: "New Client Message",
    body: "Sarah from Nike Studios: 'The 4K resolution upscaling pass looks fantastic! Let's proceed.'",
    data: { actionUrl: "/dashboard/creator" },
    read: true,
    createdAt: "3 days ago",
  },
];

let notificationsStore = [...SEEDED_NOTIFICATIONS];
let boardsStore = [...SEEDED_BOARDS];

// ---------------------------------------------------------------------------
// Store Action Functions
// ---------------------------------------------------------------------------

/**
 * Gets personalized home feed for creators.
 */
export function getCreatorPersonalizedFeed(creatorHandle?: string): PersonalizedCreatorFeed {
  // Find target creator or default to Amara
  const creator = CREATORS.find((c) => c.handle.includes(creatorHandle || "amara")) ?? CREATORS[0]!;

  const matchedBriefs: ScoredBriefItem[] = [];
  const newBriefsThisWeek: ScoredBriefItem[] = [];

  for (const brief of BRIEFS) {
    if (DISMISSED_SET.has(brief.id)) continue;

    const match = calculateBriefMatchScore(
      {
        id: creator.id,
        primaryTools: [...creator.primaryTools],
        specializations: [...creator.specializations],
        dayRateUsd: creator.startingRateUsd,
        rating: 4.95,
        deterministicPipeline: creator.verified.reproduciblePipeline,
        commercialClearanceCleared: creator.verified.commercialLicense,
      },
      {
        id: brief.id,
        requiredTools: brief.toolRequirements.requiredToolIds,
        budgetMin: (brief as unknown as { budgetMin?: number }).budgetMin || 2000,
        budgetMax: (brief as unknown as { budgetMax?: number }).budgetMax || 8500,
      }
    );

    const scoredItem: ScoredBriefItem = {
      id: brief.id,
      campaignTitle: brief.campaignTitle,
      description: brief.description,
      brandName: brief.brandName,
      deliverableType: brief.deliverableType,
      aspectRatios: brief.aspectRatios,
      budgetMin: (brief as unknown as { budgetMin?: number }).budgetMin || 2500,
      budgetMax: (brief as unknown as { budgetMax?: number }).budgetMax || 8000,
      durationSec: brief.durationSec,
      deadline: "Oct 28, 2026",
      requiredTools: brief.toolRequirements.requiredToolIds,
      matchScore: match.score,
      matchReasons: match.reasons,
      isNewThisWeek: true,
      dismissed: false,
    };

    matchedBriefs.push(scoredItem);
    newBriefsThisWeek.push(scoredItem);
  }

  // Sort matched briefs descending by score
  matchedBriefs.sort((a, b) => b.matchScore - a.matchScore);

  const trendingWorkflows: TrendingWorkflowItem[] = PORTFOLIO_ITEMS.slice(0, 4).map((p, idx) => {
    const c = CREATORS.find((cr) => cr.id === p.creatorId) ?? CREATORS[0]!;
    return {
      id: p.id,
      title: p.title,
      creatorName: c.name,
      creatorHandle: c.handle,
      creatorAvatarGradient: c.avatarGradient,
      toolchain: p.toolchain,
      stagesCount: p.pipeline.length,
      reproducibilityScore: 98 - idx * 2,
      viewCount: 1240 + idx * 310,
      posterGradient: p.posterGradient,
    };
  });

  const challenges: ChallengeAnnouncement[] = [
    {
      id: "challenge-1",
      title: "FLUX.1 Photorealism Hackathon",
      sponsor: "Black Forest Labs & CacheFlow",
      prizePool: "$15,000 USD",
      deadline: "Ends in 6 days",
      toolRequirement: "FLUX.1 [dev] + ComfyUI",
      description: "Showcase deterministic character lighting and texture consistency across 12 diverse indoor/outdoor lighting conditions.",
      tag: "Sponsored Challenge",
    },
    {
      id: "challenge-2",
      title: "Zero-Artifact Video Sprint",
      sponsor: "Topaz Labs",
      prizePool: "$8,000 USD",
      deadline: "Ends in 14 days",
      toolRequirement: "Topaz Video AI + Kling v1.5",
      description: "Deliver a 30-second hyperkinetic sports sequence with zero hand deformation or frame tearing.",
      tag: "Community Sprint",
    },
  ];

  return {
    matchedBriefs,
    newBriefsThisWeek,
    trendingWorkflows,
    challenges,
  };
}

/**
 * Gets personalized home feed for brands.
 */
export function getBrandPersonalizedFeed(): PersonalizedBrandFeed {
  const recommendedCreators: RecommendedCreatorItem[] = CREATORS.map((c, idx) => ({
    id: c.id,
    name: c.name,
    handle: c.handle,
    bio: c.bio,
    avatarGradient: c.avatarGradient,
    location: c.location,
    rating: 4.9 + (idx % 2 === 0 ? 0.05 : 0),
    startingRateUsd: c.startingRateUsd,
    primaryTools: c.primaryTools,
    specializations: c.specializations,
    matchScore: 95 - idx * 3,
    recommendationReason: `Top specialist in ${c.specializations[0]} with verified ComfyUI provenance`,
    verifiedBadges: {
      identity: c.verified.identity,
      reproduciblePipeline: c.verified.reproduciblePipeline,
      commercialLicense: c.verified.commercialLicense,
    },
    topThumbnails: PORTFOLIO_ITEMS.filter((p) => p.creatorId === c.id).slice(0, 3).map((p) => ({
      id: p.id,
      title: p.title,
      gradient: p.posterGradient,
    })),
  })).filter((c) => !DISMISSED_SET.has(c.id));

  const recentlyVerified = recommendedCreators.filter((c) => c.verifiedBadges.reproduciblePipeline);

  const followedCreatorsWork = PORTFOLIO_ITEMS.filter((p) =>
    FOLLOWED_CREATORS_SET.has(p.creatorId)
  ).map((p) => {
    const c = CREATORS.find((cr) => cr.id === p.creatorId) ?? CREATORS[0]!;
    return {
      creator: { name: c.name, handle: c.handle, avatarGradient: c.avatarGradient },
      item: { id: p.id, title: p.title, toolchain: p.toolchain, gradient: p.posterGradient },
    };
  });

  return {
    recommendedCreators,
    recentlyVerified,
    followedCreatorsWork,
    becauseYouViewed: {
      referenceName: "Amara Okafor (@amara_flow)",
      creators: recommendedCreators.slice(1, 4),
    },
  };
}

/**
 * Gets showcase feed with full filters and states.
 */
export function getShowcaseFeed(filters?: {
  contentType?: string;
  tool?: string;
  style?: string;
}): ShowcaseFeedItem[] {
  let items = PORTFOLIO_ITEMS;

  if (filters?.contentType && filters.contentType !== "all") {
    items = items.filter((i) => i.mediaType === filters.contentType);
  }

  if (filters?.tool && filters.tool !== "all") {
    items = items.filter((i) => i.toolchain.includes(filters.tool!));
  }

  if (filters?.style && filters.style !== "all") {
    items = items.filter((i) =>
      i.styleTags.some((t) => t.toLowerCase().includes(filters.style!.toLowerCase()))
    );
  }

  return items.map((p, idx) => {
    const creator = CREATORS.find((c) => c.id === p.creatorId) ?? CREATORS[0]!;
    const isLiked = LIKED_PORTFOLIO_SET.has(p.id);
    const isSaved = boardsStore.some((b) => b.items.some((bi) => bi.itemId === p.id));

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      mediaType: p.mediaType,
      aspectRatio: p.aspectRatio,
      posterGradient: p.posterGradient,
      toolchain: p.toolchain,
      styleTags: p.styleTags,
      creator: {
        id: creator.id,
        name: creator.name,
        handle: creator.handle,
        avatarGradient: creator.avatarGradient,
        rating: 4.95,
        location: creator.location,
      },
      stagesCount: p.pipeline.length,
      reproducibilityScore: 98 - (idx % 5),
      likesCount: 142 + (idx * 37) + (isLiked ? 1 : 0),
      isLiked,
      isSaved,
    };
  });
}

/**
 * Toggles like on a portfolio item.
 */
export function toggleLikePortfolioItem(itemId: string): { isLiked: boolean; newCount: number } {
  const isLiked = LIKED_PORTFOLIO_SET.has(itemId);
  if (isLiked) {
    LIKED_PORTFOLIO_SET.delete(itemId);
  } else {
    LIKED_PORTFOLIO_SET.add(itemId);
  }

  trackEvent("showcase_liked", {
    targetType: "portfolio_item",
    targetId: itemId,
    metadata: { liked: !isLiked },
  });

  return {
    isLiked: !isLiked,
    newCount: 142 + (!isLiked ? 1 : 0),
  };
}

/**
 * Toggles following a creator.
 */
export function toggleFollowCreator(creatorId: string): boolean {
  const isFollowing = FOLLOWED_CREATORS_SET.has(creatorId);
  if (isFollowing) {
    FOLLOWED_CREATORS_SET.delete(creatorId);
    trackEvent("creator_unfollowed", { targetType: "creator", targetId: creatorId });
  } else {
    FOLLOWED_CREATORS_SET.add(creatorId);
    trackEvent("creator_followed", { targetType: "creator", targetId: creatorId });
  }
  return !isFollowing;
}

export function isCreatorFollowed(creatorId: string): boolean {
  return FOLLOWED_CREATORS_SET.has(creatorId);
}

/**
 * Dismisses an item from the feed ("Not interested").
 */
export function dismissFeedItem(targetType: "brief" | "creator", targetId: string): void {
  DISMISSED_SET.add(targetId);
  trackEvent("brief_dismissed", { targetType, targetId });
}

/**
 * Boards / Collections Management
 */
export function getUserBoards(): UserBoard[] {
  return [...boardsStore];
}

export function createBoard(title: string, description: string, isPublic = true): UserBoard {
  const newBoard: UserBoard = {
    id: `board-${Date.now()}`,
    userId: "demo-user",
    title,
    description,
    isPublic,
    itemCount: 0,
    items: [],
    createdAt: new Date().toISOString(),
  };

  boardsStore = [newBoard, ...boardsStore];
  trackEvent("board_created", { targetType: "board", targetId: newBoard.id, metadata: { title } });
  return newBoard;
}

export function saveItemToBoard(boardId: string, item: {
  itemType: "portfolio_item" | "creator" | "brief";
  itemId: string;
  title: string;
  subtitle: string;
  gradient: readonly string[];
}): void {
  const board = boardsStore.find((b) => b.id === boardId);
  if (!board) return;

  const exists = board.items.some((i) => i.itemId === item.itemId);
  if (!exists) {
    board.items.push({
      id: `bi-${Date.now()}`,
      ...item,
    });
    board.itemCount = board.items.length;
    trackEvent("saved_to_board", {
      targetType: "board",
      targetId: boardId,
      metadata: { itemId: item.itemId, itemType: item.itemType },
    });
  }
}

/**
 * Notifications Management
 */
export function getAppNotifications(): AppNotification[] {
  return [...notificationsStore];
}

export function markNotificationAsRead(id: string): void {
  notificationsStore = notificationsStore.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  trackEvent("notification_marked_read", { metadata: { notificationId: id } });
}

export function markAllNotificationsAsRead(): void {
  notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }));
}

export function addNotification(notification: Omit<AppNotification, "id" | "createdAt" | "read">): AppNotification {
  const newNotif: AppNotification = {
    ...notification,
    id: `notif-${Date.now()}`,
    read: false,
    createdAt: "Just now",
  };
  notificationsStore = [newNotif, ...notificationsStore];
  return newNotif;
}

/**
 * Returns creator gamification metrics for a specific handle.
 */
export function getCreatorGamificationByHandle(handle?: string): CreatorGamificationResult {
  const creator = CREATORS.find((c) => c.handle.includes(handle || "amara")) ?? CREATORS[0]!;
  return computeCreatorGamification({
    completedProjects: creator.stats.projectsCompleted,
    rating: 4.95,
    reviewCount: 34,
    deterministicPipeline: creator.verified.reproduciblePipeline,
    verifiedIdentity: creator.verified.identity,
    commercialClearanceCleared: creator.verified.commercialLicense,
    medianResponseTimeMin: 45,
    bio: creator.bio,
    primaryToolsCount: creator.primaryTools.length,
    portfolioItemsCount: creator.portfolioItemIds.length,
    hourlyRateUsd: 150,
    website: "https://amaraflow.ai",
  });
}
