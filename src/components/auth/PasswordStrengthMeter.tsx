"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { PasswordValidationResult } from "@/lib/auth/password-policy";

interface PasswordStrengthMeterProps {
  readonly result: PasswordValidationResult;
  readonly showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  result,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { score, label, requirements } = result;

  // Segment colors based on score (0 - 4)
  const getSegmentColor = (segmentIndex: number) => {
    if (score <= segmentIndex) return "bg-surface-border";
    if (score === 1) return "bg-rose-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-sky-400";
    return "bg-emerald-400";
  };

  const getLabelColor = () => {
    if (score <= 1) return "text-rose-400";
    if (score === 2) return "text-amber-400";
    if (score === 3) return "text-sky-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-2 pt-1 text-xs">
      {/* 4-bar indicator & text label */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-content-muted">Password Strength</span>
        <span className={`font-medium ${getLabelColor()}`}>{label}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`rounded-full transition-all duration-300 ${getSegmentColor(idx)}`}
          />
        ))}
      </div>

      {showRequirements && (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-content-faint">
          <div className="flex items-center gap-1.5">
            {requirements.minLength ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <X className="h-3 w-3 text-content-faint" />
            )}
            <span className={requirements.minLength ? "text-content-muted" : ""}>
              10+ characters
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {requirements.hasUppercase && requirements.hasLowercase ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <X className="h-3 w-3 text-content-faint" />
            )}
            <span
              className={
                requirements.hasUppercase && requirements.hasLowercase
                  ? "text-content-muted"
                  : ""
              }
            >
              Uppercase &amp; lowercase
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {requirements.hasNumber ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <X className="h-3 w-3 text-content-faint" />
            )}
            <span className={requirements.hasNumber ? "text-content-muted" : ""}>
              At least one number
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {requirements.notCommon && requirements.noPersonalData ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <X className="h-3 w-3 text-content-faint" />
            )}
            <span
              className={
                requirements.notCommon && requirements.noPersonalData
                  ? "text-content-muted"
                  : ""
              }
            >
              Unique (no personal info)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
