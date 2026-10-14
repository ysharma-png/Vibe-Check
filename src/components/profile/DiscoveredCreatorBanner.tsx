"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { CreatorProfile } from "@/types/schema";

interface DiscoveredCreatorBannerProps {
  creator: CreatorProfile;
}

export function DiscoveredCreatorBanner({ creator }: DiscoveredCreatorBannerProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [channel, setChannel] = useState("public_portfolio_link");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Claim modal state
  const [verificationCode, setVerificationCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);
    setInviteStatus(null);

    try {
      const res = await fetch("/api/creators/invite-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorProfileId: creator.id,
          channel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInviteStatus({
          success: true,
          message: data.message || "Invitation successfully queued. Platform will deliver a single secure notification.",
        });
      } else {
        setInviteStatus({
          success: false,
          message: data.error || "Failed to dispatch invitation.",
        });
      }
    } catch {
      setInviteStatus({
        success: false,
        message: "Network error requesting platform invitation.",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaiming(true);
    setClaimStatus(null);

    try {
      const res = await fetch("/api/creators/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorProfileId: creator.id,
          verificationCode: verificationCode.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClaimStatus({
          success: true,
          message: data.message || "Profile successfully verified and claimed! You now have full editing rights.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setClaimStatus({
          success: false,
          message: data.message || data.error || "Verification failed. Check the verification code.",
        });
      }
    } catch {
      setClaimStatus({
        success: false,
        message: "Network error submitting claim verification.",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-amber-200">
                Discovered from public work. This creator hasn&apos;t joined yet.
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unclaimed Listing
              </span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed max-w-2xl">
              Indexed from publicly shared portfolios with attribution. No representations are made regarding rates, turnaround, or commercial availability until claimed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 md:pt-0">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Invite to claim this profile</span>
          </button>

          <button
            type="button"
            onClick={() => setClaimModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-amber-500/30 bg-surface/80 hover:bg-surface text-amber-200 transition-colors flex items-center gap-1.5"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Claim this profile</span>
          </button>
        </div>
      </div>

      {/* 1. Modal: Invite Creator (Brand Outreach via Platform) */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center gap-2.5">
                <Send className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-light text-white">Invite Creator to CacheFlow</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1.5 rounded-lg text-content-muted hover:text-white hover:bg-surface-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteStatus ? (
              <div
                className={`p-5 rounded-2xl border ${
                  inviteStatus.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                } space-y-3`}
              >
                <div className="flex items-center gap-2 font-medium text-xs">
                  {inviteStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <span>{inviteStatus.success ? "Invitation Dispatched" : "Outreach Notice"}</span>
                </div>
                <p className="text-xs leading-relaxed">{inviteStatus.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalOpen(false);
                    setInviteStatus(null);
                  }}
                  className="w-full mt-2 py-2 rounded-xl text-xs bg-surface border border-surface-border hover:bg-surface-subtle text-white transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <p className="text-xs text-content-muted leading-relaxed">
                  Request an introduction to <strong>{creator.name}</strong>. To protect creator privacy, CacheFlow never discloses private contact details to brands. The platform will deliver a single invitation link containing a brief introduction and an instant opt-out option.
                </p>

                <div className="p-3.5 rounded-xl border border-surface-border bg-surface-subtle text-[11px] text-content-muted space-y-2">
                  <div className="flex items-center gap-1.5 text-content-primary font-medium">
                    <Lock className="h-3.5 w-3.5 text-accent" />
                    <span>Single-Invitation Policy (Anti-Spam Rate Limit)</span>
                  </div>
                  <p>
                    CacheFlow strictly limits outreach to <strong>1 invitation ever</strong> per creator until they respond. Repeated invitations are blocked.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">
                    Preferred Delivery Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-xs text-content-primary focus:outline-none focus:border-accent"
                  >
                    <option value="public_portfolio_link">Public Portfolio Showcase Link</option>
                    <option value="creator_public_social">Public Social Channel (X/YouTube/Vimeo)</option>
                    <option value="email_inquiry">Public Professional Inquiries Link</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs border border-surface-border text-content-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-400 text-black transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingInvite ? "Sending..." : "Request Platform Introduction"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Modal: Claim Profile Verification */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-surface-border bg-surface p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center gap-2.5">
                <UserCheck className="h-5 w-5 text-accent" />
                <h3 className="text-lg font-light text-white">Claim {creator.name}&apos;s Profile</h3>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="p-1.5 rounded-lg text-content-muted hover:text-white hover:bg-surface-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {claimStatus ? (
              <div
                className={`p-5 rounded-2xl border ${
                  claimStatus.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                } space-y-3`}
              >
                <div className="flex items-center gap-2 font-medium text-xs">
                  {claimStatus.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <span>{claimStatus.success ? "Claim Verified" : "Verification Failed"}</span>
                </div>
                <p className="text-xs leading-relaxed">{claimStatus.message}</p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <p className="text-xs text-content-muted leading-relaxed">
                  Verify ownership of this profile to set your commercial rates, declare ComfyUI workflows, manage deliverables, or remove the profile entirely.
                </p>

                <div className="p-4 rounded-2xl bg-surface-subtle border border-surface-border text-xs text-content-muted space-y-2">
                  <span className="font-semibold text-content-primary">Verification Method: Bio Code</span>
                  <p className="text-[11px] leading-relaxed">
                    Place your temporary verification code (or enter the token from your invitation email) below. Alternatively, connect via OAuth with your source YouTube or Vimeo account.
                  </p>
                  <div className="p-2.5 rounded-xl bg-background border border-surface-border font-mono text-xs text-accent">
                    Code: {creator.claimVerificationCode || `cf-verify-${creator.handle}`}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-content-primary">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder={creator.claimVerificationCode || `cf-verify-${creator.handle}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border bg-background text-sm text-content-primary placeholder:text-content-muted/50 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/remove-my-profile?target=${encodeURIComponent(creator.handle)}`}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    I prefer to remove this profile
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setClaimModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs border border-surface-border text-content-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={claiming || !verificationCode.trim()}
                      className="px-5 py-2 rounded-xl text-xs font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
                    >
                      {claiming ? "Verifying..." : "Verify & Claim"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
