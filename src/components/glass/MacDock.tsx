"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Users,
  FolderKanban,
  FileText,
  Search,
  Sparkles,
  Command,
} from "lucide-react";

export function MacDock() {
  const pathname = usePathname();

  // Hide dock on full slide deck or presentation mode if requested
  const isSlideDeck = pathname?.startsWith("/slides");
  if (isSlideDeck) return null;

  const DOCK_ITEMS = [
    { id: "showcase", label: "Showcase", href: "/showcase" },
    { id: "creators", label: "Talent Radar", href: "/creators" },
    { id: "briefs", label: "Brief Studio", href: "/briefs/new" },
    { id: "boards", label: "Moodboards", href: "/boards" },
    { id: "design", label: "Design System", href: "/design" },
  ];

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
  };

  return (
    <nav
      aria-label="Desktop Quick Dock"
      className="hidden md:flex macos-dock"
    >
      {DOCK_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`macos-dock-item ${isActive ? "active" : ""}`}
          >
            {item.id === "showcase" && <Sparkles className="h-4 w-4" />}
            {item.id === "creators" && <Users className="h-4 w-4" />}
            {item.id === "briefs" && <FileText className="h-4 w-4" />}
            {item.id === "boards" && <FolderKanban className="h-4 w-4" />}
            {item.id === "design" && <Compass className="h-4 w-4" />}
          </Link>
        );
      })}

      <div className="h-5 w-[1px] bg-white/10 mx-1" />

      {/* Spotlight Trigger */}
      <button
        type="button"
        onClick={triggerCommandPalette}
        title="Spotlight Search (Cmd+K)"
        className="macos-dock-item text-accent hover:text-white"
      >
        <Command className="h-4 w-4" />
      </button>
    </nav>
  );
}
