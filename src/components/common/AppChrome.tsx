"use client";

import React from "react";
import { Header } from "@/components/common/Header";
import { MacDock } from "@/components/glass/MacDock";
import { GlobalCommandPalette } from "@/components/common/GlobalCommandPalette";
import { FirstRunGuide } from "@/components/common/FirstRunGuide";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { CookieConsent } from "@/components/common/CookieConsent";
import { CustomCursor } from "@/components/common/CustomCursor";

interface AppChromeProps {
  children: React.ReactNode;
}

/**
 * Consolidated Root Client Chrome
 * Encapsulates all global layout client components under a single client reference boundary.
 * Prevents Next.js webpack split-chunk factory registration mismatches across disparate RSC client imports.
 */
export function AppChrome({ children }: AppChromeProps) {
  return (
    <>
      {/* Custom Liquid Optical Cursor */}
      <CustomCursor />

      {/* Global Navigation Chrome */}
      <Header />

      <main id="main-content" className="min-h-screen relative z-10">
        {children}
      </main>

      {/* macOS Desktop Dock & Global Modals */}
      <MacDock />
      <GlobalCommandPalette />
      <FirstRunGuide />
      <MobileBottomNav />
      <CookieConsent />
    </>
  );
}

export default AppChrome;
