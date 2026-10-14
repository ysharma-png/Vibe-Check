"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { Avatar } from "@/components/common/Avatar";
import { HeroGlassScene } from "@/components/3d/HeroGlassScene";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import { MagneticButton } from "@/components/common/MagneticButton";
import Image from "next/image";

const SHOWREEL_WORKS = [
  {
    id: "showreel-1",
    creatorName: "Amara Okafor",
    creatorHandle: "@amara_flow",
    creatorRole: "AI Filmmaker & LoRA Specialist",
    title: "Chronicles of Eko 2077 - Cyber-Lagos Pilot",
    tagline: "Character Consistency • FLUX.1 [dev] + AnimateDiff",
    aspectRatio: "16:9",
    resolution: "4K Master",
    duration: "0:45",
    gradient: ["#08090B", "#16281E", "#0E1C14"],
    pipelineNodes: 14,
    reproducibilityScore: 98,
    style: "Afrofuturistic Sci-Fi",
  },
  {
    id: "showreel-2",
    creatorName: "Min-Jun Park",
    creatorHandle: "@minjun_seoul",
    creatorRole: "Camera Motion Specialist",
    title: "Subterranean Neon Night Market",
    tagline: "Dynamic Dolly & Orbit • Runway Gen-3 + Topaz 60fps",
    aspectRatio: "9:16",
    resolution: "ProRes 4444",
    duration: "0:30",
    gradient: ["#08090B", "#0E2428", "#08161A"],
    pipelineNodes: 11,
    reproducibilityScore: 95,
    style: "Cyberpunk Cinematic",
  },
  {
    id: "showreel-3",
    creatorName: "Chloé Bouchard",
    creatorHandle: "@chloe_paris",
    creatorRole: "Haute Luxury 3D Visualizer",
    title: "Luminescence Tourbillon Macro",
    tagline: "Macro Photorealism • Midjourney v6.1 + Custom LoRA",
    aspectRatio: "1:1",
    resolution: "8K UHD",
    duration: "0:25",
    gradient: ["#08090B", "#261712", "#180F0C"],
    pipelineNodes: 9,
    reproducibilityScore: 94,
    style: "Luxury Product Commercial",
  },
  {
    id: "showreel-4",
    creatorName: "Kenji Sato",
    creatorHandle: "@kenji_tokyo",
    creatorRole: "3D Gaussian Splatting Director",
    title: "Tokyo Rainy Drift Sequence",
    tagline: "3D Camera Splats • NeRF + Stable Video Diffusion",
    aspectRatio: "2.39:1",
    resolution: "4K DCI",
    duration: "0:38",
    gradient: ["#08090B", "#121724", "#0D111A"],
    pipelineNodes: 16,
    reproducibilityScore: 99,
    style: "Hyper-Real Urban Drift",
  },
];

const SEARCH_PRESETS = [
  { label: "FLUX.1 [dev]", query: "flux" },
  { label: "ComfyUI DAG", query: "comfy" },
  { label: "Runway Gen-3", query: "runway" },
  { label: "Consistent Character", query: "character" },
  { label: "9:16 Social Video", query: "9:16" },
  { label: "4K Photoreal", query: "photoreal" },
];

export function LandingHero() {
  const router = useRouter();
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeReel = SHOWREEL_WORKS[activeReelIndex] ?? SHOWREEL_WORKS[0]!;

  // Auto-advance showreel every 6 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveReelIndex((prev) => (prev + 1) % SHOWREEL_WORKS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Filtered creators for live search dropdown
  const filteredCreators = searchQuery.trim()
    ? CREATORS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.primaryTools.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          c.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 4)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/about?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/about");
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-white/10 bg-[#08090B]">
      {/* 3D Real-time Spatial Glass Canvas */}
      <HeroGlassScene className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />

      {/* Atmospheric Aurora Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-[#D8FD38]/10 rounded-full blur-[140px]" />
        <div className="absolute -top-32 right-1/4 w-[450px] h-[450px] bg-[#38F2C7]/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 space-y-16">
        {/* ========================================================= */}
        {/* Top Announcement Pill & Main Headlines                     */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex"
          >
            <GlassSurface
              tier="thin"
              rounded="32"
              className="inline-flex items-center gap-2.5 px-4 py-1.5 border-[#D8FD38]/30 bg-[#D8FD38]/10 text-xs font-mono text-[#D8FD38] shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8FD38] animate-ping" />
              <span>AI-Native Director Atelier</span>
              <span className="text-white/30">•</span>
              <span className="text-white/60">Deterministic ComfyUI Handover</span>
            </GlassSurface>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-light tracking-tight text-white leading-[1.08]"
          >
            Hire elite <span className="font-serif italic font-normal text-[#D8FD38]">generative directors</span> with verified pipelines.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed"
          >
            The enterprise atelier for commercial generative video. Inspect ComfyUI node graphs, character-consistent LoRAs, and guaranteed commercial indemnity before you commit.
          </motion.p>

          {/* Dual CTAs with Magnetic Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <MagneticButton strength={0.25}>
              <Link
                href="/signup?role=brand"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#D8FD38] hover:bg-[#D8FD38]/90 text-black font-semibold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#D8FD38]/25 transition-all group"
              >
                <span>Hire AI Creators</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={0.25}>
              <Link
                href="/signup?role=creator"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium text-sm flex items-center justify-center gap-2.5 backdrop-blur-xl transition-all shadow-sm"
              >
                <span>Join as a Creator</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/30">
                  Monetize DAGs
                </span>
              </Link>
            </MagneticButton>
          </motion.div>

          {/* Interactive Live Search Bar with Instant Presets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-2xl mx-auto pt-4"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <GlassSurface tier="regular" rounded="24" className="relative flex items-center p-1.5 border-white/10 shadow-2xl">
                <Search className="ml-3 h-4 w-4 text-white/50 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by tool (FLUX.1, ComfyUI, Runway), style, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                  className="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:bg-[#D8FD38]/90 transition-all shrink-0 shadow-md shadow-[#D8FD38]/20"
                >
                  Search
                </button>
              </GlassSurface>

              {/* Instant Search Dropdown Results */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl border border-white/10 bg-[#0E1114]/95 shadow-2xl backdrop-blur-2xl z-30 text-left space-y-2"
                  >
                    <div className="text-[10px] uppercase font-mono text-white/40 px-2">
                      Matching Verified Creators:
                    </div>
                    {filteredCreators.length > 0 ? (
                      <div className="space-y-1">
                        {filteredCreators.map((creator) => (
                          <Link
                            key={creator.id}
                            href={`/creators/${creator.handle.replace("@", "")}`}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] transition-colors group"
                          >
                            <span className="flex items-center gap-2.5">
                              <Avatar
                                name={creator.name}
                                handle={creator.handle}
                                size="xs"
                                gradient={creator.avatarGradient}
                              />
                              <span className="block">
                                <span className="text-xs font-medium text-white group-hover:text-[#D8FD38] transition-colors flex items-center gap-1.5">
                                  <span>{creator.name}</span>
                                  <span className="text-[10px] text-white/50">{creator.handle}</span>
                                </span>
                                <span className="text-[10px] text-white/40 block">
                                  {creator.specializations.slice(0, 2).join(" • ")}
                                </span>
                              </span>
                            </span>
                            <span className="text-[11px] text-[#D8FD38] font-mono font-medium flex items-center gap-1">
                              From ${creator.startingRateUsd}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-white/50">
                        No exact match for &quot;{searchQuery}&quot;. Press Enter to explore all discovery filters.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Quick Presets Filter Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="text-[11px] text-white/50 font-mono uppercase tracking-wider mr-1">
                Trending:
              </span>
              {SEARCH_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(preset.query);
                    router.push(`/about?search=${encodeURIComponent(preset.query)}`);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-[11px] text-white/60 hover:text-white transition-all font-mono"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* Cinematic Autoplaying Showreel Showcase Stage             */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <GlassSurface tier="thick" rounded="32" className="overflow-hidden border-white/15 shadow-2xl group">
            {/* Top Video Player Bar with Traffic Lights */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-white/[0.03] text-xs">
              <div className="flex items-center gap-4">
                <MacTrafficLights title="cacheflow_master_reel_4k.mov" />
                <span className="flex items-center gap-1.5 text-[#38F2C7] font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-[#38F2C7] animate-ping" />
                  LIVE REPRODUCIBLE SHOWREEL
                </span>
                <span className="text-white/30 hidden sm:inline">|</span>
                <span className="text-white/60 hidden sm:inline font-mono text-[11px]">
                  {activeReel.style}
                </span>
              </div>

              {/* Video Controls Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:text-white transition-colors"
                  title={isPlaying ? "Pause Montage" : "Play Montage"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:text-white transition-colors"
                  title={isMuted ? "Unmute Preview" : "Mute Preview"}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Main Visual Stage */}
            <div
              className="relative aspect-video w-full transition-all duration-700 flex flex-col justify-between p-6 sm:p-10"
              style={{
                background: `linear-gradient(135deg, ${activeReel.gradient[0]}, ${activeReel.gradient[1]}, ${activeReel.gradient[2]})`,
              }}
            >
              {/* Refractive Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 pointer-events-none" />

              {/* Top Stage Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                    {activeReel.aspectRatio} • {activeReel.resolution}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#38F2C7]/15 backdrop-blur-md border border-[#38F2C7]/30 text-[11px] font-mono text-[#38F2C7] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {activeReel.reproducibilityScore}% Deterministic DAG
                  </span>
                </div>

                <span className="text-[11px] font-mono text-white/60 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  {activeReel.duration} runtime
                </span>
              </div>

              {/* Center Cinematic Title Overlay */}
              <div className="relative z-10 max-w-xl space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs text-[#D8FD38] font-mono font-medium">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{activeReel.pipelineNodes} Stage ComfyUI Graph Handover</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-medium text-white tracking-tight drop-shadow-md">
                  {activeReel.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-light">
                  {activeReel.tagline}
                </p>
              </div>

              {/* Bottom Creator Attribution & Profile Deep Link */}
              <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-1.5">
                    <span>Directed by {activeReel.creatorName}</span>
                    <span className="text-xs text-white/60 font-mono">({activeReel.creatorHandle})</span>
                  </div>
                  <div className="text-[11px] text-white/60">{activeReel.creatorRole}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/creators/${activeReel.creatorHandle.replace("@", "")}`}
                    className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-[#D8FD38] transition-colors flex items-center gap-1.5 shadow-md font-mono"
                  >
                    <span>Inspect Pipeline</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Reel Carousel Selector Tabs */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02] grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SHOWREEL_WORKS.map((reel, idx) => (
                <button
                  key={reel.id}
                  type="button"
                  onClick={() => {
                    setActiveReelIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    activeReelIndex === idx
                      ? "border-[#D8FD38]/50 bg-white/[0.08] shadow-md shadow-[#D8FD38]/10 text-white"
                      : "border-transparent hover:bg-white/[0.04] text-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-white/40">0{idx + 1}</span>
                    {activeReelIndex === idx && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D8FD38] animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-white truncate">{reel.creatorName}</div>
                  <div className="text-[10px] text-white/50 truncate font-mono">{reel.style}</div>
                </button>
              ))}
            </div>
          </GlassSurface>
        </motion.div>
      </div>
    </section>
  );
}
