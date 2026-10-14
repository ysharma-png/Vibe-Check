"use client";

import React, { useRef, useCallback } from "react";

export type GlassTier = "thin" | "regular" | "thick" | "chrome";
export type GlassRadius = "10" | "12" | "16" | "20" | "24" | "28" | "32" | "full" | string;

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  tier?: GlassTier;
  radius?: GlassRadius;
  rounded?: GlassRadius;
  specular?: boolean;
  sheen?: boolean;
  refract?: boolean;
  children?: React.ReactNode;
}

export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
  (
    {
      as: Component = "div",
      tier = "regular",
      radius,
      rounded,
      specular = true,
      sheen = false,
      refract = false,
      className = "",
      children,
      onPointerMove,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (specular && internalRef.current) {
          const rect = internalRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          internalRef.current.style.setProperty("--mouse-x", `${x}px`);
          internalRef.current.style.setProperty("--mouse-y", `${y}px`);
        }
        onPointerMove?.(e);
      },
      [specular, onPointerMove]
    );

    const effectiveRadius = rounded || radius || "24";
    const tierClass = `glass-${tier}`;
    
    // Map radius to standard CSS or utility classes
    let radiusClass = "";
    if (effectiveRadius === "full") {
      radiusClass = "rounded-full";
    } else if (effectiveRadius === "32") {
      radiusClass = "rounded-[32px]";
    } else if (effectiveRadius === "28") {
      radiusClass = "rounded-[28px]";
    } else if (effectiveRadius === "24") {
      radiusClass = "rounded-[24px]";
    } else if (effectiveRadius === "20") {
      radiusClass = "rounded-[20px]";
    } else if (effectiveRadius === "16") {
      radiusClass = "rounded-[16px]";
    } else if (effectiveRadius === "12") {
      radiusClass = "rounded-[12px]";
    } else if (effectiveRadius === "10") {
      radiusClass = "rounded-[10px]";
    } else {
      radiusClass = `rounded-[${effectiveRadius}px]`;
    }

    const specularClass = specular ? "glass-specular" : "";
    const sheenClass = sheen ? "glass-sheen" : "";
    const refractClass = refract ? "liquid-refraction" : "";

    return (
      <Component
        ref={(node: HTMLDivElement | null) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onPointerMove={handlePointerMove}
        className={`glass-surface ${tierClass} ${radiusClass} ${specularClass} ${sheenClass} ${refractClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GlassSurface.displayName = "GlassSurface";
