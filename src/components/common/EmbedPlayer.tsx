"use client";

import React from "react";
import { ExternalLink, Film, CheckCircle2, Shield } from "lucide-react";
import { ImportedAttribution } from "@/lib/importers/types";

interface EmbedPlayerProps {
  embedUrl?: string;
  sourceUrl?: string;
  platform?: string;
  title: string;
  aspectRatio?: string;
  attribution?: ImportedAttribution;
  thumbnailUrl?: string;
}

export function EmbedPlayer({
  embedUrl,
  sourceUrl,
  platform,
  title,
  aspectRatio = "16:9",
  attribution,
  thumbnailUrl,
}: EmbedPlayerProps) {
  const isVideoEmbed =
    platform === "youtube" ||
    platform === "vimeo" ||
    embedUrl?.includes("youtube") ||
    embedUrl?.includes("vimeo");

  const ratioClass = aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-[16/9]";

  return (
    <div className="space-y-3 w-full">
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-surface-border bg-black shadow-xl flex items-center justify-center ${ratioClass}`}
      >
        {isVideoEmbed && embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="w-full h-full border-0"
          />
        ) : thumbnailUrl ? (
          <div className="relative w-full h-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/30 text-accent uppercase">
                  {platform ?? "External"} Showcase
                </span>
                <p className="text-xs text-white font-medium line-clamp-1">{title}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-2 text-content-muted">
            <Film className="h-8 w-8 mx-auto text-accent" />
            <p className="text-xs">{title}</p>
          </div>
        )}
      </div>

      {/* Attribution & Original Source Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-surface-border bg-surface-subtle text-xs">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="text-[11px] space-y-0.5">
            <div className="flex items-center gap-1.5 text-content-primary font-medium">
              <span>Attribution: {attribution?.creatorName || "Original Creator"}</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            </div>
            <p className="text-[10px] text-content-muted">
              Streamed via official embed player • No local re-hosting
            </p>
          </div>
        </div>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-surface-border bg-surface hover:bg-surface-border text-content-primary text-[11px] font-medium transition-colors"
          >
            <span>View original on {platform ? platform.toUpperCase() : "Platform"}</span>
            <ExternalLink className="h-3 w-3 text-content-muted" />
          </a>
        )}
      </div>
    </div>
  );
}
