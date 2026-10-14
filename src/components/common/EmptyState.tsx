"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight, RotateCcw } from "lucide-react";
import {
  EmptySearchIllustration,
  EmptyMessagesIllustration,
  EmptyPortfolioIllustration,
  EmptyNotificationsIllustration,
  EmptyBriefsIllustration,
} from "./illustrations/EmptyIllustrations";

export type EmptyStateIllustrationType =
  | "search"
  | "messages"
  | "portfolio"
  | "notifications"
  | "briefs";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: EmptyStateIllustrationType;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const ILLUSTRATION_MAP: Record<
  EmptyStateIllustrationType,
  React.ComponentType<{ className?: string }>
> = {
  search: EmptySearchIllustration,
  messages: EmptyMessagesIllustration,
  portfolio: EmptyPortfolioIllustration,
  notifications: EmptyNotificationsIllustration,
  briefs: EmptyBriefsIllustration,
};

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  const IllustrationComponent = illustration
    ? ILLUSTRATION_MAP[illustration]
    : null;

  return (
    <div className="p-8 sm:p-14 rounded-3xl border border-surface-border/60 bg-surface/30 text-center space-y-5 max-w-lg mx-auto my-8 backdrop-blur-sm shadow-xl">
      {/* Primary Visual: Custom SVG Illustration or Icon fallback */}
      {IllustrationComponent ? (
        <div className="flex items-center justify-center py-2 transition-transform hover:scale-105 duration-300">
          <IllustrationComponent className="w-48 h-36 mx-auto text-content-muted/40" />
        </div>
      ) : Icon ? (
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mx-auto shadow-inner">
          <Icon className="h-7 w-7" />
        </div>
      ) : (
        <div className="flex items-center justify-center py-2">
          <EmptySearchIllustration className="w-48 h-36 mx-auto text-content-muted/40" />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-sm text-content-muted leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {primaryAction &&
            (primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="px-5 py-2.5 rounded-xl bg-accent text-background text-xs font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="px-5 py-2.5 rounded-xl bg-accent text-background text-xs font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface/60 text-content text-xs font-medium hover:bg-surface transition-colors inline-flex items-center gap-1.5"
              >
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="px-4 py-2.5 rounded-xl border border-surface-border bg-surface/60 text-content text-xs font-medium hover:bg-surface transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5 text-content-muted" />
                <span>{secondaryAction.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
