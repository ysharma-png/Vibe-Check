"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface BrandLogoProps {
  name?: string;
  brandName?: string;
  handle?: string;
  industry?: string;
  gradient?: readonly [string, string] | [string, string];
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const BRAND_SIZE_MAP = {
  xs: { dimension: 20, text: "text-[9px]", glyph: 10, container: "w-5 h-5" },
  sm: { dimension: 28, text: "text-[11px]", glyph: 14, container: "w-7 h-7" },
  md: { dimension: 36, text: "text-xs", glyph: 18, container: "w-9 h-9" },
  lg: { dimension: 48, text: "text-sm", glyph: 24, container: "w-12 h-12" },
  xl: { dimension: 64, text: "text-base", glyph: 32, container: "w-16 h-16" },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const BRAND_PALETTES: [string, string][] = [
  ["#8B5CF6", "#EC4899"], // Lumina
  ["#3B82F6", "#06B6D4"], // Aether
  ["#F97316", "#EF4444"], // Apex
  ["#10B981", "#F59E0B"], // Saffron
  ["#6366F1", "#14B8A6"], // Velocity
  ["#EF4444", "#FACC15"], // Pulse
  ["#1F2937", "#6B7280"], // Kinetix
  ["#D97706", "#92400E"], // Arcadia
  ["#0284C7", "#38BDF8"], // Mirai
  ["#059669", "#84CC16"], // Terra
  ["#9333EA", "#C084FC"], // Verve
  ["#F43F5E", "#FB7185"], // Prism
  ["#78350F", "#B45309"], // Onyx
  ["#6366F1", "#A855F7"], // Strata
  ["#1E293B", "#334155"], // Neural Foundry
  ["#15803D", "#86EFAC"], // Biome
];

function getBrandPalette(idx: number): [string, string] {
  const p = BRAND_PALETTES[Math.abs(idx) % BRAND_PALETTES.length];
  return p ? p : ["#8B5CF6", "#EC4899"];
}

/**
 * Generate deterministic vector SVG wordmark/glyph data URI for any brand
 */
export function generateBrandSvgUri(name: string, handle?: string): string {
  const seed = (handle || name).toLowerCase();
  const hash = hashString(seed);
  const palette = getBrandPalette(hash);
  const monogram = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Distinct geometric glyphs based on seed
  const glyphIndex = hash % 5;
  let glyphPath = "";
  if (glyphIndex === 0) {
    // Diamond / Prism
    glyphPath = `<polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/>
                 <circle cx="50" cy="50" r="10" fill="#ffffff" />`;
  } else if (glyphIndex === 1) {
    // Interlocking rings / Orbital
    glyphPath = `<circle cx="50" cy="50" r="28" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="10 4"/>
                 <circle cx="50" cy="50" r="12" fill="#ffffff" opacity="0.9"/>`;
  } else if (glyphIndex === 2) {
    // Hexagon tech / Foundry
    glyphPath = `<polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="none" stroke="#ffffff" stroke-width="5"/>
                 <text x="50" y="56" font-family="system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle" fill="#ffffff">${monogram}</text>`;
  } else if (glyphIndex === 3) {
    // Sleek Chevron / Vector
    glyphPath = `<path d="M25 40 L50 20 L75 40 M25 65 L50 45 L75 65" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    // Modern Monogram
    glyphPath = `<rect x="22" y="22" width="56" height="56" rx="14" fill="#ffffff" opacity="0.15"/>
                 <text x="50" y="58" font-family="system-ui, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#ffffff" letter-spacing="1">${monogram}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="brand-grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette[0]}"/>
        <stop offset="100%" stop-color="${palette[1]}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="22" fill="url(#brand-grad-${hash})"/>
    <g transform="translate(0, 0)">${glyphPath}</g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function BrandLogo({
  name,
  brandName,
  handle,
  industry,
  gradient,
  size = "md",
  className = "",
}: BrandLogoProps) {
  const [loadError, setLoadError] = useState(false);
  const displayName = name || brandName || "Brand";
  const config = BRAND_SIZE_MAP[size] || BRAND_SIZE_MAP.md;
  const cleanHandle = (handle || displayName).toLowerCase().replace(/^@/, "");
  const hash = hashString(cleanHandle);
  const activeGradient = gradient || getBrandPalette(hash);

  const localFile = `/assets/brands/${cleanHandle}.svg`;
  const fallbackSvgUri = generateBrandSvgUri(displayName, cleanHandle);

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform hover:scale-105 duration-200 ${config.container} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${activeGradient[0]}, ${activeGradient[1]})`,
      }}
      title={`${displayName}${industry ? ` (${industry})` : ""}`}
    >
      <Image
        src={!loadError ? localFile : fallbackSvgUri}
        alt={`${displayName} brand logo`}
        width={config.dimension}
        height={config.dimension}
        className="w-full h-full object-cover p-1"
        onError={() => setLoadError(true)}
        unoptimized
      />
    </span>
  );
}
