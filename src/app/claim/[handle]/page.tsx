"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Lock,
} from "lucide-react";

export default function ClaimProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = (params?.handle as string) || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"verify" | "edit" | "success">("verify");

  // Editable fields upon successful ownership claim
  const [name, setName] = useState(handle.replace(/_/g, " "));
  const [bio, setBio] = useState(
    "Verified generative artist specializing in high-coherence AI cinematography and custom ComfyUI workflows."
  );
  const [startingRate, setStartingRate] = useState("1200");
  const [availability, setAvailability] = useState("open");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/creators/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorProfileId: `disc-${handle}`,
          verificationCode: code.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("edit");
      } else {
        setError(data.message || data.error || "Verification failed. Check the verification code.");
      }
    } catch {
      setError("Network error attempting profile verification.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
    setTimeout(() => {
      router.push(`/creators/${handle}`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background text-content-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <Link
          href={`/creators/${handle}`}
          className="inline-flex items-center gap-2 text-xs text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to profile</span>
        </Link>

        {/* Header */}
        <div className="space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
            <UserCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            Claim Profile: @{handle}
          </h1>
          <p className="text-sm text-content-muted leading-relaxed">
            Verify ownership of this discovered listing to unlock full portfolio editing, commercial contract escrow, and custom rate settings.
          </p>
        </div>

        {/* Step 1: Verification */}
        {step === "verify" && (
          <form onSubmit={handleVerify} className="p-8 rounded-3xl border border-surface-border bg-surface space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-content-primary">
                Verification Code or Token
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`cf-verify-${handle}`}
                className="w-full px-4 py-3 rounded-xl border border-surface-border bg-background text-sm text-content-primary placeholder:text-content-muted/50 focus:outline-none focus:border-accent"
              />
              <p className="text-[11px] text-content-muted">
                Enter the verification token from your invitation link, or the bio verification code.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted space-y-2">
              <div className="flex items-center gap-1.5 text-content-primary font-medium">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span>Verification Guarantees</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Claiming is irreversible and immediately binds this portfolio to your authenticated identity. The &quot;Unclaimed&quot; disclaimer is removed and your profile becomes eligible for commercial brand briefs.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-accent hover:bg-accent-hover text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
            >
              {loading ? "Verifying Ownership..." : "Verify & Proceed to Profile Setup"}
            </button>
          </form>
        )}

        {/* Step 2: Edit & Review */}
        {step === "edit" && (
          <form onSubmit={handlePublish} className="p-8 rounded-3xl border border-surface-border bg-surface space-y-6">
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Ownership Verified! Customize your profile before publishing.</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-content-primary">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-sm text-content-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-content-primary">Bio</label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">
                    Starting Rate (USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={startingRate}
                    onChange={(e) => setStartingRate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-sm text-content-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  >
                    <option value="open">Open for Q4 Briefs</option>
                    <option value="limited">Limited Capacity</option>
                    <option value="booked">Fully Booked</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Publish Verified Profile</span>
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-light text-white">Profile Successfully Activated!</h2>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Your profile is now live with full commercial capabilities. Redirecting to your showcase...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
