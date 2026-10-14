import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateBriefMatchScore,
  calculateCreatorRecommendationScore,
} from "../scoring";
import {
  computeCreatorGamification,
  BADGE_DEFINITIONS,
} from "../gamification";
import {
  groupNotifications,
  isCurrentlyQuietHours,
  renderWeeklyDigestEmail,
  AppNotification,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../notifications";
import {
  getCreatorPersonalizedFeed,
  getBrandPersonalizedFeed,
  getShowcaseFeed,
  toggleLikePortfolioItem,
  toggleFollowCreator,
  isCreatorFollowed,
  createBoard,
  saveItemToBoard,
  getUserBoards,
  dismissFeedItem,
  getAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../store";
import { trackEvent, getRecentEvents } from "../analytics";

describe("Engagement Layer: Match Scoring Engine", () => {
  it("scores high match when toolchain and budget align closely", () => {
    const creator = {
      id: "creator-1",
      primaryTools: ["comfy-ui", "flux-1-dev", "animatediff"],
      specializations: ["Consistent Character"],
      dayRateUsd: 1200,
      deterministicPipeline: true,
      commercialClearanceCleared: true,
      rating: 4.95,
    };

    const brief = {
      id: "brief-1",
      requiredTools: ["comfy-ui", "flux-1-dev"],
      budgetMin: 3000,
      budgetMax: 8000,
    };

    const result = calculateBriefMatchScore(creator, brief);

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.toolMatchCount).toBe(2);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes("Matches 2 required tools"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("budget rate") || r.includes("day rate"))).toBe(true);
  });

  it("scores lower match when required tools do not overlap", () => {
    const creator = {
      id: "creator-2",
      primaryTools: ["elevenlabs"],
      specializations: ["Voice"],
      dayRateUsd: 4000,
      deterministicPipeline: false,
      rating: 4.2,
    };

    const brief = {
      id: "brief-2",
      requiredTools: ["comfy-ui", "flux-1-dev", "live-portrait"],
      budgetMin: 500,
      budgetMax: 1000,
    };

    const result = calculateBriefMatchScore(creator, brief);

    expect(result.score).toBeLessThanOrEqual(60);
    expect(result.toolMatchCount).toBe(0);
  });

  it("calculates best recommendation score for brand with multiple briefs", () => {
    const creator = {
      id: "creator-3",
      primaryTools: ["comfy-ui", "flux-1-dev"],
      specializations: ["Cinematic"],
    };

    const briefs = [
      { id: "b1", requiredTools: ["unrelated-engine"], budgetMin: 1000, budgetMax: 2000 },
      { id: "b2", requiredTools: ["comfy-ui", "flux-1-dev"], budgetMin: 4000, budgetMax: 10000 },
    ];

    const recommendation = calculateCreatorRecommendationScore(creator, briefs);
    expect(recommendation.bestScore).toBeGreaterThanOrEqual(75);
    expect(recommendation.bestBriefId).toBe("b2");
  });
});

describe("Engagement Layer: Creator Levels & Gamification", () => {
  it("computes 'Rising' tier for new creators with under 2 completed projects", () => {
    const result = computeCreatorGamification({
      completedProjects: 0,
      rating: 5.0,
      reviewCount: 0,
      deterministicPipeline: false,
      verifiedIdentity: false,
      commercialClearanceCleared: false,
    });

    expect(result.level).toBe("Rising");
    expect(result.levelProgress.nextLevel).toBe("Pro");
    expect(result.levelProgress.requirementsRemaining.length).toBeGreaterThan(0);
    expect(result.badges.find((b) => b.id === "first_delivery")?.earned).toBe(false);
  });

  it("computes 'Pro' tier for verified creators with 2+ completed projects and 4.7+ rating", () => {
    const result = computeCreatorGamification({
      completedProjects: 3,
      rating: 4.85,
      reviewCount: 4,
      deterministicPipeline: false,
      verifiedIdentity: true,
      commercialClearanceCleared: true,
    });

    expect(result.level).toBe("Pro");
    expect(result.levelProgress.nextLevel).toBe("Elite");
    expect(result.badges.find((b) => b.id === "first_delivery")?.earned).toBe(true);
  });

  it("computes 'Elite' tier for master creators with 5+ projects, 4.9+ rating, and deterministic ComfyUI", () => {
    const result = computeCreatorGamification({
      completedProjects: 8,
      rating: 4.96,
      reviewCount: 15,
      deterministicPipeline: true,
      verifiedIdentity: true,
      commercialClearanceCleared: true,
      medianResponseTimeMin: 35,
    });

    expect(result.level).toBe("Elite");
    expect(result.levelProgress.nextLevel).toBe("Max Level");
    expect(result.levelProgress.progressPercentage).toBe(100);

    // All badges earned
    expect(result.badges.every((b) => b.earned)).toBe(true);
  });

  it("generates actionable profile strength suggestions with percentage gains", () => {
    const result = computeCreatorGamification({
      completedProjects: 1,
      rating: 4.8,
      reviewCount: 1,
      deterministicPipeline: false,
      verifiedIdentity: false,
      commercialClearanceCleared: false,
      bio: "Short bio",
      primaryToolsCount: 1,
    });

    expect(result.profileStrength).toBeLessThan(75);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some((s) => s.gain > 0)).toBe(true);
  });
});

describe("Engagement Layer: Notification Center & Digest", () => {
  const sampleNotifications: AppNotification[] = [
    {
      id: "n1",
      userId: "u1",
      type: "brief_match",
      title: "New Brief",
      body: "Brief body",
      data: {},
      read: false,
      createdAt: "10m ago",
    },
    {
      id: "n2",
      userId: "u1",
      type: "proposal_received",
      title: "New Proposal",
      body: "Proposal body",
      data: {},
      read: false,
      createdAt: "1h ago",
    },
    {
      id: "n3",
      userId: "u1",
      type: "message",
      title: "New Message",
      body: "Message body",
      data: {},
      read: true,
      createdAt: "1d ago",
    },
  ];

  it("groups notifications by category and counts unread accurately", () => {
    const grouped = groupNotifications(sampleNotifications);

    expect(grouped.unreadCount).toBe(2);
    expect(grouped.all.length).toBe(3);
    expect(grouped.briefs.length).toBe(1);
    expect(grouped.proposals.length).toBe(1);
    expect(grouped.messages.length).toBe(1);
  });

  it("evaluates quiet hours accurately across normal and overnight time windows", () => {
    const overnightPrefs = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      quietHoursEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };

    // 23:30 (11:30 PM) is inside overnight quiet hours
    const lateNight = new Date("2026-10-13T23:30:00");
    expect(isCurrentlyQuietHours(overnightPrefs, lateNight)).toBe(true);

    // 03:00 (3:00 AM) is inside overnight quiet hours
    const earlyMorning = new Date("2026-10-13T03:00:00");
    expect(isCurrentlyQuietHours(overnightPrefs, earlyMorning)).toBe(true);

    // 14:00 (2:00 PM) is outside quiet hours
    const afternoon = new Date("2026-10-13T14:00:00");
    expect(isCurrentlyQuietHours(overnightPrefs, afternoon)).toBe(false);
  });

  it("renders email-ready weekly digest HTML template with live briefing metrics", () => {
    const html = renderWeeklyDigestEmail({
      userName: "Elena Rostova",
      role: "creator",
      matchingBriefsCount: 5,
      profileViews: 92,
      newFollowers: 12,
      topOpportunities: [
        { title: "Cyberpunk Teaser", budget: "$5,000 USD", matchScore: 94, url: "https://test.com" },
      ],
    });

    expect(html).toContain("Elena Rostova");
    expect(html).toContain("94% Match");
    expect(html).toContain("Cyberpunk Teaser");
    expect(html).toContain("CacheFlow Intelligence");
    expect(html).toContain("<!DOCTYPE html>");
  });
});

describe("Engagement Layer: Store & Interaction Tracking", () => {
  it("populates personalized creator feed with scored briefs and trending workflows", () => {
    const feed = getCreatorPersonalizedFeed("amara_flow");

    expect(feed.matchedBriefs.length).toBeGreaterThan(0);
    expect(feed.matchedBriefs[0]?.matchScore).toBeGreaterThanOrEqual(70);
    expect(feed.trendingWorkflows.length).toBeGreaterThan(0);
    expect(feed.challenges.length).toBeGreaterThan(0);
  });

  it("populates personalized brand feed with recommended creators and network activity", () => {
    const feed = getBrandPersonalizedFeed();

    expect(feed.recommendedCreators.length).toBeGreaterThan(0);
    expect(feed.recentlyVerified.length).toBeGreaterThan(0);
    expect(feed.becauseYouViewed.creators.length).toBeGreaterThan(0);
  });

  it("filters out dismissed items from the feed on 'Not interested'", () => {
    const initialFeed = getCreatorPersonalizedFeed("amara_flow");
    const targetBriefId = initialFeed.matchedBriefs[0]?.id;
    expect(targetBriefId).toBeDefined();

    dismissFeedItem("brief", targetBriefId!);

    const updatedFeed = getCreatorPersonalizedFeed("amara_flow");
    expect(updatedFeed.matchedBriefs.some((b) => b.id === targetBriefId)).toBe(false);
  });

  it("handles like toggling and updates count", () => {
    const initial = toggleLikePortfolioItem("port-test-sample");
    expect(typeof initial.isLiked).toBe("boolean");

    const toggled = toggleLikePortfolioItem("port-test-sample");
    expect(toggled.isLiked).toBe(!initial.isLiked);
  });

  it("handles following toggling for creators", () => {
    const initialFollow = isCreatorFollowed("creator-amara");
    const nextState = toggleFollowCreator("creator-amara");
    expect(nextState).toBe(!initialFollow);

    // Toggle back
    toggleFollowCreator("creator-amara");
  });

  it("supports creating boards and saving items to collections", () => {
    const board = createBoard("My Test Collection", "Test description", true);
    expect(board.title).toBe("My Test Collection");
    expect(board.items.length).toBe(0);

    saveItemToBoard(board.id, {
      itemType: "portfolio_item",
      itemId: "port-amara-1",
      title: "Test Item",
      subtitle: "Subtitle",
      gradient: ["#000", "#fff"],
    });

    const userBoards = getUserBoards();
    const updatedBoard = userBoards.find((b) => b.id === board.id);
    expect(updatedBoard?.items.length).toBe(1);
  });

  it("dispatches analytics events to event buffer", async () => {
    await trackEvent("showcase_liked", {
      targetType: "portfolio_item",
      targetId: "port-amara-1",
    });

    const recent = getRecentEvents();
    expect(recent.some((e) => e.event === "showcase_liked")).toBe(true);
  });
});
