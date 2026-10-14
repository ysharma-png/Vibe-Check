"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export interface GlassTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  maxTilt?: number; // max tilt degrees (default 8)
  tier?: "thin" | "regular" | "thick";
  radius?: "16" | "24" | "32";
  glare?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassTiltCard({
  maxTilt = 7.5,
  tier = "regular",
  radius = "24",
  glare = true,
  children,
  className = "",
  onClick,
  ...props
}: GlassTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Springs for smooth, damped 3D settle
  const springConfig = { stiffness: 260, damping: 22 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Glare position
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;

      mouseX.set(x);
      mouseY.set(y);

      if (glare) {
        setGlarePos({
          x: ((e.clientX - rect.left) / width) * 100,
          y: ((e.clientY - rect.top) / height) * 100,
          opacity: 0.18,
        });
      }
    },
    [glare, mouseX, mouseY]
  );

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    if (glare) {
      setGlarePos((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  const radiusClass = `radius-${radius}`;
  const tierClass = `glass-${tier}`;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      className={`card-tilt-stage relative ${className}`}
      {...props}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`glass-surface ${tierClass} ${radiusClass} card-tilt-inner relative overflow-hidden transition-shadow duration-300 ${
          isHovered ? "shadow-2xl border-white/20" : ""
        }`}
      >
        {/* Dynamic 3D Glare Sheen Overlay */}
        {glare && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22), transparent 70%)`,
            }}
          />
        )}

        {/* Content with 3D depth preserve */}
        <div className="relative z-10" style={{ transform: "translateZ(1px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
