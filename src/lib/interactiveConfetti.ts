"use client";

import confetti from "canvas-confetti";

/**
 * Triggers studio celebration confetti adhering to our palette
 * (Acid Lime, Molten Coral, Ice Cyan, Crisp White)
 */
export function fireStudioConfetti(opts?: confetti.Options) {
  if (typeof window === "undefined") return;

  const count = 70;
  const defaults: confetti.Options = {
    origin: { y: 0.7 },
    colors: ["#D8FD38", "#FF6842", "#38F2C7", "#FFFFFF", "#EFF2F5"],
    spread: 60,
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
    ...opts,
  };

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.4),
    scalar: 1.1,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.3),
    scalar: 0.8,
  });

  confetti({
    ...defaults,
    particleCount: Math.floor(count * 0.3),
    scalar: 1.3,
  });
}

// Alias for backwards compatibility
export const fireInteractiveConfetti = fireStudioConfetti;
