/**
 * PostHog-Ready Analytics Event Layer
 *
 * Provides a unified `trackEvent` interface.
 * Automatically buffers and records interactions to the PostgreSQL events table
 * and connects to PostHog if initialized.
 */

export type AnalyticsEventType =
  | "feed_viewed"
  | "brief_viewed"
  | "brief_dismissed"
  | "showcase_swipe"
  | "showcase_liked"
  | "showcase_action"
  | "creator_followed"
  | "creator_unfollowed"
  | "saved_to_board"
  | "board_created"
  | "notification_clicked"
  | "notification_marked_read"
  | "level_upgraded"
  | "search_performed";

export interface AnalyticsEventPayload {
  userId?: string;
  targetType?: "brief" | "creator" | "portfolio_item" | "workflow" | "board";
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

// Client-side event buffer for batching / resilience
const eventBuffer: Array<{ event: AnalyticsEventType; payload: AnalyticsEventPayload }> = [];

/**
 * Dispatches an analytics event to PostHog and the platform interaction database.
 */
export async function trackEvent(
  event: AnalyticsEventType,
  payload: AnalyticsEventPayload = {}
): Promise<void> {
  const enrichedPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  // 1. PostHog Client Integration (if window.posthog exists)
  if (typeof window !== "undefined") {
    try {
      const win = window as unknown as { posthog?: { capture: (name: string, props?: unknown) => void } };
      if (win.posthog && typeof win.posthog.capture === "function") {
        win.posthog.capture(event, enrichedPayload);
      }
    } catch {
      // Ignore client analytics capture errors
    }
  }

  // 2. Buffer for UI state & local persistence
  eventBuffer.push({ event, payload: enrichedPayload });
  if (eventBuffer.length > 50) {
    eventBuffer.shift();
  }

  // 3. Persist to /api/analytics/event asynchronously (non-blocking)
  if (typeof window !== "undefined") {
    try {
      fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: event,
          targetType: enrichedPayload.targetType,
          targetId: enrichedPayload.targetId,
          metadata: enrichedPayload.metadata,
        }),
      }).catch(() => {
        // Silently tolerate network/offline conditions
      });
    } catch {
      // Silent catch
    }
  }
}

/**
 * Returns recent in-memory recorded analytics events for testing and debugging.
 */
export function getRecentEvents(): ReadonlyArray<{ event: AnalyticsEventType; payload: AnalyticsEventPayload }> {
  return [...eventBuffer];
}
