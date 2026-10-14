"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, CheckCircle2, AlertTriangle, Lock, ExternalLink } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [dsarEmail, setDsarEmail] = useState("");
  const [dsarType, setDsarType] = useState<"access" | "rectification" | "erasure">("access");
  const [dsarDetails, setDsarDetails] = useState("");
  const [dsarSubmitting, setDsarSubmitting] = useState(false);
  const [dsarResult, setDsarResult] = useState<string | null>(null);

  const handleDsarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsarEmail.trim()) return;

    setDsarSubmitting(true);
    setDsarResult(null);

    try {
      const res = await fetch("/api/privacy/dsar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: dsarEmail.trim(),
          requestType: dsarType,
          details: dsarDetails,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDsarResult(`Request #${data.requestId} registered. ${data.actionSummary}`);
        setDsarEmail("");
        setDsarDetails("");
      } else {
        setDsarResult(data.error || "Failed to submit request.");
      }
    } catch {
      setDsarResult("Network error submitting request. Contact dpo@cacheflow.test directly.");
    } finally {
      setDsarSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to CacheFlow</span>
          </Link>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-content-primary tracking-tight">
                Privacy Policy &amp; Data Protection
              </h1>
              <p className="text-xs text-content-muted">Last updated: October 2026 • GDPR &amp; CCPA Compliant</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-xs text-content-muted space-y-6 leading-relaxed">
          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">1. Information We Collect</h2>
            <p className="text-xs">
              CacheFlow collects information to facilitate verified generative media commissions. This includes account credentials, profile handles, portfolio proof-of-work assets, ComfyUI DAG node metadata, and contract engagement milestone details.
            </p>
            <p className="text-xs">
              We never expose personal email addresses or phone numbers in public queries or directory listings. All analytics IP addresses are hashed using unidirectional cryptographic algorithms.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">2. Creator-Owned Imported Media &amp; Zero Re-Hosting</h2>
            <p className="text-xs">
              When creators connect their external showcase accounts (YouTube, Vimeo, Behance, ArtStation, Civitai, Hugging Face), CacheFlow imports public metadata exclusively through official APIs or oEmbed endpoints upon explicit confirmation.
            </p>
            <p className="text-xs text-emerald-400">
              <strong>Zero Re-Hosting Guarantee:</strong> CacheFlow does not download, re-encode, or re-host third-party video or image files. All imported media is displayed directly via sandboxed platform embed players, preserving original view counts, advertising monetization, and licensing rights. Every item includes author attribution and a direct &quot;View original&quot; link.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">3. Unclaimed &quot;Discovered Creator&quot; Listings</h2>
            <p className="text-xs">
              Where permitted under GDPR Article 6(1)(f) (Legitimate Interests), CacheFlow indexes minimal public metadata for generative artists (public handle, display name, profile link, and up to 3 public embeds).
            </p>
            <ul className="text-xs list-disc pl-4 space-y-1">
              <li>Listings are prominently labeled: <em>&quot;Discovered from public work. This creator hasn&apos;t joined yet.&quot;</em></li>
              <li>We never show hire buttons, rates, availability, or reviews on unclaimed listings.</li>
              <li>Brands requesting an introduction trigger a single platform invitation. Creator contact details are never disclosed to brands.</li>
            </ul>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">4. Permanent Suppression List &amp; Right to Erasure</h2>
            <p className="text-xs">
              In accordance with GDPR Article 17 and Article 21, any creator may immediately remove an unclaimed listing via our public portal at{" "}
              <Link href="/remove-my-profile" className="text-accent underline font-mono">
                /remove-my-profile
              </Link>
              {" "}or the single-click opt-out link in any invitation.
            </p>
            <p className="text-xs">
              Upon request, listings are removed within 24 hours and a cryptographic hash of the identity is permanently registered in our <code>suppression_list</code>, preventing future algorithmic or administrative re-import.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">5. DMCA / Copyright Agent &amp; Regulatory Contacts</h2>
            <p className="text-xs">
              Pursuant to 17 U.S.C. § 512(c), CacheFlow designates the following contact for notices of claimed copyright infringement:
            </p>
            <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border text-xs space-y-1 font-mono">
              <p>DMCA Designated Agent: Copyright Compliance Team</p>
              <p>Email: dmca@cacheflow.test</p>
              <p>Data Protection Officer: dpo@cacheflow.test</p>
            </div>
          </section>

          {/* Interactive DSAR Section */}
          <section id="dsar" className="p-6 rounded-3xl bg-surface border border-surface-border space-y-4">
            <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>6. Data Subject Access Request (DSAR) Self-Service Portal</span>
            </h2>
            <p className="text-xs">
              Exercise your statutory rights under GDPR Articles 15 (Access), 16 (Rectification), and 17 (Erasure / Right to be Forgotten):
            </p>

            {dsarResult && (
              <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/10 text-accent text-xs">
                {dsarResult}
              </div>
            )}

            <form onSubmit={handleDsarSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  value={dsarEmail}
                  onChange={(e) => setDsarEmail(e.target.value)}
                  placeholder="Your registered email address"
                  className="px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                />

                <select
                  value={dsarType}
                  onChange={(e) => setDsarType(e.target.value as any)}
                  className="px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                >
                  <option value="access">Access / Export My Complete Data (JSON)</option>
                  <option value="rectification">Rectify Inaccurate Information</option>
                  <option value="erasure">Permanent Erasure (Right to be Forgotten)</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={dsarDetails}
                onChange={(e) => setDsarDetails(e.target.value)}
                placeholder="Additional details or specific profiles to include (optional)"
                className="w-full px-3.5 py-2 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
              />

              <button
                type="submit"
                disabled={dsarSubmitting || !dsarEmail.trim()}
                className="py-2.5 px-5 rounded-xl font-medium text-xs bg-accent hover:bg-accent-hover text-white transition-all disabled:opacity-50"
              >
                {dsarSubmitting ? "Submitting DSAR..." : "Submit Formal Privacy Request"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
