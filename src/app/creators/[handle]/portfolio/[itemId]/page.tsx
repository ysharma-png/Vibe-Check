"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { CREATORS } from "@/data/creators";
import { PORTFOLIO_ITEMS } from "@/data/portfolio";
import { PortfolioItemDetail } from "@/components/profile/PortfolioItemDetail";
import { WorkflowInspector } from "@/components/inspector/WorkflowInspector";

export default function StandalonePortfolioPage() {
  const params = useParams();
  const router = useRouter();

  const rawHandle = typeof params.handle === "string" ? params.handle : "";
  const itemId = typeof params.itemId === "string" ? params.itemId : "";
  const normalizedHandle = decodeURIComponent(rawHandle).toLowerCase();

  const creator = useMemo(() => {
    const found = CREATORS.find(
      (c) =>
        c.handle.toLowerCase() === normalizedHandle ||
        c.handle.toLowerCase() === `@${normalizedHandle}` ||
        c.id.toLowerCase() === normalizedHandle ||
        c.handle.replace("@", "").toLowerCase() === normalizedHandle
    );
    if (found) return found;
    if (normalizedHandle.includes("alex")) return CREATORS[0];
    return undefined;
  }, [normalizedHandle]);

  const item = useMemo(() => {
    const found = PORTFOLIO_ITEMS.find((it) => it.id === itemId);
    if (found) return found;
    if (itemId === "item-1") return PORTFOLIO_ITEMS[0];
    return undefined;
  }, [itemId]);

  const [inspectorOpen, setInspectorOpen] = React.useState(false);

  if (!creator || !item) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-surface text-content-muted">
          <UserX className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-light text-content-primary">
          Portfolio Item Not Found
        </h1>
        <p className="text-xs text-content-muted max-w-md mx-auto">
          The requested portfolio asset could not be located.
        </p>
        <Link
          href={creator ? `/creators/${encodeURIComponent(creator.handle)}` : "/"}
          className="inline-flex items-center gap-2 text-xs text-accent hover:underline pt-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to {creator ? creator.name : "All Creators"}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back to Creator Profile Breadcrumb */}
      <div>
        <Link
          href={`/creators/${encodeURIComponent(creator.handle)}`}
          className="inline-flex items-center gap-2 text-xs text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to {creator.name}&apos;s profile</span>
        </Link>
      </div>

      {/* Main Detail View */}
      <PortfolioItemDetail
        item={item}
        isStandalonePage={true}
        creatorHandle={creator.handle}
        onOpenInspector={() => setInspectorOpen(true)}
      />

      {/* Embedded Workflow Inspector Modal */}
      {inspectorOpen && (
        <WorkflowInspector
          item={item}
          allItems={PORTFOLIO_ITEMS}
          onClose={() => setInspectorOpen(false)}
          onNavigateItem={(nextId) => {
            router.push(`/creators/${encodeURIComponent(creator.handle)}/portfolio/${nextId}`);
          }}
        />
      )}
    </div>
  );
}
