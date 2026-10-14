"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { CreatorProfile } from "@/types/schema";
import { Avatar } from "@/components/common/Avatar";

interface ProfileHeaderProps {
  readonly creator: CreatorProfile;
}

export function ProfileHeader({ creator }: ProfileHeaderProps) {
  return (
    <section
      aria-label="Creator Profile Summary"
      className="rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 shadow-card"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar
            name={creator.name}
            handle={creator.handle}
            size="xl"
            shape="rounded"
            gradient={creator.avatarGradient}
            availability={creator.availability}
            showStatus
            isVerified={creator.verified.identity}
            className="shadow-soft"
          />

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-light text-content-primary">
                {creator.name}
              </h1>
              <span className="text-xs text-content-muted">
                @{creator.handle}
              </span>

              {/* Verified Shield Dot */}
              {creator.verified.commercialLicense && (
                <span
                  title="Commercially verified license"
                  className="inline-flex items-center gap-1 text-[11px] text-verified"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified</span>
                </span>
              )}

              {/* Availability badge */}
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-surface-subtle text-content-muted border border-surface-border capitalize">
                {creator.availability} availability
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-content-faint" />
                <span>{creator.location}</span>
              </span>
              <span>•</span>
              <span>{creator.timezone}</span>
              <span>•</span>
              <span className="text-content-primary">From ${creator.startingRateUsd.toLocaleString()}</span>
            </div>

            <p className="text-xs sm:text-sm text-content-muted max-w-2xl leading-relaxed pt-1">
              {creator.bio}
            </p>
          </div>
        </div>

        {/* Right: CTA to brief builder */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <Link
            href={`/briefs/new?creator=${creator.id}`}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-accent text-surface text-xs font-medium hover:bg-accent-hover transition-colors shadow-soft"
          >
            <span>Start a brief with {creator.name.split(" ")[0]}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Delivery Stats Bar */}
      <div className="mt-6 pt-5 border-t border-surface-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] text-content-faint block">Projects completed</span>
          <span className="text-sm font-medium text-content-primary mt-0.5 block">
            {creator.stats.projectsCompleted}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-content-faint block">On-time delivery</span>
          <span className="text-sm font-medium text-content-primary mt-0.5 block">
            {Math.round(creator.stats.onTimeRate * 100)}%
          </span>
        </div>
        <div>
          <span className="text-[10px] text-content-faint block">Avg. turnaround</span>
          <span className="text-sm font-medium text-content-primary mt-0.5 block">
            {creator.stats.avgTurnaroundDays} days
          </span>
        </div>
        <div>
          <span className="text-[10px] text-content-faint block">Repeat client rate</span>
          <span className="text-sm font-medium text-content-primary mt-0.5 block">
            {Math.round(creator.stats.repeatClientRate * 100)}%
          </span>
        </div>
      </div>
    </section>
  );
}
