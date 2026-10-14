import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/supabase";
import { isPublicPath, getRoleDashboard, sanitizeNextUrl } from "@/lib/auth/routing";

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
  "media-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://accounts.google.com",
  "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Content-Security-Policy", CSP_HEADER);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return res;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 1. CSRF Defense: For state-mutating API requests, check Origin/Host headers
  const method = request.method.toUpperCase();
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return applySecurityHeaders(
            new NextResponse(
              JSON.stringify({ error: "Cross-site request forgery (CSRF) check failed." }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            )
          );
        }
      } catch {
        return applySecurityHeaders(
          new NextResponse(
            JSON.stringify({ error: "Malformed origin header." }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          )
        );
      }
    }
  }

  // 2. Fetch authenticated session
  const isPlaceholderSupabase =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    supabaseUrl.includes("placeholder");

  // Support demo sandbox session cookie alongside Supabase Auth (0ms instant resolution)
  const demoRole = request.cookies.get("cf_demo_role")?.value;
  let user: any = null;

  // Only perform network lookup if NOT in placeholder/demo mode and not already validated via demo cookie
  if (!isPlaceholderSupabase && !demoRole) {
    try {
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 800)
      );
      const res = await Promise.race([authPromise, timeoutPromise]);
      user = res.data?.user ?? null;
    } catch {
      user = null;
    }
  }

  const isAuthenticated = Boolean(user || demoRole);
  const userRole = (user?.user_metadata?.role as string | undefined) ?? demoRole ?? "creator";
  const aalLevel = (user?.app_metadata?.aal as string | undefined) ?? (demoRole === "admin" ? "aal2" : "aal1");

  // 3. Routing Behavior

  // Case A: Root URL ("/")
  if (path === "/") {
    const url = request.nextUrl.clone();
    if (!isAuthenticated) {
      // Unauthenticated visitor -> redirect immediately to /login (no flash of other content)
      url.pathname = "/login";
      return applySecurityHeaders(NextResponse.redirect(url));
    } else {
      // Authenticated visitor -> redirect directly to role-specific dashboard
      url.pathname = getRoleDashboard(userRole);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // Case B: Login page ("/login")
  if (path === "/login") {
    if (isAuthenticated) {
      // Already logged in -> send to next destination or role dashboard
      const nextParam = request.nextUrl.searchParams.get("next") ?? request.nextUrl.searchParams.get("redirect");
      const target = sanitizeNextUrl(nextParam, getRoleDashboard(userRole));
      const url = request.nextUrl.clone();
      url.pathname = target;
      url.searchParams.delete("next");
      url.searchParams.delete("redirect");
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    // Unauthenticated on /login -> allow view
  }

  // Case C: Signup page ("/signup")
  if (path === "/signup") {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleDashboard(userRole);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    // Unauthenticated on /signup -> allow view
  }

  // Case D: Public paths (/about, /terms, /privacy, /forgot-password, /reset-password, /auth/callback)
  if (isPublicPath(path)) {
    // Public routes stay reachable without login
  } else if (!isAuthenticated) {
    // Case E: Protected path requested by unauthenticated visitor -> redirect to /login?next=...
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const fullOriginalPath = path + request.nextUrl.search;
    url.searchParams.set("next", fullOriginalPath);
    return applySecurityHeaders(NextResponse.redirect(url));
  } else {
    // Case F: Authenticated user accessing protected routes -> role & AAL2 enforcement
    if (path.startsWith("/dashboard/creator") && userRole !== "creator" && userRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/brand";
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    if (path.startsWith("/dashboard/brand") && userRole !== "brand" && userRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/creator";
      return applySecurityHeaders(NextResponse.redirect(url));
    }

    if (path.startsWith("/admin")) {
      if (userRole !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = getRoleDashboard(userRole);
        return applySecurityHeaders(NextResponse.redirect(url));
      }
      if (aalLevel !== "aal2") {
        const url = request.nextUrl.clone();
        url.pathname = "/settings";
        url.searchParams.set("mfa_required", "true");
        return applySecurityHeaders(NextResponse.redirect(url));
      }
    }
  }

  // 4. Return response with security headers
  return applySecurityHeaders(supabaseResponse);
}
