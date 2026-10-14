"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, CornerDownLeft, Command } from "lucide-react";

export function FirstRunGuide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const hasDismissed = localStorage.getItem("cf_guide_dismissed");
      if (!hasDismissed) {
        // Show after brief 1s initial delay on first run
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem("cf_guide_dismissed", "true");
    } catch {}
  };

  const triggerPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    );
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-6 z-40 max-w-sm rounded-2xl border border-accent/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
          <span>Quick Discovery Shortcut</span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-content-muted hover:text-white p-0.5"
          aria-label="Dismiss guide"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-xs text-content-secondary mt-2 leading-relaxed">
        Press <kbd className="px-1.5 py-0.5 rounded border border-surface-border bg-surface-subtle font-mono text-[10px] text-accent">⌘K</kbd> (or <kbd className="px-1.5 py-0.5 rounded border border-surface-border bg-surface-subtle font-mono text-[10px] text-accent">Ctrl+K</kbd>) anywhere to instantly search verified filmmakers, filter ComfyUI tools, or switch studios.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={triggerPalette}
          className="px-3 py-1.5 rounded-xl bg-accent text-background text-xs font-semibold hover:bg-accent/90 transition-colors shadow-sm"
        >
          Open Palette Now
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-content-muted hover:text-white transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
