"use client";

import React from "react";

export interface IllustrationProps {
  className?: string;
}

/**
 * 1. No Search Results Illustration
 * Stylized cosmic magnifying glass scanning through floating geometric latent vectors
 */
export function EmptySearchIllustration({ className = "w-48 h-36 mx-auto" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="search-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="glass-lens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#818CF8" stop-opacity="0.05" />
        </linearGradient>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background ambient orbit */}
      <circle cx="120" cy="90" r="70" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="4 6" />
      <circle cx="120" cy="90" r="45" stroke="currentColor" stroke-opacity="0.05" />

      {/* Floating empty nodes */}
      <rect x="40" y="50" width="24" height="24" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.1" />
      <rect x="175" y="45" width="28" height="28" rx="8" fill="currentColor" fill-opacity="0.06" stroke="currentColor" stroke-opacity="0.1" />
      <circle cx="65" cy="125" r="10" fill="currentColor" fill-opacity="0.06" />
      <circle cx="185" cy="120" r="8" fill="currentColor" fill-opacity="0.06" />

      {/* Neon accent pulses */}
      <circle cx="120" cy="85" r="40" fill="url(#search-glow)" opacity="0.15" filter="url(#soft-glow)" />

      {/* Magnifying Glass Lens */}
      <circle cx="112" cy="78" r="34" fill="url(#glass-lens)" stroke="url(#search-glow)" stroke-width="3.5" />
      <circle cx="112" cy="78" r="26" stroke="#FFFFFF" stroke-opacity="0.25" stroke-dasharray="2 4" />

      {/* Internal Reticle / Sparkle */}
      <path d="M112 68 V88 M102 78 H122" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" opacity="0.8" />
      <circle cx="112" cy="78" r="3" fill="#FFFFFF" />

      {/* Lens reflection highlights */}
      <path d="M96 64 C100 58, 116 58, 126 66" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6" />

      {/* Modern angled handle */}
      <path d="M136 102 L172 138" stroke="url(#search-glow)" stroke-width="7" stroke-linecap="round" />
      <path d="M136 102 L172 138" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.5" />
      <circle cx="172" cy="138" r="4" fill="#8B5CF6" />
    </svg>
  );
}

/**
 * 2. No Messages Illustration
 * Futuristic conversational holographic dialog bubble with audio frequency waves
 */
export function EmptyMessagesIllustration({ className = "w-48 h-36 mx-auto" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="msg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EC4899" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
        <linearGradient id="msg-card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E1B4B" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      {/* Floating secondary bubble */}
      <g transform="translate(135, 30)">
        <rect width="65" height="42" rx="14" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.15" />
        <circle cx="20" cy="21" r="3" fill="currentColor" fill-opacity="0.3" />
        <circle cx="32" cy="21" r="3" fill="currentColor" fill-opacity="0.3" />
        <circle cx="44" cy="21" r="3" fill="currentColor" fill-opacity="0.3" />
      </g>

      {/* Main Glassmorphic Chat Bubble */}
      <g transform="translate(45, 52)">
        <rect width="130" height="78" rx="20" fill="url(#msg-card)" stroke="url(#msg-grad)" stroke-width="2" />
        <path d="M30 78 L20 94 L42 78 Z" fill="url(#msg-grad)" />

        {/* Audio frequency wave bars */}
        <rect x="25" y="32" width="4" height="14" rx="2" fill="#EC4899" />
        <rect x="34" y="24" width="4" height="30" rx="2" fill="#F43F5E" />
        <rect x="43" y="18" width="4" height="42" rx="2" fill="#A855F7" />
        <rect x="52" y="28" width="4" height="22" rx="2" fill="#8B5CF6" />
        <rect x="61" y="20" width="4" height="38" rx="2" fill="#38BDF8" />
        <rect x="70" y="30" width="4" height="18" rx="2" fill="#818CF8" />
        <rect x="79" y="34" width="4" height="10" rx="2" fill="#C084FC" />

        {/* Subtle avatar badge on chat bubble */}
        <circle cx="106" cy="39" r="12" fill="url(#msg-grad)" opacity="0.9" />
        <path d="M102 39 L105 42 L111 36" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  );
}

/**
 * 3. No Portfolio Items Illustration
 * 3D isometric cinematic slate and multi-layer frame reels
 */
export function EmptyPortfolioIllustration({ className = "w-48 h-36 mx-auto" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="film-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#10B981" />
        </linearGradient>
      </defs>

      {/* Layer 1 (Back frame) */}
      <rect x="55" y="32" width="110" height="74" rx="14" transform="rotate(-6 110 69)" fill="currentColor" fill-opacity="0.05" stroke="currentColor" stroke-opacity="0.1" />

      {/* Layer 2 (Middle frame) */}
      <rect x="75" y="38" width="110" height="74" rx="14" transform="rotate(4 130 75)" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.15" />

      {/* Layer 3 (Primary hero cinema slate) */}
      <g transform="translate(58, 48)">
        <rect width="124" height="82" rx="16" fill="#090D16" stroke="url(#film-glow)" stroke-width="2.5" />

        {/* Cinematic 16:9 view area */}
        <rect x="10" y="10" width="104" height="52" rx="10" fill="currentColor" fill-opacity="0.08" />

        {/* Play triangle glyph */}
        <polygon points="56,26 72,36 56,46" fill="url(#film-glow)" opacity="0.9" />

        {/* Aspect ratio badge */}
        <rect x="12" y="66" width="32" height="9" rx="4" fill="#3B82F6" opacity="0.2" />
        <rect x="48" y="66" width="24" height="9" rx="4" fill="#10B981" opacity="0.2" />
      </g>
    </svg>
  );
}

/**
 * 4. No Notifications Illustration
 * Floating notification bell with tranquil ring wave particles
 */
export function EmptyNotificationsIllustration({ className = "w-48 h-36 mx-auto" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bell-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#EF4444" />
        </linearGradient>
      </defs>

      {/* Soft circular waves */}
      <circle cx="120" cy="85" r="62" stroke="currentColor" stroke-opacity="0.06" stroke-dasharray="5 5" />
      <circle cx="120" cy="85" r="42" stroke="currentColor" stroke-opacity="0.08" />

      {/* Bell Silhouette */}
      <g transform="translate(85, 45)">
        <path
          d="M35 12 C24 12, 16 20, 16 32 C16 48, 8 56, 6 60 H64 C62 56, 54 48, 54 32 C54 20, 46 12, 35 12 Z"
          fill="#111827"
          stroke="url(#bell-grad)"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        {/* Bell clapper */}
        <circle cx="35" cy="68" r="6" fill="url(#bell-grad)" />
        {/* Top hook */}
        <circle cx="35" cy="8" r="4" fill="none" stroke="url(#bell-grad)" stroke-width="2" />
        {/* Peaceful checkmark indicator */}
        <circle cx="48" cy="22" r="10" fill="#10B981" />
        <path d="M44 22 L47 25 L53 19" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  );
}

/**
 * 5. No Briefs / Moodboards Illustration
 * Interactive creative canvas document with glowing node connectors
 */
export function EmptyBriefsIllustration({ className = "w-48 h-36 mx-auto" }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brief-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366F1" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>

      {/* Background document canvas */}
      <rect x="68" y="28" width="104" height="124" rx="16" fill="#0B0F19" stroke="url(#brief-grad)" stroke-width="2.5" />

      {/* Decorative header lines */}
      <rect x="84" y="44" width="46" height="6" rx="3" fill="#EC4899" opacity="0.8" />
      <rect x="84" y="58" width="72" height="4" rx="2" fill="currentColor" fill-opacity="0.2" />
      <rect x="84" y="68" width="56" height="4" rx="2" fill="currentColor" fill-opacity="0.15" />

      {/* Floating ComfyUI / Node connections */}
      <circle cx="94" cy="98" r="9" fill="#6366F1" opacity="0.9" />
      <circle cx="146" cy="98" r="9" fill="#06B6D4" opacity="0.9" />
      <circle cx="120" cy="126" r="9" fill="#10B981" opacity="0.9" />

      <path d="M94 98 C120 78, 120 118, 146 98" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" />
      <path d="M120 126 C105 110, 135 110, 146 98" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 3" opacity="0.7" />
    </svg>
  );
}
