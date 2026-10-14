"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { CreatorProfile, PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { DemoBadge } from "@/components/common/DemoBadge";
import { Avatar } from "@/components/common/Avatar";
import { GlassSurface } from "@/components/glass/GlassSurface";
import Image from "next/image";

interface CreatorCardProps {
  readonly creator: CreatorProfile;
  readonly featuredItem?: PortfolioItem;
  readonly score?: number;
  readonly isFilterActive?: boolean;
  readonly onInspectItem?: (item: PortfolioItem) => void;
}

export function CreatorCard({
  creator,
  featuredItem,
  score,
  isFilterActive,
  onInspectItem,
}: CreatorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width - 0.5) * 2;
    const yPercent = (y / rect.height - 0.5) * 2;

    setTilt({
      rotateX: -yPercent * 6.5,
      rotateY: xPercent * 6.5,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  const gradient = featuredItem?.posterGradient ?? [
    creator.avatarGradient[0],
    creator.avatarGradient[1],
    "#1C1C21",
  ];

  const tools = creator.primaryTools.slice(0, 3).map((id) => {
    const t = getToolById(id);
    return t ? t.name : id;
  });

  const pipelineTeaser = featuredItem?.pipeline.slice(0, 3).map((s) => {
    const t = getToolById(s.toolId);
    return t?.name ?? s.label;
  }) ?? [];

  const handleCardClick = () => {
    if (featuredItem && onInspectItem) {
      onInspectItem(featuredItem);
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      className="card-tilt-stage h-full select-none"
    >
      <motion.div
        animate={
          shouldReduceMotion || isTouch
            ? {}
            : {
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                y: isHovered ? -4 : 0,
              }
        }
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="h-full"
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleCardClick}
      >
        <GlassSurface
          tier="regular"
          radius="24"
          specular
          sheen
          className={`h-full flex flex-col justify-between overflow-hidden cursor-pointer border transition-all duration-300 ${
            isHovered
              ? "border-white/25 shadow-2xl"
              : "border-white/10 shadow-lg"
          }`}
        >
          <div>
            {/* Layered Poster with 3D Depth */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
              {featuredItem?.mediaUrl ? (
                <Image
                  src={featuredItem.mediaUrl}
                  alt={featuredItem.title || `${creator.name}'s work`}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={`/assets/covers/cover-${(creator.specializations[0] || "ai-film")
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, "")}.svg`}
                    alt={`${creator.specializations[0] || "Creative"} banner`}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    unoptimized
                  />
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 60%, ${gradient[2] ?? "#16161A"} 100%)`,
                      opacity: 0.35,
                    }}
                    className="absolute inset-0"
                  />
                </div>
              )}

              {/* Optical vignette gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/40 pointer-events-none" />

              {/* Match score pill */}
              {isFilterActive && typeof score === "number" && (
                <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-black/70 border border-[#D8FD38]/40 text-[#D8FD38] font-mono text-[10px] backdrop-blur-md">
                  {Math.round(score * 100)}% match
                </div>
              )}

              {/* Verified Shield Icon */}
              {creator.verified.commercialLicense && (
                <div
                  title="Verified commercial license & indemnity"
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/70 border border-[#38F2C7]/30 text-[#38F2C7] backdrop-blur-md shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            {/* Core Info (Avatar, Name, Specialty, Tools) */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    name={creator.name}
                    handle={creator.handle}
                    size="sm"
                    gradient={creator.avatarGradient}
                    availability={creator.availability}
                    showStatus
                    isVerified={creator.verified.identity}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {creator.name}
                    </h3>
                    <p className="text-[11px] font-mono text-content-muted truncate">
                      {creator.handle}
                    </p>
                  </div>
                </div>
                <DemoBadge isDemo={creator.is_demo ?? creator.isDemo} variant="inline" />
              </div>

              {/* Specialty */}
              <p className="text-xs text-content-muted truncate font-light">
                {creator.specializations[0] ?? "AI Filmmaking"}
              </p>

              {/* Tools Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tools.map((toolName) => (
                  <span
                    key={toolName}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono text-content-muted glass-thin border border-white/5"
                  >
                    {toolName}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Lift Reveal */}
          <div className="px-4 pb-4 pt-1">
            <div className="h-7 relative overflow-hidden">
              <motion.div
                initial={false}
                animate={{ y: isHovered ? -28 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col h-14 justify-between"
              >
                {/* Default Row */}
                <div className="h-7 flex items-center justify-between text-[11px] font-mono text-content-muted">
                  <span>From ${creator.startingRateUsd.toLocaleString()}</span>
                  <span className="text-[10px] text-content-faint">Inspect →</span>
                </div>

                {/* Hover Revealed Row: Pipeline teaser + Rate */}
                <div className="h-7 flex items-center justify-between text-xs border-t border-white/10 pt-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-content-muted truncate max-w-[170px]">
                    {pipelineTeaser.map((stage, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <span className="truncate">{stage}</span>
                        {sIdx < pipelineTeaser.length - 1 && (
                          <span className="text-content-faint">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#D8FD38] font-mono font-medium shrink-0">
                    <span>${creator.startingRateUsd.toLocaleString()}</span>
                    <ArrowRight className="h-3 w-3 text-[#D8FD38]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </GlassSurface>
      </motion.div>
    </div>
  );
}
