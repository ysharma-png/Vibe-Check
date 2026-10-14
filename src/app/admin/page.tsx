"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Plus,
  Layers,
  Sparkles,
  UserX,
  Send,
  Eye,
  ExternalLink,
} from "lucide-react";
import { IngestionLogEntry, SuppressionEntry, DiscoveredCreatorListing } from "@/lib/importers/types";

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<"security" | "discovery" | "suppression" | "logs">("security");
  const [enableDiscovered, setEnableDiscovered] = useState(false);

  // Ingestion form state
  const [ingestName, setIngestName] = useState("");
  const [ingestHandle, setIngestHandle] = useState("");
  const [ingestPlatform, setIngestPlatform] = useState("youtube");
  const [ingestProfileUrl, setIngestProfileUrl] = useState("");
  const [ingestWorksUrl, setIngestWorksUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestNotice, setIngestNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Live data
  const [discoveredListings, setDiscoveredListings] = useState<DiscoveredCreatorListing[]>([]);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLogEntry[]>([]);
  const [suppressionList, setSuppressionList] = useState<SuppressionEntry[]>([]);

  // Suppression form
  const [suppressUrl, setSuppressUrl] = useState("");
  const [suppressing, setSuppressing] = useState(false);
  const [suppressNotice, setSuppressNotice] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/discovered/ingest?enabled=${enableDiscovered ? "true" : "false"}`);
      if (res.ok) {
        const data = await res.json();
        setDiscoveredListings(data.creators || []);
      }
    } catch {
      // Offline fallback
    }
  }, [enableDiscovered]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestName || !ingestHandle || !ingestProfileUrl) return;

    setIngesting(true);
    setIngestNotice(null);

    try {
      const works = ingestWorksUrl
        ? [
            {
              id: `yt-sample-${Date.now().toString(36)}`,
              title: `${ingestName} Featured Showcase`,
              description: `Public portfolio work indexed with attribution.`,
              platform: ingestPlatform,
              sourceUrl: ingestWorksUrl,
              embedUrl: ingestWorksUrl.includes("youtube")
                ? `https://www.youtube-nocookie.com/embed/${ingestWorksUrl.split("v=")[1] || "sample"}?rel=0`
                : ingestWorksUrl,
              thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
              aspectRatio: "16:9",
              attribution: {
                creatorName: ingestName,
                sourceProfileUrl: ingestProfileUrl,
                license: "Standard Platform Embed",
              },
              suggestedTools: ["flux-1-dev", "runway-gen3"],
              suggestedDeliverableType: "commercial_spot",
              styleTags: ["Cinematic", "AI Native"],
            },
          ]
        : [];

      const res = await fetch("/api/admin/discovered/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-enable-discovered": enableDiscovered ? "true" : "false",
        },
        body: JSON.stringify({
          name: ingestName.trim(),
          handle: ingestHandle.trim().toLowerCase(),
          sourcePlatform: ingestPlatform,
          sourceProfileUrl: ingestProfileUrl.trim(),
          works,
          adminId: "admin.compliance@cacheflow.test",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIngestNotice({
          success: true,
          message: data.message || "Discovered listing ingested with zero private fields and full attribution.",
        });
        setIngestName("");
        setIngestHandle("");
        setIngestProfileUrl("");
        setIngestWorksUrl("");
        loadData();
      } else {
        setIngestNotice({
          success: false,
          message: data.error || "Failed to ingest listing.",
        });
      }
    } catch {
      setIngestNotice({ success: false, message: "Network error ingesting creator listing." });
    } finally {
      setIngesting(false);
    }
  };

  const handleManualSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressUrl.trim()) return;

    setSuppressing(true);
    setSuppressNotice(null);

    try {
      const res = await fetch("/api/creators/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceProfileUrl: suppressUrl.trim(),
          sourcePlatform: "manual_admin",
          reason: "admin_manual_suppression",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuppressNotice(`Successfully added to permanent suppression list (Hash: ${data.suppression.identityHash.slice(0, 16)}...).`);
        setSuppressUrl("");
        loadData();
      } else {
        setSuppressNotice(data.error || "Failed to suppress identity.");
      }
    } catch {
      setSuppressNotice("Network error adding suppression.");
    } finally {
      setSuppressing(false);
    }
  };

  const defaultSecurityLogs = [
    {
      id: "log-1",
      actor: "admin.security@cacheflow.test",
      action: "VERIFY_CREATOR_PIPELINE",
      target: "Amara Okafor (port-amara-1)",
      timestamp: "10 minutes ago",
      status: "APPROVED",
    },
    {
      id: "log-2",
      actor: "system_cron",
      action: "EXPIRE_SOFT_DELETE_USERS",
      target: "0 accounts purged",
      timestamp: "1 hour ago",
      status: "SUCCESS",
    },
    {
      id: "log-3",
      actor: "admin.compliance@cacheflow.test",
      action: "AUDIT_GDPR_INGESTION_LOG",
      target: "140 profiles checked",
      timestamp: "2 hours ago",
      status: "VERIFIED",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-content-primary py-10 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-rose-400 font-mono">
                Admin Security &amp; Compliance Console
              </span>
            </div>
            <h1 className="text-3xl font-light tracking-tight">
              Platform Governance, Ingestion &amp; Audit Operations
            </h1>
            <p className="text-xs text-content-muted mt-1">
              AAL2 Verified • Strict Non-Scraping Compliance • GDPR Art. 6(1)(a) &amp; 6(1)(f) Ledger
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="h-4 w-4" />
              AAL2 ENFORCED
            </span>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface text-content-primary text-xs hover:bg-surface-subtle transition-all"
            >
              MFA Settings
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-surface-border pb-3">
          {[
            { id: "security", label: "Security & Operations", icon: ShieldAlert },
            { id: "discovery", label: "Discovered Creators Ingestion", icon: Sparkles },
            { id: "suppression", label: "Suppression List & Opt-Out", icon: UserX },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-accent/15 border border-accent/30 text-accent shadow-sm"
                    : "border border-transparent text-content-muted hover:text-content-primary hover:bg-surface-subtle"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Security & Operations */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-surface-border bg-surface space-y-2">
                <div className="text-xs text-content-muted flex items-center justify-between">
                  <span>Pending Verifications</span>
                  <UserCheck className="h-4 w-4 text-accent" />
                </div>
                <div className="text-2xl font-light text-white">2</div>
                <p className="text-[11px] text-content-muted">ComfyUI DAG reproducibility reviews</p>
              </div>

              <div className="p-5 rounded-2xl border border-surface-border bg-surface space-y-2">
                <div className="text-xs text-content-muted flex items-center justify-between">
                  <span>Open Content Reports</span>
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-2xl font-light text-white">0</div>
                <p className="text-[11px] text-content-muted">Zero pending DMCA / IP dispute flags</p>
              </div>

              <div className="p-5 rounded-2xl border border-surface-border bg-surface space-y-2">
                <div className="text-xs text-content-muted flex items-center justify-between">
                  <span>Immutable Audit Logs</span>
                  <History className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-2xl font-light text-white">1,514</div>
                <p className="text-[11px] text-content-muted">Write-only append audit table active</p>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="p-6 rounded-3xl border border-surface-border bg-surface space-y-5">
              <h2 className="text-base font-medium text-white">Security &amp; Pipeline Audit Trail</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-surface-border text-content-muted font-mono">
                      <th className="pb-3 font-normal">Actor</th>
                      <th className="pb-3 font-normal">Action</th>
                      <th className="pb-3 font-normal">Target Resource</th>
                      <th className="pb-3 font-normal">Timestamp</th>
                      <th className="pb-3 font-normal text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border font-mono">
                    {defaultSecurityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface-subtle transition-colors">
                        <td className="py-3 text-content-primary">{log.actor}</td>
                        <td className="py-3 text-accent">{log.action}</td>
                        <td className="py-3 text-content-muted">{log.target}</td>
                        <td className="py-3 text-content-faint">{log.timestamp}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Discovered Creators Ingestion */}
        {activeTab === "discovery" && (
          <div className="space-y-6">
            {/* Feature Flag Banner */}
            <div className="p-5 rounded-3xl border border-surface-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      enableDiscovered ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <h3 className="text-sm font-medium text-white">
                    Unclaimed Discovered Listings Gate (ENABLE_DISCOVERED)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-subtle text-content-muted border border-surface-border">
                    {enableDiscovered ? "ACTIVE (TRUE)" : "DISABLED BY DEFAULT (FALSE)"}
                  </span>
                </div>
                <p className="text-xs text-content-muted max-w-2xl">
                  Controlled by environment variable <code>ENABLE_DISCOVERED</code>. When false, public directory suppresses unclaimed listings until enabled by admin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableDiscovered(!enableDiscovered)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  enableDiscovered
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
                }`}
              >
                {enableDiscovered ? "Disable Ingestion Gate" : "Enable Ingestion Gate (Demo)"}
              </button>
            </div>

            {/* Ingestion Tool Form */}
            <form onSubmit={handleIngest} className="p-6 sm:p-8 rounded-3xl border border-surface-border bg-surface space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h3 className="text-base font-medium text-white">
                  Compliant Public API Ingestion Tool
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Index public work with zero scraping, no private fields, and max 3 public embeds with attribution.
                </p>
              </div>

              {ingestNotice && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
                    ingestNotice.success
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {ingestNotice.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{ingestNotice.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">
                    Public Creator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestName}
                    onChange={(e) => setIngestName(e.target.value)}
                    placeholder="e.g. Elena Rodriguez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">Public Handle</label>
                  <input
                    type="text"
                    required
                    value={ingestHandle}
                    onChange={(e) => setIngestHandle(e.target.value)}
                    placeholder="e.g. elena_rdz_ai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">Source Platform</label>
                  <select
                    value={ingestPlatform}
                    onChange={(e) => setIngestPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  >
                    <option value="youtube">YouTube (Official API)</option>
                    <option value="vimeo">Vimeo (oEmbed)</option>
                    <option value="behance">Behance (oEmbed)</option>
                    <option value="artstation">ArtStation (oEmbed)</option>
                    <option value="civitai">Civitai (REST Catalog)</option>
                    <option value="huggingface">Hugging Face (Open Weights Hub)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">
                    Public Profile URL
                  </label>
                  <input
                    type="url"
                    required
                    value={ingestProfileUrl}
                    onChange={(e) => setIngestProfileUrl(e.target.value)}
                    placeholder="https://youtube.com/@channel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-content-primary">
                  Sample Public Media Work URL (Embed with Attribution)
                </label>
                <input
                  type="url"
                  value={ingestWorksUrl}
                  onChange={(e) => setIngestWorksUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted space-y-1.5">
                <span className="font-semibold text-content-primary flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-accent" />
                  <span>Data Minimization Guarantee (GDPR Art. 5(1)(c))</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  No email, phone number, address, or private data is ever collected. Listings are marked with a prominent &quot;Unclaimed&quot; badge, lack hire buttons or pricing, and include an instant removal link in every outreach.
                </p>
              </div>

              <button
                type="submit"
                disabled={ingesting}
                className="py-2.5 px-6 rounded-xl font-medium text-xs bg-accent hover:bg-accent-hover text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                <Plus className="h-4 w-4" />
                <span>{ingesting ? "Ingesting..." : "Create Minimal Discovered Listing"}</span>
              </button>
            </form>

            {/* Discovered Listings Table */}
            <div className="p-6 rounded-3xl border border-surface-border bg-surface space-y-4">
              <h3 className="text-base font-medium text-white">Active Discovered Profiles</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-surface-border text-content-muted font-mono">
                      <th className="pb-3 font-normal">Name</th>
                      <th className="pb-3 font-normal">Handle</th>
                      <th className="pb-3 font-normal">Platform</th>
                      <th className="pb-3 font-normal">Claim Status</th>
                      <th className="pb-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {discoveredListings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-content-muted text-xs">
                          No discovered listings active (ENABLE_DISCOVERED is {enableDiscovered ? "active with 0 rows" : "inactive"}).
                        </td>
                      </tr>
                    ) : (
                      discoveredListings.map((creator) => (
                        <tr key={creator.id} className="hover:bg-surface-subtle transition-colors">
                          <td className="py-3 font-medium text-white">{creator.name}</td>
                          <td className="py-3 font-mono text-content-muted">@{creator.handle}</td>
                          <td className="py-3 uppercase text-[11px] font-mono text-accent">
                            {creator.sourcePlatform}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {creator.claimStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <Link
                              href={`/creators/${creator.handle}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded-lg border border-surface-border bg-surface text-content-muted hover:text-white text-[11px]"
                            >
                              View Listing
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Suppression List & Opt-Out */}
        {activeTab === "suppression" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-surface-border bg-surface space-y-6">
              <div className="border-b border-surface-border pb-4">
                <h3 className="text-base font-medium text-white">Permanent Suppression Registry</h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Identities added to this ledger are permanently barred from ingestion by any tool or API.
                </p>
              </div>

              {suppressNotice && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                  {suppressNotice}
                </div>
              )}

              <form onSubmit={handleManualSuppression} className="space-y-3">
                <label className="text-xs font-medium text-content-primary">
                  Add Profile URL or Handle to Permanent Suppression
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={suppressUrl}
                    onChange={(e) => setSuppressUrl(e.target.value)}
                    placeholder="https://youtube.com/@channel or handle"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={suppressing || !suppressUrl.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50 transition-colors"
                  >
                    {suppressing ? "Suppressing..." : "Add to Suppression List"}
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted space-y-1">
                <p className="text-content-primary font-medium">Public Opt-Out Portal:</p>
                <p className="text-[11px]">
                  Creators can also opt out directly via the public endpoint at{" "}
                  <Link href="/remove-my-profile" className="text-accent underline">
                    /remove-my-profile
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
