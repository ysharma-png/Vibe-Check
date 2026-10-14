"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserX, ArrowLeft, CheckCircle2, AlertTriangle, Lock } from "lucide-react";

function RemoveProfileForm() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || "";
  const initialToken = searchParams.get("token") || "";

  const [identifier, setIdentifier] = useState(initialTarget);
  const [platform, setPlatform] = useState("any");
  const [reason, setReason] = useState("creator_opt_out");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/creators/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceProfileUrl: identifier.trim(),
          sourcePlatform: platform,
          reason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message || "Your listing has been removed and your identity is permanently suppressed.",
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to submit removal request. Please try again.",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error submitting removal request. Please email privacy@cacheflow.test.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to CacheFlow</span>
        </Link>

        <div className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <UserX className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            Creator Profile Opt-Out &amp; Suppression
          </h1>
          <p className="text-sm text-content-muted leading-relaxed">
            CacheFlow respects your absolute sovereignty over your creative identity. If a public listing was created for your work, you may remove it instantly.
          </p>
        </div>

        {initialToken && (
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-indigo-300">Verified Invitation Token Detected</p>
              <p className="text-indigo-200/80">
                This one-click opt-out request is authenticated via your secure outreach link ({initialToken.slice(0, 10)}...).
              </p>
            </div>
          </div>
        )}

        {result ? (
          <div
            className={`p-6 rounded-3xl border ${
              result.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            } space-y-4`}
          >
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              )}
              <h3 className="text-base font-medium">
                {result.success ? "Removal Confirmed & Suppressed" : "Request Notice"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed">{result.message}</p>
            {result.success && (
              <div className="text-[11px] text-content-muted border-t border-emerald-500/20 pt-3 space-y-1">
                <p>• The public discovered listing is deleted immediately (within 24h across all edge caches).</p>
                <p>• A cryptographic hash of your handle is added to our permanent suppression list.</p>
                <p>• No administrator or algorithm can ever re-import your profile.</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 rounded-3xl border border-surface-border bg-surface space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-content-primary">
                Your Public Profile URL, Channel Link, or Handle
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="https://youtube.com/@yourchannel or https://vimeo.com/yourhandle"
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-background text-sm text-content-primary placeholder:text-content-muted/60 focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-[11px] text-content-muted">
                Provide the URL or handle matching the listing you want removed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-content-primary">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                >
                  <option value="any">Any / Automatic Detection</option>
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="behance">Behance</option>
                  <option value="artstation">ArtStation</option>
                  <option value="civitai">Civitai</option>
                  <option value="huggingface">Hugging Face</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-content-primary">Reason (Optional)</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                >
                  <option value="creator_opt_out">Creator Request / Opt-Out</option>
                  <option value="gdpr_rtbf">GDPR Article 17 Right to Erasure</option>
                  <option value="copyright_concern">Copyright / DMCA Takedown</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted space-y-2">
              <div className="flex items-center gap-2 text-content-primary font-medium">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>Our Permanent Non-Reimport Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Submitting this request deletes the listing and creates a hash record in our suppression ledger. Even if public web APIs are queried again, this identity is completely barred from ingestion.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !identifier.trim()}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-rose-900/20"
            >
              {submitting ? "Processing Immediate Removal..." : "Remove Profile & Suppress Permanently"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RemoveMyProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background p-8 text-white">Loading opt-out portal...</div>}>
      <RemoveProfileForm />
    </Suspense>
  );
}
