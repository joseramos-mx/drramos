"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUpIcon } from "@phosphor-icons/react";

/**
 * Scroll-to-top.
 * - Aparece después de 800px de scroll.
 * - Usa Lenis para subir con animación suave (1.8s).
 * - 56px de diámetro (target táctil cómodo).
 * - Fallback a window.scrollTo si Lenis no está activo.
 */

const EASE = [0.22, 0.61, 0.36, 1];
const VISIBLE_AFTER = 800;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > VISIBLE_AFTER);
  });

  const handleClick = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.8 });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Volver al inicio de la página"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="group fixed bottom-28 right-7 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.18] bg-[#000000]/80 text-[#f5f1ea] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors duration-300 hover:border-white/40 hover:bg-[#000000]/95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
        >
          <ArrowUpIcon
            size={22}
            weight="thin"
            className="transition-transform duration-300 group-hover:-translate-y-0.5"
          />
          {/* Tooltip desktop */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-full top-1/2 mr-4 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#f5f1ea] px-4 py-2 font-[family-name:var(--font-albert)] text-[12px] font-medium tracking-[0.04em] text-[#000000] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
          >
            Volver al inicio
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
