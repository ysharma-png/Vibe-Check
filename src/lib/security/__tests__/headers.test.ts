import { describe, it, expect } from "vitest";
import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest } from "next/server";

describe("Production Security Headers Verification", () => {
  it("injects Content-Security-Policy, HSTS, frame-ancestors, and X-Content-Type-Options", async () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = await updateSession(req);

    // 1. Content-Security-Policy
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("https://*.supabase.co");

    // 2. X-Content-Type-Options
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");

    // 3. X-Frame-Options
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");

    // 4. Referrer-Policy
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");

    // 5. Strict-Transport-Security (HSTS)
    const hsts = res.headers.get("Strict-Transport-Security");
    expect(hsts).toBeTruthy();
    expect(hsts).toContain("max-age=63072000");
    expect(hsts).toContain("includeSubDomains");

    // 6. Permissions-Policy
    const permissions = res.headers.get("Permissions-Policy");
    expect(permissions).toBeTruthy();
    expect(permissions).toContain("camera=()");
    expect(permissions).toContain("microphone=()");

    // 7. Cross-Origin-Opener-Policy
    expect(res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  it("enforces CSRF check on state-mutating API requests with mismatched origin", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/export-data", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "https://evil-attacker.com",
      },
    });

    const res = await updateSession(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("CSRF");
  });
});
