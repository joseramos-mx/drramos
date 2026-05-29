"use client";

import { motion } from "framer-motion";
import { useAplicacion, CTA_LABEL } from "./aplicacion-context";

/**
 * Trigger flotante del formulario.
 * - Mobile: pill horizontal abajo, centrada.
 * - Desktop (md+): pill vertical en el borde derecho.
 * Ambas comparten contexto · misma etiqueta única.
 */

const EASE = [0.22, 0.61, 0.36, 1];

export default function AplicacionTrigger() {
  const { openModal } = useAplicacion();

  return (
    <>
      {/* Mobile · pill flotante abajo */}
      <motion.button
        type="button"
        onClick={openModal}
        data-event="open_application_mobile"
        aria-label={CTA_LABEL}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
        className="group fixed bottom-4 left-1/2 z-40 flex min-h-[48px] -translate-x-1/2 items-center gap-2.5 bg-[#f5f1ea] px-5 py-3.5 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.24em] text-[#000000] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] md:hidden"
      >
        {CTA_LABEL}
        <span
          aria-hidden
          className="block h-px w-3 bg-[#000000] transition-all duration-500 group-hover:w-5"
        />
      </motion.button>

      {/* Desktop · pill vertical borde derecho */}
      <motion.button
        type="button"
        onClick={openModal}
        data-event="open_application_desktop"
        aria-label={CTA_LABEL}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
        className="group fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2.5 bg-[#f5f1ea] px-3.5 py-9 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.28em] text-[#000000] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 hover:bg-white hover:pr-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] md:flex"
        style={{ writingMode: "vertical-rl" }}
      >
        {CTA_LABEL}
        <span
          aria-hidden
          className="block h-px w-3 bg-[#000000] transition-all duration-500 group-hover:w-5"
        />
      </motion.button>
    </>
  );
}
