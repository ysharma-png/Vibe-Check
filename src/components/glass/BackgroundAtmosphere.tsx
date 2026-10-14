import React from "react";

/**
 * Living Studio Lighting & Atmospheric Aura Behind Glass
 * Slow-moving organic color fields (Acid Lime, Molten Coral, Ice Cyan) + fine grid matrix
 */
export function BackgroundAtmosphere() {
  return (
    <div className="glass-canvas-bg" aria-hidden="true">
      {/* Three slow drifting ambient auroras */}
      <div className="glass-aurora-1" />
      <div className="glass-aurora-2" />
      <div className="glass-aurora-3" />

      {/* Coordinate matrix for architectural depth */}
      <div className="glass-grid-matrix" />
    </div>
  );
}
