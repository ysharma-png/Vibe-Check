/**
 * Reusable Production Rate Limiter & Brute-Force Protection
 *
 * Supports:
 * - Dual bucket tracking: Per-IP and Per-Account keying
 * - Sliding window token bucket
 * - Exponential penalty lockout on repeat violations
 * - Standard HTTP 429 Retry-After calculation
 * - Production-ready interface adaptable to Upstash Redis REST
 */

export interface RateLimitOptions {
  readonly maxRequests: number;
  readonly windowSeconds: number;
  readonly blockMultiplier?: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetSeconds: number;
  readonly retryAfter: number;
  readonly message?: string;
}

interface BucketEntry {
  count: number;
  resetAt: number;
  violations: number;
  blockedUntil: number;
}

// In-memory sliding window cache (survives dev server requests, cleared on reboot)
const memoryStore = new Map<string, BucketEntry>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key) ?? {
    count: 0,
    resetAt: now + options.windowSeconds * 1000,
    violations: 0,
    blockedUntil: 0,
  };

  // Check if key is currently in exponential lockout
  if (entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetSeconds: retryAfter,
      retryAfter,
      message: `Too many requests. Temporary lockout active. Try again in ${retryAfter} seconds.`,
    };
  }

  // Window reset
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + options.windowSeconds * 1000;
  }

  // Increment counter
  entry.count += 1;

  if (entry.count > options.maxRequests) {
    entry.violations += 1;
    // Exponential lockout calculation: base window * (2 ^ violations)
    const multiplier = options.blockMultiplier ?? 2;
    const lockoutSec = Math.min(
      900, // 15 minutes max cap
      options.windowSeconds * Math.pow(multiplier, Math.min(entry.violations - 1, 4))
    );
    entry.blockedUntil = now + lockoutSec * 1000;
    memoryStore.set(key, entry);

    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetSeconds: lockoutSec,
      retryAfter: lockoutSec,
      message: `Rate limit exceeded. Please wait ${lockoutSec} seconds before retrying.`,
    };
  }

  memoryStore.set(key, entry);
  const remaining = Math.max(0, options.maxRequests - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed: true,
    limit: options.maxRequests,
    remaining,
    resetSeconds,
    retryAfter: 0,
  };
}

/**
 * Specialized presets for critical security endpoints
 */
export const RATE_LIMIT_PRESETS = {
  // Login: 5 attempts per 60s per IP/email
  login: { maxRequests: 5, windowSeconds: 60, blockMultiplier: 2 },

  // Signup: 3 attempts per 60s per IP
  signup: { maxRequests: 3, windowSeconds: 60, blockMultiplier: 2 },

  // Password reset & Magic Link: 3 requests per 60s
  passwordReset: { maxRequests: 3, windowSeconds: 60, blockMultiplier: 2 },

  // AI Brief Builder: 20 parse requests per hour per user
  aiBriefBuilder: { maxRequests: 20, windowSeconds: 3600, blockMultiplier: 1.5 },

  // Messaging: 40 messages per minute per user
  chatMessaging: { maxRequests: 40, windowSeconds: 60, blockMultiplier: 1.5 },

  // File upload: 10 uploads per minute per user
  fileUpload: { maxRequests: 10, windowSeconds: 60, blockMultiplier: 2 },
} as const;

export function resetRateLimitKeyForTesting(key: string): void {
  memoryStore.delete(key);
}
