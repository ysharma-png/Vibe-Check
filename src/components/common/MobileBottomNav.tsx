"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Bookmark, User, Settings } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cookieStr = typeof document !== "undefined" ? document.cookie : "";
      const cookies = cookieStr.split("; ");
      const roleCookie = cookies.find((c) => c.startsWith("cf_demo_role="));
      if (roleCookie) {
        setRole(roleCookie.split("=")[1] ?? null);
      }
    } catch {}
  }, [pathname]);

  // Hide on dedicated auth routes
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthRoute) {
    return null;
  }

  const dashboardHref = role === "brand" ? "/dashboard/brand" : "/dashboard/creator";

  const NAV_ITEMS = [
    { id: "feed", label: "Feed", href: "/home" },
    { id: "showcase", label: "Showcase", href: "/showcase" },
    { id: "boards", label: "Boards", href: "/boards" },
    { id: "studio", label: "Studio", href: dashboardHref },
    { id: "settings", label: "Settings", href: "/settings" },
  ];

  return (
    <nav
      aria-label="Mobile Dock Navigation"
      className="md:hidden fixed bottom-3 left-4 right-4 z-40 select-none"
    >
      <GlassSurface
        tier="chrome"
        radius="full"
        className="px-3 py-1.5 border border-white/20 shadow-2xl flex items-center justify-around"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/home"
              ? pathname === "/home" || pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-2 rounded-full transition-all relative ${
                isActive
                  ? "text-[#D8FD38] font-semibold"
                  : "text-content-muted hover:text-white"
              }`}
            >
              {item.id === "feed" && <Home className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-content-muted"}`} />}
              {item.id === "showcase" && <Film className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-content-muted"}`} />}
              {item.id === "boards" && <Bookmark className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-content-muted"}`} />}
              {item.id === "studio" && <User className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-content-muted"}`} />}
              {item.id === "settings" && <Settings className={`h-4 w-4 ${isActive ? "text-[#D8FD38]" : "text-content-muted"}`} />}
              <span className="text-[9px] mt-0.5 font-mono">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#D8FD38]" />
              )}
            </Link>
          );
        })}
      </GlassSurface>
    </nav>
  );
}
