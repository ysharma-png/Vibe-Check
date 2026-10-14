"use client";

import React, { useState } from "react";
import { Lock, X, ShieldAlert, KeyRound } from "lucide-react";

interface ReauthModalProps {
  readonly isOpen: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly requireMfa?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (password: string, totpCode?: string) => Promise<boolean>;
}

export function ReauthModal({
  isOpen,
  title = "Security Verification Required",
  description = "Confirm your current password to perform this sensitive action.",
  requireMfa = false,
  onClose,
  onConfirm,
}: ReauthModalProps) {
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your current password.");
      return;
    }
    if (requireMfa && totpCode.trim().length !== 6) {
      setError("Please enter a valid 6-digit authenticator code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const success = await onConfirm(password, totpCode);
      if (success) {
        setPassword("");
        setTotpCode("");
        onClose();
      } else {
        setError("Invalid credentials. Verification failed.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-3xl bg-surface border border-surface-border shadow-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Lock className="h-4 w-4" />
            </div>
            <h3 id="reauth-modal-title" className="text-sm font-semibold text-content-primary">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-subtle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-content-muted leading-relaxed">{description}</p>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-content-muted block font-medium">Current Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          {requireMfa && (
            <div className="space-y-1">
              <label className="text-xs text-content-muted block font-medium">
                6-Digit Authenticator Code (AAL2)
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 absolute left-3 top-3 text-content-faint" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-content-primary text-xs font-mono tracking-widest focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs text-content-muted hover:text-content-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? "Verifying..." : "Confirm & Proceed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
