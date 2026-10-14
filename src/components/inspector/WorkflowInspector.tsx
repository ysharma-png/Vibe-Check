"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Sparkles,
  Download,
  AlertOctagon,
} from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { assessCommercialClearance, calculatePipelineTotals } from "@/lib/provenance";
import { getToolById } from "@/lib/taxonomy";
import { AssetViewer } from "./AssetViewer";
import { PipelineTimeline } from "./PipelineTimeline";
import { NodeGraphView } from "./NodeGraphView";
import { LicenseBadgePanel } from "./LicenseBadgePanel";
import { ReproducibilityMeter } from "./ReproducibilityMeter";
import { GlassSurface } from "@/components/glass/GlassSurface";
import { MacTrafficLights } from "@/components/glass/MacTrafficLights";

export type InspectorMode = "overview" | "technical";

interface WorkflowInspectorProps {
  readonly item: PortfolioItem;
  readonly allItems: readonly PortfolioItem[];
  readonly onClose: () => void;
  readonly onNavigateItem: (itemId: string) => void;
}

export function WorkflowInspector({
  item,
  allItems,
  onClose,
  onNavigateItem,
}: WorkflowInspectorProps) {
  const [mode, setMode] = useState<InspectorMode>("overview");
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"asset" | "overview" | "technical">("overview");

  // Expandable disclosures in overview
  const [isLicenseDetailsOpen, setIsLicenseDetailsOpen] = useState(false);
  const [isReproDetailsOpen, setIsReproDetailsOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Store element that triggered open, restore on close
  useEffect(() => {
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    return () => {
      previousActiveElementRef.current?.focus();
    };
  }, []);

  const currentIndex = allItems.findIndex((it) => it.id === item.id);
  const totalCount = allItems.length;

  const handlePrev = React.useCallback(() => {
    if (currentIndex > 0) {
      const prev = allItems[currentIndex - 1];
      if (prev) onNavigateItem(prev.id);
    } else if (allItems.length > 0) {
      const last = allItems[allItems.length - 1];
      if (last) onNavigateItem(last.id);
    }
  }, [currentIndex, allItems, onNavigateItem]);

  const handleNext = React.useCallback(() => {
    if (currentIndex < totalCount - 1) {
      const next = allItems[currentIndex + 1];
      if (next) onNavigateItem(next.id);
    } else if (allItems.length > 0) {
      const first = allItems[0];
      if (first) onNavigateItem(first.id);
    }
  }, [currentIndex, totalCount, allItems, onNavigateItem]);

  // Keyboard navigation: Escape closes, ArrowLeft/Right navigates items
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const assessment = assessCommercialClearance(item);
  const totals = calculatePipelineTotals(item.pipeline);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Workflow Inspector: ${item.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl"
    >
      <GlassSurface
        tier="thick"
        rounded="32"
        ref={dialogRef}
        tabIndex={-1}
        className="relative flex flex-col h-full sm:h-[92vh] w-full max-w-6xl overflow-hidden border border-white/10 shadow-2xl focus:outline-none"
      >
        {/* Top App Bar Header with macOS Traffic Lights */}
        <header className="flex h-14 items-center justify-between border-b border-white/10 px-5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            <MacTrafficLights onClose={onClose} />
            <div className="h-4 w-px bg-white/10" />
            <h2 className="text-sm font-display font-medium text-white truncate">
              {item.title}
            </h2>
            <span className="text-xs font-mono text-white/40">
              {currentIndex + 1} of {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next buttons */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous item"
                className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next item"
                className="p-1.5 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="p-1.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs */}
        <div className="flex border-b border-white/10 md:hidden bg-black/60">
          {(["asset", "overview", "technical"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-xs font-mono capitalize font-medium transition-colors border-b-2 ${
                mobileTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-white/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main 2-Column Split (55% Asset, 45% Pipeline & Details) */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Side: Asset Viewer + Scrubber (55%) */}
          <div
            className={`w-full md:w-[55%] border-r border-white/10 overflow-hidden ${
              mobileTab === "asset" ? "flex flex-col" : "hidden md:flex md:flex-col"
            }`}
          >
            <AssetViewer
              item={item}
              activeStageId={activeStageId}
              onSelectStage={setActiveStageId}
            />
          </div>

          {/* Right Side: Tabbed Details (45%) */}
          <div
            className={`w-full md:w-[45%] flex flex-col bg-[#08090B]/60 backdrop-blur-md overflow-hidden ${
              mobileTab !== "asset" ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Segmented Toggle at Top of Right Panel */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setMode("overview")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    mode === "overview"
                      ? "bg-accent text-[#08090B] font-semibold shadow-glow-lime"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setMode("technical")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    mode === "technical"
                      ? "bg-accent text-[#08090B] font-semibold shadow-glow-lime"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Technical
                </button>
              </div>

              <div className="text-[11px] text-white/50 font-mono">
                {item.pipeline.length} stages • ${totals.totalCostUsd.toFixed(2)} total
              </div>
            </div>

            {/* Scrollable Panel Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {mode === "overview" ? (
                <>
                  {/* Flagged IP Notice (Prominent, clear but calm inline notice) */}
                  {item.commercialSafety.copyrightedIpScan === "flagged" && (
                    <div className="rounded-2xl border border-flagged/30 bg-flagged/10 p-3.5 flex items-start gap-3">
                      <AlertOctagon className="h-4 w-4 text-flagged shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-flagged">
                          Protected character likeness flagged
                        </div>
                        <p className="text-[11px] text-content-muted leading-relaxed">
                          Potential protected trademark or celebrity likeness detected in training weights. Commercial broadcast requires rights clearance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. Simple Pipeline Overview */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-content-primary">
                      Pipeline overview
                    </span>
                    <div className="space-y-2">
                      {item.pipeline.map((stage) => {
                        const isSelected = activeStageId === stage.id;
                        const tool = getToolById(stage.toolId);
                        const outcomeLabel = stage.outputPreview.caption.split("•")[0]?.trim() || stage.label;

                        return (
                          <div
                            key={stage.id}
                            onClick={() =>
                              setActiveStageId(isSelected ? null : stage.id)
                            }
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-accent/10 border-accent/40 shadow-sm"
                                : "bg-surface-subtle/50 border-surface-border hover:border-surface-border-hover hover:bg-surface-subtle"
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-content-primary">
                                  {tool?.name ?? stage.toolId}
                                </span>
                                <span className="text-[11px] text-content-faint">
                                  Stage {stage.order + 1}
                                </span>
                              </div>
                              <p className="text-[11px] text-content-muted truncate">
                                {stage.label}
                              </p>
                            </div>

                            <span className="px-2 py-0.5 rounded-lg text-[10px] bg-surface border border-surface-border text-content-muted shrink-0">
                              {outcomeLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Commercial Clearance Summary Line (Expandable) */}
                  <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            assessment.level === "cleared"
                              ? "bg-verified"
                              : assessment.level === "conditional"
                              ? "bg-caution"
                              : "bg-flagged"
                          }`}
                        />
                        <span className="text-xs font-medium text-content-primary">
                          {assessment.summary}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsLicenseDetailsOpen(!isLicenseDetailsOpen)}
                        className="text-[11px] text-content-muted hover:text-content-primary flex items-center gap-1"
                      >
                        <span>{isLicenseDetailsOpen ? "Hide" : "Details"}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            isLicenseDetailsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[11px] text-content-muted leading-relaxed">
                      {assessment.reasons[0] ?? item.commercialSafety.usageRightsNotes}
                    </p>

                    {isLicenseDetailsOpen && (
                      <div className="pt-3 border-t border-surface-border/60">
                        <LicenseBadgePanel item={item} />
                      </div>
                    )}
                  </div>

                  {/* 3. Reproducibility Summary Line (Expandable) */}
                  <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.reproducibility.kind === "verified_deterministic"
                              ? "bg-verified"
                              : item.reproducibility.kind === "partially_reproducible"
                              ? "bg-caution"
                              : "bg-content-faint"
                          }`}
                        />
                        <span className="text-xs font-medium text-content-primary">
                          {item.reproducibility.kind === "verified_deterministic"
                            ? `Deterministic re-run verified (${Math.round(
                                item.reproducibility.rerunMatchScore * 100
                              )}% match)`
                            : item.reproducibility.kind === "partially_reproducible"
                            ? "Partially reproducible (hosted SaaS video stages)"
                            : "Unverified generation pipeline"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsReproDetailsOpen(!isReproDetailsOpen)}
                        className="text-[11px] text-content-muted hover:text-content-primary flex items-center gap-1"
                      >
                        <span>{isReproDetailsOpen ? "Hide" : "Details"}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            isReproDetailsOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isReproDetailsOpen && (
                      <div className="pt-3 border-t border-surface-border/60">
                        <ReproducibilityMeter item={item} />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Technical View Mode */
                <div className="space-y-6">
                  {/* Detailed Stage Accordions (Seeds, Prompts, LoRAs, Hashes) */}
                  <div>
                    <span className="text-xs font-medium text-content-primary block mb-3">
                      Stage execution parameters
                    </span>
                    <PipelineTimeline
                      item={item}
                      activeStageId={activeStageId}
                      onSelectStage={setActiveStageId}
                    />
                  </div>

                  {/* ComfyUI Node Graph */}
                  <div className="pt-4 border-t border-surface-border">
                    <span className="text-xs font-medium text-content-primary block mb-3">
                      Executable ComfyUI DAG
                    </span>
                    <NodeGraphView
                      nodeGraph={item.nodeGraph}
                      title={item.title}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
}
