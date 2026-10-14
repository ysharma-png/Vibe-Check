/**
 * Creator Levels, Badges, and Profile Strength Calculator
 */

export type CreatorLevel = "Rising" | "Pro" | "Elite";

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  earned: boolean;
  earnedAt?: string;
}

export interface ProfileSuggestion {
  id: string;
  text: string;
  gain: number; // e.g. +8%
  completed: boolean;
  actionUrl: string;
}

export interface NextLevelProgress {
  currentLevel: CreatorLevel;
  nextLevel: CreatorLevel | "Max Level";
  progressPercentage: number;
  requirementsRemaining: string[];
}

export interface CreatorGamificationResult {
  level: CreatorLevel;
  levelProgress: NextLevelProgress;
  badges: BadgeInfo[];
  profileStrength: number; // 0 - 100
  suggestions: ProfileSuggestion[];
}

export interface GamificationInput {
  completedProjects: number;
  rating: number;
  reviewCount: number;
  deterministicPipeline: boolean;
  verifiedIdentity: boolean;
  commercialClearanceCleared: boolean;
  medianResponseTimeMin?: number;
  bio?: string;
  avatarUrl?: string | null;
  primaryToolsCount?: number;
  portfolioItemsCount?: number;
  hourlyRateUsd?: number | null;
  website?: string | null;
}

export const BADGE_DEFINITIONS: Record<
  "first_delivery" | "verified_workflow" | "five_star_streak" | "fast_responder",
  Omit<BadgeInfo, "earned" | "earnedAt">
> = {
  first_delivery: {
    id: "first_delivery",
    name: "First Delivery",
    description: "Successfully delivered and completed a funded client engagement.",
    icon: "Rocket",
  },
  verified_workflow: {
    id: "verified_workflow",
    name: "Verified Workflow",
    description: "Published a 100% deterministic, reproducible ComfyUI DAG pipeline.",
    icon: "CheckCircle2",
  },
  five_star_streak: {
    id: "five_star_streak",
    name: "5-Star Streak",
    description: "Maintained a 4.9+ star average across multiple completed engagements.",
    icon: "Sparkles",
  },
  fast_responder: {
    id: "fast_responder",
    name: "Fast Responder",
    description: "Median client inquiry response time under 1 hour.",
    icon: "Zap",
  },
};

/**
 * Evaluates objective signals to calculate creator level, badges, and profile strength.
 */
export function computeCreatorGamification(input: GamificationInput): CreatorGamificationResult {
  const completed = input.completedProjects || 0;
  const rating = input.rating || 5.0;
  const reviewCount = input.reviewCount || 0;
  const deterministic = Boolean(input.deterministicPipeline);
  const responseTimeMin = input.medianResponseTimeMin ?? 45;

  // 1. Badges
  const badges: BadgeInfo[] = [
    {
      ...BADGE_DEFINITIONS.first_delivery,
      earned: completed >= 1,
      earnedAt: completed >= 1 ? "2026-08-15" : undefined,
    },
    {
      ...BADGE_DEFINITIONS.verified_workflow,
      earned: deterministic,
      earnedAt: deterministic ? "2026-09-01" : undefined,
    },
    {
      ...BADGE_DEFINITIONS.five_star_streak,
      earned: rating >= 4.9 && reviewCount >= 3,
      earnedAt: rating >= 4.9 && reviewCount >= 3 ? "2026-09-20" : undefined,
    },
    {
      ...BADGE_DEFINITIONS.fast_responder,
      earned: responseTimeMin <= 60,
      earnedAt: responseTimeMin <= 60 ? "2026-10-01" : undefined,
    },
  ];

  // 2. Level Roadmap & Progress
  let level: CreatorLevel = "Rising";
  let nextLevel: CreatorLevel | "Max Level" = "Pro";
  let progressPercentage = 30;
  const requirementsRemaining: string[] = [];

  if (completed >= 5 && rating >= 4.9 && deterministic) {
    level = "Elite";
    nextLevel = "Max Level";
    progressPercentage = 100;
  } else if (completed >= 2 && rating >= 4.7) {
    level = "Pro";
    nextLevel = "Elite";

    const neededEngagements = Math.max(0, 5 - completed);
    if (neededEngagements > 0) {
      requirementsRemaining.push(`Complete ${neededEngagements} more funded engagement${neededEngagements > 1 ? "s" : ""}`);
    }
    if (rating < 4.9) {
      requirementsRemaining.push(`Achieve a 4.90+ client rating (currently ${rating.toFixed(2)})`);
    }
    if (!deterministic) {
      requirementsRemaining.push("Verify deterministic ComfyUI pipeline");
    }

    const completedRatio = Math.min(1, completed / 5);
    const ratingRatio = Math.min(1, rating / 4.9);
    const deterRatio = deterministic ? 1 : 0.4;
    progressPercentage = Math.round(((completedRatio + ratingRatio + deterRatio) / 3) * 100);
  } else {
    level = "Rising";
    nextLevel = "Pro";

    const neededEngagements = Math.max(0, 2 - completed);
    if (neededEngagements > 0) {
      requirementsRemaining.push(`Complete ${neededEngagements} client engagement${neededEngagements > 1 ? "s" : ""}`);
    }
    if (rating < 4.7) {
      requirementsRemaining.push(`Earn a 4.70+ rating`);
    }
    if (!input.verifiedIdentity) {
      requirementsRemaining.push("Verify platform identity");
    }

    const completedRatio = Math.min(1, completed / 2);
    progressPercentage = Math.round(Math.max(25, completedRatio * 70));
  }

  // 3. Profile Strength & Actionable Suggestions
  let strength = 35;
  const suggestions: ProfileSuggestion[] = [];

  // Suggestion: Top workflow
  if (deterministic) {
    strength += 15;
  } else {
    suggestions.push({
      id: "add_workflow",
      text: "Add a verified ComfyUI workflow to your top item",
      gain: 15,
      completed: false,
      actionUrl: "/dashboard/creator",
    });
  }

  // Suggestion: Detailed bio
  if (input.bio && input.bio.length >= 25) {
    strength += 10;
  } else {
    suggestions.push({
      id: "add_bio",
      text: "Expand your bio to explain your creative process",
      gain: 10,
      completed: false,
      actionUrl: "/settings",
    });
  }

  // Suggestion: Tools
  if ((input.primaryToolsCount || 0) >= 3) {
    strength += 12;
  } else {
    suggestions.push({
      id: "add_tools",
      text: "Add at least 3 generation tools (e.g. FLUX, Runway, ComfyUI)",
      gain: 12,
      completed: false,
      actionUrl: "/settings",
    });
  }

  // Suggestion: Identity verification
  if (input.verifiedIdentity) {
    strength += 10;
  } else {
    suggestions.push({
      id: "verify_identity",
      text: "Complete identity verification to receive the verified badge",
      gain: 10,
      completed: false,
      actionUrl: "/settings",
    });
  }

  // Suggestion: Commercial clearance
  if (input.commercialClearanceCleared) {
    strength += 8;
  } else {
    suggestions.push({
      id: "commercial_clearance",
      text: "Upload proof of copyright indemnified model usage",
      gain: 8,
      completed: false,
      actionUrl: "/settings",
    });
  }

  // Suggestion: Consulting rates
  if (input.hourlyRateUsd && input.hourlyRateUsd > 0) {
    strength += 5;
  } else {
    suggestions.push({
      id: "set_rates",
      text: "Define transparent hourly and day consulting rates",
      gain: 5,
      completed: false,
      actionUrl: "/settings",
    });
  }

  // Suggestion: External link
  if (input.website) {
    strength += 5;
  } else {
    suggestions.push({
      id: "add_website",
      text: "Link your external studio portfolio or social link",
      gain: 5,
      completed: false,
      actionUrl: "/settings",
    });
  }

  return {
    level,
    levelProgress: {
      currentLevel: level,
      nextLevel,
      progressPercentage: Math.min(100, Math.max(10, progressPercentage)),
      requirementsRemaining,
    },
    badges,
    profileStrength: Math.min(100, strength),
    suggestions: suggestions.slice(0, 3), // Show top 3 highest-impact suggestions
  };
}
