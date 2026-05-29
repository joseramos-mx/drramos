"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Marquee · Strip de afiliaciones / credenciales bajo el hero.
 * - SVGs reales en /public/logos (todos ya en blanco para fondo oscuro).
 * - Hover (Framer Motion): cada línea SE EXTIENDE desde el centro hacia los lados.
 * - Degradados negros en los flancos para sensación de marquee infinito.
 */

// ─────────────────────────────────────────────────────────────
//  AJUSTES FINOS
// ─────────────────────────────────────────────────────────────
const OVERSHOOT = {
  vertical:   "-top-6 -bottom-6",
  horizontal: "-left-6 -right-6",
};

// Fade lateral responsive — en mobile no debe tapar el grid entero.
const FADE_W = "w-12 sm:w-24 md:w-48 lg:w-120";
const ROW_PADDING_Y = "py-14";

// Ease luxury — easeOutExpo-like
const EASE = [0.22, 0.61, 0.36, 1];
const LINE_DURATION = 0.7;

// Logos reales. Las alturas se calibran para que pesen visualmente parejo.
// `monochrome: true` aplica brightness-0 + invert para que las marcas con
// colores brand (BSM verde/azul, Elegoo azules) entren al palette dark luxury.
// "El Arte de Hacer Dientes" se deja natural porque su bronce coincide con
// nuestro champagne.
const LOGOS = [
  { src: "/logos/ian.svg",                                  alt: "Instituto IAN",            h: 48 },
  { src: "/logos/3shape.svg",                               alt: "3Shape",                   h: 24 },
  { src: "/logos/rmszahn.svg",                              alt: "RMS Zahn",                 h: 28 },
  { src: "/logos/bsm.svg",                                  alt: "BSM",                      h: 36, monochrome: true },
  { src: "/logos/elegoo.svg",                               alt: "Elegoo",                   h: 24, monochrome: true },
  { src: "/logos/el%20arte%20de%20hacer%20dientes.svg",     alt: "El Arte de Hacer Dientes", h: 30 },
  { src: "/logos/lisermed.svg",                             alt: "Lisermed",                 h: 44 },
];

// Variantes de líneas hover
const lineHorizontal = {
  rest:  { scaleX: 0, opacity: 0 },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: LINE_DURATION, ease: EASE },
  },
};

const lineVertical = {
  rest:  { scaleY: 0, opacity: 0 },
  hover: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: LINE_DURATION, ease: EASE },
  },
};

const separatorVariant = {
  rest:  { opacity: 1 },
  hover: { opacity: 0, transition: { duration: 0.35, ease: EASE } },
};

function LogoMark({ src, alt, h, monochrome }) {
  return (
    <div className="flex items-center justify-center opacity-65 transition-opacity duration-500 group-hover:opacity-100">
      <Image
        src={src}
        alt={alt}
        width={Math.round(h * 4)}
        height={h}
        unoptimized
        style={{ height: `${h}px`, width: "auto" }}
        className={`block max-w-[160px] object-contain md:max-w-[180px] ${
          monochrome ? "brightness-0 invert" : ""
        }`}
      />
    </div>
  );
}

export default function Marquee() {
  return (
    <motion.section
      aria-label="Afiliaciones y credenciales"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE }}
      // py-8 da aire para que el overshoot vertical (-top-6/-bottom-6 = 24px)
      // no sea recortado por el overflow-hidden de la sección.
      className="relative isolate overflow-hidden bg-[#000000] py-8"
    >
      <div className="relative">
        {/* Líneas horizontales sutiles arriba y abajo del strip */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.1]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.1]" />

        {/* Grid de logos */}
        <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {LOGOS.map((logo, i) => (
            <motion.div
              key={logo.alt}
              initial="rest"
              animate="rest"
              whileHover="hover"
              className={`group relative flex items-center justify-center px-6 ${ROW_PADDING_Y}`}
            >
              {/* Separador vertical interno (estado base) — se desvanece al hover */}
              {i < LOGOS.length - 1 && (
                <motion.span
                  aria-hidden
                  variants={separatorVariant}
                  className="pointer-events-none absolute inset-y-3 right-0 w-px bg-white/[0.07]"
                />
              )}

              {/* Borde hover — 4 líneas que se EXTIENDEN desde el centro y sobresalen del cell */}
              <motion.span
                aria-hidden
                variants={lineHorizontal}
                style={{ originX: 0.5 }}
                className={`pointer-events-none absolute h-px bg-white top-0 ${OVERSHOOT.horizontal}`}
              />
              <motion.span
                aria-hidden
                variants={lineHorizontal}
                style={{ originX: 0.5 }}
                className={`pointer-events-none absolute h-px bg-white bottom-0 ${OVERSHOOT.horizontal}`}
              />
              <motion.span
                aria-hidden
                variants={lineVertical}
                style={{ originY: 0.5 }}
                className={`pointer-events-none absolute w-px bg-white left-0 ${OVERSHOOT.vertical}`}
              />
              <motion.span
                aria-hidden
                variants={lineVertical}
                style={{ originY: 0.5 }}
                className={`pointer-events-none absolute w-px bg-white right-0 ${OVERSHOOT.vertical}`}
              />

              <LogoMark {...logo} />
            </motion.div>
          ))}
        </div>

        {/* Degradados laterales — marquee fade */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 ${FADE_W} bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent z-10`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 ${FADE_W} bg-gradient-to-l from-[#000000] via-[#000000]/80 to-transparent z-10`}
        />
      </div>
    </motion.section>
  );
}
