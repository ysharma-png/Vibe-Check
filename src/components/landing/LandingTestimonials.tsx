"use client";

import React from "react";
import { Star, Quote, Building2, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { BrandLogo } from "@/components/common/BrandLogo";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

const TESTIMONIALS = [
  {
    quote:
      "On other freelance platforms, we were constantly burned by black-box AI generators where creators couldn't fix a lighting shift without ruining the character. CacheFlow's ComfyUI DAG requirement solved our production repeatability completely.",
    author: "Marcus Vance",
    role: "VP of Creative & Virtual Production",
    company: "Nike Studios EMEA",
    rating: 5,
    tag: "Brand Client",
    avatarGradient: ["#f97316", "#e11d48"],
  },
  {
    quote:
      "As an AI filmmaker, I spent years arguing with clients about what constitutes 'final delivery'. CacheFlow gives me escrow safety and clear milestone checkpoints. Uploading my workflow JSON is seamless and clients respect our technical expertise.",
    author: "Amara Okafor",
    role: "Verified Filmmaker (@amara_flow)",
    company: "Studio Eko 2077",
    rating: 5,
    tag: "Verified Director",
    avatarGradient: ["#8b5cf6", "#ec4899"],
  },
  {
    quote:
      "The legal indemnification alone was the deciding factor for our general counsel. Knowing every base checkpoint used is clean and verified allowed us to run global broadcast TV spots with zero legal hesitations.",
    author: "Sarah Lindqvist",
    role: "Executive Producer",
    company: "Horizon Brand Partnerships",
    rating: 5,
    tag: "Brand Client",
    avatarGradient: ["#06b6d4", "#3b82f6"],
  },
];

export function LandingTestimonials() {
  return (
    <section className="relative py-28 px-6 border-b border-white/[0.08] bg-[#08090B] overflow-hidden">
      {/* Background Optical Refraction Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#38F2C7]/5 via-[#D8FD38]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono text-[#D8FD38] backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-[#D8FD38] text-[#D8FD38]" />
            <span className="tracking-widest uppercase">Reputation &amp; Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-white tracking-tight leading-[1.08]">
            Built for <span className="font-serif italic font-normal text-[#D8FD38]">serious commercial work</span>.
          </h2>

          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            See how enterprise brand producers and elite AI filmmakers collaborate with complete creative and legal confidence.
          </p>
        </div>

        {/* Testimonials Grid with Glass Surfaces */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <GlassSurface
              key={idx}
              tier="regular"
              rounded="28"
              className="p-8 flex flex-col justify-between space-y-8 hover:border-[#D8FD38]/30 transition-all duration-300 group shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-5">
                {/* Traffic lights & Rating */}
                <div className="flex items-center justify-between">
                  <MacTrafficLights size="sm" />
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                    ))}
                  </div>
                </div>

                {/* Tag pill */}
                <span className="inline-block text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/60">
                  {t.tag}
                </span>

                {/* Quote */}
                <p className="text-sm sm:text-base text-white/85 leading-relaxed font-light italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Row */}
              <div className="pt-5 border-t border-white/[0.08] flex items-center gap-3.5">
                {t.tag.includes("Brand") ? (
                  <BrandLogo
                    name={t.company}
                    size="md"
                    gradient={t.avatarGradient as [string, string]}
                  />
                ) : (
                  <Avatar
                    name={t.author}
                    size="md"
                    gradient={t.avatarGradient as [string, string]}
                    isVerified
                  />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-display font-semibold text-white flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#38F2C7]" />
                  </div>
                  <div className="text-xs text-white/50 font-light truncate">{t.role}</div>
                  <div className="text-xs text-[#D8FD38] font-mono mt-0.5">{t.company}</div>
                </div>
              </div>
            </GlassSurface>
          ))}
        </div>
      </div>
    </section>
  );
}
