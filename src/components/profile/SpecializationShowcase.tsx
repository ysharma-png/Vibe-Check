"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { PortfolioItem, Specialization } from "@/types/schema";

interface SpecializationShowcaseProps {
  readonly specializations: readonly Specialization[];
  readonly portfolioItems: readonly PortfolioItem[];
  readonly onSelectItem: (itemId: string) => void;
}

export function SpecializationShowcase({
  specializations,
  portfolioItems,
  onSelectItem,
}: SpecializationShowcaseProps) {
  return (
    <section aria-label="Specialization Proof of Work" className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-content-primary">
          Specialization proof of work
        </h2>
        <p className="text-xs text-content-muted mt-0.5">
          Verified skills proven by audited production pipeline assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {specializations.map((spec) => {
          const proofItems = portfolioItems.slice(0, 2);

          return (
            <div
              key={spec}
              className="flex flex-col justify-between rounded-2xl border border-surface-border bg-surface p-4 shadow-soft"
            >
              <div>
                <span className="inline-block rounded-lg bg-surface-subtle border border-surface-border px-2 py-0.5 text-xs font-medium text-content-primary">
                  {spec}
                </span>

                <div className="mt-3 space-y-2">
                  {proofItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectItem(item.id)}
                      className="group flex w-full items-center justify-between rounded-xl border border-surface-border bg-surface-subtle/50 p-2 text-left hover:border-surface-border-hover hover:bg-surface-subtle transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className="h-8 w-8 shrink-0 rounded-lg shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]})`,
                          }}
                        />
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-medium text-content-primary group-hover:text-accent transition-colors">
                            {item.title}
                          </span>
                          <span className="block text-[10px] text-content-muted">
                            {item.aspectRatio} • {item.resolution}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="h-3 w-3 text-content-muted group-hover:text-accent transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
