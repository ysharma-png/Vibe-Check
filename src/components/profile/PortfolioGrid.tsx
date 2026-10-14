"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Smartphone, Monitor } from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { getToolById } from "@/lib/taxonomy";
import Image from "next/image";

interface PortfolioGridProps {
  readonly items: readonly PortfolioItem[];
  readonly onSelectItem: (itemId: string) => void;
}

export function PortfolioGrid({ items, onSelectItem }: PortfolioGridProps) {
  return (
    <section aria-label="Creator Portfolio Work" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-content-primary">
            Portfolio &amp; verified work ({items.length})
          </h2>
          <p className="text-xs text-content-muted mt-0.5">
            Click any work to inspect its ComfyUI pipeline and commercial license.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const reproDotColor = {
            verified_deterministic: "bg-verified",
            partially_reproducible: "bg-caution",
            unverified: "bg-content-faint",
          }[item.reproducibility.kind];

          // Mini toolchain chain
          const toolChainNames = item.toolchain.slice(0, 3).map((id) => {
            const t = getToolById(id);
            return t ? t.name.split(" ")[0] : id;
          });

          return (
            <article
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectItem(item.id);
                }
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-300 hover:border-surface-border-hover hover:shadow-lift cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {/* Media Poster Canvas */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <Image
                  src={
                    item.mediaUrl ||
                    `/assets/thumbnails/thumb-${((Math.abs(item.id.charCodeAt(item.id.length - 1)) % 24) + 1)
                      .toString()
                      .padStart(3, "0")}.svg`
                  }
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div
                  className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${item.posterGradient[0]}, ${item.posterGradient[1]}, ${item.posterGradient[2] ?? "#16161A"})`,
                    opacity: 0.25,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30 pointer-events-none" />

                {/* Top badges: aspect ratio + verified dot */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-content-muted backdrop-blur-md">
                    {item.aspectRatio === "9:16" ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Monitor className="h-3 w-3" />
                    )}
                    <span>{item.aspectRatio}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Reproducibility dot */}
                    <span
                      title={`Reproducibility: ${item.reproducibility.kind}`}
                      className={`h-2 w-2 rounded-full ${reproDotColor}`}
                    />
                    {item.commercialSafety.subscriptionVerified && (
                      <div className="p-1 rounded-full bg-background/80 text-verified backdrop-blur-md">
                        <ShieldCheck className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold text-content-primary truncate group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-content-muted line-clamp-1">
                  {item.description}
                </p>

                {/* Mini toolchain arrow chain */}
                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-content-muted">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    {toolChainNames.map((name, idx) => (
                      <React.Fragment key={idx}>
                        <span className="truncate">{name}</span>
                        {idx < toolChainNames.length - 1 && (
                          <span className="text-content-faint">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-0.5 text-content-primary font-medium group-hover:text-accent transition-colors">
                    <span>Inspect</span>
                    <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
