"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AplicacionModal from "./aplicacion-modal";

/**
 * Trigger del formulario de aplicación.
 * - Desktop (md+): pill vertical en el borde derecho.
 * - Mobile: pill horizontal flotante centrada en el pie.
 * Ambas abren el mismo modal.
 */

const EASE = [0.22, 0.61, 0.36, 1];

export default function AplicacionTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile · pill flotante abajo, centrada */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        data-event="open_application"
        aria-label="Abrir aplicación de 3 preguntas"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
        className="group fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 bg-[#f5f1ea] px-5 py-3.5 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.28em] text-[#000000] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 hover:bg-white md:hidden"
      >
        Abrir aplicación
        <span
          aria-hidden
          className="block h-px w-3 bg-[#000000] transition-all duration-500 group-hover:w-5"
        />
      </motion.button>

      {/* Desktop · pill vertical en el borde derecho */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        data-event="open_application"
        aria-label="Abrir aplicación de 3 preguntas"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.4, ease: EASE }}
        className="group fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2.5 bg-[#f5f1ea] px-3.5 py-9 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.32em] text-[#000000] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 hover:bg-white hover:pr-4 md:flex"
        style={{ writingMode: "vertical-rl" }}
      >
        Abrir aplicación
        <span
          aria-hidden
          className="block h-px w-3 bg-[#000000] transition-all duration-500 group-hover:w-5"
        />
      </motion.button>

      <AplicacionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
