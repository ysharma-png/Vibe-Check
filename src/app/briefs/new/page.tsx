import React, { Suspense } from "react";
import type { Metadata } from "next";
import { BriefBuilder } from "@/components/brief/BriefBuilder";

export const metadata: Metadata = {
  title: "AI Brief Builder | CacheFlow",
  description:
    "Structure generative media campaign briefs, define escrow milestones, mandate foundation model compliance, and match with verified AI creators.",
};

export default function NewBriefPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="mt-3 text-xs font-mono text-zinc-400">Loading AI Brief Builder...</p>
          </div>
        }
      >
        <BriefBuilder />
      </Suspense>
    </div>
  );
}
