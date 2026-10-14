"use client";

import React from "react";
import { motion } from "framer-motion";

export interface MacToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function MacToggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: MacToggleProps) {
  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`macos-toggle relative inline-flex items-center ${
          checked ? "active" : ""
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="macos-toggle-thumb"
        />
      </button>
      {label && <span className="text-xs sm:text-sm font-medium text-content-primary">{label}</span>}
    </label>
  );
}
