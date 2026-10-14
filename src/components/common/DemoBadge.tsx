"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface DemoBadgeProps {
  readonly isDemo?: boolean;
  readonly className?: string;
  readonly variant?: "pill" | "inline";
}

/**
 * Subtle "Demo profile" indicator for synthetic demo creators.
 * Controlled by SHOW_DEMO_BADGE / NEXT_PUBLIC_SHOW_DEMO_BADGE environment variable.
 */
export function DemoBadge({
  isDemo = true,
  className = "",
  variant = "pill",
}: DemoBadgeProps) {
  // Hideable via env flag SHOW_DEMO_BADGE
  if (
    process.env.NEXT_PUBLIC_SHOW_DEMO_BADGE === "false" ||
    process.env.SHOW_DEMO_BADGE === "false"
  ) {
    return null;
  }

  if (!isDemo) return null;

  if (variant === "inline") {
    return (
      <span
        title="Synthetic fictional creator profile for demonstration and rubric evaluation"
        className={`inline-flex items-center gap-1 text-[10px] font-mono text-content-muted/90 bg-surface-subtle/80 border border-surface-border/80 px-2 py-0.5 rounded-md ${className}`}
      >
        <Sparkles className="h-2.5 w-2.5 text-accent/70 shrink-0" />
        <span>Demo profile</span>
      </span>
    );
  }

  return (
    <span
      title="Synthetic fictional creator profile for demonstration and rubric evaluation"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-content-muted bg-surface-subtle border border-surface-border shadow-sm ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent/70 animate-pulse shrink-0" />
      <span>Demo profile</span>
    </span>
  );
}
