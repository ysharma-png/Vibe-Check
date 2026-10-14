"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Award,
} from "lucide-react";
import { PlatformStats } from "@/lib/data/platform-stats";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { HeroGlassScene } from "@/components/3d/HeroGlassScene";

interface ShowreelMontageProps {
  stats: PlatformStats;
}

const SHOWREEL_ITEMS = [
  {
    id: "amara-1",
    creator: "Amara Okafor",
    role: "Afrofuturistic Director",
    title: "Chronicles of Eko 2077",
    tagline: "Character Consistency • FLUX.1 [dev] + AnimateDiff",
    aspect: "16:9",
    resolution: "4K Master",
    accent: "#D8FD38",
    tool: "ComfyUI DAG #8a2f",
    index: "01",
  },
  {
    id: "minjun-1",
    creator: "Min-Jun Park",
    role: "Cyberpunk Cinematographer",
    title: "Seoul Subterranean Night Market",
    tagline: "Dynamic Camera Motion Control • Runway Gen-3",
    aspect: "9:16",
    resolution: "ProRes 4444",
    accent: "#38F2C7",
    tool: "Topaz Video AI 5",
    index: "02",
  },
  {
    id: "chloe-1",
    creator: "Chloé Bouchard",
    role: "Haute Horlogerie 3D Artist",
    title: "Chronograph Tourbillon Macro",
    tagline: "Photorealistic CAD Integration • Midjourney v6.1",
    aspect: "1:1",
    resolution: "8K UHD Master",
    accent: "#FF6842",
    tool: "Custom LoRA Seed Locked",
    index: "03",
  },
];

export function ShowreelMontage({ stats }: ShowreelMontageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate montage every 6.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SHOWREEL_ITEMS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const activeItem = SHOWREEL_ITEMS[currentIndex] ?? SHOWREEL_ITEMS[0]!;

  return (
    <div className="relative w-full h-full min-h-[560px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 overflow-hidden select-none">
      {/* 3D Real-time Optical Glass Canvas Background */}
      <div className="absolute inset-0 -z-10 opacity-70">
        <HeroGlassScene />
      </div>

      {/* Atmospheric ambient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/60 pointer-events-none -z-10" />

      {/* Top Studio Monograph Banner */}
      <div className="space-y-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 glass-thin backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#D8FD38] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-[#D8FD38] uppercase">
            ENTERPRISE CURATED NETWORK // 2026
          </span>
        </div>

        <div className="space-y-3 max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white leading-[1.12]">
            Where brands hire{" "}
            <span className="font-serif italic font-normal text-[#D8FD38]">
              uncompromising
            </span>{" "}
            AI directors.
          </h1>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed font-light">
            The private marketplace for generative filmmakers, verified ComfyUI node graphs,
            and guaranteed commercial clearance.
          </p>
        </div>

        {/* 3 Curated Benefit Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-white/10 glass-thin text-white/90">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#38F2C7]" />
            <span>Verified DAG Portfolios</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-white/10 glass-thin text-white/90">
            <Sparkles className="h-3.5 w-3.5 text-[#D8FD38]" />
            <span>LoRA Seed Lock</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-white/10 glass-thin text-white/90">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FF6842]" />
            <span>100% Indemnified Clean Room</span>
          </div>
        </div>
      </div>

      {/* Middle Interactive Showreel Montage Frame */}
      <div className="my-8 relative z-10 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassSurface
              tier="thick"
              radius="32"
              specular
              sheen
              className="p-6 sm:p-7 border border-white/15 shadow-2xl relative overflow-hidden group"
            >
              {/* Tape detail for human studio feel */}
              <div className="studio-tape" />

              <div className="relative space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-mono text-[#D8FD38]">
                      {activeItem.index}
                    </span>
                    <div>
                      <h2 className="text-xs font-medium text-white">{activeItem.creator}</h2>
                      <p className="text-[10px] font-mono text-content-muted">{activeItem.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white/80 border border-white/10">
                      {activeItem.aspect}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#38F2C7]/20 text-[#38F2C7] border border-[#38F2C7]/30 flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> {activeItem.resolution}
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-lg sm:text-xl font-light text-white tracking-tight">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-content-muted mt-0.5 font-light">{activeItem.tagline}</p>
                </div>

                {/* Verified Node Toolchain Chip */}
                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/10">
                  <span className="flex items-center gap-1.5 font-mono text-white/80">
                    <Cpu className="h-3 w-3 text-accent" />
                    {activeItem.tool}
                  </span>
                  <span className="text-[#38F2C7] font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Clean-Room DAG
                  </span>
                </div>
              </div>
            </GlassSurface>
          </motion.div>
        </AnimatePresence>

        {/* Floating Glass Badges */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-regular border border-white/15 text-[11px] text-white shadow-xl"
        >
          <Award className="h-3.5 w-3.5 text-[#D8FD38]" />
          <span>Vetted ComfyUI DAG</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-regular border border-white/15 text-[11px] text-white shadow-xl"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#38F2C7]" />
          <span>Deterministic Seed Locked</span>
        </motion.div>

        {/* Scrubber dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {SHOWREEL_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`View ${item.creator}'s showcase`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-7 bg-[#D8FD38]" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Live Platform Stats with Monograph Rules */}
      <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 z-10 text-left">
        <div>
          <div className="text-xl sm:text-2xl font-light text-white tracking-tight">
            {stats.creatorsCount}
          </div>
          <p className="text-[11px] font-mono text-content-muted uppercase">Vetted Creators</p>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-light text-white tracking-tight">
            {stats.pipelinesCount}
          </div>
          <p className="text-[11px] font-mono text-content-muted uppercase">Verified DAGs</p>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-light text-white tracking-tight">
            {stats.deliveredProjectsCount}
          </div>
          <p className="text-[11px] font-mono text-content-muted uppercase">Clearance Deeds</p>
        </div>
      </div>
    </div>
  );
}
