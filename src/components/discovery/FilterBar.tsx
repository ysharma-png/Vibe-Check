"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, X, Sparkles, CornerDownLeft } from "lucide-react";
import { FilterState } from "@/lib/discovery/filter";
import { SEARCH_SUGGESTIONS, DEMO_TRAPS } from "./CommandPalette";

interface FilterBarProps {
  readonly filters: FilterState;
  readonly onFilterChange: (filters: FilterState) => void;
  readonly onOpenDrawer: () => void;
  readonly onOpenCommandPalette: () => void;
  readonly onSelectPreset: (url: string) => void;
  readonly activeFiltersCount: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  onOpenDrawer,
  onOpenCommandPalette,
  onSelectPreset,
  activeFiltersCount,
}: FilterBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearQuery = () => {
    onFilterChange({ ...filters, query: "" });
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* (5) ONE Large Pill Search Bar */}
      <div
        className={`flex items-center h-13 px-4 rounded-full bg-surface border transition-all duration-200 shadow-soft ${
          isFocused
            ? "border-accent/40 ring-2 ring-accent/10"
            : "border-surface-border hover:border-surface-border-hover"
        }`}
      >
        <Search className="h-4 w-4 text-content-muted shrink-0 mr-3" />

        <input
          type="text"
          value={filters.query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
          placeholder="Try: vertical product ad, Runway, verified"
          className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none"
        />

        {filters.query && (
          <button
            type="button"
            onClick={handleClearQuery}
            aria-label="Clear search"
            className="p-1 mr-2 text-content-muted hover:text-content-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Cmd+K trigger hint */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Open Command Palette (Cmd/Ctrl + K)"
          className="hidden sm:flex items-center gap-1 px-2 py-1 mr-2 rounded-md bg-surface-subtle text-[11px] font-sans text-content-muted hover:text-content-primary transition-colors"
        >
          <span>⌘K</span>
        </button>

        {/* Integrated Filters Button with Count */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-colors shrink-0 ${
            activeFiltersCount > 0
              ? "bg-accent/15 text-accent border border-accent/30"
              : "bg-surface-subtle text-content-muted hover:text-content-primary hover:bg-surface-muted"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-accent text-[10px] text-surface font-semibold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Soft Dropdown on Focus */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-surface/95 border border-surface-border shadow-card backdrop-blur-md p-3 space-y-3">
          {/* Try searching section */}
          <div>
            <span className="text-[10px] text-content-faint px-2 block mb-1">
              Try searching
            </span>
            <div className="space-y-0.5">
              {SEARCH_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectPreset(sug.url);
                    setIsFocused(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                >
                  <span className="text-xs text-content-primary group-hover:text-accent transition-colors">
                    {sug.label}
                  </span>
                  <span className="text-[10px] text-content-muted">
                    {sug.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rare combos (Demo Traps) section */}
          <div className="pt-2 border-t border-surface-border/60">
            <span className="text-[10px] text-content-faint px-2 block mb-1">
              Rare combos (fallback relaxation ladder)
            </span>
            <div className="space-y-0.5">
              {DEMO_TRAPS.map((trap) => (
                <button
                  key={trap.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectPreset(trap.url);
                    setIsFocused(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl text-left hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                >
                  <span className="text-xs text-content-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-accent/60" />
                    <span>{trap.label}</span>
                  </span>
                  <span className="text-[10px] text-content-muted">
                    {trap.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
