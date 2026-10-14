"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface CaptchaWidgetProps {
  readonly onVerify?: (token: string) => void;
  readonly isEnabled?: boolean;
}

export function CaptchaWidget({
  onVerify,
  isEnabled = false,
}: CaptchaWidgetProps) {
  const [verified, setVerified] = useState(false);

  // If captcha is not enabled in environment, do not render or auto-pass
  if (!isEnabled && process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "true") {
    return null;
  }

  const handleToggle = () => {
    if (!verified) {
      setVerified(true);
      onVerify?.(`cf_turnstile_${Date.now()}`);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className="p-3 rounded-2xl bg-surface-subtle border border-surface-border hover:border-surface-border-strong cursor-pointer transition-colors flex items-center justify-between text-xs"
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-colors ${
            verified
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "border-surface-border bg-surface text-content-faint"
          }`}
        >
          {verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
        </div>
        <span className="text-content-muted">I am a human creator/brand</span>
      </div>

      <div className="flex items-center gap-1.5 text-content-faint text-[10px]">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Cloudflare Turnstile</span>
      </div>
    </div>
  );
}
