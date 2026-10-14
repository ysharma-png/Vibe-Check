"use client";

import React from "react";
import {
  AspectRatio,
  ASPECT_RATIOS,
  DeliverableType,
  DELIVERABLE_TYPES,
  Resolution,
  RESOLUTIONS,
} from "@/types/schema";
import { FieldProvenance } from "./FieldProvenance";
import { ConfidenceLevel } from "@/lib/brief/parse-nl";
import { Smartphone, Tv, Square, RectangleVertical, Film, Clapperboard, Image, Box, Music } from "lucide-react";

interface FormatSectionProps {
  readonly aspectRatios: AspectRatio[];
  readonly deliverableType: DeliverableType;
  readonly resolution: Resolution;
  readonly durationSec: number;
  readonly confidence: Record<string, ConfidenceLevel>;
  readonly evidence: Record<string, string>;
  readonly onUpdateAspectRatios: (ratios: AspectRatio[]) => void;
  readonly onUpdateDeliverableType: (type: DeliverableType) => void;
  readonly onUpdateResolution: (res: Resolution) => void;
  readonly onUpdateDurationSec: (sec: number) => void;
  readonly onClearProvenance: (field: string) => void;
}

const DELIVERABLE_META: Record<
  DeliverableType,
  { label: string; icon: React.ElementType; description: string }
> = {
  social_short_form: {
    label: "Social Short Form",
    icon: Smartphone,
    description: "TikTok, Reels, Shorts (vertical, kinetic motion)",
  },
  commercial_spot: {
    label: "Commercial Spot",
    icon: Tv,
    description: "Hero ad campaign, broadcast, web commercial",
  },
  animation: {
    label: "AI Animation / Narrative",
    icon: Clapperboard,
    description: "Stylized characters, anime, motion narrative sequences",
  },
  product_visual: {
    label: "Product Visualization",
    icon: Box,
    description: "Packshots, 3D turntable renders, bottles",
  },
  still_assets: {
    label: "Still Key Visuals",
    icon: Image,
    description: "High-resolution posters, billboard stills, print assets",
  },
  music_video: {
    label: "Music Video / Visualizer",
    icon: Music,
    description: "Rhythm-synchronized narrative or abstract visuals",
  },
};

const ASPECT_META: Record<
  AspectRatio,
  { label: string; icon: React.ElementType; boxClass: string; desc: string }
> = {
  "9:16": {
    label: "9:16 Vertical",
    icon: Smartphone,
    boxClass: "w-5 h-9",
    desc: "TikTok, Reels, Shorts",
  },
  "16:9": {
    label: "16:9 Cinema",
    icon: Tv,
    boxClass: "w-9 h-5",
    desc: "YouTube, Broadcast, Trailer",
  },
  "1:1": {
    label: "1:1 Square",
    icon: Square,
    boxClass: "w-6 h-6",
    desc: "Instagram Feed Post",
  },
  "4:5": {
    label: "4:5 Portrait",
    icon: RectangleVertical,
    boxClass: "w-6 h-7.5",
    desc: "Social Feed Hero",
  },
  "21:9": {
    label: "21:9 Ultrawide",
    icon: Film,
    boxClass: "w-11 h-4.5",
    desc: "Cinematic Banner, Display",
  },
};

export function FormatSection({
  aspectRatios,
  deliverableType,
  resolution,
  durationSec,
  confidence,
  evidence,
  onUpdateAspectRatios,
  onUpdateDeliverableType,
  onUpdateResolution,
  onUpdateDurationSec,
  onClearProvenance,
}: FormatSectionProps) {
  const toggleAspectRatio = (ratio: AspectRatio) => {
    onClearProvenance("aspectRatios");
    if (aspectRatios.includes(ratio)) {
      if (aspectRatios.length > 1) {
        onUpdateAspectRatios(aspectRatios.filter((r) => r !== ratio));
      }
    } else {
      onUpdateAspectRatios([...aspectRatios, ratio]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deliverable Type */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-content-primary">
            Deliverable Format
            <FieldProvenance
              confidence={confidence.deliverableType}
              evidence={evidence.deliverableType}
              fieldName="Deliverable Format"
              onConfirm={() => onClearProvenance("deliverableType")}
            />
          </label>
          <span className="text-xs text-content-faint">Select campaign format</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DELIVERABLE_TYPES.map((type) => {
            const meta = DELIVERABLE_META[type];
            const Icon = meta.icon;
            const isSelected = deliverableType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onClearProvenance("deliverableType");
                  onUpdateDeliverableType(type);
                }}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-accent/10 border-accent/60 text-content-primary shadow-sm"
                    : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary hover:bg-surface"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isSelected ? "bg-accent text-background" : "bg-surface-muted text-content-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-content-primary">{meta.label}</div>
                  <div className="text-[11px] text-content-muted line-clamp-1 mt-0.5">
                    {meta.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Aspect Ratio Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-content-primary">
            Aspect Ratios (Multi-Select)
            <FieldProvenance
              confidence={confidence.aspectRatios}
              evidence={evidence.aspectRatios}
              fieldName="Aspect Ratios"
              onConfirm={() => onClearProvenance("aspectRatios")}
            />
          </label>
          <span className="text-xs text-content-faint">One or more frame outputs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ASPECT_RATIOS.map((ratio) => {
            const meta = ASPECT_META[ratio];
            const isSelected = aspectRatios.includes(ratio);

            return (
              <button
                key={ratio}
                type="button"
                onClick={() => toggleAspectRatio(ratio)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-accent/10 border-accent/60 text-content-primary shadow-sm"
                    : "bg-surface-subtle border-surface-border text-content-muted hover:border-surface-border-strong hover:text-content-primary"
                }`}
              >
                {/* Proportional Box Graphic */}
                <div className="h-12 flex items-center justify-center mb-2">
                  <div
                    className={`${meta.boxClass} rounded-md border-2 transition-all ${
                      isSelected
                        ? "border-accent bg-accent/20"
                        : "border-surface-border-strong bg-surface-muted"
                    }`}
                  />
                </div>
                <div className="text-xs font-sans font-medium text-content-primary">{meta.label}</div>
                <div className="text-[10px] text-content-muted mt-0.5">{meta.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resolution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-content-primary">
              Master Resolution
              <FieldProvenance
                confidence={confidence.resolution}
                evidence={evidence.resolution}
                fieldName="Resolution"
                onConfirm={() => onClearProvenance("resolution")}
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RESOLUTIONS.map((res) => {
              const isSelected = resolution === res;
              return (
                <button
                  key={res}
                  type="button"
                  onClick={() => {
                    onClearProvenance("resolution");
                    onUpdateResolution(res);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-medium transition-colors ${
                    isSelected
                      ? "bg-accent text-background border-accent shadow-sm"
                      : "bg-surface-subtle text-content-muted border-surface-border hover:border-surface-border-strong hover:text-content-primary"
                  }`}
                >
                  {res}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-content-primary">
              Duration (Seconds)
              <FieldProvenance
                confidence={confidence.durationSec}
                evidence={evidence.durationSec}
                fieldName="Duration"
                onConfirm={() => onClearProvenance("durationSec")}
              />
            </label>
            <span className="text-xs text-accent font-sans">{durationSec}s total</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={300}
              value={durationSec}
              onChange={(e) => {
                onClearProvenance("durationSec");
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  onUpdateDurationSec(val);
                }
              }}
              className="w-24 px-3 py-2 rounded-xl border border-surface-border bg-surface-subtle text-sm text-content-primary focus:border-accent focus:outline-none"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {[15, 30, 60, 90].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onClearProvenance("durationSec");
                    onUpdateDurationSec(preset);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-sans transition-colors ${
                    durationSec === preset
                      ? "bg-surface-muted border-accent text-accent"
                      : "bg-surface-subtle border-surface-border text-content-muted hover:text-content-primary"
                  }`}
                >
                  {preset}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
