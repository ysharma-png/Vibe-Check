"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";
import { ALL_CREATORS as CREATORS, ALL_PORTFOLIO_ITEMS as PORTFOLIO_ITEMS } from "@/data/all-creators";
import { CreatorProfile, PortfolioItem } from "@/types/schema";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileTabs, ProfileTabKey } from "@/components/profile/ProfileTabs";
import { MasonryPortfolioGrid } from "@/components/profile/MasonryPortfolioGrid";
import { ToolsAndSkillsTab } from "@/components/profile/ToolsAndSkillsTab";
import { WorkflowsTab } from "@/components/profile/WorkflowsTab";
import { AboutTab } from "@/components/profile/AboutTab";
import { ReviewsTab } from "@/components/profile/ReviewsTab";
import { CaseStudyModal } from "@/components/profile/CaseStudyModal";
import { WorkflowInspector } from "@/components/inspector/WorkflowInspector";
import { Avatar } from "@/components/common/Avatar";

function CreatorProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>("portfolio");
  const [caseStudyItem, setCaseStudyItem] = useState<PortfolioItem | null>(null);

  const rawHandle = typeof params.handle === "string" ? params.handle : "";
  const normalizedHandle = decodeURIComponent(rawHandle).toLowerCase();

  // Find Creator Profile
  const creator = useMemo<CreatorProfile | undefined>(() => {
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

  // Creator's Portfolio Items
  const creatorItems = useMemo<PortfolioItem[]>(() => {
    if (!creator) return [];
    const itemMap = new Map<string, PortfolioItem>(
      PORTFOLIO_ITEMS.map((it) => [it.id, it])
    );
    return creator.portfolioItemIds
      .map((id) => itemMap.get(id))
      .filter((it): it is PortfolioItem => it !== undefined);
  }, [creator]);

  // Active Inspector Item from query param ?item=<id>
  const activeItemId = searchParams.get("item");
  const activeItem = useMemo(() => {
    if (!activeItemId) return null;
    return PORTFOLIO_ITEMS.find((it) => it.id === activeItemId) ?? null;
  }, [activeItemId]);

  const handleOpenItem = (itemId: string) => {
    router.push(`/creators/${encodeURIComponent(rawHandle)}?item=${itemId}`, {
      scroll: false,
    });
  };

  const handleCloseInspector = () => {
    router.push(`/creators/${encodeURIComponent(rawHandle)}`, {
      scroll: false,
    });
  };

  const handleNavigateInspectorItem = (nextId: string) => {
    router.push(`/creators/${encodeURIComponent(rawHandle)}?item=${nextId}`, {
      scroll: false,
    });
  };

  // 404 View with Suggestions
  if (!creator) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-surface text-content-muted">
          <UserX className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-light text-content-primary">
          Creator not found
        </h1>
        <p className="mt-2 text-xs text-content-muted max-w-md mx-auto leading-relaxed font-light">
          No verified AI director matches &ldquo;{rawHandle}&rdquo;. Explore other vetted creators below:
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg mx-auto">
          {CREATORS.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/creators/${encodeURIComponent(c.handle)}`}
              className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface p-3 text-left hover:border-surface-border-strong transition-colors"
            >
              <Avatar
                name={c.name}
                handle={c.handle}
                size="sm"
                gradient={c.avatarGradient}
                shape="rounded"
              />
              <span className="min-w-0 block">
                <span className="block truncate text-xs font-medium text-content-primary">
                  {c.name}
                </span>
                <span className="block truncate text-[11px] text-content-muted">
                  @{c.handle} • {c.location}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to discovery roster</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>All creators</span>
        </Link>
      </div>

      {/* Hero Section */}
      <ProfileHero creator={creator} />

      {/* Tabs Bar */}
      <ProfileTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        portfolioCount={creatorItems.length}
        toolsCount={creator.primaryTools.length}
        workflowsCount={creatorItems.filter((i) => i.nodeGraph !== null).length}
      />

      {/* Tab Panels */}
      <div>
        {activeTab === "portfolio" && (
          <MasonryPortfolioGrid
            items={creatorItems}
            onSelectItem={handleOpenItem}
            onOpenCaseStudy={setCaseStudyItem}
          />
        )}

        {activeTab === "tools" && (
          <ToolsAndSkillsTab
            items={creatorItems}
            creatorPrimaryTools={creator.primaryTools}
          />
        )}

        {activeTab === "workflows" && (
          <WorkflowsTab
            items={creatorItems}
            onOpenInspector={handleOpenItem}
          />
        )}

        {activeTab === "about" && (
          <AboutTab creator={creator} />
        )}

        {activeTab === "reviews" && (
          <ReviewsTab creator={creator} />
        )}
      </div>

      {/* Case Study Long-Form Modal */}
      {caseStudyItem && (
        <CaseStudyModal
          item={caseStudyItem}
          onClose={() => setCaseStudyItem(null)}
          onInspectWorkflow={(itemId) => {
            setCaseStudyItem(null);
            handleOpenItem(itemId);
          }}
        />
      )}

      {/* Deep-Linked Workflow Inspector */}
      {activeItem && (
        <WorkflowInspector
          item={activeItem}
          allItems={PORTFOLIO_ITEMS}
          onClose={handleCloseInspector}
          onNavigateItem={handleNavigateInspectorItem}
        />
      )}
    </div>
  );
}

export default function CreatorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreatorProfileContent />
    </Suspense>
  );
}
