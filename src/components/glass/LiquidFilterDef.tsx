import React from "react";

/**
 * Optical Liquid Refraction SVG Filter Definition
 * Embedded once in root layout. Provides physical refractive displacement for glass chrome.
 */
export function LiquidFilterDef() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0"
    >
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="objectBoundingBox"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="linearRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.04"
            numOctaves="2"
            seed="92"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacement"
          />
        </filter>
      </defs>
    </svg>
  );
}
