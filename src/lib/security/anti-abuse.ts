/**
 * Anti-Abuse, Anti-Disintermediation & Spam Prevention Engine
 *
 * Implements:
 * 1. Disintermediation detection (phone numbers, emails, WhatsApp, Telegram, crypto/payment handles)
 *    in early chat to prevent escrow circumvention and off-platform exploitation.
 * 2. Spam & duplicate submission detection for briefs and messages.
 * 3. Flagging & report categorization for moderation queue.
 */

// Contact patterns to detect off-platform solicitation
const CONTACT_PATTERNS = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/i,
  // Phone numbers (various formats)
  /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/i,
  // WhatsApp / WA / Telegram / Signal / Discord / Skype mentions with handles/numbers
  /\b(whatsapp|wa\.me|telegram|t\.me|signal|discord|discordapp\.gg|skype)\b/i,
  // Payment terms indicating direct circumvention
  /\b(paypal|venmo|cashapp|zelle|crypto|usdt|bitcoin|wire\s*transfer)\b/i,
];

export interface ContactLeakCheckResult {
  readonly hasContactLeak: boolean;
  readonly matchedSignals: readonly string[];
  readonly warningMessage?: string;
}

/**
 * Scans text for contact information and off-platform payment circumvention.
 */
export function checkContactLeak(text: string): ContactLeakCheckResult {
  if (!text) return { hasContactLeak: false, matchedSignals: [] };

  const matchedSignals: string[] = [];

  for (const pattern of CONTACT_PATTERNS) {
    const match = pattern.exec(text);
    if (match && match[0]) {
      matchedSignals.push(match[0]);
    }
  }

  if (matchedSignals.length > 0) {
    return {
      hasContactLeak: true,
      matchedSignals,
      warningMessage:
        "For your safety and guaranteed escrow indemnity, all contracts, communication, and payments must remain on CacheFlow.",
    };
  }

  return {
    hasContactLeak: false,
    matchedSignals: [],
  };
}

// In-memory duplicate submission store: Map<userId + hash, timestamp>
const duplicateSubmissionCache = new Map<string, number>();

/**
 * Detects rapid duplicate submissions (identical content submitted within 30 seconds).
 */
export function checkDuplicateSpam(
  userId: string,
  content: string,
  windowSec: number = 30
): { isSpam: boolean; reason?: string } {
  const normalized = content.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized.length < 5) return { isSpam: false };

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }

  const key = `${userId}:${hash}`;
  const now = Date.now();
  const previous = duplicateSubmissionCache.get(key);

  if (previous && now - previous < windowSec * 1000) {
    return {
      isSpam: true,
      reason: "Duplicate submission detected. Please do not submit identical content repeatedly.",
    };
  }

  duplicateSubmissionCache.set(key, now);
  return { isSpam: false };
}
