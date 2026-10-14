"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Star,
  ArrowRight,
  Eye,
} from "lucide-react";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { Avatar } from "@/components/common/Avatar";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";
import Image from "next/image";

export function LandingCreatorsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <section className="relative py-28 px-6 border-b border-white/[0.08] bg-[#0E1114]/40 backdrop-blur-xl overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#D8FD38]/5 to-[#38F2C7]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-14 relative z-10">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#D8FD38] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#D8FD38]" />
              <span className="tracking-widest uppercase">Roster of Excellence</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-white tracking-tight leading-[1.08]">
              Featured <span className="font-serif italic font-normal text-[#D8FD38]">Generative Directors</span>
            </h2>

            <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Every director is vetted through deterministic ComfyUI graph audits, verified commercial clearances, and portfolio reproducibility tests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-xs font-mono font-medium text-[#D8FD38] hover:underline mr-4 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All {CREATORS.length}+ Studios</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-20 disabled:pointer-events-none text-white transition-all backdrop-blur-md shadow-glass"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 disabled:opacity-20 disabled:pointer-events-none text-white transition-all backdrop-blur-md shadow-glass"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory focus:outline-none"
          tabIndex={0}
          aria-label="Featured creators carousel"
        >
          {CREATORS.map((creator) => {
            const creatorPortfolio = PORTFOLIO_ITEMS.filter((it) => it.creatorId === creator.id).slice(0, 3);

            return (
              <div
                key={creator.id}
                className="w-[360px] sm:w-[400px] flex-shrink-0 snap-start"
              >
                <GlassSurface
                  tier="regular"
                  rounded="28"
                  className="h-full p-6 flex flex-col justify-between space-y-6 hover:border-[#D8FD38]/40 transition-all duration-300 group shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
                >
                  {/* Top Bar with Traffic Lights & Rating */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <MacTrafficLights size="sm" />
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                      </div>
                    </div>

                    {/* Creator Identity */}
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        name={creator.name}
                        handle={creator.handle}
                        size="lg"
                        gradient={creator.avatarGradient}
                        isVerified={creator.verified.identity}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/creators/${creator.handle.replace("@", "")}`}
                          className="font-display font-semibold text-base text-white group-hover:text-[#D8FD38] transition-colors flex items-center gap-1.5 truncate"
                        >
                          <span className="truncate">{creator.name}</span>
                          {creator.verified.identity && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#38F2C7] shrink-0" />
                          )}
                        </Link>
                        <p className="text-xs font-mono text-white/50 truncate">
                          {creator.handle} • {creator.location}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed font-light">
                      {creator.bio}
                    </p>

                    {/* Tool Badges & DAG Verified Badge */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {creator.primaryTools.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/70"
                        >
                          {tool}
                        </span>
                      ))}
                      {creator.verified.reproduciblePipeline && (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#38F2C7]/10 text-[#38F2C7] border border-[#38F2C7]/25 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          DAG Verified
                        </span>
                      )}
                    </div>

                    {/* Top 3 Portfolio Thumbnails */}
                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {creatorPortfolio.map((item, itemIdx) => (
                        <Link
                          key={item.id}
                          href={`/creators/${creator.handle.replace("@", "")}`}
                          className="aspect-square rounded-xl overflow-hidden relative group/thumb border border-white/10 hover:border-[#D8FD38]/60 transition-all shadow-inner"
                          title={item.title}
                        >
                          <Image
                            src={`/assets/thumbnails/thumb-${(((itemIdx + 1)).toString().padStart(3, "0"))}.svg`}
                            alt={item.title}
                            fill
                            sizes="110px"
                            className="object-cover transition-transform group-hover/thumb:scale-105"
                            unoptimized
                          />
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white drop-shadow-md" />
                          </span>
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/70 text-white/90 px-1 py-0.5 rounded z-10 block backdrop-blur-sm">
                            {item.aspectRatio}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Rate & Action */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-white/40 block">Starting At</span>
                      <span className="text-sm font-display font-semibold text-white">
                        ${creator.startingRateUsd.toLocaleString()}{" "}
                        <span className="text-[10px] font-mono font-normal text-white/50">/ proj</span>
                      </span>
                    </div>

                    <Link
                      href={`/creators/${creator.handle.replace("@", "")}`}
                      className="px-4 py-2 rounded-xl bg-[#D8FD38] text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(216,253,56,0.4)] transition-all font-sans"
                    >
                      View Studio &rarr;
                    </Link>
                  </div>
                </GlassSurface>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
