"use client";

import React, { Suspense, useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterState, SortOption } from "@/lib/discovery/filter";
import { resolveDiscovery, DiscoveryResult } from "@/lib/discovery/fallback";
import {
  DEFAULT_FILTER_STATE,
  parseSearchParams,
  serializeFilterState,
} from "@/lib/discovery/url-state";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { PortfolioItem } from "@/types/schema";
import { HeroObject3D } from "@/components/discovery/HeroObject3D";
import { FilterBar } from "@/components/discovery/FilterBar";
import { FilterDrawer } from "@/components/discovery/FilterDrawer";
import { CommandPalette } from "@/components/discovery/CommandPalette";
import { ActiveFilterChips } from "@/components/discovery/ActiveFilterChips";
import { FallbackPanel } from "@/components/discovery/FallbackPanel";
import { CreatorGrid } from "@/components/discovery/CreatorGrid";
import { WorkflowInspector } from "@/components/inspector/WorkflowInspector";

function DiscoveryContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() =>
    parseSearchParams(searchParams)
  );

  // Modals & Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Inspector item ID state (deep-linked via ?item=<id>)
  const itemIdParam = searchParams.get("item");
  const [inspectedItem, setInspectedItem] = useState<PortfolioItem | null>(() => {
    if (itemIdParam) {
      return PORTFOLIO_ITEMS.find((it) => it.id === itemIdParam) ?? null;
    }
    return null;
  });

  // Keep inspector in sync with URL
  useEffect(() => {
    if (itemIdParam) {
      const match = PORTFOLIO_ITEMS.find((it) => it.id === itemIdParam);
      setInspectedItem(match ?? null);
    } else {
      setInspectedItem(null);
    }
  }, [itemIdParam]);

  // Sync internal filter state when external URL search params change
  useEffect(() => {
    const fromUrl = parseSearchParams(searchParams);
    setFilters(fromUrl);
  }, [searchParams]);

  // Debounced URL synchronization (150ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const baseQuery = serializeFilterState(filters);
      const params = new URLSearchParams(baseQuery.replace("?", ""));
      if (itemIdParam) {
        params.set("item", itemIdParam);
      }
      const q = params.toString();
      const nextUrl = q ? `${pathname}?${q}` : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, 150);

    return () => clearTimeout(handler);
  }, [filters, pathname, router, itemIdParam]);

  // Cmd / Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute discovery results (Exact or Fallback Ladder)
  const discoveryResult: DiscoveryResult = useMemo(() => {
    return resolveDiscovery(filters, CREATORS, PORTFOLIO_ITEMS);
  }, [filters]);

  const displayedMatches = useMemo(() => {
    if (discoveryResult.kind === "exact") return discoveryResult.matches;
    if (discoveryResult.kind === "relaxed") return discoveryResult.matches;
    return discoveryResult.popular;
  }, [discoveryResult]);

  // Is any filter or query active?
  const isFilterActive = useMemo(() => {
    return (
      filters.query.trim().length > 0 ||
      filters.tools.length > 0 ||
      filters.specializations.length > 0 ||
      filters.aspectRatios.length > 0 ||
      filters.verification.commercialLicense ||
      filters.verification.reproduciblePipeline ||
      filters.availability.length > 0 ||
      filters.maxStartingRateUsd !== null
    );
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.query.trim() ? 1 : 0) +
      filters.tools.length +
      filters.specializations.length +
      filters.aspectRatios.length +
      (filters.verification.commercialLicense ? 1 : 0) +
      (filters.verification.reproduciblePipeline ? 1 : 0) +
      filters.availability.length +
      (filters.maxStartingRateUsd !== null ? 1 : 0)
    );
  }, [filters]);

  const handleOpenInspector = (item: PortfolioItem) => {
    setInspectedItem(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", item.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseInspector = () => {
    setInspectedItem(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("item");
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const handleNavigateInspectorItem = (nextId: string) => {
    const nextItem = PORTFOLIO_ITEMS.find((it) => it.id === nextId);
    if (nextItem) {
      setInspectedItem(nextItem);
      const params = new URLSearchParams(searchParams.toString());
      params.set("item", nextId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    const params = new URLSearchParams(presetUrl.replace("?", ""));
    const parsed = parseSearchParams(params);
    setFilters(parsed);
  };

  const handleSortChange = (newSort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort: newSort }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* LANDING STATE: Above the fold */}
      <section className="relative px-6 lg:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Hero Content */}
            <div className="w-full max-w-2xl space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-content-primary leading-[1.12]">
                Find AI creators <br className="hidden sm:inline" />
                <span className="font-normal text-content-primary">you can trust.</span>
              </h1>

              <p className="text-sm sm:text-base text-content-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                Vetted generative filmmakers, transparent workflows, and guaranteed commercial clearance.
              </p>

              {/* Search Bar */}
              <div className="pt-2">
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  onOpenDrawer={() => setIsDrawerOpen(true)}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  onSelectPreset={handlePresetSelect}
                  activeFiltersCount={activeFiltersCount}
                />

                <ActiveFilterChips
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={() => setFilters(DEFAULT_FILTER_STATE)}
                  discoveryResult={discoveryResult}
                />
              </div>
            </div>

            <HeroObject3D />
          </div>
        </div>
      </section>

      {/* Fallback Panel */}
      <FallbackPanel
        discoveryResult={discoveryResult}
        onSearchExact={() => {
          setFilters((prev) => ({ ...prev }));
        }}
      />

      {/* Inline Sort Control & Count */}
      {isFilterActive && (
        <div className="mx-auto max-w-7xl w-full px-6 lg:px-8 pb-3 flex items-center justify-between text-xs text-content-muted">
          <span>
            {displayedMatches.length} creator{displayedMatches.length === 1 ? "" : "s"} found
          </span>

          <div className="flex items-center gap-2">
            <span>Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="bg-surface border border-surface-border text-content-primary rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-accent"
            >
              <option value="best_match">Best match</option>
              <option value="rate_asc">Starting rate</option>
              <option value="turnaround">Turnaround time</option>
              <option value="reliability">Reliability</option>
            </select>
          </div>
        </div>
      )}

      {/* Creator Card Grid */}
      <main className="flex-1 pb-20">
        <CreatorGrid
          matches={displayedMatches}
          isFilterActive={isFilterActive}
          onResetFilters={() => setFilters(DEFAULT_FILTER_STATE)}
          onInspectItem={handleOpenInspector}
        />
      </main>

      {/* Right Drawer Filters Sheet */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(DEFAULT_FILTER_STATE)}
        totalMatches={displayedMatches.length}
      />

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPreset={handlePresetSelect}
        onSearchSubmit={(q) => setFilters((prev) => ({ ...prev, query: q }))}
      />

      {/* Deep-Linked Workflow Inspector Modal */}
      {inspectedItem && (
        <WorkflowInspector
          item={inspectedItem}
          allItems={PORTFOLIO_ITEMS}
          onClose={handleCloseInspector}
          onNavigateItem={handleNavigateInspectorItem}
        />
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DiscoveryContent />
    </Suspense>
  );
}
