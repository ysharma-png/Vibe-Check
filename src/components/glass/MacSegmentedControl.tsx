"use client";

import React from "react";
import { motion } from "framer-motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MacSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function MacSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
}: MacSegmentedControlProps<T>) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm";

  return (
    <div
      role="tablist"
      className={`segmented-control relative inline-flex items-center p-1 bg-surface-subtle/80 border border-white/10 rounded-2xl backdrop-blur-xl ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`relative z-10 font-medium transition-colors duration-200 flex items-center gap-1.5 rounded-xl ${pad} ${
              isSelected ? "text-content-primary" : "text-content-muted hover:text-white"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-indicator"
                className="absolute inset-0 rounded-xl bg-white/15 border border-white/20 shadow-md backdrop-blur-md"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-20 flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
