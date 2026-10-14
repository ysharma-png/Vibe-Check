"use client";

import React, { useRef } from "react";
import { motion, useSpring, HTMLMotionProps } from "framer-motion";

export interface MagneticButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  strength?: number;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "glass" | "coral";
  size?: "sm" | "md" | "lg";
}

export function MagneticButton({
  strength = 0.25,
  children,
  className = "",
  variant = "glass",
  size = "md",
  onClick,
  disabled,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const springConfig = { stiffness: 350, damping: 20 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  let variantStyles = "";
  if (variant === "primary") {
    // Electric Acid Lime with deep ink text (AAA 15.4:1 contrast)
    variantStyles =
      "bg-[#D8FD38] hover:bg-[#E5FF66] text-[#08090B] font-semibold border border-[#D8FD38]/40 shadow-lg shadow-[#D8FD38]/20";
  } else if (variant === "coral") {
    // Molten Coral with crisp white text
    variantStyles =
      "bg-[#FF6842] hover:bg-[#FF8261] text-white font-semibold border border-[#FF6842]/40 shadow-lg shadow-[#FF6842]/20";
  } else if (variant === "secondary") {
    variantStyles =
      "bg-surface-subtle/80 hover:bg-surface text-content-primary border border-white/10 backdrop-blur-md";
  } else {
    // Glass
    variantStyles =
      "glass-surface glass-regular hover:border-white/25 text-content-primary hover:text-white";
  }

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl",
    md: "px-5 py-2.5 text-xs sm:text-sm rounded-2xl",
    lg: "px-7 py-3.5 text-sm sm:text-base rounded-2xl",
  }[size];

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
