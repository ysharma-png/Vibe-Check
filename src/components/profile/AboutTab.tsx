"use client";

import React from "react";
import {
  User,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Clock,
  Sparkles,
} from "lucide-react";
import { CreatorProfile } from "@/types/schema";

interface AboutTabProps {
  readonly creator: CreatorProfile;
}

export function AboutTab({ creator }: AboutTabProps) {
  return (
    <div className="space-y-8">
      {/* Studio Philosophy & Background */}
      <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4">
        <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
          <User className="h-4 w-4 text-accent" />
          <span>Director Biography &amp; Creative Philosophy</span>
        </h2>
        <div className="text-xs sm:text-sm text-content-muted leading-relaxed font-light space-y-3">
          <p>
            {creator.bio}
          </p>
          <p>
            Operating at the intersection of generative latent space and commercial film production. Every visual asset is engineered through custom ComfyUI node graphs with strict frame-by-frame temporal consistency, avoiding the unpredictable artifacts of standard consumer generation tools.
          </p>
          <p>
            We partner with forward-thinking creative agencies and global brands to deliver high-impact hero campaign spots, vertical kinetic video, and photorealistic packshots with speed and legal certainty.
          </p>
        </div>
      </div>

      {/* Hardware Workstation & Local Compute Specs */}
      <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-accent" />
            <span>Dedicated Studio Hardware &amp; Inference Rig</span>
          </h2>
          <span className="text-[11px] text-verified font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Zero Cloud Latency Bottlenecks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              GPU Compute
            </span>
            <span className="font-semibold text-content-primary block">
              2x NVIDIA RTX 4090
            </span>
            <span className="text-[11px] text-content-muted">48GB Total High-Speed VRAM</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              System Memory
            </span>
            <span className="font-semibold text-content-primary block">
              128GB DDR5 ECC RAM
            </span>
            <span className="text-[11px] text-content-muted">High-Throughput Model Caching</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Scratch Storage
            </span>
            <span className="font-semibold text-content-primary block">
              8TB NVMe PCIe 4.0
            </span>
            <span className="text-[11px] text-content-muted">7,000 MB/s Uncompressed R/W</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-1">
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Color Monitoring
            </span>
            <span className="font-semibold text-content-primary block">
              EIZO ColorEdge 4K
            </span>
            <span className="text-[11px] text-content-muted">DCI-P3 99% Hardware Calibrated</span>
          </div>
        </div>
      </div>

      {/* Commercial Terms & Copyright Ethics Statement */}
      <div className="p-8 rounded-3xl bg-surface border border-surface-border space-y-4">
        <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-verified" />
          <span>Copyright Integrity &amp; Commercial Terms SLA</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="font-semibold text-content-primary">
              100% Client IP Assignment
            </div>
            <p className="text-content-muted leading-relaxed text-[11px]">
              All generation master outputs, final ProRes renders, and custom fine-tuned LoRAs are delivered with complete intellectual property transfer upon milestone sign-off.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="font-semibold text-content-primary">
              Clean Training Datasets
            </div>
            <p className="text-content-muted leading-relaxed text-[11px]">
              We exclusively employ open weights released under commercial permissive agreements (FLUX.1 Pro/Schnell, SDXL) or commercially indemnified platforms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border space-y-2">
            <div className="font-semibold text-content-primary">
              SLA Turnaround Guarantee
            </div>
            <p className="text-content-muted leading-relaxed text-[11px]">
              Standard commercial spot turnarounds average {creator.stats.avgTurnaroundDays} business days from creative brief lock, including 2 revision rounds in escrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
