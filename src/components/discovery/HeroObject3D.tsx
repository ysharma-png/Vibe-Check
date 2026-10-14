"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function HeroObject3D() {
  const shouldReduceMotion = useReducedMotion();
  const [rotateOffset, setRotateOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handlePointerMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xPercent = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Subtle parallax (max 6 deg tilt)
      setRotateOffset({
        x: -yPercent * 6,
        y: xPercent * 6,
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [shouldReduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex items-center justify-center relative w-72 h-72 select-none pointer-events-none"
    >
      {/* Ambient radial blur orbs behind */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
        <div className="w-40 h-40 rounded-full bg-surface-subtle/80 blur-2xl -translate-y-4" />
      </div>

      {/* 3D Isometric Preserved Stack */}
      <div className="perspective-1000 w-full h-full flex items-center justify-center">
        <motion.div
          animate={
            shouldReduceMotion
              ? {
                  rotateX: 52,
                  rotateZ: -28,
                  rotateY: 0,
                }
              : {
                  rotateX: 52 + rotateOffset.x,
                  rotateZ: -28 + rotateOffset.y,
                  y: [-5, 5, -5],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                  rotateX: { type: "spring", stiffness: 60, damping: 20 },
                  rotateZ: { type: "spring", stiffness: 60, damping: 20 },
                }
          }
          className="preserve-3d relative w-44 h-44"
        >
          {/* Layer 1 (Bottom): Latent Seed & Keyframe */}
          <div
            style={{ transform: "translateZ(0px)" }}
            className="absolute inset-0 rounded-2xl bg-surface/70 border border-white/10 backdrop-blur-md shadow-card flex flex-col justify-between p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-content-muted font-sans">01 Latent Seed</span>
              <span className="h-1.5 w-1.5 rounded-full bg-content-faint" />
            </div>
            <div className="h-1 w-16 bg-white/10 rounded-full" />
          </div>

          {/* Layer 2 (Middle): Diffusion & Motion Pass */}
          <div
            style={{ transform: "translateZ(36px)" }}
            className="absolute inset-0 rounded-2xl bg-surface-subtle/60 border border-white/15 backdrop-blur-md shadow-soft flex flex-col justify-between p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-content-primary/90 font-sans">02 Motion Flow</span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-8 bg-accent/30 rounded-full" />
              <div className="h-1 w-12 bg-white/10 rounded-full" />
            </div>
          </div>

          {/* Layer 3 (Top): Verified Master Composite */}
          <div
            style={{ transform: "translateZ(72px)" }}
            className="absolute inset-0 rounded-2xl bg-surface/90 border border-accent/30 backdrop-blur-lg shadow-lift flex flex-col justify-between p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-content-primary font-sans">03 Master Render</span>
              <span className="h-1.5 w-1.5 rounded-full bg-verified" />
            </div>
            <div className="space-y-1">
              <div className="h-1 w-20 bg-accent/40 rounded-full" />
              <div className="h-1 w-12 bg-white/20 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
