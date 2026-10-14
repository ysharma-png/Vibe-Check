"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sliders,
  Clock,
  Eye,
  CheckCircle2,
  DollarSign,
  Cpu,
} from "lucide-react";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { CreatorLevelCard } from "@/components/creator/CreatorLevelCard";
import { getCreatorGamificationByHandle } from "@/lib/engagement/store";
import { Avatar } from "@/components/common/Avatar";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MagneticButton } from "@/components/common/MagneticButton";

export default function CreatorDashboardPage() {
  const creator = CREATORS[0]; // fallback
  const items = PORTFOLIO_ITEMS.filter((it) => it.creatorId === creator?.id);

  const [displayName, setDisplayName] = React.useState(creator?.name ?? "Creator");
  const [handle, setHandle] = React.useState(creator?.handle ?? "creator");

  React.useEffect(() => {
    try {
      const cookieStr = typeof document !== "undefined" ? document.cookie : "";
      const cookies = cookieStr.split("; ");
      const nameCookie = cookies.find((c) => c.startsWith("cf_user_name="));
      const handleCookie = cookies.find((c) => c.startsWith("cf_user_handle="));
      if (nameCookie) setDisplayName(decodeURIComponent(nameCookie.split("=")[1] || ""));
      if (handleCookie) setHandle(decodeURIComponent(handleCookie.split("=")[1] || ""));
    } catch {}
  }, []);

  const gamification = getCreatorGamificationByHandle(handle);

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
            <Avatar
              name={displayName}
              handle={handle}
              size="lg"
              isVerified
              showStatus
              availability="open"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-wider text-white/50 font-mono">
                  Creator Workspace
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-white">
                Welcome, <span className="font-semibold text-accent">{displayName}</span>
              </h1>
              <p className="text-xs text-white/60 font-mono mt-1">
                @{handle} • Verified Generative Filmmaker &amp; ComfyUI Specialist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/home">
              <MagneticButton variant="primary" size="md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Matched Feed</span>
              </MagneticButton>
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white text-xs font-mono hover:bg-white/[0.08] transition-all backdrop-blur-md"
            >
              Alerts &amp; Settings
            </Link>
          </div>
        </GlassSurface>

        {/* Creator Level & Profile Strength Card */}
        <CreatorLevelCard gamification={gamification} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Pipeline Score</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">
              98<span className="text-sm text-white/40 font-mono">/100</span>
            </div>
            <p className="text-[11px] text-white/50 font-light">Deterministic ComfyUI graph verified</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Active Proposals</span>
              <Briefcase className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">4</div>
            <p className="text-[11px] text-white/50 font-light">2 briefs in final brand review</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Portfolio Items</span>
              <Layers className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">
              {items.length} Proofs
            </div>
            <p className="text-[11px] text-white/50 font-light">All clear for commercial licensing</p>
          </GlassSurface>

          <GlassSurface
            tier="regular"
            rounded="24"
            className="p-5 border border-white/10 space-y-2 backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-white/50 font-mono text-xs">
              <span>Escrow Earned</span>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-display font-medium tracking-tight text-white">$14,200</div>
            <p className="text-[11px] text-white/50 font-light">Protected under CacheFlow escrow</p>
          </GlassSurface>
        </div>

        {/* Portfolio Items Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Verified Portfolio Items</span>
            </h2>
            <Link
              href="/dashboard/creator/portfolio"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              <span>View editor</span> <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <GlassSurface
                key={item.id}
                tier="regular"
                rounded="24"
                className="p-6 border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/25 transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                      {item.aspectRatio} • {item.resolution}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-3 w-3" /> Verified DAG
                    </span>
                  </div>
                  <h3 className="text-sm font-display font-medium text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-white/60 line-clamp-2 font-light leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-accent" />
                    <span>{item.pipeline.length} stages</span>
                  </span>
                  <Link
                    href={`/creators/${creator?.handle}/portfolio/${item.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Preview</span> <Eye className="h-3 w-3" />
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
