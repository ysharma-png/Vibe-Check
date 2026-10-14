import React from "react";
import { Metadata } from "next";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingTrustStrip } from "@/components/landing/LandingTrustStrip";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingCreatorsCarousel } from "@/components/landing/LandingCreatorsCarousel";
import { LandingToolsWall } from "@/components/landing/LandingToolsWall";
import { LandingVerificationExplainer } from "@/components/landing/LandingVerificationExplainer";
import { LandingBriefBuilderDemo } from "@/components/landing/LandingBriefBuilderDemo";
import { LandingTestimonials } from "@/components/landing/LandingTestimonials";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "CacheFlow — AI-Native Creator Discovery & Deterministic Pipelines",
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
  openGraph: {
    title: "CacheFlow — AI-Native Creator Discovery & Deterministic Pipelines",
    description:
      "Hire vetted generative directors with reproducible ComfyUI DAG pipelines, character-consistent LoRAs, and guaranteed commercial clearance.",
    url: "https://cacheflow.ai/landing",
    siteName: "CacheFlow",
    images: [
      {
        url: "https://cacheflow.ai/og-landing.png",
        width: 1200,
        height: 630,
        alt: "CacheFlow AI-Native Creator Discovery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CacheFlow — AI-Native Creator Discovery & Deterministic Pipelines",
    description:
      "Hire vetted generative directors with reproducible ComfyUI DAG pipelines, character-consistent LoRAs, and guaranteed commercial clearance.",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-content-primary selection:bg-accent/20">
      {/* 1. Cinematic Hero with Autoplaying Showreel & Dual CTAs */}
      <LandingHero />

      {/* 2. Trust Strip with Metrics & Enterprise Logos */}
      <LandingTrustStrip />

      {/* 3. How It Works (Brief, Match, Collaborate, Deliver) */}
      <LandingHowItWorks />

      {/* 4. Featured Creators Carousel */}
      <LandingCreatorsCarousel />

      {/* 5. Supported Generative Tools Wall */}
      <LandingToolsWall />

      {/* 6. Verification Explainer vs Traditional Marketplaces */}
      <LandingVerificationExplainer />

      {/* 7. Interactive Brief-Builder Demo Section */}
      <LandingBriefBuilderDemo />

      {/* 8. Testimonials */}
      <LandingTestimonials />

      {/* 9. FAQ Section */}
      <LandingFaq />

      {/* 10. Footer */}
      <LandingFooter />
    </div>
  );
}
