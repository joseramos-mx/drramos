"use client";

import { ReactLenis } from "lenis/react";

/**
 * Lenis smooth scroll · global provider.
 * Curva luxury: easeOutExpo lento — sensación gomosa, premium.
 */
export default function LenisProvider({ children }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      {children}
    </ReactLenis>
  );
}
