/**
 * Routing & Open-Redirect Prevention Utilities
 */

export const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/terms",
  "/privacy",
  "/about",
  "/landing",
  "/design",
  "/sitemap.xml",
  "/robots.txt",
] as const;

/**
 * Checks whether a given path is completely public (accessible without authentication).
 */
export function isPublicPath(path: string): boolean {
  // Strip trailing slashes and query strings for checking
  const cleanPath = path.split("?")[0]?.replace(/\/$/, "") || "/";

  // Check exact matches
  if (PUBLIC_PATHS.some((p) => p === cleanPath)) {
    return true;
  }

  // Check auth callbacks or static routes
  if (cleanPath.startsWith("/auth/callback")) {
    return true;
  }

  return false;
}

/**
 * Returns the default dashboard URL for a given role.
 */
export function getRoleDashboard(role?: string | null): string {
  if (role === "brand") return "/dashboard/brand";
  if (role === "admin") return "/admin";
  return "/dashboard/creator";
}

/**
 * Validates and sanitizes a post-login destination URL to prevent open-redirect attacks.
 *
 * Requirements:
 * - Must start with a single '/'
 * - Must NOT start with '//' (protocol-relative URL)
 * - Must NOT start with '/\' (Windows backslash path traversal)
 * - Must NOT contain protocol schemes ('http:', 'https:', 'javascript:', 'data:')
 * - Origin must resolve strictly to the application host
 * - Must NOT redirect back to '/login', '/signup', or root '/' (prevents loops)
 */
export function sanitizeNextUrl(next: string | null | undefined, fallback: string): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must begin with '/' and NOT '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Block any scheme before or within
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  try {
    const dummyBase = "http://localhost:3000";
    const parsed = new URL(trimmed, dummyBase);

    // Verify origin matches dummyBase exactly
    if (parsed.origin !== dummyBase) {
      return fallback;
    }

    const pathname = parsed.pathname;

    // Never redirect to login, signup, or root to avoid redirect loops
    if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
      return fallback;
    }

    // Return relative path + query + hash
    return pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
