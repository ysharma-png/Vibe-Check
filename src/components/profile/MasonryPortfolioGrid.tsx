"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Smartphone,
  Monitor,
  ShieldCheck,
  ArrowRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import Image from "next/image";

interface MasonryPortfolioGridProps {
  readonly items: readonly PortfolioItem[];
  readonly onSelectItem: (itemId: string) => void;
  readonly onOpenCaseStudy: (item: PortfolioItem) => void;
}

export function MasonryPortfolioGrid({
  items,
  onSelectItem,
  onOpenCaseStudy,
}: MasonryPortfolioGridProps) {
  // Filter chips
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedTool, setSelectedTool] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");

  // Hovering item id for video preview
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Collect available tools and styles
  const availableTools = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.toolchain.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [items]);

  const availableStyles = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.styleTags.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedType !== "all" && item.mediaType !== selectedType) return false;
      if (selectedTool !== "all" && !item.toolchain.includes(selectedTool)) return false;
      if (selectedStyle !== "all" && !item.styleTags.includes(selectedStyle)) return false;
      return true;
    });
  }, [items, selectedType, selectedTool, selectedStyle]);

  // Featured Item for Case Study (first item or item with client outcome)
  const featuredItem = useMemo(() => {
    return items.find((it) => it.clientOutcome) ?? items[0] ?? null;
  }, [items]);

  // Lightbox keyboard navigation
  const handleNextLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  const handlePrevLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNextLightbox();
      if (e.key === "ArrowLeft") handlePrevLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNextLightbox, handlePrevLightbox]);

  const activeLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="space-y-6">
      {/* 1. Featured Case Study Banner */}
      {featuredItem && (
        <GlassSurface
          tier="thick"
          rounded="32"
          className="relative overflow-hidden p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
        >
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-accent/20 text-accent border border-accent/30 shadow-glow-lime">
                <Sparkles className="h-3 w-3" />
                Featured Case Study
              </span>
              <span className="text-xs text-white/40 font-mono">
                {featuredItem.aspectRatio} • {featuredItem.resolution}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-display font-medium text-white tracking-tight">
              {featuredItem.title}
            </h3>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-2 font-light">
              {featuredItem.clientOutcome || featuredItem.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-white/40 font-mono">
              <span>Tools:</span>
              {featuredItem.toolchain.slice(0, 4).map((tId) => (
                <span
                  key={tId}
                  className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] text-white/70 border border-white/10 backdrop-blur-md"
                >
                  {getToolById(tId)?.name || tId}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenCaseStudy(featuredItem)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent hover:bg-accent/90 text-[#08090B] text-xs font-mono font-semibold transition-all shadow-glow-lime hover:scale-[1.02]"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Read Case Study</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectItem(featuredItem.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono font-medium text-white transition-all backdrop-blur-md hover:border-white/20"
            >
              <span>Inspect Workflow</span>
              <ArrowRight className="h-3.5 w-3.5 text-accent" />
            </button>
          </div>
        </GlassSurface>
      )}

      {/* 2. Filter Chips Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-display font-medium text-white tracking-tight">
            Portfolio Work ({filteredItems.length})
          </h2>
          <span className="text-xs text-white/40 font-mono">
            Hover cards for video playback preview
          </span>
        </div>

        {/* Filter Groups */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Media Type Chips */}
          <GlassSurface
            tier="thin"
            rounded="16"
            className="inline-flex items-center p-1 border border-white/10"
          >
            {[
              { id: "all", label: "All Media" },
              { id: "video", label: "Video" },
              { id: "image", label: "Stills" },
              { id: "3d", label: "3D / NeRF" },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  selectedType === type.id
                    ? "bg-accent text-[#08090B] font-semibold shadow-glow-lime"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {type.label}
              </button>
            ))}
          </GlassSurface>

          {/* Tools Filter */}
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="px-3.5 py-1.5 rounded-2xl border border-white/10 bg-[#0E1114]/80 text-xs font-mono text-white/70 hover:text-white focus:outline-none focus:border-accent backdrop-blur-md"
          >
            <option value="all">All Tools ({availableTools.length})</option>
            {availableTools.map((tId) => (
              <option key={tId} value={tId} className="bg-[#0E1114] text-white">
                {getToolById(tId)?.name || tId}
              </option>
            ))}
          </select>

          {/* Style Filter */}
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="px-3.5 py-1.5 rounded-2xl border border-white/10 bg-[#0E1114]/80 text-xs font-mono text-white/70 hover:text-white focus:outline-none focus:border-accent backdrop-blur-md"
          >
            <option value="all">All Styles ({availableStyles.length})</option>
            {availableStyles.map((style) => (
              <option key={style} value={style} className="bg-[#0E1114] text-white">
                {style}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* 3. Masonry Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => {
          const isHovered = hoveredItemId === item.id;
          const reproColor = {
            verified_deterministic: "bg-accent shadow-glow-lime",
            partially_reproducible: "bg-amber-400",
            unverified: "bg-white/20",
          }[item.reproducibility.kind];

          // Dynamic aspect ratio calculation
          const aspectClass = {
            "9:16": "aspect-[9/16]",
            "16:9": "aspect-[16/9]",
            "1:1": "aspect-square",
            "4:5": "aspect-[4/5]",
            "21:9": "aspect-[21/9]",
          }[item.aspectRatio] ?? "aspect-[16/9]";

          return (
            <GlassSurface
              key={item.id}
              tier="regular"
              rounded="24"
              tabIndex={0}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              onClick={() => onSelectItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectItem(item.id);
                }
              }}
              className="group relative flex flex-col justify-between overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/25 hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {/* Media Container with Autoplay / Hover scrubbing */}
              <div className={`relative w-full overflow-hidden bg-black/40 ${aspectClass}`}>
                {/* Image Thumbnail with Ambient Gradient Overlay */}
                <Image
                  src={
                    item.mediaUrl ||
                    `/assets/thumbnails/thumb-${((Math.abs(item.id.charCodeAt(item.id.length - 1)) % 24) + 1)
                      .toString()
                      .padStart(3, "0")}.svg`
                  }
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  unoptimized
                />
                <div
                  className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]}, ${item.posterGradient[2] ?? "#16161A"})`,
                    opacity: 0.25,
                  }}
                />

                {/* Simulated / Real Video Autoplay on hover */}
                {item.mediaUrl && isHovered ? (
                  <video
                    src={item.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover z-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="h-4 w-4 ml-0.5 text-accent" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/40 pointer-events-none" />

                {/* Top Overlay Badges */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                  <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-md font-mono border border-white/10">
                    {item.aspectRatio === "9:16" ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Monitor className="h-3 w-3" />
                    )}
                    <span>{item.aspectRatio}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Lightbox Trigger */}
                    <button
                      type="button"
                      aria-label="Open Fullscreen Lightbox"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(idx);
                      }}
                      className="p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white/70 hover:text-white backdrop-blur-md transition-colors pointer-events-auto border border-white/10"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </button>

                    {/* Commercial Verified Shield */}
                    {item.commercialSafety.subscriptionVerified && (
                      <div
                        title="Commercial License Verified"
                        className="p-1.5 rounded-full bg-black/70 text-cyan-300 backdrop-blur-md border border-cyan-400/20"
                      >
                        <ShieldCheck className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration indicator if video */}
                {item.durationSec && (
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 text-white/70 backdrop-blur-md border border-white/10">
                    {item.durationSec}s
                  </div>
                )}
              </div>

              {/* Title & Metadata Details */}
              <div className="p-5 space-y-3 bg-[#08090B]/60 backdrop-blur-md">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold font-display text-white truncate group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <span
                      title={`Reproducibility: ${item.reproducibility.kind}`}
                      className={`h-2 w-2 rounded-full shrink-0 ${reproColor}`}
                    />
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                {/* Toolchain chain */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40 font-mono">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    {item.toolchain.slice(0, 3).map((tId, tIdx) => {
                      const tool = getToolById(tId);
                      const name = tool ? tool.name.split(" ")[0] : tId;
                      return (
                        <React.Fragment key={tId}>
                          <span className="truncate">{name}</span>
                          {tIdx < Math.min(item.toolchain.length, 3) - 1 && (
                            <span className="text-white/20">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <span className="inline-flex items-center gap-1 text-white font-medium group-hover:text-accent transition-colors">
                    <span>Inspect</span>
                    <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </GlassSurface>
          );
        })}
      </div>

      {/* 4. Fullscreen Lightbox Viewer */}
      {activeLightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Lightbox: ${activeLightboxItem.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-8"
        >
          {/* Close button with Traffic Lights */}
          <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
            <MacTrafficLights onClose={() => setLightboxIndex(null)} />
            <span className="text-xs font-mono text-white/50">
              {activeLightboxItem.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.06] border border-white/10 text-white/70 hover:text-white transition-colors z-50 backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left / Right Navigation */}
          <button
            type="button"
            onClick={handlePrevLightbox}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-colors z-50 backdrop-blur-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={handleNextLightbox}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white transition-colors z-50 backdrop-blur-md"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Main Content Modal */}
          <GlassSurface
            tier="thick"
            rounded="32"
            className="max-w-4xl w-full flex flex-col items-center p-6 border border-white/10 shadow-2xl space-y-4"
          >
            <div
              className="relative w-full max-h-[70vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-black/60"
              style={{
                aspectRatio: activeLightboxItem.aspectRatio.replace(":", "/"),
                background: `linear-gradient(135deg, ${activeLightboxItem.posterGradient[0]}, ${activeLightboxItem.posterGradient[1]})`,
              }}
            >
              {activeLightboxItem.mediaUrl ? (
                <video
                  src={activeLightboxItem.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <Film className="h-12 w-12 text-accent mx-auto animate-pulse" />
                  <h3 className="text-lg font-display text-white">
                    {activeLightboxItem.title}
                  </h3>
                  <p className="text-xs text-white/60 max-w-md mx-auto font-light">
                    {activeLightboxItem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Controls / Inspect Action */}
            <div className="w-full flex items-center justify-between text-xs font-mono text-white/60 px-2">
              <div>
                <span className="text-white font-medium mr-2">
                  {activeLightboxItem.title}
                </span>
                <span className="text-white/40">({activeLightboxItem.aspectRatio} • {activeLightboxItem.resolution})</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = activeLightboxItem.id;
                  setLightboxIndex(null);
                  onSelectItem(id);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-[#08090B] font-semibold hover:bg-accent/90 transition-all shadow-glow-lime"
              >
                <span>Inspect Full Workflow</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
