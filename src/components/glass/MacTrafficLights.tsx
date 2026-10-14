"use client";

import React from "react";

export interface MacTrafficLightsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onExpand?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

export function MacTrafficLights({
  onClose,
  onMinimize,
  onExpand,
  className = "",
  size = "md",
  title,
}: MacTrafficLightsProps) {
  const sizeClasses = {
    sm: "gap-1.5 [&_.traffic-light]:h-2.5 [&_.traffic-light]:w-2.5",
    md: "gap-2 [&_.traffic-light]:h-3 [&_.traffic-light]:w-3",
    lg: "gap-2.5 [&_.traffic-light]:h-3.5 [&_.traffic-light]:w-3.5",
  }[size];

  return (
    <div className={`traffic-lights group inline-flex items-center ${sizeClasses} ${className}`} aria-hidden="true" title={title}>
      <button
        type="button"
        tabIndex={-1}
        onClick={onClose}
        title="Close Window"
        className="traffic-light traffic-light-close"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/60 leading-none transition-opacity">
          ×
        </span>
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={onMinimize}
        title="Minimize Window"
        className="traffic-light traffic-light-minimize"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/60 leading-none transition-opacity">
          −
        </span>
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={onExpand}
        title="Expand Window"
        className="traffic-light traffic-light-expand"
      >
        <span className="opacity-0 group-hover:opacity-100 text-[6px] font-bold text-black/60 leading-none transition-opacity">
          +
        </span>
      </button>
    </div>
  );
}
