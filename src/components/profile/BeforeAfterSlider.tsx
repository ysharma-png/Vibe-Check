"use client";

import React, { useState, useRef, useCallback } from "react";
import { Sparkles, Wand2 } from "lucide-react";

interface BeforeAfterSliderProps {
  readonly beforeLabel?: string;
  readonly afterLabel?: string;
  readonly beforeGradient?: [string, string];
  readonly afterGradient?: [string, string];
  readonly aspectRatio?: string;
  readonly title?: string;
}

export function BeforeAfterSlider({
  beforeLabel = "Raw Diffusion Latent",
  afterLabel = "4K Graded Master",
  beforeGradient = ["#16161A", "#2E303E"],
  afterGradient = ["#1A1C2E", "#8B93FF"],
  aspectRatio = "16/9",
  title = "Workflow Transformation: Pre-Upscale vs Final Master",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-content-muted">
        <span className="font-medium text-content-primary flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-accent" />
          {title}
        </span>
        <span className="text-[11px] text-content-faint">Drag slider or use arrow keys</span>
      </div>

      <div
        ref={containerRef}
        role="slider"
        aria-label="Before and after transformation slider"
        aria-valuenow={sliderPosition}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full overflow-hidden rounded-2xl border border-surface-border bg-surface-subtle cursor-ew-resize select-none focus:outline-none focus:ring-2 focus:ring-accent"
        style={{ aspectRatio }}
      >
        {/* AFTER Layer (Background) */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6"
          style={{
            background: `linear-gradient(135deg, ${afterGradient[0]}, ${afterGradient[1]})`,
          }}
        >
          <div className="text-center space-y-1 z-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-accent/20 text-accent border border-accent/30 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              {afterLabel}
            </span>
            <p className="text-xs text-content-primary font-light max-w-xs mx-auto drop-shadow-sm">
              Proteus 4K Upscale + Kodak 5219 35mm Subtle Grain Injection
            </p>
          </div>
        </div>

        {/* BEFORE Layer (Clipped Overlay) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-6"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
              background: `linear-gradient(135deg, ${beforeGradient[0]}, ${beforeGradient[1]})`,
            }}
          >
            <div className="text-center space-y-1 z-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-surface/80 text-content-muted border border-surface-border backdrop-blur-md">
                {beforeLabel}
              </span>
              <p className="text-xs text-content-muted font-light max-w-xs mx-auto">
                Raw 1024x576 Diffusion Latent (FLUX.1 Dev)
              </p>
            </div>
          </div>
        </div>

        {/* DRAGGER HANDLE */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-2xl z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-surface border-2 border-accent text-accent shadow-lg flex items-center justify-center">
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">‹</span>
              <span className="text-[10px] font-bold">›</span>
            </div>
          </div>
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-content-faint pointer-events-none z-10">
          <span className="bg-background/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {beforeLabel}
          </span>
          <span className="bg-background/80 px-2 py-0.5 rounded-full backdrop-blur-sm text-accent">
            {afterLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
