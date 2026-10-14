import React, { Suspense } from "react";
import type { Metadata } from "next";
import {
  Space_Grotesk,
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { Header } from "@/components/common/Header";
import { BackgroundAtmosphere } from "@/components/glass/BackgroundAtmosphere";
import { LiquidFilterDef } from "@/components/glass/LiquidFilterDef";
import { MacDock } from "@/components/glass/MacDock";
import { GlobalCommandPalette } from "@/components/common/GlobalCommandPalette";
import { FirstRunGuide } from "@/components/common/FirstRunGuide";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { CookieConsent } from "@/components/common/CookieConsent";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cacheflow.ai"),
  title: {
    default: "CacheFlow — AI-Native Creator Discovery & Deterministic Pipelines",
    template: "%s • CacheFlow",
  },
  description:
    "Hire vetted generative directors with reproducible ComfyUI DAG pipelines, character-consistent LoRAs, and guaranteed commercial clearance.",
  keywords: [
    "AI creators",
    "ComfyUI workflows",
    "generative filmmakers",
    "FLUX.1 dev",
    "Runway Gen-3",
    "AI video production",
    "commercial clearance",
  ],
  authors: [{ name: "CacheFlow Inc." }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cacheflow.ai",
    siteName: "CacheFlow",
    title: "CacheFlow — AI-Native Creator Discovery & Deterministic Pipelines",
    description:
      "Hire vetted generative directors with reproducible ComfyUI DAG pipelines, character-consistent LoRAs, and guaranteed commercial clearance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CacheFlow — AI-Native Creator Discovery",
    description:
      "Hire vetted generative directors with reproducible ComfyUI DAG pipelines and guaranteed commercial clearance.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${jakartaSans.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-content-primary antialiased selection:bg-accent/20 selection:text-content-primary pb-20 md:pb-12"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-background focus:rounded-xl focus:font-semibold focus:shadow-lift"
        >
          Skip to main content
        </a>

        {/* Liquid Refraction Filter & Living Atmosphere Behind Glass */}
        <LiquidFilterDef />
        <BackgroundAtmosphere />
        <Header />
        <main id="main-content" className="min-h-screen relative z-10">
          {children}
        </main>

        {/* Global Overlays & Modals Isolated in Suspense Boundary */}
        {/* <Suspense fallback={null}>
          <MacDock />
          <GlobalCommandPalette />
          <FirstRunGuide />
          <MobileBottomNav />
          <CookieConsent />
        </Suspense> */}
      </body>
    </html>
  );
}
