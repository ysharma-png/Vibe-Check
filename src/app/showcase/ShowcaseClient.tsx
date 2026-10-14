"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  Share2,
  Workflow,
  Send,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Filter,
  Layers,
  Sparkles,
  Grid,
  Maximize2,
  Volume2,
  VolumeX,
  X,
  Download,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import {
  getShowcaseFeed,
  toggleLikePortfolioItem,
  ShowcaseFeedItem,
} from "@/lib/engagement/store";
import { Avatar } from "@/components/common/Avatar";
import Image from "next/image";
import { SaveToBoardModal } from "@/components/boards/SaveToBoardModal";
import { trackEvent } from "@/lib/engagement/analytics";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { PortfolioItem } from "@/types/schema";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { GlassTiltCard } from "@/components/glass/GlassTiltCard";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MacSegmentedControl } from "@/components/glass/MacSegmentedControl";
import { CoverFlowCarousel } from "@/components/3d/CoverFlowCarousel";

export function ShowcaseClient() {
  const [items, setItems] = useState<ShowcaseFeedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeFilterTool, setActiveFilterTool] = useState("all");
  const [activeFilterStyle, setActiveFilterStyle] = useState("all");
  const [activeFilterContent, setActiveFilterContent] = useState("all");
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewMode, setViewMode] = useState<"coverflow" | "immersive" | "grid">("coverflow");

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Load feed items based on filters
  const loadFeed = useCallback(() => {
    const feed = getShowcaseFeed({
      contentType: activeFilterContent,
      tool: activeFilterTool,
      style: activeFilterStyle,
    });
    setItems(feed);
    setCurrentIndex(0);
  }, [activeFilterContent, activeFilterTool, activeFilterStyle]);

  useEffect(() => {
    loadFeed();
    trackEvent("feed_viewed", { metadata: { type: "showcase" } });
  }, [loadFeed]);

  const currentItem: ShowcaseFeedItem | undefined = items[currentIndex];

  // Navigate feed
  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      trackEvent("showcase_swipe", { metadata: { direction: "next", index: currentIndex + 1 } });
    }
  }, [currentIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      trackEvent("showcase_swipe", { metadata: { direction: "prev", index: currentIndex - 1 } });
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === "l" && currentItem) {
        e.preventDefault();
        handleLike(currentItem.id);
      } else if (e.key.toLowerCase() === "s" && currentItem) {
        e.preventDefault();
        setShowSaveModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, currentItem]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0]?.clientY ?? 0;
    const diff = touchStartY.current - touchEndY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Like action
  const handleLike = (id: string) => {
    const { isLiked, newCount } = toggleLikePortfolioItem(id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLiked, likesCount: newCount } : item
      )
    );
  };

  const fullItemRecord = currentItem
    ? PORTFOLIO_ITEMS.find((p) => p.id === currentItem.id)
    : undefined;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[calc(100vh-3.5rem)] bg-background text-content-primary overflow-hidden select-none"
    >
      {/* Top Filter & View Mode Bar with macOS Chrome styling */}
      <div className="sticky top-16 mx-4 sm:mx-8 z-30 mt-3">
        <GlassSurface
          tier="chrome"
          radius="24"
          specular
          className="flex flex-wrap items-center justify-between gap-3 p-3 border border-white/10 shadow-xl"
        >
          {/* Tool Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-content-muted font-mono text-[10px] uppercase px-2 flex items-center gap-1">
              <Filter className="h-3 w-3 text-accent" /> Engines:
            </span>
            {["all", "comfy-ui", "flux-1-dev", "animatediff", "topaz-video-ai"].map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => setActiveFilterTool(tool)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                  activeFilterTool === tool
                    ? "bg-[#D8FD38] text-[#08090B] font-bold shadow-sm"
                    : "glass-thin text-content-muted hover:text-white"
                }`}
              >
                {tool === "all" ? "All" : tool.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* View Mode Segmented Controls */}
          <div className="flex items-center gap-2">
            <MacSegmentedControl
              options={[
                { value: "coverflow", label: "3D Coverflow", icon: Boxes },
                { value: "immersive", label: "Reel", icon: Maximize2 },
                { value: "grid", label: "Matrix", icon: Grid },
              ]}
              value={viewMode}
              onChange={(val) => setViewMode(val as "coverflow" | "immersive" | "grid")}
              size="sm"
            />
          </div>
        </GlassSurface>
      </div>

      {/* VIEW 1: 3D Coverflow Mode (Default Showcase Feature) */}
      {viewMode === "coverflow" && (
        <div className="pt-8 pb-16 px-4 max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent">
              3D PORTFOLIO COVERFLOW // SEEDED WORKS
            </div>
            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
              Curated Generative <span className="font-serif italic font-normal text-[#D8FD38]">Cinematic</span> Works
            </h2>
            <p className="text-xs text-content-muted font-light max-w-md mx-auto">
              Inspect ComfyUI node graphs, LoRA reproducibility scores, and commercial clearance deeds.
            </p>
          </div>

          <CoverFlowCarousel
            items={PORTFOLIO_ITEMS}
            onSelectItem={(item) => {
              const feedIdx = items.findIndex((i) => i.id === item.id);
              if (feedIdx !== -1) {
                setCurrentIndex(feedIdx);
                setViewMode("immersive");
              }
            }}
          />
        </div>
      )}

      {/* VIEW 2: Grid Mode with 3D Tilt Cards */}
      {viewMode === "grid" && (
        <div className="pt-8 pb-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item, idx) => (
              <GlassTiltCard
                key={item.id}
                tier="regular"
                radius="24"
                maxTilt={8}
                onClick={() => {
                  setCurrentIndex(idx);
                  setViewMode("immersive");
                }}
                className="cursor-pointer group"
              >
                <div className="relative aspect-[9/16] w-full p-4 flex flex-col justify-between overflow-hidden">
                  <Image
                    src={`/assets/thumbnails/thumb-${(((idx % 24) + 1)).toString().padStart(3, "0")}.svg`}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/60 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white border border-white/10">
                      {item.aspectRatio}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                      className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] border border-white/10 hover:border-rose-500/40"
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          item.isLiked ? "text-rose-500 fill-rose-500" : "text-white"
                        }`}
                      />
                      <span>{item.likesCount}</span>
                    </button>
                  </div>

                  <div className="relative z-10 glass-thin p-3 rounded-2xl border border-white/10 space-y-1">
                    <h4 className="text-xs font-medium text-white truncate group-hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-content-muted truncate font-mono">
                      {item.creator.name} ({item.creator.handle})
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.toolchain.slice(0, 2).map((t) => (
                        <span key={t} className="text-[9px] glass-thin px-1.5 py-0.5 rounded text-white font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassTiltCard>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Immersive Reel Mode */}
      {viewMode === "immersive" && (
        <div className="relative h-[calc(100vh-8rem)] flex items-center justify-center p-4">
          {currentItem ? (
            <div className="relative w-full h-full max-w-lg md:max-w-2xl mx-auto flex items-center justify-center">
              <GlassSurface
                tier="thick"
                radius="32"
                specular
                sheen
                className="relative w-full h-full max-h-[82vh] overflow-hidden border border-white/15 shadow-2xl flex flex-col justify-between p-6 transition-all duration-300"
              >
                {/* Background ambient radiance */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-black/60 text-[#D8FD38] backdrop-blur-md border border-[#D8FD38]/30 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      {currentItem.reproducibilityScore}% Reproducible DAG
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/40 text-white/80 border border-white/10">
                      {currentItem.aspectRatio}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full glass-thin text-white hover:border-white/30 transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>

                {/* Center Play / Pause Indicator */}
                <div
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                >
                  {!isPlaying && (
                    <div className="p-5 rounded-full glass-thick text-white border border-white/20 animate-in zoom-in-75">
                      <Play className="h-8 w-8 translate-x-0.5" />
                    </div>
                  )}
                </div>

                {/* Bottom Creator Info Card */}
                <div className="relative z-10 glass-thin border border-white/10 p-5 rounded-2xl space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/creators/${currentItem.creator.handle.replace("@", "")}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar
                        name={currentItem.creator.name}
                        handle={currentItem.creator.handle}
                        size="md"
                        gradient={currentItem.creator.avatarGradient}
                        showStatus
                        availability="open"
                        className="flex-shrink-0"
                      />
                      <span className="block">
                        <span className="text-sm font-medium text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
                          <span>{currentItem.creator.name}</span>
                          <span className="text-[10px] font-mono text-[#D8FD38]">★ {currentItem.creator.rating}</span>
                        </span>
                        <span className="text-xs font-mono text-content-muted block">
                          {currentItem.creator.handle} • {currentItem.creator.location}
                        </span>
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setShowInviteModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D8FD38] text-[#08090B] hover:bg-[#E5FF66] shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      <span>Invite</span>
                    </button>
                  </div>

                  <div>
                    <h2 className="text-base font-medium text-white leading-tight">{currentItem.title}</h2>
                    <p className="text-xs text-content-muted line-clamp-2 mt-1 font-light">
                      {currentItem.description}
                    </p>
                  </div>

                  {/* Tool Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {currentItem.toolchain.map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md glass-thin text-white border border-white/10"
                      >
                        {tool}
                      </span>
                    ))}
                    {currentItem.styleTags.slice(0, 2).map((style) => (
                      <span
                        key={style}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#D8FD38]/15 text-[#D8FD38] border border-[#D8FD38]/30"
                      >
                        #{style}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Floating Actions on Right */}
                <div className="absolute right-4 bottom-28 z-20 flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleLike(currentItem.id)}
                    className="p-3 rounded-full glass-thin border border-white/15 hover:border-rose-500/50 transition-all flex flex-col items-center gap-1"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        currentItem.isLiked ? "text-rose-500 fill-rose-500" : "text-white"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-white">{currentItem.likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    className="p-3 rounded-full glass-thin border border-white/15 hover:border-accent transition-all flex flex-col items-center gap-1"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${currentItem.isSaved ? "text-accent fill-accent" : "text-white"}`}
                    />
                    <span className="text-[10px] font-mono text-white">Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWorkflowModal(true)}
                    className="p-3 rounded-full glass-thin border border-white/15 hover:border-[#D8FD38] transition-all flex flex-col items-center gap-1"
                  >
                    <Workflow className="h-4 w-4 text-[#D8FD38]" />
                    <span className="text-[10px] font-mono text-white">DAG</span>
                  </button>
                </div>

                {/* Up/Down Navigation Arrows */}
                <div className="hidden lg:flex flex-col items-center gap-3 absolute -right-16 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="p-3 rounded-full glass-regular text-content-primary hover:text-white disabled:opacity-30 transition-all"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-mono text-content-muted">
                    {currentIndex + 1} / {items.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentIndex === items.length - 1}
                    onClick={handleNext}
                    className="p-3 rounded-full glass-regular text-content-primary hover:text-white disabled:opacity-30 transition-all"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
              </GlassSurface>
            </div>
          ) : (
            <div className="text-center py-24 space-y-3">
              <Sparkles className="h-8 w-8 text-accent mx-auto" />
              <h3 className="text-base font-semibold text-white">No showcase items match filters</h3>
              <p className="text-xs text-content-muted">Try adjusting your tools above.</p>
            </div>
          )}
        </div>
      )}

      {/* Save to Board Modal */}
      {showSaveModal && currentItem && (
        <SaveToBoardModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          item={{
            itemType: "portfolio_item",
            itemId: currentItem.id,
            title: currentItem.title,
            subtitle: `${currentItem.creator.name} • ${currentItem.toolchain.join(", ")}`,
            gradient: currentItem.posterGradient,
          }}
        />
      )}

      {/* View Workflow Modal */}
      {showWorkflowModal && fullItemRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <GlassSurface
            tier="thick"
            radius="32"
            specular
            className="w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl flex flex-col space-y-5 overflow-hidden border border-white/20"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <MacTrafficLights onClose={() => setShowWorkflowModal(false)} />
                <Workflow className="h-4 w-4 text-accent" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{fullItemRecord.title}</h3>
                  <p className="text-[10px] font-mono text-content-muted">ComfyUI DAG Provenance Graph</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkflowModal(false)}
                className="p-1 rounded-lg text-content-muted hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-2xl glass-thin border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">ComfyUI Deterministic DAG Graph</div>
                  <div className="text-[11px] font-mono text-content-muted">
                    {fullItemRecord.pipeline.length} pipeline stages • 100% Reproducibility
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Downloading reproducible ComfyUI workflow JSON graph...")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D8FD38] text-[#08090B] text-xs font-semibold hover:bg-[#E5FF66] transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download DAG</span>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-content-faint">
                  Pipeline Execution Nodes ({fullItemRecord.pipeline.length})
                </h4>
                {fullItemRecord.pipeline.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-4 rounded-2xl glass-thin border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#D8FD38] text-[#08090B] flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {stage.label}
                      </span>
                      <span className="font-mono text-[10px] text-accent">{stage.toolId}</span>
                    </div>
                    <div className="text-content-muted text-[11px] font-mono bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[#D8FD38]">prompt:</span> {stage.prompt}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-content-muted pt-1">
                      <span>seed: {stage.seed}</span>
                      <span>model: {stage.modelVersion}</span>
                      <span>hash: {stage.checkpointHash}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassSurface>
        </div>
      )}

      {/* Invite to Brief Modal */}
      {showInviteModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <GlassSurface
            tier="thick"
            radius="24"
            className="w-full max-w-md p-6 shadow-2xl space-y-4 border border-white/20"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MacTrafficLights onClose={() => setShowInviteModal(false)} />
                <h3 className="text-sm font-semibold text-white ml-2">Invite to Open Brief</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-content-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-content-muted leading-relaxed font-light">
              Select one of your active campaigns to invite <strong>{currentItem.creator.name}</strong> ({currentItem.creator.handle}) to pitch.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Direct invite sent to ${currentItem.creator.name}!`);
                  setShowInviteModal(false);
                }}
                className="w-full p-3.5 rounded-2xl glass-thin border border-white/10 hover:border-[#D8FD38] text-left text-xs transition-colors"
              >
                <div className="font-semibold text-white">Pulse Energy 2026: Hyper-Speed Social Shorts</div>
                <div className="text-[11px] font-mono text-accent">$4,000 - $8,000 USD • Delivery: 15 days</div>
              </button>
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  );
}
