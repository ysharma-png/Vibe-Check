"use client";

import React from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface CaseStudyModalProps {
  readonly item: PortfolioItem | null;
  readonly onClose: () => void;
  readonly onInspectWorkflow: (itemId: string) => void;
}

export function CaseStudyModal({
  item,
  onClose,
  onInspectWorkflow,
}: CaseStudyModalProps) {
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Case Study: ${item.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-surface-border bg-surface shadow-2xl p-6 sm:p-10 space-y-8 scrollbar-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Case Study"
          className="absolute top-6 right-6 p-2 rounded-full bg-surface-subtle border border-surface-border text-content-muted hover:text-content-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Banner */}
        <div className="space-y-3 border-b border-surface-border pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-accent/15 text-accent border border-accent/30">
              <Sparkles className="h-3 w-3" />
              Verified Case Study
            </span>
            <span className="text-xs text-content-faint">
              Format: {item.aspectRatio} • Master {item.resolution}
            </span>
            {item.commercialSafety.subscriptionVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] text-verified font-medium ml-auto">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Commercial Cleared</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-content-primary">
            {item.title}
          </h2>

          <p className="text-sm text-content-muted leading-relaxed max-w-2xl font-light">
            {item.clientOutcome || item.description}
          </p>
        </div>

        {/* 1. Executive Summary Grid: The 30-Second Answer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs">
          <div>
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Deliverable Format
            </span>
            <span className="font-medium text-content-primary mt-1 block">
              {item.deliverableType.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Primary Model Engine
            </span>
            <span className="font-medium text-accent mt-1 block">
              {getToolById(item.toolchain[0] ?? "")?.name || item.toolchain[0]}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Compute Pipeline Cost
            </span>
            <span className="font-medium text-content-primary mt-1 block">
              $1.24 USD / render
            </span>
          </div>

          <div>
            <span className="text-[10px] text-content-faint uppercase tracking-wider block">
              Commercial License
            </span>
            <span className="font-medium text-verified mt-1 block flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Client Transferred
            </span>
          </div>
        </div>

        {/* 2. Before / After Transformation Slider */}
        <div className="space-y-3">
          <BeforeAfterSlider
            title="Generative Transformation: Raw Diffusion Latent vs 4K Graded Master"
            aspectRatio={item.aspectRatio.replace(":", "/")}
            beforeGradient={["#16161A", item.posterGradient[0]]}
            afterGradient={[item.posterGradient[1], item.posterGradient[2] ?? "#8B93FF"]}
          />
        </div>

        {/* 3. The Challenge & Creative Intent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Creative Brief &amp; Target
            </h3>
            <p className="text-xs text-content-muted leading-relaxed font-light">
              The project required photorealistic cinematic video generation adhering strictly to brand identity guidelines without uncanny artifacts. Deliverables required multi-format export ({item.aspectRatio}) with zero temporal jitter.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-verified" />
              Technical Solution &amp; Node Architecture
            </h3>
            <p className="text-xs text-content-muted leading-relaxed font-light">
              Crafted a custom ComfyUI node pipeline combining FLUX.1 latent keyframing with Runway Gen-3 motion interpolation. Post-processing applied Proteus neural upscaling with fine-grain texture injection to remove plastic diffusion sheen.
            </p>
          </div>
        </div>

        {/* 4. Production Toolchain Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-content-primary">
            Production Toolchain &amp; Verified Roles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {item.pipeline.slice(0, 3).map((stage, idx) => {
              const tool = getToolById(stage.toolId);
              return (
                <div
                  key={stage.id}
                  className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-content-faint">
                    <span>STAGE {idx + 1}</span>
                    <span>{stage.durationSec}s</span>
                  </div>
                  <div className="text-xs font-medium text-content-primary">
                    {stage.label}
                  </div>
                  <div className="text-[11px] text-accent">
                    {tool?.name || stage.toolId}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Footer Actions */}
        <div className="border-t border-surface-border pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-content-muted">
            Reproducibility Score:{" "}
            <span className="text-content-primary font-medium">
              {item.reproducibility.kind === "verified_deterministic" ? "100% Deterministic" : "90% Reproducible"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-content-muted hover:text-content-primary transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                const itemId = item.id;
                onClose();
                onInspectWorkflow(itemId);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent hover:bg-accent/90 text-background text-xs font-medium transition-all shadow-md shadow-accent/20"
            >
              <span>Inspect Full Workflow DAG</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
