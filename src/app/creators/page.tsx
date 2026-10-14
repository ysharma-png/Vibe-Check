"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  ArrowRight,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { ALL_CREATORS as CREATORS, ALL_PORTFOLIO_ITEMS as PORTFOLIO_ITEMS } from "@/data/all-creators";
import { DemoBadge } from "@/components/common/DemoBadge";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { GlassTiltCard } from "@/components/glass/GlassTiltCard";
import Image from "next/image";

const POPULAR_TOOLS = [
  { id: "all", label: "All Tools" },
  { id: "comfy-ui", label: "ComfyUI" },
  { id: "flux-1-dev", label: "FLUX.1 [dev]" },
  { id: "runway-gen-3", label: "Runway Gen-3" },
  { id: "animatediff", label: "AnimateDiff" },
  { id: "topaz-video-ai", label: "Topaz Video AI" },
  { id: "midjourney-v6", label: "Midjourney" },
];

function CreatorsDirectoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "rate_asc" | "rate_desc" | "rating">("score");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter & Sort Logic
  const filteredCreators = useMemo(() => {
    let result = [...CREATORS];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q) ||
          c.primaryTools.some((t) => t.toLowerCase().includes(q)) ||
          c.specializations.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Tool filter
    if (selectedTool !== "all") {
      result = result.filter((c) =>
        c.primaryTools.some((t) => t.toLowerCase().includes(selectedTool.toLowerCase()))
      );
    }

    // Verified only filter
    if (verifiedOnly) {
      result = result.filter(
        (c) => c.verified.commercialLicense && c.verified.reproduciblePipeline
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rate_asc") return a.startingRateUsd - b.startingRateUsd;
      if (sortBy === "rate_desc") return b.startingRateUsd - a.startingRateUsd;
      if (sortBy === "rating") return b.stats.onTimeRate - a.stats.onTimeRate;
      return b.stats.projectsCompleted - a.stats.projectsCompleted;
    });

    return result;
  }, [searchQuery, selectedTool, sortBy, verifiedOnly]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTool("all");
    setSortBy("score");
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-10 px-6 lg:px-12 selection:bg-accent/20">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(216,253,56,0.6)] animate-pulse" />
              <span className="text-[11px] uppercase font-mono tracking-widest text-accent">
                TALENT RADAR // DIRECTORY
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white">
              Discover <span className="font-serif italic font-normal text-accent">verified</span> AI Directors
            </h1>
            <p className="text-xs sm:text-sm text-content-muted font-light max-w-xl">
              Inspect deterministic ComfyUI workflows, character consistency LoRAs, and guaranteed commercial clearance.
            </p>
          </div>

          <div className="text-xs font-mono text-content-muted">
            INDEX: <span className="text-white font-semibold">{filteredCreators.length}</span> / {CREATORS.length} STUDIOS
          </div>
        </div>

        {/* Filter & Search Bar Row */}
        <GlassSurface
          tier="regular"
          radius="32"
          specular
          className="p-5 border border-white/10 shadow-xl space-y-4"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
              <input
                type="text"
                placeholder="Search by name, handle, engine (FLUX.1, ComfyUI, Runway), or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs text-white placeholder-content-muted focus:outline-none focus:ring-1 focus:ring-[#D8FD38] transition-all"
              />
            </div>

            {/* Sort & Verified Toggles */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 text-xs font-mono text-content-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-white/20 bg-black/50 text-[#D8FD38] focus:ring-[#D8FD38]/40"
                />
                <span>DAG Verified Only</span>
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-black/50 text-xs font-mono text-content-primary focus:outline-none focus:ring-1 focus:ring-[#D8FD38]"
              >
                <option value="score">Sort: Experience &amp; Score</option>
                <option value="rating">Sort: Reliability</option>
                <option value="rate_asc">Rate: Low to High</option>
                <option value="rate_desc">Rate: High to Low</option>
              </select>
            </div>
          </div>

          {/* Tool Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted mr-1">
              Engines:
            </span>
            {POPULAR_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedTool(tool.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  selectedTool === tool.id
                    ? "bg-[#D8FD38] text-[#08090B] font-bold shadow-sm"
                    : "glass-thin text-content-muted hover:text-white"
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
        </GlassSurface>

        {/* Creators Grid with 3D Tilt Cards */}
        {filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => {
              const creatorPortfolio = PORTFOLIO_ITEMS.filter((it) => it.creatorId === creator.id).slice(0, 3);

              return (
                <GlassTiltCard
                  key={creator.id}
                  tier="regular"
                  radius="24"
                  maxTilt={6}
                  className="p-6 flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/creators/${creator.handle.replace("@", "")}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          name={creator.name}
                          handle={creator.handle}
                          size="lg"
                          gradient={creator.avatarGradient}
                          isVerified={creator.verified.identity}
                          availability={creator.availability}
                          showStatus
                        />
                        <span className="block">
                          <span className="text-sm font-medium text-white group-hover:text-accent transition-colors flex items-center gap-1.5 flex-wrap">
                            <span>{creator.name}</span>
                            {creator.verified.identity && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#38F2C7] shrink-0" />
                            )}
                            <DemoBadge isDemo={creator.is_demo ?? creator.isDemo} variant="inline" />
                          </span>
                          <span className="text-xs font-mono text-content-muted block">{creator.handle} • {creator.location}</span>
                        </span>
                      </Link>

                      <div className="flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-content-muted line-clamp-2 leading-relaxed font-light">
                      {creator.bio}
                    </p>

                    {/* Verified Toolchain Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {creator.primaryTools.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-lg glass-thin border border-white/5 text-content-muted"
                        >
                          {tool}
                        </span>
                      ))}
                      {creator.verified.reproduciblePipeline && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/30 flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          DAG Verified
                        </span>
                      )}
                    </div>

                    {/* Top 3 Thumbnails */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {creatorPortfolio.map((item, idx) => (
                        <Link
                          key={item.id}
                          href={`/creators/${creator.handle.replace("@", "")}`}
                          className="aspect-square rounded-xl overflow-hidden relative group/thumb shadow-sm hover:ring-1 hover:ring-[#D8FD38] transition-all border border-white/10"
                          title={item.title}
                        >
                          <Image
                            src={`/assets/thumbnails/thumb-${(((idx + 1)).toString().padStart(3, "0"))}.svg`}
                            alt={item.title}
                            fill
                            sizes="120px"
                            className="object-cover transition-transform group-hover/thumb:scale-105"
                            unoptimized
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none block" />
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/60 text-white px-1 rounded z-10 block">
                            {item.aspectRatio}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-content-muted block">Starting At</span>
                      <span className="text-sm font-mono font-medium text-white">
                        ${creator.startingRateUsd.toLocaleString()}{" "}
                        <span className="text-[10px] font-normal text-content-muted">/ proj</span>
                      </span>
                    </div>

                    <Link
                      href={`/creators/${creator.handle.replace("@", "")}`}
                      className="px-4 py-1.5 rounded-xl bg-[#D8FD38] text-[#08090B] text-xs font-semibold hover:bg-[#E5FF66] transition-colors shadow-sm"
                    >
                      View Profile →
                    </Link>
                  </div>
                </GlassTiltCard>
              );
            })}
          </div>
        ) : (
          <EmptyState
            illustration="search"
            title="No creators match your current filters"
            description="Try clearing the search query or tool engine filters to view the full directory of verified studios."
            primaryAction={{
              label: "Reset All Filters",
              onClick: resetFilters,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function CreatorsDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background py-16 px-6 max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-64 glass-thin rounded-2xl" />
          <div className="h-20 w-full glass-thin rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-80 glass-thin rounded-3xl" />
            <div className="h-80 glass-thin rounded-3xl" />
            <div className="h-80 glass-thin rounded-3xl" />
          </div>
        </div>
      }
    >
      <CreatorsDirectoryContent />
    </Suspense>
  );
}
