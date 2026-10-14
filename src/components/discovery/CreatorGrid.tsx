"use client";

import React from "react";
import { AlertCircle, RotateCcw, SearchX } from "lucide-react";
import { CreatorMatch } from "@/lib/discovery/filter";
import { PortfolioItem } from "@/types/schema";
import { CreatorCard } from "./CreatorCard";

interface CreatorGridProps {
  readonly matches: readonly CreatorMatch[];
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onResetFilters?: () => void;
  readonly isFilterActive?: boolean;
  readonly onInspectItem?: (item: PortfolioItem) => void;
}

export function CreatorGrid({
  matches,
  isLoading = false,
  error = null,
  onResetFilters,
  isFilterActive = false,
  onInspectItem,
}: CreatorGridProps) {
  // Error state
  if (error) {
    return (
      <section
        aria-label="Error loading creators"
        className="mx-auto my-12 max-w-lg rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-soft"
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-flagged/10 text-flagged">
          <AlertCircle className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-content-primary">
          Unable to load creators
        </h3>
        <p className="mt-1 text-xs text-content-muted">{error}</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-subtle px-3 py-1.5 text-xs text-content-primary hover:bg-surface-muted transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </section>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <section
        aria-label="Loading creators"
        aria-busy="true"
        className="mx-auto max-w-7xl px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-surface border border-surface-border overflow-hidden h-80 animate-pulse flex flex-col justify-between p-4"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-surface-subtle" />
              <div className="space-y-2 mt-4">
                <div className="h-4 w-1/2 bg-surface-subtle rounded" />
                <div className="h-3 w-1/3 bg-surface-subtle rounded" />
              </div>
              <div className="h-3 w-full bg-surface-subtle rounded mt-4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <section
        aria-label="No creators found"
        className="mx-auto my-16 max-w-md rounded-2xl border border-surface-border bg-surface p-8 text-center shadow-soft"
      >
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-content-muted">
          <SearchX className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-content-primary">
          No creators found
        </h3>
        <p className="mt-1 text-xs text-content-muted leading-relaxed">
          None of our vetted creators match your exact criteria. Try broadening your tools or clearing rate limits.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-accent text-surface px-4 py-2 text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all filters</span>
          </button>
        )}
      </section>
    );
  }

  // Main Card Grid
  return (
    <section aria-label="Creators roster" className="mx-auto max-w-7xl px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(({ creator, matchedItems, score }) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            featuredItem={matchedItems[0]}
            score={score}
            isFilterActive={isFilterActive}
            onInspectItem={onInspectItem}
          />
        ))}
      </div>
    </section>
  );
}
