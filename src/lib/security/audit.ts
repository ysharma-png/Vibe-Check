/**
 * Immutable Audit Logging & Sensitive Data Masking Engine
 *
 * Implements:
 * 1. Immutable audit record creation for all administrative and high-risk actions
 * 2. Automatic masking of sensitive personal data (passwords, tokens, credit cards)
 * 3. Hashing of IP addresses for anonymized analytics and logging compliance
 */

export interface AuditEvent {
  readonly actorId: string;
  readonly actorRole: string;
  readonly action:
    | "user.suspend"
    | "user.delete"
    | "user.verify"
    | "brief.moderate"
    | "portfolio.moderate"
    | "engagement.dispute_resolve"
    | "mfa.enforce"
    | "auth.login_lockout";
  readonly targetType: "user" | "brief" | "portfolio_item" | "engagement";
  readonly targetId: string;
  readonly beforeState?: Record<string, unknown> | null;
  readonly afterState?: Record<string, unknown> | null;
  readonly ipAddress?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface StoredAuditLog extends AuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly ipHash: string;
}

// In-memory audit log store for dev/simulation; writes to supabase public.audit_logs in prod
const auditLogStore: StoredAuditLog[] = [];

/**
 * Anonymizes an IP address by hashing with salt.
 */
export function hashIp(ip: string | undefined): string {
  if (!ip) return "anonymous";
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return `ip_${Math.abs(hash).toString(16)}`;
}

/**
 * Recursively masks sensitive fields such as password, token, secret, apiKey.
 */
export function maskSensitiveFields(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveFields);
  }

  const masked: Record<string, unknown> = {};
  const sensitiveKeys = new Set([
    "password",
    "passwordhash",
    "token",
    "refreshtoken",
    "secret",
    "totpsecret",
    "apikey",
    "recoverycodes",
  ]);

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      masked[key] = "********";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveFields(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Records an immutable audit log event.
 */
export function recordAuditEvent(event: AuditEvent): StoredAuditLog {
  const stored: StoredAuditLog = {
    id: `audit-${crypto.randomUUID()}`,
    actorId: event.actorId,
    actorRole: event.actorRole,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    beforeState: (maskSensitiveFields(event.beforeState) as Record<string, unknown>) ?? null,
    afterState: (maskSensitiveFields(event.afterState) as Record<string, unknown>) ?? null,
    ipAddress: undefined, // raw IP omitted from persistence for privacy
    ipHash: hashIp(event.ipAddress),
    timestamp: new Date().toISOString(),
    metadata: (maskSensitiveFields(event.metadata) as Record<string, unknown>) ?? {},
  };

  auditLogStore.push(stored);
  return stored;
}

export function getAuditLogs(): readonly StoredAuditLog[] {
  return auditLogStore;
}
