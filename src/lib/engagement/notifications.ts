/**
 * Notification Center, Smart Alerts, and Digest System
 */

export type NotificationType =
  | "brief_match"
  | "proposal_received"
  | "invite_received"
  | "stage_change"
  | "message"
  | "creator_verified"
  | "saved_search"
  | "level_upgraded"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    briefId?: string;
    proposalId?: string;
    creatorId?: string;
    engagementId?: string;
    actionUrl?: string;
    matchScore?: number;
    badgeId?: string;
    [key: string]: unknown;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  briefMatches: boolean;
  proposals: boolean;
  invites: boolean;
  stageChanges: boolean;
  messages: boolean;
  creatorVerified: boolean;
  savedSearches: boolean;
  weeklyDigest: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  quietHoursTimezone: string; // "UTC"
  rateLimitPerHour: number; // max per hour
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  briefMatches: true,
  proposals: true,
  invites: true,
  stageChanges: true,
  messages: true,
  creatorVerified: true,
  savedSearches: true,
  weeklyDigest: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  quietHoursTimezone: "UTC",
  rateLimitPerHour: 20,
};

/**
 * Checks if current time falls within user's configured quiet hours.
 */
export function isCurrentlyQuietHours(prefs: NotificationPreferences, now = new Date()): boolean {
  if (!prefs.quietHoursEnabled) return false;

  const [startHour, startMin] = prefs.quietHoursStart.split(":").map(Number);
  const [endHour, endMin] = prefs.quietHoursEnd.split(":").map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = (startHour || 0) * 60 + (startMin || 0);
  const endMinutes = (endHour || 0) * 60 + (endMin || 0);

  if (startMinutes <= endMinutes) {
    // Normal range e.g. 09:00 to 17:00
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight range e.g. 22:00 to 08:00
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

/**
 * Group notifications into categorical tabs for the notification center UI.
 */
export function groupNotifications(notifications: AppNotification[]): {
  all: AppNotification[];
  briefs: AppNotification[];
  proposals: AppNotification[];
  messages: AppNotification[];
  system: AppNotification[];
  unreadCount: number;
} {
  const briefs: AppNotification[] = [];
  const proposals: AppNotification[] = [];
  const messages: AppNotification[] = [];
  const system: AppNotification[] = [];
  let unreadCount = 0;

  for (const n of notifications) {
    if (!n.read) unreadCount++;

    if (n.type === "brief_match" || n.type === "saved_search") {
      briefs.push(n);
    } else if (n.type === "proposal_received" || n.type === "invite_received" || n.type === "stage_change") {
      proposals.push(n);
    } else if (n.type === "message") {
      messages.push(n);
    } else {
      system.push(n);
    }
  }

  return {
    all: notifications,
    briefs,
    proposals,
    messages,
    system,
    unreadCount,
  };
}

/**
 * Renders an email-ready HTML template for the weekly digest.
 */
export function renderWeeklyDigestEmail(data: {
  userName: string;
  role: "creator" | "brand";
  matchingBriefsCount: number;
  profileViews: number;
  newFollowers: number;
  topOpportunities: Array<{ title: string; budget: string; matchScore: number; url: string }>;
}): string {
  const oppRows = data.topOpportunities
    .map(
      (opp) => `
    <tr style="border-bottom: 1px solid #27272a;">
      <td style="padding: 12px 0;">
        <div style="font-weight: 600; color: #ffffff; font-size: 14px;">${opp.title}</div>
        <div style="color: #a1a1aa; font-size: 12px; margin-top: 2px;">Budget: ${opp.budget}</div>
      </td>
      <td style="padding: 12px 0; text-align: right;">
        <span style="background-color: #3b82f620; color: #60a5fa; border: 1px solid #3b82f640; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
          ${opp.matchScore}% Match
        </span>
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your CacheFlow Weekly Briefing</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <div style="max-width: 580px; margin: 40px auto; background-color: #121215; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; padding: 32px;">
    <!-- Logo Header -->
    <div style="display: flex; align-items: center; margin-bottom: 24px;">
      <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #3b82f6; margin-right: 8px;"></div>
      <div style="font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">CacheFlow Intelligence</div>
    </div>

    <!-- Hero Title -->
    <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">Weekly Marketplace Digest</h1>
    <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
      Hi ${data.userName}, here is your tailored generative AI market briefing for this week.
    </p>

    <!-- Metrics Cards Grid -->
    <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 24px;">
      <tr>
        <td style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${data.matchingBriefsCount}</div>
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">New Brief Matches</div>
        </td>
        <td style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 20px; font-weight: 700; color: #ffffff;">${data.profileViews}</div>
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">Profile Views</div>
        </td>
        <td style="background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; width: 33%;">
          <div style="font-size: 20px; font-weight: 700; color: #ffffff;">+${data.newFollowers}</div>
          <div style="font-size: 11px; color: #71717a; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px;">New Followers</div>
        </td>
      </tr>
    </table>

    <!-- Top Opportunities -->
    <h2 style="font-size: 15px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
      Top Matched Opportunities
    </h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
      ${oppRows}
    </table>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="https://cacheflow.ai/home" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        Open Your Home Feed &rarr;
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; color: #71717a; text-align: center; line-height: 1.5;">
      You received this email because you opted into weekly briefings.<br>
      To adjust quiet hours or disable digests, visit your <a href="https://cacheflow.ai/settings" style="color: #60a5fa; text-decoration: none;">Notification Settings</a>.
    </div>
  </div>
</body>
</html>
  `.trim();
}
