"use client";

import React from "react";
import { X } from "lucide-react";
import { FilterState } from "@/lib/discovery/filter";
import { DiscoveryResult } from "@/lib/discovery/fallback";
import { getToolById } from "@/lib/taxonomy";

interface ActiveFilterChipsProps {
  readonly filters: FilterState;
  readonly onFilterChange: (filters: FilterState) => void;
  readonly onResetFilters: () => void;
  readonly discoveryResult?: DiscoveryResult;
}

export function ActiveFilterChips({
  filters,
  onFilterChange,
  onResetFilters,
  discoveryResult,
}: ActiveFilterChipsProps) {
  // Collect active filters
  const chips: { id: string; label: string; onRemove: () => void; isRelaxed?: boolean; original?: string }[] = [];

  // If fallback is in relaxed state, inspect relaxed steps
  const isRelaxed = discoveryResult?.kind === "relaxed";
  const relaxationSteps = isRelaxed && "relaxation" in discoveryResult ? discoveryResult.relaxation : [];

  // Query chip
  if (filters.query) {
    chips.push({
      id: "q",
      label: `"${filters.query}"`,
      onRemove: () => onFilterChange({ ...filters, query: "" }),
    });
  }

  // Tools chips
  for (const toolId of filters.tools) {
    const tool = getToolById(toolId);
    const toolName = tool ? tool.name : toolId;

    // Check if this tool was substituted in relaxation
    const toolSubStep = relaxationSteps.find((s) => s.kind === "tool_substitution" && s.original === toolId);

    if (toolSubStep) {
      const subTool = getToolById(toolSubStep.substitute);
      chips.push({
        id: `tool-${toolId}`,
        label: subTool?.name ?? toolSubStep.substitute,
        original: toolName,
        isRelaxed: true,
        onRemove: () =>
          onFilterChange({
            ...filters,
            tools: filters.tools.filter((t) => t !== toolId),
          }),
      });
    } else {
      chips.push({
        id: `tool-${toolId}`,
        label: toolName,
        onRemove: () =>
          onFilterChange({
            ...filters,
            tools: filters.tools.filter((t) => t !== toolId),
          }),
      });
    }
  }

  // Aspect ratios
  for (const aspect of filters.aspectRatios) {
    chips.push({
      id: `aspect-${aspect}`,
      label: aspect,
      onRemove: () =>
        onFilterChange({
          ...filters,
          aspectRatios: filters.aspectRatios.filter((a) => a !== aspect),
        }),
    });
  }

  // Specializations
  for (const spec of filters.specializations) {
    const specSubStep = relaxationSteps.find((s) => s.kind === "specialization_adjacent" && s.original === spec);

    if (specSubStep) {
      chips.push({
        id: `spec-${spec}`,
        label: specSubStep.substitute,
        original: spec,
        isRelaxed: true,
        onRemove: () =>
          onFilterChange({
            ...filters,
            specializations: filters.specializations.filter((s) => s !== spec),
          }),
      });
    } else {
      chips.push({
        id: `spec-${spec}`,
        label: spec,
        onRemove: () =>
          onFilterChange({
            ...filters,
            specializations: filters.specializations.filter((s) => s !== spec),
          }),
      });
    }
  }

  // Verification
  if (filters.verification.commercialLicense) {
    chips.push({
      id: "ver-comm",
      label: "Commercial license",
      onRemove: () =>
        onFilterChange({
          ...filters,
          verification: { ...filters.verification, commercialLicense: false },
        }),
    });
  }

  if (filters.verification.reproduciblePipeline) {
    chips.push({
      id: "ver-repr",
      label: "Deterministic pipeline",
      onRemove: () =>
        onFilterChange({
          ...filters,
          verification: { ...filters.verification, reproduciblePipeline: false },
        }),
    });
  }

  // Availability
  for (const avail of filters.availability) {
    chips.push({
      id: `avail-${avail}`,
      label: avail,
      onRemove: () =>
        onFilterChange({
          ...filters,
          availability: filters.availability.filter((a) => a !== avail),
        }),
    });
  }

  // Budget
  if (filters.maxStartingRateUsd !== null) {
    chips.push({
      id: "budget",
      label: `Under $${filters.maxStartingRateUsd.toLocaleString()}`,
      onRemove: () => onFilterChange({ ...filters, maxStartingRateUsd: null }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1.5 rounded-full text-[11px] bg-surface border border-surface-border text-content-primary"
        >
          {chip.isRelaxed && chip.original ? (
            <span className="flex items-center gap-1">
              <span className="line-through text-content-muted">{chip.original}</span>
              <span className="text-content-faint">→</span>
              <span className="text-accent">{chip.label}</span>
            </span>
          ) : (
            <span>{chip.label}</span>
          )}

          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label}`}
            className="p-0.5 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] text-content-muted hover:text-content-primary pl-1 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
