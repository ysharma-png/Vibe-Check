"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Monitor } from "lucide-react";
import { AspectRatio, PipelineStage, PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";

import { GlassSurface } from "@/components/glass/GlassSurface";

interface AssetViewerProps {
  readonly item: PortfolioItem;
  readonly activeStageId: string | null;
  readonly onSelectStage: (stageId: string | null) => void;
}

const ASPECT_FRAME_CLASSES: Record<AspectRatio, string> = {
  "9:16": "max-w-[260px] aspect-[9/16] rounded-3xl border border-white/15 shadow-2xl",
  "16:9": "w-full max-w-lg aspect-[16/9] rounded-2xl border border-white/15 shadow-2xl",
  "1:1": "max-w-[360px] aspect-square rounded-2xl border border-white/15 shadow-2xl",
  "4:5": "max-w-[300px] aspect-[4/5] rounded-2xl border border-white/15 shadow-2xl",
  "21:9": "w-full aspect-[21/9] rounded-2xl border border-white/15 shadow-2xl",
};

export function AssetViewer({
  item,
  activeStageId,
  onSelectStage,
}: AssetViewerProps) {
  // If activeStageId is set, find stage preview; otherwise use final master gradient
  const activeStage = item.pipeline.find((s) => s.id === activeStageId);

  const displayGradient: [string, string, string] = activeStage
    ? [
        activeStage.outputPreview.gradient[0],
        activeStage.outputPreview.gradient[1],
        "#0E0E11",
      ]
    : item.posterGradient;

  const displayCaption = activeStage
    ? `Stage ${activeStage.order + 1}: ${activeStage.label} — ${activeStage.outputPreview.caption}`
    : `Master Delivery: ${item.title} (${item.resolution} ${item.deliverableType.replace("_", " ")})`;

  return (
    <div className="flex flex-col h-full justify-between gap-5 p-6 bg-[#08090B]/80 backdrop-blur-md">
      {/* Aspect Ratio Framing Wrapper */}
      <div className="flex flex-1 items-center justify-center min-h-[300px] w-full">
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            ASPECT_FRAME_CLASSES[item.aspectRatio]
          }`}
        >
          {item.mediaUrl ? (
            <video
              src={item.mediaUrl}
              controls
              playsInline
              poster="/assets/thumbnails/thumb-001.svg"
              className="h-full w-full object-cover"
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStageId ?? "master"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full flex flex-col justify-between p-4 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${displayGradient[0]} 0%, ${displayGradient[1]} 60%, ${displayGradient[2]} 100%)`,
                }}
              >
                {/* Subtle top watermark */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] text-white/70 backdrop-blur-md border border-white/10 font-mono">
                    {item.aspectRatio === "9:16" ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Monitor className="h-3 w-3" />
                    )}
                    <span>{item.aspectRatio}</span>
                  </span>

                  <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] text-white/70 backdrop-blur-md border border-white/10 font-mono">
                    Preview
                  </span>
                </div>

                {/* Bottom caption overlay */}
                <div className="relative z-10 rounded-xl bg-black/80 p-2.5 backdrop-blur-md border border-white/10">
                  <div className="text-[11px] font-mono text-white line-clamp-2">
                    {displayCaption}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* STAGE SCRUBBER (Proof of side-by-side asset + pipeline) */}
      <GlassSurface
        tier="regular"
        rounded="24"
        className="p-3 border border-white/10 space-y-2 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between text-xs font-mono text-white/60">
          <span>Stage scrubber</span>
          <span className="text-[11px] text-white/40">
            {activeStage ? `Stage ${activeStage.order + 1} of ${item.pipeline.length}` : "Final output"}
          </span>
        </div>

        <div className="grid grid-flow-col auto-cols-fr gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {/* Stage 0: Master output */}
          <button
            type="button"
            onClick={() => onSelectStage(null)}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all truncate ${
              activeStageId === null
                ? "bg-accent text-[#08090B] shadow-glow-lime font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Final
          </button>

          {/* Individual Stages */}
          {item.pipeline.map((stage) => {
            const isSelected = activeStageId === stage.id;
            const tool = getToolById(stage.toolId);
            const toolName = tool?.name.split(" ")[0] ?? `S${stage.order + 1}`;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelectStage(stage.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-all truncate ${
                  isSelected
                    ? "bg-accent text-[#08090B] shadow-glow-lime font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
                title={`Stage ${stage.order + 1}: ${stage.label}`}
              >
                {toolName}
              </button>
            );
          })}
        </div>
      </GlassSurface>
    </div>
  );
}
