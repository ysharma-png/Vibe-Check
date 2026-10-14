"use client";

import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

interface EmailVerificationBannerProps {
  readonly email: string;
  readonly isVerified: boolean;
  readonly onResend?: () => Promise<void>;
}

export function EmailVerificationBanner({
  email,
  isVerified,
  onResend,
}: EmailVerificationBannerProps) {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sentMessage, setSentMessage] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (isVerified) return null;

  const handleResend = async () => {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    try {
      if (onResend) {
        await onResend();
      }
      setSentMessage(true);
      setCooldown(60); // 60s cooldown
      setTimeout(() => setSentMessage(false), 5000);
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside
      aria-label="Email Verification Notice"
      className="w-full bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 text-xs text-amber-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">
            Please verify your email address (<strong>{email}</strong>) to publish creative briefs, proposals, or messages.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {sentMessage ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verification link dispatched!
            </span>
          ) : (
            <button
              type="button"
              disabled={cooldown > 0 || isSending}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-medium transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${isSending ? "animate-spin" : ""}`} />
              <span>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
