import React, { Suspense } from "react";
import { Metadata } from "next";
import { getPlatformStats } from "@/lib/data/platform-stats";
import { LoginFormClient } from "@/components/auth/LoginFormClient";

export const metadata: Metadata = {
  title: "Sign in — CacheFlow",
  description: "Sign in to your verified creator studio or enterprise brand workspace.",
};

export default async function LoginPage() {
  const stats = await getPlatformStats();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormClient stats={stats} />
    </Suspense>
  );
}
