"use client";

import Link from "next/link";
import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { useAplicacion, CTA_LABEL } from "./aplicacion-context";

/**
 * Navbar simplificado para landing de conversión:
 * wordmark + un solo CTA al formulario. Sin nav interno
 * para no invitar a salir del embudo.
 */

const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { openModal } = useAplicacion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD);
  });

  return (
    <header
      className={`sticky top-0 z-50 font-[family-name:var(--font-albert)] transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "bg-[#000000]/65 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 pr-0 sm:gap-6 sm:px-8 sm:pr-0 md:px-12 md:pr-0">
        {/* Wordmark */}
        <Link
          href="/"
          className="py-5 font-[family-name:var(--font-cormorant)] text-[18px] font-light italic tracking-[0.01em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] md:py-6"
        >
          <img
            src="/signature.svg"
            alt="Dr. Felipe Ramos · Diseño de Sonrisa"
            className="h-4 inline-block sm:h-5"
          />
        </Link>

        {/* CTA único */}
        <button
          type="button"
          onClick={openModal}
          data-event="open_application_nav"
          className="flex min-h-[48px] items-center gap-2 self-stretch bg-[#1a4540] px-5 py-5 font-[family-name:var(--font-cormorant)] text-[14px] font-light italic text-[#f5f1ea] transition-colors duration-300 hover:bg-[#225850] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] sm:text-[16px] md:px-8 md:py-6"
        >
          {CTA_LABEL}
        </button>
      </div>

      {/* Línea horizontal bajo nav */}
      <div
        aria-hidden
        className={`h-px w-full transition-colors duration-500 ${
          scrolled ? "bg-white/[0.1]" : "bg-white/[0.04]"
        }`}
      />
    </header>
  );
}
