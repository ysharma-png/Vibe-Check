"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Award,
  EyeOff,
  Bookmark,
  Share2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Filter,
  UserCheck,
  UserPlus,
  RefreshCw,
  Zap,
  Clock,
  DollarSign,
  ChevronRight,
  Cpu,
} from "lucide-react";
import {
  getCreatorPersonalizedFeed,
  getBrandPersonalizedFeed,
  dismissFeedItem,
  PersonalizedCreatorFeed,
  PersonalizedBrandFeed,
} from "@/lib/engagement/store";
import { SaveToBoardModal } from "@/components/boards/SaveToBoardModal";
import { FollowButton } from "@/components/creator/FollowButton";
import { Avatar } from "@/components/common/Avatar";
import { BrandLogo } from "@/components/common/BrandLogo";
import { EmptyBriefsIllustration } from "@/components/common/illustrations/EmptyIllustrations";
import Image from "next/image";
import { CreatorLevelCard } from "@/components/creator/CreatorLevelCard";
import { getCreatorGamificationByHandle } from "@/lib/engagement/store";
import { trackEvent } from "@/lib/engagement/analytics";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { GlassTiltCard } from "@/components/glass/GlassTiltCard";
import { MacSegmentedControl } from "@/components/glass/MacSegmentedControl";

interface HomeFeedClientProps {
  initialRole?: string;
  userName?: string;
  userHandle?: string;
}

export function HomeFeedClient({ initialRole = "creator", userName = "Alex Rivera", userHandle = "alex_rivera" }: HomeFeedClientProps) {
  const [role, setRole] = useState<"creator" | "brand">(() => {
    return initialRole === "brand" ? "brand" : "creator";
  });
  const [loading, setLoading] = useState(false);
  const [creatorFeed, setCreatorFeed] = useState<PersonalizedCreatorFeed | null>(() => {
    return initialRole === "brand" ? null : getCreatorPersonalizedFeed(userHandle);
  });
  const [brandFeed, setBrandFeed] = useState<PersonalizedBrandFeed | null>(() => {
    return initialRole === "brand" ? getBrandPersonalizedFeed() : null;
  });
  const [visibleCount, setVisibleCount] = useState(4);
  const [saveModalItem, setSaveModalItem] = useState<{
    itemType: "portfolio_item" | "creator" | "brief";
    itemId: string;
    title: string;
    subtitle: string;
    gradient: readonly string[];
  } | null>(null);

  useEffect(() => {
    if (role === "creator") {
      setCreatorFeed(getCreatorPersonalizedFeed(userHandle));
    } else {
      setBrandFeed(getBrandPersonalizedFeed());
    }
    trackEvent("feed_viewed", { metadata: { role } });
  }, [role, userHandle]);

  const handleDismissBrief = (briefId: string) => {
    dismissFeedItem("brief", briefId);
    if (creatorFeed) {
      setCreatorFeed({
        ...creatorFeed,
        matchedBriefs: creatorFeed.matchedBriefs.filter((b) => b.id !== briefId),
        newBriefsThisWeek: creatorFeed.newBriefsThisWeek.filter((b) => b.id !== briefId),
      });
    }
  };

  const handleDismissCreator = (creatorId: string) => {
    dismissFeedItem("creator", creatorId);
    if (brandFeed) {
      setBrandFeed({
        ...brandFeed,
        recommendedCreators: brandFeed.recommendedCreators.filter((c) => c.id !== creatorId),
      });
    }
  };

  const gamification = getCreatorGamificationByHandle(userHandle);

  return (
    <div className="min-h-screen bg-background text-content-primary pb-24 selection:bg-accent/20">
      {/* Hero Welcome & Role Persona Switcher with Glass Chrome */}
      <div className="border-b border-white/10 glass-chrome">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D8FD38] shadow-[0_0_8px_rgba(216,253,56,0.6)] animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-[#D8FD38]">
                STUDIO INTELLIGENCE FEED // 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Welcome back, <span className="font-serif italic font-normal text-white">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-content-muted font-light max-w-lg">
              {role === "creator"
                ? "Scored brief matches, verified ComfyUI DAG workflows, and active prize sprints."
                : "Matched generative creators, indemnified pipeline talent, and network activity."}
            </p>
          </div>

          {/* Perspective Switcher */}
          <div className="self-start md:self-auto">
            <MacSegmentedControl
              options={[
                { value: "creator", label: "Creator Studio" },
                { value: "brand", label: "Brand Hub" },
              ]}
              value={role}
              onChange={(val) => setRole(val as "creator" | "brand")}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-44 rounded-3xl glass-thin" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 rounded-3xl glass-thin" />
              <div className="h-64 rounded-3xl glass-thin" />
            </div>
          </div>
        ) : role === "creator" && creatorFeed ? (
          /* ================================================================= */
          /* CREATOR FEED                                                     */
          /* ================================================================= */
          <div className="space-y-14">
            {/* Creator Gamification Card */}
            <CreatorLevelCard gamification={gamification} />

            {/* SECTION 1: Matched Creative Briefs */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D8FD38]">01 // MATCHED</span>
                  <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                    Briefs Matching Your Pipeline
                  </h2>
                  <p className="text-xs text-content-muted font-light">
                    Calculated from ComfyUI reproducibility, required engines, and day rate fit.
                  </p>
                </div>
                <Link
                  href="/briefs"
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <span>Explore all briefs</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {creatorFeed.matchedBriefs.length === 0 ? (
                <GlassSurface tier="regular" radius="32" className="p-10 text-center space-y-4">
                  <EmptyBriefsIllustration className="w-48 h-36 mx-auto" />
                  <div>
                    <h3 className="text-sm font-medium text-white">No active briefs matching your filters</h3>
                    <p className="text-xs text-content-muted max-w-md mx-auto mt-1 font-light">
                      You have reviewed or dismissed all current matches. Adjust your primary tools in Settings or explore public campaigns.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCreatorFeed(getCreatorPersonalizedFeed(userHandle))}
                      className="px-4 py-2 rounded-xl bg-[#D8FD38] text-[#08090B] text-xs font-semibold"
                    >
                      Reset Feed Dismissals
                    </button>
                    <Link
                      href="/settings"
                      className="px-4 py-2 rounded-xl glass-thin text-xs text-content-primary hover:text-white"
                    >
                      Update Profile Tools
                    </Link>
                  </div>
                </GlassSurface>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {creatorFeed.matchedBriefs.slice(0, visibleCount).map((brief, idx) => (
                    <GlassTiltCard
                      key={brief.id}
                      tier="regular"
                      radius="24"
                      maxTilt={6}
                      className="p-6 flex flex-col justify-between space-y-4 group"
                    >
                      {/* Tape detail for human studio feel */}
                      {idx === 0 && <div className="studio-tape" />}

                      <div className="space-y-3">
                        {/* Top Match Score & Action Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#D8FD38]/15 text-[#D8FD38] border border-[#D8FD38]/30 shadow-sm flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3" />
                              {brief.matchScore}% Match
                            </span>
                            {brief.isNewThisWeek && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#38F2C7]/15 text-[#38F2C7] border border-[#38F2C7]/30">
                                Fresh
                              </span>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSaveModalItem({
                                  itemType: "brief",
                                  itemId: brief.id,
                                  title: brief.campaignTitle,
                                  subtitle: brief.brandName,
                                  gradient: ["#1e1b4b", "#065f46"],
                                })
                              }
                              className="p-1.5 rounded-lg text-content-muted hover:text-white glass-thin transition-colors"
                              title="Save to board"
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDismissBrief(brief.id)}
                              className="p-1.5 rounded-lg text-content-muted hover:text-rose-400 glass-thin transition-colors"
                              title="Dismiss brief"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Brand */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BrandLogo brandName={brief.brandName} size="xs" />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted">
                              {brief.brandName}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-white group-hover:text-accent transition-colors">
                            {brief.campaignTitle}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-content-muted line-clamp-2 leading-relaxed font-light">
                          {brief.description}
                        </p>

                        {/* Match Reasons Tags */}
                        {brief.matchReasons.length > 0 && (
                          <div className="p-3 rounded-xl glass-thin border border-white/5 space-y-1">
                            <div className="text-[9px] font-mono uppercase text-content-faint">
                              Determinism Rationale:
                            </div>
                            <div className="space-y-1">
                              {brief.matchReasons.slice(0, 2).map((reason, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1.5 text-[11px] text-content-muted">
                                  <CheckCircle2 className="h-3 w-3 text-[#38F2C7] flex-shrink-0" />
                                  <span className="truncate">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Budget & Link */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-white font-medium">
                            ${brief.budgetMin.toLocaleString()} - ${brief.budgetMax.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-content-muted">• {brief.aspectRatios[0]}</span>
                        </div>
                        <Link
                          href={`/briefs`}
                          className="px-4 py-1.5 rounded-xl bg-[#D8FD38] text-[#08090B] text-xs font-semibold hover:bg-[#E5FF66] transition-colors shadow-sm"
                        >
                          Submit Pitch →
                        </Link>
                      </div>
                    </GlassTiltCard>
                  ))}
                </div>
              )}

              {creatorFeed.matchedBriefs.length > visibleCount && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 4)}
                    className="px-6 py-2.5 rounded-2xl glass-regular hover:bg-white/10 text-xs font-mono text-content-primary hover:text-white transition-colors"
                  >
                    Load More Matches
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 2: Trending ComfyUI Workflows */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#38F2C7]">02 // PROVENANCE</span>
                  <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                    Trending ComfyUI DAGs
                  </h2>
                  <p className="text-xs text-content-muted font-light">
                    Reproducible graph handovers verified by clean-room determinism tests.
                  </p>
                </div>
                <Link
                  href="/showcase"
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <span>Explore Showcase</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {creatorFeed.trendingWorkflows.map((item, wIdx) => (
                  <Link
                    key={item.id}
                    href="/showcase"
                    className="group"
                  >
                    <GlassSurface tier="regular" radius="24" sheen className="p-4 h-full flex flex-col justify-between">
                      <div>
                        <div
                          className="h-28 w-full rounded-xl mb-3 flex items-end p-2.5 relative overflow-hidden border border-white/10"
                          style={{
                            background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]})`,
                          }}
                        >
                          <span className="text-[10px] font-mono bg-black/70 text-[#38F2C7] backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                            {item.reproducibilityScore}% DAG
                          </span>
                        </div>
                        <h4 className="text-xs font-medium text-white truncate group-hover:text-accent transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] font-mono text-content-muted truncate mt-0.5">
                          by {item.creatorName}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-content-faint mt-3">
                        <span>{item.stagesCount} Nodes</span>
                        <span>{item.viewCount} Views</span>
                      </div>
                    </GlassSurface>
                  </Link>
                ))}
              </div>
            </section>

            {/* SECTION 3: Sponsored Challenges */}
            <section className="space-y-6">
              <div className="border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#FF6842]">03 // SPRINTS</span>
                <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                  Sponsored Challenges &amp; Prize Pools
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creatorFeed.challenges.map((c) => (
                  <GlassSurface
                    key={c.id}
                    tier="thick"
                    radius="24"
                    className="p-6 space-y-4 flex flex-col justify-between border-amber-500/20"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF6842] bg-[#FF6842]/15 px-2.5 py-0.5 rounded-full border border-[#FF6842]/30">
                          {c.tag}
                        </span>
                        <span className="text-xs font-mono text-content-muted">{c.deadline}</span>
                      </div>
                      <h3 className="text-base font-medium text-white">{c.title}</h3>
                      <p className="text-xs text-content-muted leading-relaxed font-light">{c.description}</p>
                      <div className="pt-1 text-xs text-[#FF6842] font-mono flex items-center gap-2">
                        <span>Prize: {c.prizePool}</span>
                        <span>• Engine: {c.toolRequirement}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-content-muted">Sponsor: {c.sponsor}</span>
                      <button
                        type="button"
                        onClick={() => alert(`Entered challenge: ${c.title}`)}
                        className="px-4 py-1.5 rounded-xl bg-[#FF6842] text-white text-xs font-semibold hover:bg-[#FF8261] transition-colors"
                      >
                        Join Sprint
                      </button>
                    </div>
                  </GlassSurface>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* ================================================================= */
          /* BRAND FEED                                                        */
          /* ================================================================= */
          brandFeed && (
            <div className="space-y-14">
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#D8FD38]">TALENT MATCH</span>
                    <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                      Recommended Creators for Your Active Campaigns
                    </h2>
                    <p className="text-xs text-content-muted font-light">
                      Matched to your open briefs based on commercial license audit and prompt consistency.
                    </p>
                  </div>
                  <Link
                    href="/briefs/new"
                    className="text-xs font-mono text-[#D8FD38] hover:underline flex items-center gap-1"
                  >
                    <span>+ Post new brief</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brandFeed.recommendedCreators.map((creator) => (
                    <GlassTiltCard
                      key={creator.id}
                      tier="regular"
                      radius="24"
                      maxTilt={6}
                      className="p-6 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
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
                              showStatus
                              availability="open"
                            />
                            <span className="block">
                              <span className="text-sm font-medium text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
                                <span>{creator.name}</span>
                                <span className="text-[10px] font-mono text-[#D8FD38]">★ {creator.rating.toFixed(1)}</span>
                              </span>
                              <span className="text-xs font-mono text-content-muted block">{creator.handle} • {creator.location}</span>
                            </span>
                          </Link>

                          <div className="flex items-center gap-1">
                            <FollowButton creatorId={creator.id} compact />
                            <button
                              type="button"
                              onClick={() => handleDismissCreator(creator.id)}
                              className="p-1 rounded-lg text-content-muted hover:text-rose-400 glass-thin"
                              title="Dismiss"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl glass-thin text-xs text-[#D8FD38] font-mono flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{creator.matchScore}% Match • {creator.recommendationReason}</span>
                        </div>

                        <p className="text-xs text-content-muted line-clamp-2 leading-relaxed font-light">
                          {creator.bio}
                        </p>

                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {creator.topThumbnails.map((th, thIdx) => (
                            <div
                              key={th.id}
                              className="relative aspect-square rounded-xl overflow-hidden border border-white/10"
                              title={th.title}
                            >
                              <Image
                                src={`/assets/thumbnails/thumb-${((thIdx + 1) % 24 || 1).toString().padStart(3, "0")}.svg`}
                                alt={th.title}
                                fill
                                sizes="120px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="font-mono text-white font-medium">
                          From ${creator.startingRateUsd.toLocaleString()}/proj
                        </span>
                        <Link
                          href={`/creators/${creator.handle.replace("@", "")}`}
                          className="px-4 py-1.5 rounded-xl bg-[#D8FD38] text-[#08090B] font-semibold hover:bg-[#E5FF66] transition-colors"
                        >
                          View Profile →
                        </Link>
                      </div>
                    </GlassTiltCard>
                  ))}
                </div>
              </section>
            </div>
          )
        )}
      </div>

      {/* Save to Board Modal */}
      {saveModalItem && (
        <SaveToBoardModal
          isOpen={Boolean(saveModalItem)}
          onClose={() => setSaveModalItem(null)}
          item={saveModalItem}
        />
      )}
    </div>
  );
}
