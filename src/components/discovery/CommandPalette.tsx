"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, AlertCircle, X, CornerDownLeft } from "lucide-react";

export interface SearchPreset {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly url: string;
  readonly isTrap?: boolean;
}

export const SEARCH_SUGGESTIONS: readonly SearchPreset[] = [
  {
    id: "sug-1",
    label: "Vertical product commercial",
    description: "9:16 format with commercial spot deliverable",
    url: "?aspect=9:16&deliverable=commercial_spot",
  },
  {
    id: "sug-2",
    label: "Kinetic social short",
    description: "Fast-paced vertical shorts with verified pipeline",
    url: "?aspect=9:16&deliverable=social_short_form&verified=1",
  },
  {
    id: "sug-3",
    label: "FLUX photoreal cinematic",
    description: "FLUX.1 16:9 widescreen cinematic output",
    url: "?tools=flux&aspect=16:9",
  },
];

export const DEMO_TRAPS: readonly SearchPreset[] = [
  {
    id: "trap-1",
    label: "Luma vertical video",
    description: "Tool substitution ladder: falls back to Runway & Kling",
    url: "?tools=luma&aspect=9:16&verified=1",
    isTrap: true,
  },
  {
    id: "trap-2",
    label: "3D NeRF video",
    description: "Specialization adjacency: camera motion & product vis",
    url: "?specs=3D%20%2F%20NeRF&verified=1",
    isTrap: true,
  },
  {
    id: "trap-3",
    label: "Consistent character under $1,500",
    description: "Budget relaxation: preserves deterministic pipeline",
    url: "?specs=Consistent%20Character&rate=1500&reproducible=1",
    isTrap: true,
  },
];

interface CommandPaletteProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectPreset: (url: string) => void;
  readonly onSearchSubmit: (query: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectPreset,
  onSearchSubmit,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label="Quick search and presets"
            className="relative z-10 w-full max-w-lg rounded-2xl bg-surface border border-surface-border shadow-lift overflow-hidden"
          >
            {/* Input Header */}
            <form onSubmit={handleSubmit} className="flex items-center px-4 py-3.5 border-b border-surface-border">
              <Search className="h-4 w-4 text-content-muted shrink-0 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search tools, formats, or try a preset..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-content-primary placeholder-content-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-content-muted hover:text-content-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-4">
              {/* Natural suggestions */}
              <div>
                <span className="text-[10px] text-content-faint px-2 block mb-1">
                  Try searching
                </span>
                <div className="space-y-1">
                  {SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(sug.url);
                        onClose();
                      }}
                      className="w-full p-2 rounded-xl text-left hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-content-primary group-hover:text-accent transition-colors">
                          {sug.label}
                        </div>
                        <div className="text-[10px] text-content-muted truncate">
                          {sug.description}
                        </div>
                      </div>
                      <CornerDownLeft className="h-3 w-3 text-content-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rare combos (Demo Traps) */}
              <div>
                <div className="flex items-center gap-1.5 px-2 mb-1">
                  <span className="text-[10px] text-content-faint">Rare combos (fallback ladder)</span>
                </div>
                <div className="space-y-1">
                  {DEMO_TRAPS.map((trap) => (
                    <button
                      key={trap.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(trap.url);
                        onClose();
                      }}
                      className="w-full p-2 rounded-xl text-left hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-content-primary flex items-center gap-1.5 group-hover:text-accent transition-colors">
                          <span className="h-1 w-1 rounded-full bg-accent/60" />
                          <span>{trap.label}</span>
                        </div>
                        <div className="text-[10px] text-content-muted truncate">
                          {trap.description}
                        </div>
                      </div>
                      <CornerDownLeft className="h-3 w-3 text-content-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
