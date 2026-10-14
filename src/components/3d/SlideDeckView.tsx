"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import Link from "next/link";

export interface SlideData {
  id: string;
  category: string;
  title: string;
  highlightWord?: string;
  subtitle: string;
  bullets: string[];
  metrics?: { label: string; value: string; badge?: string }[];
  graphicType: "dag" | "metrics" | "clearance" | "network";
}

const DEMO_SLIDES: SlideData[] = [
  {
    id: "slide-1",
    category: "EXECUTIVE VISION // 01",
    title: "The Industrialization of",
    highlightWord: "Generative Cinema",
    subtitle: "Moving beyond random prompting to deterministic ComfyUI workflows and guaranteed commercial clearance.",
    bullets: [
      "Traditional stock platforms cannot guarantee character consistency across scenes.",
      "Generic marketplaces offer zero code provenance or legal clean-room indemnification.",
      "CacheFlow bridges Hollywood directors with reproducible node graph handovers.",
    ],
    metrics: [
      { label: "Pipeline Reproducibility", value: "98.4%", badge: "+14.2%" },
      { label: "Commercial Clearance", value: "100%", badge: "Indemnified" },
      { label: "Active Seed Talent", value: "140+", badge: "Vetted" },
    ],
    graphicType: "dag",
  },
  {
    id: "slide-2",
    category: "PIPELINE MECHANICS // 02",
    title: "Deterministic ComfyUI",
    highlightWord: "DAG Handovers",
    subtitle: "Every frame is tied to an inspectable node topology, custom LoRA weights, and seed coordinates.",
    bullets: [
      "Inspect execution trees down to latent denoisers and control nets before booking.",
      "Direct node graph export into local enterprise rendering clusters.",
      "Zero vendor lock-in with open model checkpoints (FLUX.1 [dev], SDXL, Hunyuan).",
    ],
    metrics: [
      { label: "Avg Node Complexity", value: "14.2 Nodes", badge: "ComfyUI" },
      { label: "Render Time per 4K Frame", value: "1.2s", badge: "H100 Cluster" },
      { label: "Consistency Score", value: "99.1%", badge: "LoRA Locked" },
    ],
    graphicType: "metrics",
  },
  {
    id: "slide-3",
    category: "ENTERPRISE ASSURANCE // 03",
    title: "Legal Clean-Room",
    highlightWord: "Indemnification",
    subtitle: "Enterprise brands commission AI directors with comprehensive copyright warranties and escrow.",
    bullets: [
      "Milestone-locked smart escrow prevents payment release until DAG verification passes.",
      "Automated perceptual similarity screening against protected IP and likenesses.",
      "Full clean-room training provenance logs delivered alongside raw ProRes exports.",
    ],
    metrics: [
      { label: "Enterprise Brands", value: "40 Tier-1", badge: "Onboarded" },
      { label: "Escrow Protection", value: "$2.4M+", badge: "Under Contract" },
      { label: "Dispute Rate", value: "0.02%", badge: "Near Zero" },
    ],
    graphicType: "clearance",
  },
];

export function SlideDeckView() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const slides = DEMO_SLIDES;
  const currentSlide = slides[currentSlideIndex] ?? slides[0]!;

  const goToNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, isFullscreen]);

  // 3D slide transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 800 : -800,
      rotateY: dir > 0 ? 35 : -35,
      z: -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      rotateY: 0,
      z: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -800 : 800,
      rotateY: dir > 0 ? -35 : 35,
      z: -300,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#08090B] p-4 sm:p-10 flex flex-col justify-between"
          : "min-h-[580px] py-8"
      }`}
    >
      {/* Deck macOS Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 rounded-2xl glass-chrome border border-white/10 mb-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <MacTrafficLights />
          <span className="text-[11px] font-mono text-content-muted hidden sm:inline">
            CACHEFLOW_DECK_V2.KEY
          </span>
        </div>

        <div className="text-xs font-mono text-accent">
          SLIDE {String(currentSlideIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-white/10 text-content-muted hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Presenter Mode"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 3D Slide Stage */}
      <div className="relative max-w-5xl mx-auto w-full flex-1 perspective-[1200px] overflow-hidden flex items-center justify-center min-h-[460px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <GlassSurface
              tier="thick"
              radius="32"
              specular
              className="p-8 sm:p-12 border border-white/15 shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient light */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8FD38]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6842]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Category Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono tracking-widest text-accent uppercase flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  {currentSlide.category}
                </span>
                <span className="text-xs font-mono text-content-muted">2026 ROADMAP</span>
              </div>

              {/* Title & Accent Word */}
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight mb-4">
                {currentSlide.title}{" "}
                {currentSlide.highlightWord && (
                  <span className="font-serif italic font-normal text-[#D8FD38]">
                    {currentSlide.highlightWord}
                  </span>
                )}
              </h2>

              <p className="text-sm sm:text-lg text-content-muted font-light max-w-2xl mb-8 leading-relaxed">
                {currentSlide.subtitle}
              </p>

              {/* Two Column Layout: Bullets & Interactive Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
                {/* Left: Bullets with editorial cross marks */}
                <div className="space-y-3.5">
                  <div className="text-[11px] font-mono uppercase text-content-faint">
                    Architectural Pillars:
                  </div>
                  {currentSlide.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-content-primary">
                      <span className="font-mono text-accent text-xs mt-0.5">0{idx + 1} {"//"}</span>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Right: Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
                  {currentSlide.metrics?.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl glass-thin border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-content-muted">{metric.label}</div>
                        <div className="text-xl font-light text-white">{metric.value}</div>
                      </div>
                      {metric.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D8FD38]/15 border border-[#D8FD38]/30 text-[#D8FD38] text-[10px] font-mono">
                          {metric.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Interactive Action */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-content-muted">
                  Use [←] and [→] arrow keys to navigate deck
                </span>
                <Link
                  href="/briefs/new"
                  className="inline-flex items-center gap-2 text-xs font-medium text-white hover:text-accent transition-colors"
                >
                  <span>Launch Brief Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </GlassSurface>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deck Bottom Navigation Controls */}
      <div className="flex items-center justify-between px-6 max-w-5xl mx-auto w-full mt-6">
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-xl glass-regular text-xs text-content-primary hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Slide</span>
        </button>

        {/* Slide Progress Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirection(idx > currentSlideIndex ? 1 : -1);
                setCurrentSlideIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlideIndex === idx ? "w-8 bg-[#D8FD38]" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goToNext}
          disabled={currentSlideIndex === slides.length - 1}
          className="px-4 py-2 rounded-xl glass-regular text-xs text-content-primary hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
        >
          <span>Next Slide</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
