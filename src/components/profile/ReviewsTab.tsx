"use client";

import React from "react";
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { CreatorProfile } from "@/types/schema";
import { BrandLogo } from "@/components/common/BrandLogo";

interface ReviewsTabProps {
  readonly creator: CreatorProfile;
}

export function ReviewsTab({ creator }: ReviewsTabProps) {
  const reviews = [
    {
      id: "rev-1",
      brandName: "Nike Studios Global",
      contactName: "Marcus Sterling",
      role: "Global Creative Director",
      avatarColor: ["#6366F1", "#06B6D4"],
      rating: 5,
      date: "2 weeks ago",
      deliverable: "Commercial Spot (4K DCI + 9:16 Vertical Social Cut)",
      quote:
        "The level of temporal control and character consistency Alex achieved through ComfyUI was leagues beyond standard AI studios. Delivered 3 days ahead of our broadcast launch with full commercial indemnification paperwork.",
      verifiedHire: true,
      repeatClient: true,
    },
    {
      id: "rev-2",
      brandName: "Red Bull Media House",
      contactName: "Evelyn Zhao",
      role: "Executive Producer",
      avatarColor: ["#F59E0B", "#EF4444"],
      rating: 5,
      date: "1 month ago",
      deliverable: "Kinetic Mountain Drone Spot & Sound Design",
      quote:
        "Zero uncanny valley artifacts, flawlessly choreographed camera sweeps, and total openness with node graphs. The workflow inspector made executive clearance a breeze.",
      verifiedHire: true,
      repeatClient: true,
    },
    {
      id: "rev-3",
      brandName: "Arc Browser / The Browser Company",
      contactName: "Julian Vance",
      role: "Design Lead",
      avatarColor: ["#8B5CF6", "#EC4899"],
      rating: 5,
      date: "2 months ago",
      deliverable: "Minimalist Browser Product Visualizer",
      quote:
        "Super fast, communicative, and technically brilliant. Having deterministic seeds and hashes meant revisions were exact down to the pixel.",
      verifiedHire: true,
      repeatClient: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Reviews Summary Header */}
      <div className="p-8 rounded-3xl bg-surface border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="text-4xl sm:text-5xl font-light text-content-primary">
            5.0
          </div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-content-muted mt-1 block">
              Based on {creator.stats.projectsCompleted} verified brand project deliveries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-content-muted border-t sm:border-t-0 sm:border-l border-surface-border pt-4 sm:pt-0 sm:pl-6">
          <div>
            <span className="font-semibold text-verified block">100%</span>
            <span className="text-[11px] text-content-faint">On-time delivery</span>
          </div>
          <div>
            <span className="font-semibold text-accent block">
              {Math.round(creator.stats.repeatClientRate * 100)}%
            </span>
            <span className="text-[11px] text-content-faint">Repeat client rate</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4 hover:border-surface-border-strong transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandLogo
                  name={rev.brandName}
                  size="md"
                  gradient={rev.avatarColor as [string, string]}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-content-primary">
                      {rev.brandName}
                    </span>
                    {rev.verifiedHire && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-verified/10 text-verified border border-verified/25">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        <span>Verified Brand Contract</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-content-muted">
                    {rev.contactName} • {rev.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400" />
                  ))}
                </div>
                <span className="text-content-faint font-sans text-[11px]">{rev.date}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-content-primary/90 font-light leading-relaxed italic">
              &ldquo;{rev.quote}&rdquo;
            </p>

            <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-content-muted">
              <span>Deliverable: {rev.deliverable}</span>
              {rev.repeatClient && (
                <span className="text-accent font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Repeat Client Endorsement
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
