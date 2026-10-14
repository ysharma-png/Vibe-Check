import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — CacheFlow",
  description: "Terms governing generative media production, commercial indemnification, and escrow milestones.",
};

export default function TermsOfServicePage() {
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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-light text-content-primary tracking-tight">
                Terms of Service &amp; Commercial SLA
              </h1>
              <p className="text-xs text-content-muted">Last updated: October 2026 • Commercial Indemnification Terms</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert prose-xs text-content-muted space-y-6 leading-relaxed">
          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">1. Commercial Clearance &amp; Foundation Model Compliance</h2>
            <p className="text-xs">
              All generative works submitted on CacheFlow must declare foundation model pedigree (e.g. FLUX.1 [pro], Runway Gen-3/4, Midjourney v7). Creators warrant that training datasets and custom LoRAs do not infringe upon third-party copyrights or trademarked character likenesses without explicit written consent.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">2. Escrow Funding &amp; Milestone State Machine</h2>
            <p className="text-xs">
              Brands agree to fund contract escrow prior to the initiation of generative rendering. Deliverables pass through discrete state machine stages: <code>active</code> &rarr; <code>in_review</code> &rarr; <code>completed</code>. Funds are released to creator payout accounts upon explicit client milestone sign-off.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">3. Off-Platform Disintermediation Policy</h2>
            <p className="text-xs">
              To preserve legal indemnification guarantees and dispute arbitration, all communications, contract negotiations, and milestone disbursements must occur exclusively through CacheFlow platform infrastructure.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">4. Imported Content &amp; Platform Terms Compliance</h2>
            <p className="text-xs">
              Creators connecting external showcase profiles (YouTube, Vimeo, Behance, ArtStation, Civitai, Hugging Face) represent and warrant that they possess all requisite rights to authorize CacheFlow to index and embed such content. Users agree to comply with third-party developer terms, including the YouTube Terms of Service and Vimeo API Terms.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">5. Unclaimed Discovered Profiles Disclaimer</h2>
            <p className="text-xs">
              Listings designated as &quot;Discovered&quot; represent automated index records of publicly accessible artistic showcases. CacheFlow makes no representations regarding the availability, rates, or business readiness of unverified creators. Discovered creators retain the absolute right to claim their listing via bio verification or request immediate, permanent deletion via <code>/remove-my-profile</code>.
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-surface border border-surface-border space-y-3">
            <h2 className="text-sm font-semibold text-content-primary">6. DMCA Notice-and-Takedown Procedure (17 U.S.C. § 512)</h2>
            <p className="text-xs">
              CacheFlow will expeditiously respond to notices of claimed copyright infringement submitted to our designated agent at <code>dmca@cacheflow.test</code>. Valid notices must contain: identification of the copyrighted work, URL of the infringing embed or listing, statement of good faith belief, and physical or electronic signature.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
