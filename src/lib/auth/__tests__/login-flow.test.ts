import { describe, it, expect } from "vitest";
import { updateSession } from "@/lib/supabase/middleware";
import { sanitizeNextUrl, getRoleDashboard } from "@/lib/auth/routing";
import { NextRequest } from "next/server";

describe("Production Authentication & Routing Behavior Verification", () => {
  // Helper to create test NextRequest
  function makeRequest(path: string, cookies: Record<string, string> = {}) {
    const req = new NextRequest(`http://localhost:3000${path}`);
    for (const [key, value] of Object.entries(cookies)) {
      req.cookies.set(key, value);
    }
    return req;
  }

  // 1. Opening / while logged out lands on /login with no flash
  it("redirects unauthenticated visitors from root '/' directly to '/login' with 307", async () => {
    const req = makeRequest("/");
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    // Verify production security headers are attached even to redirects
    expect(res.headers.get("Content-Security-Policy")).toBeTruthy();
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  // 2. Opening protected URLs while logged out redirects to /login?next=...
  it("redirects unauthenticated visitors from '/dashboard/brand' to '/login?next=%2Fdashboard%2Fbrand'", async () => {
    const req = makeRequest("/dashboard/brand");
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fdashboard%2Fbrand");
  });

  it("redirects unauthenticated visitors from '/creators' to '/login?next=%2Fcreators'", async () => {
    const req = makeRequest("/creators");
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fcreators");
  });

  // 3. Login as demo brand -> /dashboard/brand; demo creator -> /dashboard/creator; admin -> /admin
  it("routes authenticated demo brand to '/dashboard/brand'", async () => {
    const req = makeRequest("/", { cf_demo_role: "brand" });
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard/brand");
  });

  it("routes authenticated demo creator to '/dashboard/creator'", async () => {
    const req = makeRequest("/", { cf_demo_role: "creator" });
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard/creator");
  });

  it("routes authenticated admin to '/admin'", async () => {
    const req = makeRequest("/", { cf_demo_role: "admin" });
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/admin");
  });

  // 4. Logged-in users opening /login are redirected to their dashboard
  it("redirects logged-in brand opening '/login' to '/dashboard/brand'", async () => {
    const req = makeRequest("/login", { cf_demo_role: "brand" });
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard/brand");
  });

  it("redirects logged-in creator opening '/login' to '/dashboard/creator'", async () => {
    const req = makeRequest("/login", { cf_demo_role: "creator" });
    const res = await updateSession(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard/creator");
  });

  // 5. Open redirect attack: next=https://evil.com and next=//evil.com are rejected
  it("rejects open-redirect attempts and safely routes to role dashboard", () => {
    expect(sanitizeNextUrl("https://evil.com", "/dashboard/brand")).toBe("/dashboard/brand");
    expect(sanitizeNextUrl("//evil.com", "/dashboard/brand")).toBe("/dashboard/brand");
    expect(sanitizeNextUrl("/\\evil.com", "/dashboard/brand")).toBe("/dashboard/brand");
    expect(sanitizeNextUrl("javascript:alert(1)", "/dashboard/creator")).toBe("/dashboard/creator");
    expect(sanitizeNextUrl("/briefs/123", "/dashboard/brand")).toBe("/briefs/123");
  });

  // 6. Public routes stay accessible without login
  it("permits unauthenticated access to public routes without redirection", async () => {
    const publicPages = ["/about", "/terms", "/privacy", "/forgot-password", "/reset-password"];

    for (const page of publicPages) {
      const req = makeRequest(page);
      const res = await updateSession(req);
      // Status should be 200 (NextResponse.next) not 307
      expect(res.status).toBe(200);
    }
  });
});
