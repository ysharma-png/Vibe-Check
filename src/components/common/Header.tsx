"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Sparkles, Command } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // Hide the global top navigation bar on dedicated auth screens
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthPage) {
    return null;
  }

  const NAV_ITEMS = [
    {
      name: "Showcase",
      href: "/showcase",
      badge: "3D",
      isActive: (path: string) => path.startsWith("/showcase"),
      visibility: "inline-flex",
    },
    {
      name: "Creators",
      href: "/creators",
      isActive: (path: string) => path.startsWith("/creators"),
      visibility: "inline-flex",
    },
    {
      name: "Feed",
      href: "/home",
      isActive: (path: string) => path === "/home" || path === "/",
      visibility: "hidden sm:inline-flex",
    },
    {
      name: "Boards",
      href: "/boards",
      isActive: (path: string) => path.startsWith("/boards"),
      visibility: "inline-flex",
    },
    {
      name: "Studio",
      href: "/dashboard/creator",
      isActive: (path: string) => path.startsWith("/dashboard/creator"),
      visibility: "hidden sm:inline-flex",
    },
    {
      name: "Brand",
      href: "/dashboard/brand",
      isActive: (path: string) => path.startsWith("/dashboard/brand"),
      visibility: "hidden md:inline-flex",
    },
    {
      name: "Design",
      href: "/design",
      isActive: (path: string) => path.startsWith("/design"),
      visibility: "hidden lg:inline-flex",
    },
  ];

  return (
    <header className="sticky top-0 z-40 glass-chrome border-b border-white/10 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Wordmark with Living Glyph */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-90 flex items-center gap-2.5 font-display"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#D8FD38] shadow-[0_0_10px_rgba(216,253,56,0.6)]" />
          <span className="tracking-tight text-base">CacheFlow</span>
          <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-content-muted border border-white/5">
            PRO
          </span>
        </Link>

        {/* macOS Sliding Glass Nav Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {/* Spotlight Quick Search Trigger */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
              );
            }}
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-content-muted hover:text-white hover:bg-white/10 transition-all shadow-sm group mr-1"
            title="Open Spotlight (Cmd+K)"
          >
            <Command className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] font-mono">Spotlight</span>
            <kbd className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 font-mono text-accent">
              ⌘K
            </kbd>
          </button>

          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                  item.visibility
                } ${
                  active
                    ? "bg-[#D8FD38]/15 text-[#D8FD38] font-semibold border border-[#D8FD38]/40 shadow-sm"
                    : "text-content-muted hover:text-white hover:bg-white/5 border border-transparent font-medium"
                }`}
              >
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D8FD38] animate-pulse shrink-0" />
                )}
                <span>{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full transition-colors ${
                      active
                        ? "bg-[#D8FD38] text-[#08090B] font-bold"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="ml-1 flex items-center gap-2 border-l border-white/10 pl-2 sm:pl-3">
            <ThemeToggle />
            <NotificationBell />
            <button
              type="button"
              onClick={() => {
                document.cookie = "cf_demo_role=; path=/; max-age=0";
                document.cookie = "cf_user_name=; path=/; max-age=0";
                document.cookie = "cf_user_handle=; path=/; max-age=0";
                document.cookie = "cf_user_email=; path=/; max-age=0";
                try {
                  localStorage.removeItem("cf_current_user");
                } catch {}
                window.location.href = "/login";
              }}
              className="text-xs font-mono text-rose-400/70 hover:text-rose-400 px-2 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              Exit
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
