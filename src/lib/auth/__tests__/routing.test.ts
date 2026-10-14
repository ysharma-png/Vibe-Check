import { describe, it, expect } from "vitest";
import {
  sanitizeNextUrl,
  isPublicPath,
  getRoleDashboard,
  PUBLIC_PATHS,
} from "../routing";

describe("Routing & Open-Redirect Protection", () => {
  describe("sanitizeNextUrl", () => {
    const fallback = "/dashboard/brand";

    it("accepts valid relative internal paths", () => {
      expect(sanitizeNextUrl("/briefs/123", fallback)).toBe("/briefs/123");
      expect(sanitizeNextUrl("/creators?tool=flux", fallback)).toBe("/creators?tool=flux");
      expect(sanitizeNextUrl("/dashboard/brand/campaigns", fallback)).toBe("/dashboard/brand/campaigns");
      expect(sanitizeNextUrl("/dashboard/creator#stats", fallback)).toBe("/dashboard/creator#stats");
      expect(sanitizeNextUrl("/settings", fallback)).toBe("/settings");
    });

    it("rejects absolute URLs pointing to external domains (Open Redirect Attack)", () => {
      expect(sanitizeNextUrl("https://evil.com", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("http://attacker.com/steal-token", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("https://cacheflow.test.evil.com", fallback)).toBe(fallback);
    });

    it("rejects protocol-relative URLs (//evil.com)", () => {
      expect(sanitizeNextUrl("//evil.com", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("//evil.com/phish", fallback)).toBe(fallback);
    });

    it("rejects Windows backslash path bypasses (/\\evil.com)", () => {
      expect(sanitizeNextUrl("/\\evil.com", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("\\evil.com", fallback)).toBe(fallback);
    });

    it("rejects javascript: and data: URIs", () => {
      expect(sanitizeNextUrl("javascript:alert(document.cookie)", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("data:text/html,<script>alert(1)</script>", fallback)).toBe(fallback);
    });

    it("prevents redirect loops by rejecting auth and root paths as 'next'", () => {
      // If someone has ?next=/ or ?next=/login, we must fallback to the role dashboard
      expect(sanitizeNextUrl("/", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("/login", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("/signup", fallback)).toBe(fallback);
    });

    it("handles null, undefined, empty, or whitespace-only inputs gracefully", () => {
      expect(sanitizeNextUrl(null, fallback)).toBe(fallback);
      expect(sanitizeNextUrl(undefined, fallback)).toBe(fallback);
      expect(sanitizeNextUrl("", fallback)).toBe(fallback);
      expect(sanitizeNextUrl("   ", fallback)).toBe(fallback);
    });
  });

  describe("isPublicPath", () => {
    it("recognizes all designated public routes without authentication", () => {
      expect(isPublicPath("/login")).toBe(true);
      expect(isPublicPath("/signup")).toBe(true);
      expect(isPublicPath("/forgot-password")).toBe(true);
      expect(isPublicPath("/reset-password")).toBe(true);
      expect(isPublicPath("/terms")).toBe(true);
      expect(isPublicPath("/privacy")).toBe(true);
      expect(isPublicPath("/about")).toBe(true);
      expect(isPublicPath("/auth/callback")).toBe(true);
    });

    it("recognizes public routes with trailing slashes or search queries", () => {
      expect(isPublicPath("/about/")).toBe(true);
      expect(isPublicPath("/login?next=/briefs")).toBe(true);
      expect(isPublicPath("/terms?v=2")).toBe(true);
      expect(isPublicPath("/auth/callback?code=abc123xyz")).toBe(true);
    });

    it("identifies protected routes that require authentication", () => {
      expect(isPublicPath("/")).toBe(false);
      expect(isPublicPath("/creators")).toBe(false);
      expect(isPublicPath("/creators/alex-rivera")).toBe(false);
      expect(isPublicPath("/briefs/new")).toBe(false);
      expect(isPublicPath("/dashboard/creator")).toBe(false);
      expect(isPublicPath("/dashboard/brand")).toBe(false);
      expect(isPublicPath("/admin")).toBe(false);
      expect(isPublicPath("/settings")).toBe(false);
    });
  });

  describe("getRoleDashboard", () => {
    it("routes creators to /dashboard/creator", () => {
      expect(getRoleDashboard("creator")).toBe("/dashboard/creator");
    });

    it("routes brands to /dashboard/brand", () => {
      expect(getRoleDashboard("brand")).toBe("/dashboard/brand");
    });

    it("routes admins to /admin", () => {
      expect(getRoleDashboard("admin")).toBe("/admin");
    });

    it("defaults to creator dashboard if role is unspecified", () => {
      expect(getRoleDashboard(null)).toBe("/dashboard/creator");
      expect(getRoleDashboard(undefined)).toBe("/dashboard/creator");
    });
  });

  describe("Redirect Loop Prevention Simulation", () => {
    type SessionState = {
      isAuthenticated: boolean;
      role?: "creator" | "brand" | "admin";
    };

    function simulateNavigation(
      targetPath: string,
      session: SessionState,
      nextQuery?: string
    ): { finalPath: string; redirectCount: number; loopDetected: boolean } {
      let current = targetPath;
      let count = 0;
      const visited = new Set<string>();

      while (count < 10) {
        if (visited.has(current)) {
          return { finalPath: current, redirectCount: count, loopDetected: true };
        }
        visited.add(current);

        // Step 1: Root path "/"
        if (current === "/") {
          count++;
          if (!session.isAuthenticated) {
            current = "/login";
          } else {
            current = getRoleDashboard(session.role);
          }
          continue;
        }

        // Step 2: Login path "/login"
        if (current === "/login") {
          if (session.isAuthenticated) {
            count++;
            const sanitized = sanitizeNextUrl(nextQuery, getRoleDashboard(session.role));
            current = sanitized;
            continue;
          }
          // Unauthenticated on /login -> STOPS here (serves /login page)
          break;
        }

        // Step 3: Public path
        if (isPublicPath(current)) {
          // STOPS here (serves public page)
          break;
        }

        // Step 4: Protected path
        if (!session.isAuthenticated) {
          count++;
          current = "/login";
          continue;
        }

        // Step 5: Role protection check
        if (current.startsWith("/dashboard/creator") && session.role !== "creator" && session.role !== "admin") {
          count++;
          current = "/dashboard/brand";
          continue;
        }
        if (current.startsWith("/dashboard/brand") && session.role !== "brand" && session.role !== "admin") {
          count++;
          current = "/dashboard/creator";
          continue;
        }

        // Successfully reached target protected dashboard
        break;
      }

      return { finalPath: current, redirectCount: count, loopDetected: false };
    }

    it("proves no redirect loop when logged-out visitor opens root /", () => {
      const res = simulateNavigation("/", { isAuthenticated: false });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/login");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-out visitor opens /login directly", () => {
      const res = simulateNavigation("/login", { isAuthenticated: false });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/login");
      expect(res.redirectCount).toBe(0);
    });

    it("proves no redirect loop when logged-out visitor opens protected /briefs/new", () => {
      const res = simulateNavigation("/briefs/new", { isAuthenticated: false });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/login");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-in creator opens root /", () => {
      const res = simulateNavigation("/", { isAuthenticated: true, role: "creator" });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/dashboard/creator");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-in creator opens /login", () => {
      const res = simulateNavigation("/login", { isAuthenticated: true, role: "creator" });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/dashboard/creator");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-in brand opens root /", () => {
      const res = simulateNavigation("/", { isAuthenticated: true, role: "brand" });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/dashboard/brand");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-in brand opens /login", () => {
      const res = simulateNavigation("/login", { isAuthenticated: true, role: "brand" });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/dashboard/brand");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when logged-in admin opens root /", () => {
      const res = simulateNavigation("/", { isAuthenticated: true, role: "admin" });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/admin");
      expect(res.redirectCount).toBe(1);
    });

    it("proves no redirect loop when attacker passes next=https://evil.com to /login", () => {
      const res = simulateNavigation("/login", { isAuthenticated: true, role: "creator" }, "https://evil.com");
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/dashboard/creator");
    });

    it("proves no redirect loop on expired session attempting to visit /settings", () => {
      const res = simulateNavigation("/settings", { isAuthenticated: false });
      expect(res.loopDetected).toBe(false);
      expect(res.finalPath).toBe("/login");
    });
  });
});
