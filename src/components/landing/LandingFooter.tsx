"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Sparkles, ShieldCheck, ArrowRight, Github, Twitter } from "lucide-react";
import { GlassSurface } from "@/components/glass/GlassSurface";

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#08090B] pt-20 pb-16 px-6 overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-32 bg-gradient-to-t from-[#D8FD38]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="h-3 w-3 rounded-full bg-[#D8FD38] shadow-[0_0_12px_rgba(216,253,56,0.8)] group-hover:scale-125 transition-transform" />
              <span className="font-display font-bold text-xl tracking-tight text-white">CacheFlow</span>
            </Link>

            <p className="text-xs sm:text-sm text-white/60 max-w-sm leading-relaxed font-light">
              The enterprise marketplace for AI-native creator discovery, verified ComfyUI DAG pipelines, and guaranteed commercial IP indemnification.
            </p>

            {/* Live Uptime Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#38F2C7]/20 bg-[#38F2C7]/[0.06] text-xs font-mono text-[#38F2C7] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#38F2C7] animate-pulse" />
              <span>All Systems Operational • 99.98% Uptime</span>
            </div>
          </div>

          {/* Col 1: Discovery */}
          <div className="space-y-4 text-xs font-sans">
            <div className="font-mono uppercase text-[11px] text-white/40 tracking-wider">Marketplace</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Find AI Creators
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="text-white/70 hover:text-[#D8FD38] transition-colors flex items-center gap-1.5">
                  <span>Showcase Mode</span>
                  <span className="text-[9px] font-mono bg-[#D8FD38]/20 text-[#D8FD38] px-1.5 py-0.5 rounded-full font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link href="/boards" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Creative Moodboards
                </Link>
              </li>
              <li>
                <Link href="/briefs/new" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Post a Creative Brief
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-4 text-xs font-sans">
            <div className="font-mono uppercase text-[11px] text-white/40 tracking-wider">For Teams</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/dashboard/brand" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Brand Studio Hub
                </Link>
              </li>
              <li>
                <Link href="/dashboard/creator" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Creator Monetization
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Demo Sandbox
                </Link>
              </li>
              <li>
                <Link href="/api/digest-preview" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Weekly Brief Digest
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Security */}
          <div className="space-y-4 text-xs font-sans">
            <div className="font-mono uppercase text-[11px] text-white/40 tracking-wider">Legal &amp; Trust</div>
            <ul className="space-y-2.5">
              <li>
                <Link href="/terms" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="text-[#38F2C7] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  IP Indemnified
                </span>
              </li>
              <li>
                <Link href="/settings" className="text-white/70 hover:text-[#D8FD38] transition-colors">
                  Account Security &amp; 2FA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-10 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/50">
          <div className="font-mono text-center sm:text-left">
            © {new Date().getFullYear()} CacheFlow Inc. Deterministic Generative Architecture.
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
