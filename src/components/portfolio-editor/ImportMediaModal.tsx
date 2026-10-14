"use client";

import React, { useState } from "react";
import {
  X,
  Link as LinkIcon,
  Video,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { ImportedMediaItem, ConsentDisclosure } from "@/lib/importers/types";
import { EmbedPlayer } from "@/components/common/EmbedPlayer";

interface ImportMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorHandle: string;
  onImportSuccess: (item: ImportedMediaItem) => void;
}

export function ImportMediaModal({
  isOpen,
  onClose,
  creatorId,
  creatorHandle,
  onImportSuccess,
}: ImportMediaModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ImportedMediaItem | null>(null);
  const [consentDisclosure, setConsentDisclosure] = useState<ConsentDisclosure | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!isOpen) return null;

  const handleFetchPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setPreviewItem(null);
    setConsentGiven(false);

    try {
      const res = await fetch("/api/creators/import-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewItem(data.item);
        setConsentDisclosure(data.consent);
      } else {
        setError(data.error || "Failed to parse public link. Please verify the URL.");
      }
    } catch {
      setError("Network error fetching import preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewItem || !consentGiven) return;

    setConfirming(true);
    setError(null);

    try {
      const res = await fetch("/api/creators/import-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          creatorHandle,
          item: previewItem,
          consentConfirmed: consentGiven,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onImportSuccess(data.item || previewItem);
        onClose();
      } else {
        setError(data.error || "Failed to confirm media import.");
      }
    } catch {
      setError("Network error confirming import.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-surface-border bg-surface shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white">Import Your Work Compliantly</h2>
              <p className="text-xs text-content-muted">
                Official APIs &amp; oEmbed • Zero Re-Hosting • Full Attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-content-muted hover:text-white hover:bg-surface-subtle transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Form */}
        {!previewItem && (
          <form onSubmit={handleFetchPreview} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-content-primary">
                Paste Public Media or Showcase URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-border bg-background text-sm text-content-primary placeholder:text-content-muted/60 focus:outline-none focus:border-accent transition-colors"
                />
                <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-content-muted" />
              </div>
            </div>

            {/* Platform Badges */}
            <div className="space-y-2">
              <span className="text-[11px] text-content-muted uppercase tracking-wider font-mono">
                Supported Official Platforms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "YouTube (API & Shorts)",
                  "Vimeo (Player Embed)",
                  "Behance",
                  "ArtStation",
                  "Civitai",
                  "Hugging Face",
                  "Instagram",
                  "TikTok",
                ].map((plat) => (
                  <span
                    key={plat}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-surface-border bg-surface-subtle text-content-muted"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-accent hover:bg-accent-hover text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Connecting to Official API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Fetch Preview &amp; Review Consent</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Preview & Consent Step */}
        {previewItem && consentDisclosure && (
          <div className="space-y-6">
            {/* Embedded Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span>Import Preview ({previewItem.platform.toUpperCase()})</span>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-accent hover:underline text-[11px]"
                >
                  Change URL
                </button>
              </div>

              <EmbedPlayer
                embedUrl={previewItem.embedUrl}
                sourceUrl={previewItem.sourceUrl}
                platform={previewItem.platform}
                title={previewItem.title}
                aspectRatio={previewItem.aspectRatio}
                attribution={previewItem.attribution}
                thumbnailUrl={previewItem.thumbnailUrl}
              />
            </div>

            {/* Consent Disclosure Panel */}
            <div className="p-5 rounded-2xl border border-surface-border bg-surface-subtle space-y-4">
              <div className="flex items-center gap-2 text-content-primary font-medium text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Required Consent Disclosure &amp; Data Minimization</span>
              </div>

              <div className="space-y-2 text-[11px] text-content-muted">
                <p className="text-white/90 font-medium">Fields to be imported:</p>
                <div className="grid grid-cols-2 gap-1.5 pl-2">
                  {consentDisclosure.fields.map((field) => (
                    <div key={field} className="flex items-center gap-1.5 text-content-muted">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background border border-surface-border text-[11px] text-content-muted space-y-1.5 leading-relaxed">
                <p className="text-content-primary font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-accent" />
                  <span>{consentDisclosure.legalBasis}</span>
                </p>
                <p>{consentDisclosure.hostingNotice}</p>
                <p className="text-emerald-400/90">{consentDisclosure.dataControlNotice}</p>
              </div>

              {/* Explicit Confirmation Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-surface-border bg-surface text-accent focus:ring-accent accent-accent"
                />
                <span className="text-xs text-content-primary leading-tight">
                  I confirm that I am the author or authorized rights holder of this work. I consent to importing these metadata fields and streaming via official embed player.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs text-content-muted hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={confirming || !consentGiven}
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                {confirming ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Confirming Import...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Authorize &amp; Add to Portfolio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
