"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  ArrowRight,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";
import { CREATORS } from "@/data/creators";
import { Avatar } from "@/components/common/Avatar";
import { BrandLogo } from "@/components/common/BrandLogo";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MagneticButton } from "@/components/common/MagneticButton";

export default function BrandDashboardPage() {
  const topCreators = CREATORS.slice(0, 3);
  const [displayName, setDisplayName] = React.useState("Brand Director");

  React.useEffect(() => {
    try {
      const cookieStr = typeof document !== "undefined" ? document.cookie : "";
      const cookies = cookieStr.split("; ");
      const nameCookie = cookies.find((c) => c.startsWith("cf_user_name="));
      if (nameCookie) setDisplayName(decodeURIComponent(nameCookie.split("=")[1] || ""));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white py-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Header */}
        <GlassSurface
          tier="thick"
          rounded="32"
          className="p-6 sm:p-8 border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <BrandLogo name="Lumina Haute Couture" handle="lumina_fashion" size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-white/50 font-mono">
                  Brand Studio Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white">
                Welcome, <span className="font-semibold text-accent">{displayName}</span>
              </h1>
              <p className="text-xs text-white/60 font-mono mt-1">
                Lumina Haute Couture • Enterprise Generative Media Production
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/briefs/new">
              <MagneticButton variant="primary" size="md">
                <Plus className="h-4 w-4" />
                <span>Post Creative Brief</span>
              </MagneticButton>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white text-xs font-mono hover:bg-white/[0.08] transition-all backdrop-blur-md"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Browse Creators</span>
            </Link>
          </div>
        </GlassSurface>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Active Briefs</span>
              <Briefcase className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">3</div>
            <p className="text-[11px] text-white/50 font-light">2 open for proposals, 1 in review</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Proposals Received</span>
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">12</div>
            <p className="text-[11px] text-white/50 font-light">4 new pitches with verified pipelines</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Shortlisted Creators</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">8</div>
            <p className="text-[11px] text-white/50 font-light">100% commercial license indemnified</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Escrow Protected</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">$24,500</div>
            <p className="text-[11px] text-white/50 font-light">Milestone payout upon approval</p>
          </GlassSurface>
        </div>

        {/* Active Campaigns / Briefs */}
        <GlassSurface
          tier="thick"
          rounded="32"
          className="p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base font-display font-medium text-white">Active Creative Briefs</h2>
              <p className="text-xs text-white/50 font-mono mt-0.5">Campaigns currently accepting proposals from verified filmmakers.</p>
            </div>
            <Link
              href="/briefs/new"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              <span>New AI brief</span> <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold">
                    Commercial Spot • 16:9 4K
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-medium">$12,000 Budget</span>
                </div>
                <h3 className="text-sm font-display font-medium text-white">Spring Kinetic Footwear Campaign (AirMax 2027)</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed">Looking for consistent character + photorealistic product visualization with FLUX and Topaz upscale.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-white/50">5 Proposals</span>
                <Link
                  href="/briefs/new"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.06] text-xs font-mono text-white hover:bg-white/[0.12] transition-all"
                >
                  Review Bids
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 font-semibold">
                    Social Short Form • 9:16
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-medium">$6,500 Budget</span>
                </div>
                <h3 className="text-sm font-display font-medium text-white">Urban Motion Viral Reels - Hyperlapse AI Transitions</h3>
                <p className="text-xs text-white/60 font-light leading-relaxed">Camera motion control specialization required with Runway Gen-3 and AnimateDiff.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono text-white/50">7 Proposals</span>
                <Link
                  href="/briefs/new"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.06] text-xs font-mono text-white hover:bg-white/[0.12] transition-all"
                >
                  Review Bids
                </Link>
              </div>
            </div>
          </div>
        </GlassSurface>

        {/* Shortlisted Creators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-medium text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Recommended Creators for Your Next Campaign</span>
            </h2>
            <Link href="/about" className="text-xs font-mono text-accent hover:underline flex items-center gap-1">
              <span>Browse all</span> <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topCreators.map((creator) => (
              <GlassSurface
                key={creator.id}
                tier="regular"
                rounded="24"
                className="p-6 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/25 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={creator.name}
                        handle={creator.handle}
                        size="md"
                        gradient={creator.avatarGradient}
                        isVerified={creator.verified.identity}
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-display font-medium text-white truncate">{creator.name}</h3>
                        <p className="text-[11px] font-mono text-white/50 truncate">@{creator.handle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-3 line-clamp-2 leading-relaxed font-light">{creator.bio}</p>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/40">From ${creator.startingRateUsd.toLocaleString()}</span>
                  <Link
                    href={`/creators/${creator.handle}`}
                    className="text-accent font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View profile</span> <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </GlassSurface>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
