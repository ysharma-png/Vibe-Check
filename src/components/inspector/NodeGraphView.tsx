"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { NodeGraph } from "@/types/schema";

interface NodeGraphViewProps {
  readonly nodeGraph: NodeGraph | null;
  readonly itemTitle?: string;
  readonly title?: string;
}

const NODE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; header: string }> = {
  LoadCheckpoint: { bg: "#16161A", border: "#8B93FF", text: "#EDEDED", header: "#24242B" },
  FLUXSampler: { bg: "#16161A", border: "#10B981", text: "#EDEDED", header: "#24242B" },
  KSampler: { bg: "#16161A", border: "#10B981", text: "#EDEDED", header: "#24242B" },
  LoraLoader: { bg: "#16161A", border: "#A78BFA", text: "#EDEDED", header: "#24242B" },
  LoRAStacker: { bg: "#16161A", border: "#A78BFA", text: "#EDEDED", header: "#24242B" },
  ControlNetApply: { bg: "#16161A", border: "#38BDF8", text: "#EDEDED", header: "#24242B" },
  IPAdapterModelLoader: { bg: "#16161A", border: "#38BDF8", text: "#EDEDED", header: "#24242B" },
  AnimateDiffModule: { bg: "#16161A", border: "#F472B6", text: "#EDEDED", header: "#24242B" },
  SaveLatentVideo: { bg: "#16161A", border: "#F59E0B", text: "#EDEDED", header: "#24242B" },
  default: { bg: "#16161A", border: "rgba(255,255,255,0.15)", text: "#EDEDED", header: "#24242B" },
};

function getNodeColor(type: string) {
  return NODE_TYPE_COLORS[type] ?? NODE_TYPE_COLORS.default!;
}

export function NodeGraphView({ nodeGraph, itemTitle, title }: NodeGraphViewProps) {
  const displayTitle = itemTitle ?? title ?? "workflow";
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // If nodeGraph is null, render honest empty state
  if (!nodeGraph) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-surface-border bg-surface-subtle min-h-[260px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-surface-border text-content-muted mb-3">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h4 className="text-xs font-semibold text-content-primary">
          Hosted toolchain without an exportable graph
        </h4>
        <p className="mt-1 text-[11px] text-content-muted max-w-sm leading-relaxed">
          This creator uses hosted tools without an exportable graph. Generation prompts, RNG seeds, and commercial licensing remain documented and verified.
        </p>
      </div>
    );
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setScale(0.85);
    setPan({ x: 30, y: 30 });
  };

  const handleDownloadWorkflow = () => {
    const jsonStr = JSON.stringify(nodeGraph, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nodeGraph.workflowJsonFilename ?? `${displayTitle.toLowerCase().replace(/\s+/g, "-")}-workflow.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-content-muted">
          <span>{nodeGraph.nodes.length} nodes • {nodeGraph.edges.length} connections</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-surface-border bg-surface-subtle p-0.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
              aria-label="Zoom out"
              className="p-1 rounded text-content-muted hover:text-content-primary transition-colors"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset zoom"
              className="p-1 rounded text-content-muted hover:text-content-primary transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.8, s + 0.1))}
              aria-label="Zoom in"
              className="p-1 rounded text-content-muted hover:text-content-primary transition-colors"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Download workflow.json */}
          {nodeGraph.downloadable && (
            <button
              type="button"
              onClick={handleDownloadWorkflow}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-surface-border bg-surface hover:bg-surface-subtle text-xs text-content-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-accent" />
              <span>Download workflow.json</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas with Pan/Zoom */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative h-72 w-full overflow-hidden rounded-2xl border border-surface-border bg-surface-subtle select-none cursor-grab active:cursor-grabbing"
      >
        <svg className="h-full w-full">
          <defs>
            <pattern id="graphGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="rgba(255, 255, 255, 0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graphGrid)" />

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {/* Edges */}
            {nodeGraph.edges.map((edge, idx) => {
              const fromNode = nodeGraph.nodes.find((n) => n.id === edge.from);
              const toNode = nodeGraph.nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isConnected = hoveredNodeId === edge.from || hoveredNodeId === edge.to;
              const x1 = fromNode.x + 140;
              const y1 = fromNode.y + 35;
              const x2 = toNode.x;
              const y2 = toNode.y + 35;
              const dx = (x2 - x1) * 0.5;

              return (
                <path
                  key={idx}
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={isConnected ? "#8B93FF" : "rgba(255, 255, 255, 0.15)"}
                  strokeWidth={isConnected ? 2 : 1.25}
                  className="transition-colors duration-150"
                />
              );
            })}

            {/* Nodes */}
            {nodeGraph.nodes.map((node) => {
              const colors = getNodeColor(node.type);
              const isHovered = hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onPointerEnter={() => setHoveredNodeId(node.id)}
                  onPointerLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer"
                >
                  <rect
                    width="140"
                    height="65"
                    rx="12"
                    fill={colors.bg}
                    stroke={isHovered ? "#8B93FF" : colors.border}
                    strokeWidth={isHovered ? 1.75 : 1}
                    className="transition-all duration-150"
                  />
                  <rect width="140" height="24" rx="12" fill={colors.header} opacity="0.6" />
                  <text
                    x="10"
                    y="16"
                    fill="#EDEDED"
                    fontSize="9.5"
                    fontFamily="var(--font-inter), sans-serif"
                    fontWeight="500"
                  >
                    {node.type}
                  </text>
                  <text
                    x="10"
                    y="45"
                    fill="#8A8A93"
                    fontSize="9"
                    fontFamily="var(--font-inter), sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
