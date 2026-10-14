"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Rocket,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { CreatorGamificationResult } from "@/lib/engagement/gamification";

interface CreatorLevelCardProps {
  gamification: CreatorGamificationResult;
  compact?: boolean;
}

export function CreatorLevelCard({ gamification, compact = false }: CreatorLevelCardProps) {
  const { level, levelProgress, badges, profileStrength, suggestions } = gamification;

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case "Elite":
        return {
          pill: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          bar: "bg-gradient-to-r from-purple-500 to-indigo-500",
          glow: "shadow-purple-500/20",
        };
      case "Pro":
        return {
          pill: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          bar: "bg-gradient-to-r from-blue-500 to-cyan-500",
          glow: "shadow-blue-500/20",
        };
      default:
        return {
          pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          bar: "bg-gradient-to-r from-emerald-500 to-teal-500",
          glow: "shadow-emerald-500/20",
        };
    }
  };

  const levelColors = getLevelColor(level);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Rocket":
        return <Rocket className="h-3.5 w-3.5" />;
      case "CheckCircle2":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "Sparkles":
        return <Sparkles className="h-3.5 w-3.5" />;
      case "Zap":
        return <Zap className="h-3.5 w-3.5" />;
      default:
        return <ShieldCheck className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated/70 backdrop-blur-md p-6 space-y-6 shadow-sm">
      {/* Level Header & Roadmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-content-muted">
              Marketplace Tier
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${levelColors.pill}`}
            >
              {level} Tier
            </span>
          </div>
          <h3 className="text-base font-semibold text-content-primary">
            {level === "Elite"
              ? "Elite Master Creator"
              : level === "Pro"
              ? "Verified Pro Creator"
              : "Rising Talent"}
          </h3>
        </div>

        {/* Profile Strength Meter */}
        <div className="flex items-center gap-3 bg-surface/70 border border-surface-border/60 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-content-muted">Profile Strength</div>
            <div className="text-sm font-bold text-content-primary">{profileStrength}%</div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-border/40"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent transition-all duration-1000 ease-out"
                strokeDasharray={`${profileStrength}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <TrendingUp className="h-4 w-4 text-accent absolute" />
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-content-muted">
            Progress to <strong className="text-content-primary">{levelProgress.nextLevel}</strong>
          </span>
          <span className="text-content-primary font-semibold">{levelProgress.progressPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-border/50 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${levelColors.bar}`}
            style={{ width: `${levelProgress.progressPercentage}%` }}
          />
        </div>
        {levelProgress.requirementsRemaining.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1.5">
              Requirements to reach {levelProgress.nextLevel}:
            </span>
            <ul className="space-y-1">
              {levelProgress.requirementsRemaining.map((req, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-content-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Public Badges */}
      <div className="pt-2 border-t border-surface-border/60">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-content-muted mb-3">
          Earned Verification Badges
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-xl border transition-all ${
                b.earned
                  ? "bg-surface/80 border-surface-border text-content-primary shadow-sm hover:border-accent/40"
                  : "bg-surface/30 border-surface-border/30 text-content-muted opacity-50"
              }`}
              title={b.description}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={`p-1.5 rounded-lg ${
                    b.earned ? "bg-accent/15 text-accent" : "bg-surface-border/40 text-content-muted"
                  }`}
                >
                  {getBadgeIcon(b.icon)}
                </div>
                {b.earned ? (
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] text-content-muted">Locked</span>
                )}
              </div>
              <div className="text-xs font-semibold truncate mt-1">{b.name}</div>
              <div className="text-[10px] text-content-muted line-clamp-1 mt-0.5">{b.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Profile Suggestions */}
      {suggestions.length > 0 && !compact && (
        <div className="pt-2 border-t border-surface-border/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-content-muted mb-3 flex items-center justify-between">
            <span>Boost Your Profile Strength</span>
            <span className="text-[10px] text-accent">High Impact</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={s.actionUrl}
                className="group flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-surface-border/60 hover:bg-surface hover:border-accent/30 transition-all text-xs"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px]">
                    +{s.gain}%
                  </span>
                  <span className="text-content-secondary group-hover:text-content-primary transition-colors">
                    {s.text}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-content-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
