"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Zap,
  Bookmark,
  Share2,
  ArrowRight,
  Check,
  Sparkles,
  Cpu,
} from "lucide-react";
import { CreatorProfile } from "@/types/schema";
import { FollowButton } from "@/components/creator/FollowButton";
import { DemoBadge } from "@/components/common/DemoBadge";
import { DiscoveredCreatorBanner } from "./DiscoveredCreatorBanner";
import { Avatar } from "@/components/common/Avatar";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MagneticButton } from "@/components/common/MagneticButton";
import Image from "next/image";

interface ProfileHeroProps {
  readonly creator: CreatorProfile;
}

export function ProfileHero({ creator }: ProfileHeroProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const isClaimed = creator.isClaimed !== false && creator.claimStatus !== "unclaimed";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <GlassSurface
      tier="thick"
      rounded="32"
      className="relative overflow-hidden border border-white/10 shadow-2xl"
    >
      {/* 1. Cinematic Ambient Cover Banner */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black/60">
        <Image
          src={`/assets/covers/cover-${(creator.specializations[0] || "ai-film")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}.svg`}
          alt={`${creator.name}'s studio cover`}
          fill
          priority
          className="object-cover opacity-70 filter saturate-[1.2] contrast-[1.05]"
          unoptimized
        />
        <div
          className="absolute inset-0 opacity-50 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${creator.avatarGradient[0]} 0%, transparent 65%), linear-gradient(135deg, ${creator.avatarGradient[1]} 0%, transparent 70%)`,
          }}
        />
        {/* Optical Glass Depth Gradient & Noise */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/60 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Main Profile Content */}
      <div className="relative px-6 sm:px-10 pb-8 pt-0">
        {!isClaimed && <DiscoveredCreatorBanner creator={creator} />}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          {/* Avatar + Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Unified Reusable Avatar with Glass Halo */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent/30 via-accent-coral/20 to-accent-cyan/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <Avatar
                name={creator.name}
                handle={creator.handle}
                size="2xl"
                gradient={creator.avatarGradient}
                availability={isClaimed ? creator.availability : undefined}
                showStatus={isClaimed}
                isVerified={creator.verified.identity}
                className="relative shadow-2xl ring-4 ring-[#08090B]/80"
              />
            </div>

            {/* Name, Handle, Headline */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white flex items-center gap-2">
                  <span>{creator.name}</span>
                </h1>
                <span className="text-xs text-white/50 font-mono tracking-tight">
                  @{creator.handle}
                </span>

                {/* Availability Pill (Claimed only) */}
                {isClaimed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {creator.availability === "open"
                      ? "Available for Q4"
                      : `${creator.availability} availability`}
                  </span>
                )}

                {/* Subtle Demo Profile Badge */}
                <DemoBadge isDemo={creator.is_demo ?? creator.isDemo} />
              </div>

              {/* Verified Badges Row (Claimed only) */}
              {isClaimed && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {creator.verified.commercialLicense && (
                    <span
                      title="100% Commercial Copyright Indemnified Workflows"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/25 backdrop-blur-md"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Commercial Verified</span>
                    </span>
                  )}
                  {creator.verified.reproduciblePipeline && (
                    <span
                      title="Reproducible ComfyUI DAGs with RNG seeds & hashes"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono bg-accent/10 text-accent border border-accent/25 backdrop-blur-md"
                    >
                      <Cpu className="h-3.5 w-3.5 text-accent" />
                      <span>Deterministic Pipeline</span>
                    </span>
                  )}
                  {creator.verified.identity && (
                    <span
                      title="Stripe & Identity Verified Professional"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono bg-white/5 text-white/70 border border-white/10 backdrop-blur-md"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>ID Verified</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Follow, Save, Share, Invite to Brief */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0">
            {isClaimed && <FollowButton creatorId={creator.id} />}

            <button
              type="button"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-medium transition-all backdrop-blur-md ${
                isSaved
                  ? "bg-accent/20 border-accent/40 text-accent shadow-glow-lime"
                  : "bg-white/[0.04] border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-accent" : ""}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white/70 hover:text-white transition-all backdrop-blur-md"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {isClaimed && (
              <Link href={`/briefs/new?creator=${creator.id}`}>
                <MagneticButton variant="primary" size="md">
                  <span>Invite to brief</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </MagneticButton>
              </Link>
            )}
          </div>
        </div>

        {/* 3. Bio & Metadata Summary */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
          <p className="text-xs sm:text-sm text-white/85 max-w-3xl leading-relaxed font-light">
            {creator.bio}
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-white/50 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/30" />
              <span>{creator.location}</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-white/30" />
              <span>{creator.timezone}</span>
            </span>
            {isClaimed && (
              <>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5 text-accent">
                  <Zap className="h-3.5 w-3.5" />
                  <span>&lt; 2h avg response</span>
                </span>
                <span className="text-white/20">•</span>
                <span className="font-medium text-white">
                  From ${creator.startingRateUsd.toLocaleString()} / project
                </span>
              </>
            )}
          </div>

          {/* Quick Stats Grid (Claimed only) - Frosted Glass Docks */}
          {isClaimed && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md group hover:border-white/20 transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">
                  Projects Completed
                </span>
                <span className="text-base font-semibold font-mono text-white mt-1 block">
                  {creator.stats.projectsCompleted} verified
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md group hover:border-emerald-500/30 transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">
                  On-Time Delivery
                </span>
                <span className="text-base font-semibold font-mono text-emerald-400 mt-1 block">
                  {Math.round(creator.stats.onTimeRate * 100)}%
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md group hover:border-white/20 transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">
                  Avg. Turnaround
                </span>
                <span className="text-base font-semibold font-mono text-white mt-1 block">
                  {creator.stats.avgTurnaroundDays} days
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md group hover:border-accent/30 transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">
                  Repeat Client Rate
                </span>
                <span className="text-base font-semibold font-mono text-accent mt-1 block">
                  {Math.round(creator.stats.repeatClientRate * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}
