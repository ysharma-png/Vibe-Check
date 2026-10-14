"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  ASPECT_RATIOS,
  AspectRatio,
  SPECIALIZATIONS,
  Specialization,
  TOOL_CATEGORIES,
  ToolCategory,
} from "@/types/schema";
import { TOOLS } from "@/lib/taxonomy";
import { FilterState, ToolMatchMode } from "@/lib/discovery/filter";

interface FilterDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly filters: FilterState;
  readonly onFilterChange: (filters: FilterState) => void;
  readonly onResetFilters: () => void;
  readonly totalMatches: number;
}

const CATEGORY_NAMES: Record<ToolCategory, string> = {
  image_gen: "Image models",
  video_gen: "Video models",
  workflow_engine: "Graph & engine",
  upscaler: "Upscaling",
  audio: "Audio & voice",
  lipsync: "Lip-sync",
  "3d": "3D & spatial",
  editing: "Editorial",
};

const ASPECT_BOXES: Record<AspectRatio, { label: string; boxClass: string }> = {
  "9:16": { label: "9:16 Vertical", boxClass: "w-3.5 h-6" },
  "16:9": { label: "16:9 Cinema", boxClass: "w-6 h-3.5" },
  "1:1": { label: "1:1 Square", boxClass: "w-4 h-4" },
  "4:5": { label: "4:5 Portrait", boxClass: "w-4 h-5" },
  "21:9": { label: "21:9 Ultrawide", boxClass: "w-7 h-3" },
};

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalMatches,
}: FilterDrawerProps) {
  // Accordion open states (collapsed by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    tools: false,
    format: false,
    niche: false,
    verification: false,
    availability: false,
    budget: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Section selected counts
  const toolsCount = filters.tools.length;
  const formatCount = filters.aspectRatios.length;
  const nicheCount = filters.specializations.length;
  const verificationCount =
    (filters.verification.commercialLicense ? 1 : 0) +
    (filters.verification.reproduciblePipeline ? 1 : 0);
  const availCount = filters.availability.length;
  const budgetSet = filters.maxStartingRateUsd !== null;

  const totalActiveCount =
    toolsCount + formatCount + nicheCount + verificationCount + availCount + (budgetSet ? 1 : 0);

  const handleToggleTool = (toolId: string) => {
    const exists = filters.tools.includes(toolId);
    const updated = exists
      ? filters.tools.filter((t) => t !== toolId)
      : [...filters.tools, toolId];
    onFilterChange({ ...filters, tools: updated });
  };

  const handleToggleAspect = (ratio: AspectRatio) => {
    const exists = filters.aspectRatios.includes(ratio);
    const updated = exists
      ? filters.aspectRatios.filter((r) => r !== ratio)
      : [...filters.aspectRatios, ratio];
    onFilterChange({ ...filters, aspectRatios: updated });
  };

  const handleToggleSpecialization = (spec: Specialization) => {
    const exists = filters.specializations.includes(spec);
    const updated = exists
      ? filters.specializations.filter((s) => s !== spec)
      : [...filters.specializations, spec];
    onFilterChange({ ...filters, specializations: updated });
  };

  const handleToggleAvailability = (avail: "open" | "limited") => {
    const exists = filters.availability.includes(avail);
    const updated = exists
      ? filters.availability.filter((a) => a !== avail)
      : [...filters.availability, avail];
    onFilterChange({ ...filters, availability: updated });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            aria-label="Filter creators"
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full sm:w-[420px] h-full bg-surface border-l border-surface-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold text-content-primary">Filters</h2>
                {totalActiveCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-full text-[11px] font-medium bg-accent/15 text-accent">
                    {totalActiveCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {totalActiveCount > 0 && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="text-xs text-content-muted hover:text-content-primary transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear all</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close filters"
                  className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Accordion List Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {/* 1. Tools Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("tools")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Tools</span>
                  <div className="flex items-center gap-2">
                    {toolsCount > 0 && (
                      <span className="text-[11px] text-accent font-sans">
                        {toolsCount} selected
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.tools ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.tools && (
                  <div className="p-3.5 pt-0 space-y-4 border-t border-surface-border/40">
                    {/* Tool Match toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-content-muted">Match mode</span>
                      <div className="inline-flex rounded-lg border border-surface-border bg-surface p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            onFilterChange({ ...filters, toolMatch: "any" })
                          }
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            filters.toolMatch === "any"
                              ? "bg-surface-subtle text-content-primary"
                              : "text-content-muted hover:text-content-primary"
                          }`}
                        >
                          Any tool
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onFilterChange({ ...filters, toolMatch: "all" })
                          }
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            filters.toolMatch === "all"
                              ? "bg-surface-subtle text-content-primary"
                              : "text-content-muted hover:text-content-primary"
                          }`}
                        >
                          All tools
                        </button>
                      </div>
                    </div>

                    {/* Grouped tools */}
                    <div className="space-y-3">
                      {TOOL_CATEGORIES.map((cat) => {
                        const catTools = TOOLS.filter((t) => t.category === cat);
                        if (catTools.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-1.5">
                            <span className="text-[10px] text-content-faint">
                              {CATEGORY_NAMES[cat]}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {catTools.map((tool) => {
                                const isSelected = filters.tools.includes(tool.id);
                                return (
                                  <button
                                    key={tool.id}
                                    type="button"
                                    onClick={() => handleToggleTool(tool.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                                      isSelected
                                        ? "bg-accent/15 border-accent text-accent"
                                        : "bg-surface border-surface-border text-content-muted hover:text-content-primary"
                                    }`}
                                  >
                                    {tool.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Format Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("format")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Format</span>
                  <div className="flex items-center gap-2">
                    {formatCount > 0 && (
                      <span className="text-[11px] text-accent font-sans">
                        {formatCount} selected
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.format ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.format && (
                  <div className="p-3.5 pt-0 grid grid-cols-2 gap-2 border-t border-surface-border/40">
                    {ASPECT_RATIOS.map((ratio) => {
                      const isSelected = filters.aspectRatios.includes(ratio);
                      const box = ASPECT_BOXES[ratio];

                      return (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => handleToggleAspect(ratio)}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                            isSelected
                              ? "bg-accent/15 border-accent text-accent"
                              : "bg-surface border-surface-border text-content-muted hover:text-content-primary"
                          }`}
                        >
                          <div
                            className={`${box.boxClass} rounded border ${
                              isSelected ? "border-accent bg-accent/20" : "border-content-faint/50"
                            }`}
                          />
                          <span className="text-xs">{box.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Niche / Specialization Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("niche")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Niche</span>
                  <div className="flex items-center gap-2">
                    {nicheCount > 0 && (
                      <span className="text-[11px] text-accent font-sans">
                        {nicheCount} selected
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.niche ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.niche && (
                  <div className="p-3.5 pt-0 flex flex-wrap gap-1.5 border-t border-surface-border/40">
                    {SPECIALIZATIONS.map((spec) => {
                      const isSelected = filters.specializations.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleToggleSpecialization(spec)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                            isSelected
                              ? "bg-accent/15 border-accent text-accent"
                              : "bg-surface border-surface-border text-content-muted hover:text-content-primary"
                          }`}
                        >
                          {spec}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Verification Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("verification")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Verification</span>
                  <div className="flex items-center gap-2">
                    {verificationCount > 0 && (
                      <span className="text-[11px] text-accent font-sans">
                        {verificationCount} active
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.verification ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.verification && (
                  <div className="p-3.5 pt-0 space-y-2 border-t border-surface-border/40">
                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle cursor-pointer">
                      <div>
                        <div className="text-xs text-content-primary flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-verified" />
                          <span>Commercial license</span>
                        </div>
                        <span className="text-[10px] text-content-muted">
                          Verified paid enterprise SaaS tier
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.verification.commercialLicense}
                        onChange={(e) =>
                          onFilterChange({
                            ...filters,
                            verification: {
                              ...filters.verification,
                              commercialLicense: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-surface-border bg-surface text-accent focus:ring-accent"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-subtle cursor-pointer">
                      <div>
                        <div className="text-xs text-content-primary flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          <span>Deterministic pipeline</span>
                        </div>
                        <span className="text-[10px] text-content-muted">
                          Seed-locked ComfyUI DAG re-runs
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={filters.verification.reproduciblePipeline}
                        onChange={(e) =>
                          onFilterChange({
                            ...filters,
                            verification: {
                              ...filters.verification,
                              reproduciblePipeline: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-surface-border bg-surface text-accent focus:ring-accent"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* 5. Availability Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("availability")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Availability</span>
                  <div className="flex items-center gap-2">
                    {availCount > 0 && (
                      <span className="text-[11px] text-accent font-sans">
                        {availCount} selected
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.availability ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.availability && (
                  <div className="p-3.5 pt-0 flex gap-2 border-t border-surface-border/40">
                    {(["open", "limited"] as const).map((avail) => {
                      const isSelected = filters.availability.includes(avail);
                      return (
                        <button
                          key={avail}
                          type="button"
                          onClick={() => handleToggleAvailability(avail)}
                          className={`flex-1 p-2 rounded-xl border text-xs capitalize transition-colors ${
                            isSelected
                              ? "bg-accent/15 border-accent text-accent"
                              : "bg-surface border-surface-border text-content-muted hover:text-content-primary"
                          }`}
                        >
                          {avail}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Budget Accordion */}
              <div className="rounded-2xl border border-surface-border bg-surface-subtle/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection("budget")}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-medium text-content-primary transition-colors hover:bg-surface-subtle/80"
                >
                  <span>Budget</span>
                  <div className="flex items-center gap-2">
                    {budgetSet && (
                      <span className="text-[11px] text-accent font-sans">
                        Up to ${filters.maxStartingRateUsd?.toLocaleString()}
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-content-muted transition-transform ${
                        openSections.budget ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openSections.budget && (
                  <div className="p-3.5 pt-0 space-y-3 border-t border-surface-border/40">
                    <div className="flex items-center justify-between text-xs text-content-muted">
                      <span>Starting rate under:</span>
                      <span className="text-content-primary font-medium">
                        {filters.maxStartingRateUsd
                          ? `$${filters.maxStartingRateUsd.toLocaleString()}`
                          : "Any rate"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {[1500, 2500, 5000].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() =>
                            onFilterChange({
                              ...filters,
                              maxStartingRateUsd:
                                filters.maxStartingRateUsd === rate ? null : rate,
                            })
                          }
                          className={`flex-1 py-1.5 rounded-lg border text-xs transition-colors ${
                            filters.maxStartingRateUsd === rate
                              ? "bg-accent/15 border-accent text-accent"
                              : "bg-surface border-surface-border text-content-muted hover:text-content-primary"
                          }`}
                        >
                          ${rate.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-surface-border bg-surface">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-accent text-surface hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
              >
                <span>Show {totalMatches} creators</span>
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
