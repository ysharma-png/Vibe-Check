"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Clock,
  Film,
  Sparkles,
  Download,
  AlertOctagon,
  CheckCircle2,
  Share2,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Sliders,
  FileCode,
  Wand2,
} from "lucide-react";
import { PortfolioItem, PipelineStage } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { calculatePipelineTotals, assessCommercialClearance } from "@/lib/provenance";
import { EmbedPlayer } from "@/components/common/EmbedPlayer";

interface PortfolioItemDetailProps {
  readonly item: PortfolioItem;
  readonly isStandalonePage?: boolean;
  readonly onOpenInspector?: () => void;
  readonly creatorHandle?: string;
}

export function PortfolioItemDetail({
  item,
  isStandalonePage = false,
  onOpenInspector,
  creatorHandle,
}: PortfolioItemDetailProps) {
  const [activeTab, setActiveTab] = useState<"workflow" | "specs" | "licensing">("workflow");
  const [copied, setCopied] = useState(false);

  const totals = calculatePipelineTotals(item.pipeline);
  const clearance = assessCommercialClearance(item);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans bg-surface-subtle text-content-muted border border-surface-border uppercase">
              {item.deliverableType.replace("_", " ")}
            </span>
            <span className="text-xs text-content-faint">
              {item.aspectRatio} • {item.resolution}
            </span>

            {/* Verification Indicators */}
            {item.commercialSafety.subscriptionVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] text-verified font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Commercial Verified</span>
              </span>
            )}
            {item.reproducibility.kind === "verified_deterministic" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-accent font-medium">
                <Cpu className="h-3.5 w-3.5" />
                <span>Deterministic Workflow</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-content-primary">
            {item.title}
          </h1>

          <p className="text-xs sm:text-sm text-content-muted max-w-3xl leading-relaxed font-light">
            {item.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-surface-border bg-surface-subtle hover:bg-surface text-xs font-medium text-content-muted hover:text-content-primary transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>

          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-surface-border bg-surface-subtle hover:bg-surface text-xs font-medium text-content-muted hover:text-content-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View original</span>
            </a>
          )}

          {creatorHandle && !isStandalonePage && (
            <Link
              href={`/creators/${encodeURIComponent(creatorHandle)}/portfolio/${item.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-surface-border bg-surface-subtle hover:bg-surface text-xs font-medium text-content-muted hover:text-content-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Full Page</span>
            </Link>
          )}

          {onOpenInspector && (
            <button
              type="button"
              onClick={onOpenInspector}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-accent hover:bg-accent/90 text-background text-xs font-medium transition-all shadow-sm"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Open in Inspector</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Large Media Player */}
      {item.embedUrl ? (
        <EmbedPlayer
          embedUrl={item.embedUrl}
          sourceUrl={item.sourceUrl}
          platform={item.platform}
          title={item.title}
          aspectRatio={item.aspectRatio}
          attribution={item.attribution}
        />
      ) : (
        <div
          className="relative w-full rounded-3xl overflow-hidden border border-surface-border shadow-2xl bg-surface-subtle flex items-center justify-center"
          style={{
            aspectRatio: item.aspectRatio.replace(":", "/"),
            background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]}, ${item.posterGradient[2] ?? "#16161A"})`,
          }}
        >
          {item.mediaUrl ? (
            <video
              src={item.mediaUrl}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center p-8 space-y-3 z-10">
              <Film className="h-12 w-12 text-accent mx-auto animate-pulse" />
              <h3 className="text-lg font-light text-content-primary">{item.title}</h3>
              <p className="text-xs text-content-muted max-w-md mx-auto">
                Verified Generative Pipeline Output • {item.resolution} Master
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-sans bg-black/60 text-white backdrop-blur-md">
              Master Resolution: {item.resolution}
            </span>
            {item.durationSec && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-sans bg-black/60 text-white backdrop-blur-md">
                Duration: {item.durationSec}s
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. AI Tools & Models Used Panel (Cards with logo/vendor and pipeline role) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent" />
            <span>AI Tools &amp; Foundation Models in Pipeline</span>
          </h2>
          <span className="text-xs text-content-faint">
            {item.pipeline.length} pipeline stages
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {item.pipeline.map((stage) => {
            const tool = getToolById(stage.toolId);
            return (
              <div
                key={stage.id}
                className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2 hover:border-surface-border-strong transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-content-faint font-sans uppercase">
                    Stage {stage.order}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-accent/10 text-accent font-medium">
                    {stage.durationSec}s
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-content-primary">
                    {tool?.name || stage.toolId}
                  </div>
                  <div className="text-[11px] text-content-muted">
                    {tool?.vendor || "Open Weights"} • {stage.modelVersion}
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-border/60 text-[11px] text-accent font-medium">
                  Role: {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tabbed Deep-Dive: Workflow Breakdown | Tech Specs | Licensing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border pb-2">
          {[
            { key: "workflow", label: "Workflow Breakdown & Before/After", icon: Sliders },
            { key: "specs", label: "Technical Specs", icon: Film },
            { key: "licensing", label: "Commercial Clearance & Licensing", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30 shadow-sm"
                    : "text-content-muted hover:text-content-primary hover:bg-surface-subtle"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Workflow Breakdown */}
        {activeTab === "workflow" && (
          <div className="space-y-6 pt-2">
            {/* Draggable Before / After Slider */}
            <BeforeAfterSlider
              title="Interactive Transformation: Pre-Upscale Latent vs Final Graded Master"
              aspectRatio={item.aspectRatio.replace(":", "/")}
              beforeGradient={["#16161A", item.posterGradient[0]]}
              afterGradient={[item.posterGradient[1], item.posterGradient[2] ?? "#8B93FF"]}
            />

            {/* Ordered Workflow Steps */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-content-primary uppercase tracking-wider">
                Ordered Generation Stages
              </h3>
              <div className="space-y-2.5">
                {item.pipeline.map((stage) => {
                  const tool = getToolById(stage.toolId);
                  return (
                    <div
                      key={stage.id}
                      className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-content-primary">
                          <span className="h-5 w-5 rounded-full bg-surface-muted text-content-muted text-[10px] flex items-center justify-center">
                            {stage.order}
                          </span>
                          <span>{stage.label}</span>
                          <span className="text-content-faint">({tool?.name || stage.toolId})</span>
                        </div>
                        <span className="text-content-muted font-sans text-[11px]">
                          Seed: {stage.seed ?? "Auto"} • Cost: ${stage.costUsd.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs space-y-1">
                        <span className="text-[10px] text-content-faint uppercase tracking-wider block font-sans">
                          Prompt Strategy
                        </span>
                        <p className="text-content-primary font-mono text-[11px] leading-relaxed">
                          {stage.prompt}
                        </p>
                      </div>

                      {stage.negativePrompt && (
                        <div className="text-[11px] text-content-muted">
                          <span className="text-content-faint">Exclusions: </span>
                          <span className="font-mono text-[10px]">{stage.negativePrompt}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Specs */}
        {activeTab === "specs" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Aspect Ratio
              </span>
              <div className="text-sm font-medium text-content-primary">
                {item.aspectRatio} Delivery Frame
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Master Resolution
              </span>
              <div className="text-sm font-medium text-content-primary">
                {item.resolution} (3840x2160 DCI Master)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Playback Duration
              </span>
              <div className="text-sm font-medium text-content-primary">
                {item.durationSec ?? 30} seconds total
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Frame Rate
              </span>
              <div className="text-sm font-medium text-content-primary">
                24 fps Cinematic
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Generation Architecture
              </span>
              <div className="text-sm font-medium text-content-primary">
                ComfyUI Multi-Pass Diffusion + Motion Synthesis
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1">
              <span className="text-[10px] text-content-faint uppercase tracking-wider">
                Compute Footprint
              </span>
              <div className="text-sm font-medium text-content-primary">
                {totals.totalDurationSec}s compute • ${totals.totalCostUsd.toFixed(2)} API cost
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Commercial Clearance & Licensing */}
        {activeTab === "licensing" && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
                <div className="flex items-center gap-2 text-verified">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">Commercial Use Cleared</span>
                </div>
                <p className="text-xs text-content-muted leading-relaxed">
                  Output is 100% cleared for commercial broadcasting, digital social ad placements, streaming hero video, and print campaigns.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Cpu className="h-4 w-4" />
                  <span className="text-xs font-semibold">Output Ownership Transferred</span>
                </div>
                <p className="text-xs text-content-muted leading-relaxed">
                  Upon milestone release, complete intellectual property ownership transfers to the client without recurring licensing royalties.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
                <span className="text-[10px] text-content-faint uppercase tracking-wider block">
                  Model License Policy
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Strictly utilizes open permissive weights or enterprise-indemnified platforms. Commercial SaaS subscriptions verified.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-surface-border space-y-2">
                <span className="text-[10px] text-content-faint uppercase tracking-wider block">
                  Human-in-the-Loop Disclosure
                </span>
                <p className="text-xs text-content-muted leading-relaxed">
                  Prompt engineering, latent mask choreography, audio mixing, and fine-tuning performed directly by the creator.
                </p>
              </div>
            </div>

            {item.commercialSafety.copyrightedIpScan === "flagged" && (
              <div className="p-4 rounded-2xl bg-flagged/10 border border-flagged/30 flex items-start gap-3 text-xs text-flagged">
                <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Flagged IP Notice: This item contains stylistic homages to third-party properties and is certified for portfolio demonstration only.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
