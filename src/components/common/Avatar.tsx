"use client";

import React, { useState } from "react";
import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type AvailabilityStatus = "open" | "limited" | "booked" | "offline";

export interface AvatarProps {
  src?: string | null;
  avatarUrl?: string | null;
  name: string;
  handle?: string;
  size?: AvatarSize;
  gradient?: readonly [string, string] | [string, string];
  availability?: AvailabilityStatus;
  showStatus?: boolean;
  isVerified?: boolean;
  priority?: boolean;
  shape?: "circle" | "rounded";
  className?: string;
  alt?: string;
}

const SIZE_CONFIG: Record<
  AvatarSize,
  {
    dimension: number;
    containerClass: string;
    textClass: string;
    dotClass: string;
    verifiedBadgeSize: number;
  }
> = {
  xs: {
    dimension: 24,
    containerClass: "w-6 h-6",
    textClass: "text-[10px]",
    dotClass: "w-1.5 h-1.5 bottom-0 right-0",
    verifiedBadgeSize: 10,
  },
  sm: {
    dimension: 32,
    containerClass: "w-8 h-8",
    textClass: "text-xs",
    dotClass: "w-2 h-2 bottom-0 right-0",
    verifiedBadgeSize: 12,
  },
  md: {
    dimension: 40,
    containerClass: "w-10 h-10",
    textClass: "text-sm",
    dotClass: "w-2.5 h-2.5 bottom-0.5 right-0.5",
    verifiedBadgeSize: 14,
  },
  lg: {
    dimension: 48,
    containerClass: "w-12 h-12",
    textClass: "text-base",
    dotClass: "w-3 h-3 bottom-0.5 right-0.5",
    verifiedBadgeSize: 16,
  },
  xl: {
    dimension: 64,
    containerClass: "w-16 h-16",
    textClass: "text-xl",
    dotClass: "w-3.5 h-3.5 bottom-1 right-1",
    verifiedBadgeSize: 18,
  },
  "2xl": {
    dimension: 96,
    containerClass: "w-24 h-24",
    textClass: "text-3xl",
    dotClass: "w-4 h-4 bottom-1.5 right-1.5",
    verifiedBadgeSize: 22,
  },
  "3xl": {
    dimension: 128,
    containerClass: "w-32 h-32",
    textClass: "text-4xl",
    dotClass: "w-5 h-5 bottom-2 right-2",
    verifiedBadgeSize: 26,
  },
};

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  open: "bg-emerald-500 ring-emerald-950/40",
  limited: "bg-amber-500 ring-amber-950/40",
  booked: "bg-rose-500 ring-rose-950/40",
  offline: "bg-zinc-400 ring-zinc-950/40",
};

/**
 * Deterministic hash function for seed strings to generate consistent colors & avatars
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic gradient pairs based on handle or name
 */
const DEFAULT_GRADIENTS: [string, string][] = [
  ["#8b5cf6", "#06b6d4"],
  ["#ec4899", "#8b5cf6"],
  ["#3b82f6", "#10b981"],
  ["#f59e0b", "#ef4444"],
  ["#6366f1", "#ec4899"],
  ["#14b8a6", "#3b82f6"],
  ["#a855f7", "#3b82f6"],
  ["#06b6d4", "#3b82f6"],
  ["#10b981", "#14b8a6"],
  ["#f43f5e", "#fb7185"],
];

function getGradient(idx: number): [string, string] {
  const g = DEFAULT_GRADIENTS[Math.abs(idx) % DEFAULT_GRADIENTS.length];
  return g ? g : ["#8b5cf6", "#06b6d4"];
}

/**
 * Generates an inline deterministic stylized SVG portrait as guaranteed offline fallback
 */
function generateDeterministicSvgDataUri(seed: string): string {
  const hash = hashString(seed);
  const color1 = getGradient(hash)[0];
  const color2 = getGradient(hash + 3)[1];
  const eyeRadius = 3 + (hash % 3);
  const smileCurve = 40 + ((hash >> 2) % 15);
  const accessoryType = hash % 4; // glasses, headphones, cap, none

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <linearGradient id="skin-${hash}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fdba74"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#bg-${hash})" />
    <!-- Stylized shoulders/torso -->
    <path d="M20 95 C25 72, 75 72, 80 95 Z" fill="${color2}" opacity="0.9" />
    <path d="M30 95 C35 78, 65 78, 70 95 Z" fill="#ffffff" opacity="0.2" />
    <!-- Stylized Head -->
    <ellipse cx="50" cy="48" rx="22" ry="26" fill="url(#skin-${hash})" />
    <!-- Hair stylized -->
    <path d="M26 44 C24 24, 76 24, 74 44 C66 32, 34 32, 26 44 Z" fill="#18181b" />
    <!-- Eyes -->
    <circle cx="41" cy="48" r="${eyeRadius}" fill="#09090b" />
    <circle cx="59" cy="48" r="${eyeRadius}" fill="#09090b" />
    <circle cx="${41 + 1}" cy="${48 - 1}" r="1.5" fill="#ffffff" />
    <circle cx="${59 + 1}" cy="${48 - 1}" r="1.5" fill="#ffffff" />
    <!-- Smile -->
    <path d="M43 ${smileCurve} Q50 ${smileCurve + 6} 57 ${smileCurve}" fill="none" stroke="#7c2d12" stroke-width="2" stroke-linecap="round" />
    <!-- Accessory overlay -->
    ${
      accessoryType === 1
        ? `<!-- Modern Tech Glasses -->
           <rect x="33" y="42" width="15" height="12" rx="3" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
           <rect x="52" y="42" width="15" height="12" rx="3" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
           <line x1="48" y1="48" x2="52" y2="48" stroke="#ffffff" stroke-width="2" opacity="0.8"/>`
        : accessoryType === 2
        ? `<!-- Creative Headphones -->
           <path d="M25 48 C25 28, 75 28, 75 48" fill="none" stroke="#38bdf8" stroke-width="3"/>
           <rect x="23" y="42" width="6" height="14" rx="2" fill="#38bdf8"/>
           <rect x="71" y="42" width="6" height="14" rx="2" fill="#38bdf8"/>`
        : ""
    }
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Reusable Unified Avatar Component
 * Fallback Chain:
 * 1. Uploaded/custom URL (`src`)
 * 2. Generated illustrated portrait / local avatar asset (`avatarUrl`)
 * 3. Offline deterministic stylized SVG avatar (from handle/seed)
 * 4. Initials on deterministic dual-stop gradient
 */
export function Avatar({
  src,
  avatarUrl,
  name,
  handle,
  size = "md",
  gradient,
  availability,
  showStatus = false,
  isVerified = false,
  priority = false,
  shape = "circle",
  className = "",
  alt,
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [avatarUrlFailed, setAvatarUrlFailed] = useState(false);

  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const cleanSeed = (handle || name || "creator").replace(/^@/, "").toLowerCase();
  const seedHash = hashString(cleanSeed);

  // Determine fallback gradient
  const activeGradient = gradient || getGradient(seedHash);

  // Derive initials
  const initials = (name || cleanSeed)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || cleanSeed.slice(0, 2).toUpperCase();

  // Determine resolved image source
  let resolvedImage: string | null = null;
  if (src && !imageFailed) {
    resolvedImage = src;
  } else if (avatarUrl && !avatarUrlFailed) {
    resolvedImage = avatarUrl;
  } else {
    // Guaranteed inline deterministic stylized SVG portrait
    resolvedImage = generateDeterministicSvgDataUri(cleanSeed);
  }

  // Guaranteed fallback data URI
  const svgFallbackUri = generateDeterministicSvgDataUri(cleanSeed);

  const roundedClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  const handleImageError = () => {
    if (src && !imageFailed) {
      setImageFailed(true);
    } else {
      setAvatarUrlFailed(true);
    }
  };

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 ${config.containerClass} ${className}`}
      title={`${name}${handle ? ` (${handle})` : ""}`}
    >
      {/* Verified Ring */}
      {isVerified && (
        <span
          className={`absolute -inset-0.5 ${roundedClass} bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 opacity-90 blur-[1px]`}
          aria-hidden="true"
        />
      )}

      {/* Main Avatar Container */}
      <span
        className={`relative w-full h-full ${roundedClass} overflow-hidden shadow-inner flex items-center justify-center z-10 transition-transform duration-200 ${
          isVerified ? "ring-2 ring-background" : ""
        }`}
        style={{
          background: `linear-gradient(135deg, ${activeGradient[0]}, ${activeGradient[1]})`,
        }}
      >
        {resolvedImage ? (
          <Image
            src={resolvedImage}
            alt={alt || `${name}'s avatar`}
            width={config.dimension}
            height={config.dimension}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="w-full h-full object-cover"
            onError={handleImageError}
            unoptimized={resolvedImage.startsWith("data:") || resolvedImage.endsWith(".svg")}
          />
        ) : (
          /* Deterministic SVG fallback */
          <Image
            src={svgFallbackUri}
            alt={alt || `${name}'s avatar`}
            width={config.dimension}
            height={config.dimension}
            className="w-full h-full object-cover"
            unoptimized
          />
        )}

        {/* Absolute fallback: Initials when both images fail */}
        {imageFailed && avatarUrlFailed && (
          <span
            className={`font-semibold tracking-wider text-white select-none ${config.textClass}`}
          >
            {initials}
          </span>
        )}
      </span>

      {/* Verified Mini Checkmark Badge (for lg and above) */}
      {isVerified && (size === "lg" || size === "xl" || size === "2xl" || size === "3xl") && (
        <span
          className="absolute -top-0.5 -right-0.5 z-20 flex items-center justify-center bg-cyan-500 text-white rounded-full ring-2 ring-background shadow-md"
          style={{
            width: config.verifiedBadgeSize,
            height: config.verifiedBadgeSize,
          }}
          title="Verified Creator"
        >
          <svg
            className="w-2.5 h-2.5 fill-current"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}

      {/* Online / Availability Status Dot */}
      {showStatus && availability && (
        <span
          className={`absolute ${config.dotClass} ${roundedClass} ${
            STATUS_COLORS[availability] || STATUS_COLORS.open
          } ring-2 ring-background z-20 shadow-sm`}
          title={`Status: ${availability}`}
          aria-label={`Status: ${availability}`}
        />
      )}
    </span>
  );
}
