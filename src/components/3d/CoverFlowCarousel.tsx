"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PortfolioItem } from "@/types/schema";
import { GlassSurface } from "@/components/glass/GlassSurface";

interface CoverFlowCarouselProps {
  items: readonly PortfolioItem[] | PortfolioItem[];
  onSelectItem?: (item: PortfolioItem) => void;
  className?: string;
}

export function CoverFlowCarousel({
  items,
  onSelectItem,
  className = "",
}: CoverFlowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const currentItem = items[activeIndex] ?? items[0]!;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`relative w-full max-w-6xl mx-auto py-8 select-none ${className}`}>
      {/* 3D Coverflow Perspective Stage */}
      <div className="relative h-[440px] sm:h-[500px] flex items-center justify-center perspective-[1200px] overflow-hidden">
        {items.map((item, index) => {
          const offset = index - activeIndex;
          const isActive = index === activeIndex;

          // Limit rendering range for performance
          if (Math.abs(offset) > 3) return null;

          const translateX = offset * 240;
          const rotateY = offset * -28;
          const translateZ = -Math.abs(offset) * 160;
          const opacity = Math.abs(offset) > 2 ? 0.2 : Math.abs(offset) === 2 ? 0.5 : Math.abs(offset) === 1 ? 0.8 : 1;
          const zIndex = 20 - Math.abs(offset);

          return (
            <motion.div
              key={item.id}
              onClick={() => {
                if (isActive && onSelectItem) onSelectItem(item);
                else setActiveIndex(index);
              }}
              animate={{
                x: translateX,
                rotateY: rotateY,
                z: translateZ,
                opacity: opacity,
                scale: isActive ? 1.05 : 0.9,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 26,
              }}
              style={{
                position: "absolute",
                zIndex,
                transformStyle: "preserve-3d",
              }}
              className="w-[280px] sm:w-[360px] md:w-[420px] aspect-[4/5] cursor-pointer group"
            >
              <GlassSurface
                tier={isActive ? "thick" : "regular"}
                radius="24"
                specular={isActive}
                sheen={isActive}
                className={`h-full w-full p-4 flex flex-col justify-between overflow-hidden transition-all duration-300 border ${
                  isActive ? "border-[#D8FD38]/40 shadow-2xl" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Media frame */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 mb-4">
                  {item.mediaUrl ? (
                    <Image
                      src={item.mediaUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 300px, 420px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: item.posterGradient
                          ? `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]})`
                          : "linear-gradient(135deg, #1f2937, #111827)",
                      }}
                    >
                      <Sparkles className="h-6 w-6 text-[#D8FD38]/60" />
                    </div>
                  )}

                  {/* Aspect tag */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                    {item.aspectRatio ?? "16:9"}
                  </span>

                  {item.reproducibility?.kind === "verified_deterministic" && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#38F2C7]/20 border border-[#38F2C7]/30 text-[#38F2C7] text-[10px] font-medium flex items-center gap-1 backdrop-blur-md">
                      <CheckCircle2 className="h-3 w-3" />
                      DAG
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                  <div className="text-[10px] font-mono text-white/50 flex items-center justify-between">
                    <span>{item.creatorId}</span>
                    <span className="uppercase">{item.deliverableType}</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-white truncate group-hover:text-[#D8FD38] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2">
                    {item.description || "Deterministic generative pipeline output."}
                  </p>
                </div>

                {/* Bottom inspect link */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-accent">
                    INDEX {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-white/80 group-hover:text-white flex items-center gap-1">
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </GlassSurface>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="p-3 rounded-2xl glass-regular hover:bg-white/10 text-content-primary hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dots progress indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-thin border border-white/10">
          {items.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? "w-6 bg-[#D8FD38]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="p-3 rounded-2xl glass-regular hover:bg-white/10 text-content-primary hover:text-white border border-white/10 transition-all hover:scale-105 active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
