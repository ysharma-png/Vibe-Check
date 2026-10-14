"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cacheflow_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = (level: "all" | "essential") => {
    localStorage.setItem("cacheflow_cookie_consent", level);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-3xl bg-surface border border-surface-border shadow-2xl backdrop-blur-xl space-y-3 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shrink-0 mt-0.5">
          <Cookie className="h-4 w-4" />
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="text-xs font-semibold text-content-primary">Privacy &amp; Cookie Preferences</h4>
          <p className="text-[11px] text-content-muted leading-relaxed">
            We use secure HTTP-only cookies strictly for authentication session tokens and CSRF protection. See our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-border text-xs">
        <button
          type="button"
          onClick={() => handleAccept("essential")}
          className="px-3 py-1.5 rounded-xl border border-surface-border bg-surface-subtle hover:bg-surface-border/50 text-[11px] text-content-muted hover:text-content-primary transition-colors"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => handleAccept("all")}
          className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-[11px] font-medium hover:bg-accent/90 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Check className="h-3 w-3" />
          <span>Accept All</span>
        </button>
      </div>
    </div>
  );
}
