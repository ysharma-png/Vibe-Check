"use client";

import React from "react";
import { Film, Wrench, GitFork, User, Star } from "lucide-react";

import { GlassSurface } from "@/components/glass/GlassSurface";

export type ProfileTabKey = "portfolio" | "tools" | "workflows" | "about" | "reviews";

interface ProfileTabsProps {
  readonly activeTab: ProfileTabKey;
  readonly onChangeTab: (tab: ProfileTabKey) => void;
  readonly portfolioCount: number;
  readonly toolsCount: number;
  readonly workflowsCount: number;
}

export function ProfileTabs({
  activeTab,
  onChangeTab,
  portfolioCount,
  toolsCount,
  workflowsCount,
}: ProfileTabsProps) {
  const tabs: { key: ProfileTabKey; label: string; icon: React.ElementType; count?: string | number }[] = [
    { key: "portfolio", label: "Portfolio", icon: Film, count: portfolioCount },
    { key: "tools", label: "Tools & Skills", icon: Wrench, count: toolsCount },
    { key: "workflows", label: "Workflows", icon: GitFork, count: workflowsCount },
    { key: "about", label: "About", icon: User },
    { key: "reviews", label: "Reviews", icon: Star, count: "5.0 ★" },
  ];

  return (
    <div className="relative pt-2 pb-1">
      <GlassSurface
        tier="regular"
        rounded="24"
        className="p-1.5 border border-white/10 backdrop-blur-xl shadow-lg inline-flex max-w-full overflow-x-auto scrollbar-none"
      >
        <nav className="flex items-center gap-1.5" aria-label="Profile Sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChangeTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-accent text-[#08090B] font-semibold shadow-glow-lime"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#08090B]" : "text-white/40"}`} />
                <span>{tab.label}</span>

                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-[#08090B]/20 text-[#08090B] font-bold"
                        : "bg-white/[0.06] text-white/50"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </GlassSurface>
    </div>
  );
}
