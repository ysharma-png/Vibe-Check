"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Calendar,
  Building,
  AlertOctagon,
} from "lucide-react";
import { PortfolioItem } from "@/types/schema";
import { assessCommercialClearance } from "@/lib/provenance";

interface LicenseBadgePanelProps {
  readonly item: PortfolioItem;
}

export function LicenseBadgePanel({ item }: LicenseBadgePanelProps) {
  const assessment = assessCommercialClearance(item);
  const safety = item.commercialSafety;

  return (
    <div className="space-y-4 text-xs">
      {/* Flagged IP Alert if flagged */}
      {safety.copyrightedIpScan === "flagged" && (
        <div className="rounded-xl border border-flagged/40 bg-flagged/10 p-3 flex items-start gap-2.5">
          <AlertOctagon className="h-4 w-4 text-flagged shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-flagged block">
              Flagged copyrighted IP detected
            </span>
            <p className="text-[11px] text-content-muted leading-relaxed">
              Scan identified potential proprietary character or brand assets. Not cleared for commercial use.
            </p>
          </div>
        </div>
      )}

      {/* Compliance Checklist Table */}
      <div className="rounded-2xl border border-surface-border bg-surface-subtle divide-y divide-surface-border/60 overflow-hidden">
        {/* Row 1: Subscription Tier */}
        <div className="p-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-content-primary">
              Subscription tier
            </div>
            <div className="text-[11px] text-content-muted">
              {safety.subscriptionTier}
              {safety.subscriptionVerifiedAt && (
                <span> • Verified {new Date(safety.subscriptionVerifiedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-[11px] shrink-0 font-medium ${
              safety.subscriptionVerified ? "text-verified" : "text-caution"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${safety.subscriptionVerified ? "bg-verified" : "bg-caution"}`} />
            <span>{safety.subscriptionVerified ? "Verified" : "Unverified"}</span>
          </span>
        </div>

        {/* Row 2: Base Model Compliance */}
        <div className="p-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-content-primary">
              Base model compliance
            </div>
            <div className="text-[11px] text-content-muted capitalize">
              {safety.baseModelCompliance.replace("_", " ")} training dataset
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-[11px] shrink-0 font-medium ${
              safety.baseModelCompliance === "permissive" || safety.baseModelCompliance === "licensed_dataset"
                ? "text-verified"
                : "text-flagged"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                safety.baseModelCompliance === "permissive" || safety.baseModelCompliance === "licensed_dataset"
                  ? "bg-verified"
                  : "bg-flagged"
              }`}
            />
            <span className="capitalize">{safety.baseModelCompliance}</span>
          </span>
        </div>

        {/* Row 3: Indemnity Provider */}
        <div className="p-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-content-primary">
              Copyright indemnity
            </div>
            <div className="text-[11px] text-content-muted">
              {safety.indemnityProvider ?? "No provider on file"}
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-[11px] shrink-0 font-medium ${
              safety.indemnified ? "text-verified" : "text-content-faint"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${safety.indemnified ? "bg-verified" : "bg-content-faint"}`} />
            <span>{safety.indemnified ? "Active" : "None"}</span>
          </span>
        </div>

        {/* Row 4: IP Scan Result */}
        <div className="p-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-content-primary">
              Copyrighted IP scan
            </div>
            <div className="text-[11px] text-content-muted">
              Automated visual & prompt trademark scan
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-[11px] shrink-0 font-medium ${
              safety.copyrightedIpScan === "clean"
                ? "text-verified"
                : safety.copyrightedIpScan === "flagged"
                ? "text-flagged"
                : "text-content-faint"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                safety.copyrightedIpScan === "clean"
                  ? "bg-verified"
                  : safety.copyrightedIpScan === "flagged"
                  ? "bg-flagged"
                  : "bg-content-faint"
              }`}
            />
            <span className="capitalize">{safety.copyrightedIpScan}</span>
          </span>
        </div>

        {/* Row 5: Usage Rights Notes */}
        <div className="p-3 space-y-1">
          <div className="text-xs font-medium text-content-primary">
            Usage rights notes
          </div>
          <p className="text-[11px] text-content-muted leading-relaxed">
            {safety.usageRightsNotes}
          </p>
        </div>
      </div>
    </div>
  );
}
