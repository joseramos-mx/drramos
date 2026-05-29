"use client";

import { motion } from "framer-motion";
import { Camera, Clock, MagnifyingGlass } from "@phosphor-icons/react";

/**
 * Problema · Mini-sección emocional de reconocimiento.
 * Función: que la lectora se reconozca en 10s. Sin CTA — pura conexión.
 * Estilo: dark luxury, mismo lenguaje del hero/marquee (líneas finas, Cormorant
 * italic para frases, Albert Sans light para meta, hover con overshoot).
 */

// ─────────────────────────────────────────────────────────────
//  AJUSTES FINOS
// ─────────────────────────────────────────────────────────────
const EASE = [0.22, 0.61, 0.36, 1];

const OVERSHOOT = {
  vertical:   "-top-6 -bottom-6",
  horizontal: "-left-6 -right-6",
};

const BULLETS = [
  {
    num: "01",
    Icon: Camera,
    text: "Hace años que sonríes de medio lado en las fotos.",
  },
  {
    num: "02",
    Icon: Clock,
    text: "Has pospuesto la cita porque imaginas dolor o cirugía.",
  },
  {
    num: "03",
    Icon: MagnifyingGlass,
    text: "Has visto opciones, pero ninguna se siente seria.",
  },
];

// Variantes de líneas — mismo lenguaje que el marquee
const lineHorizontal = {
  rest:  { scaleX: 0, opacity: 0 },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const lineVertical = {
  rest:  { scaleY: 0, opacity: 0 },
  hover: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const separatorVariant = {
  rest:  { opacity: 1 },
  hover: { opacity: 0, transition: { duration: 0.35, ease: EASE } },
};

// Stagger para la entrada de las viñetas en viewport
const bulletsContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const bulletItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

export default function Problema() {
  return (
    <section
      id="problema"
      aria-label="Tal vez te resulte familiar"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      {/* Líneas decorativas verticales — coherentes con el hero */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* Headline emocional, centrado — sin italic */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="mx-auto max-w-[820px] text-center font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,72px)] text-[#f5f1ea]"
        >
          Tal vez te resulte familiar.
        </motion.h2>

        {/* Subhead breve — opcional, refuerza intención */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="mx-auto mt-7 max-w-[540px] text-center font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/55"
        >
          Tres señales que suelen acompañar a quienes nos buscan
          por primera vez. Nada que tengas que explicar.
        </motion.p>

        {/* Viñetas — 3 columnas con separadores y hover overshoot */}
        <motion.div
          variants={bulletsContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          className="mt-20 grid grid-cols-1 md:mt-24 md:grid-cols-3"
        >
          {BULLETS.map((b, i) => (
            <motion.div
              key={b.num}
              variants={bulletItem}
              className="group relative"
            >
              {/* Wrapper interno para que el hover overshoot sea independiente */}
              <motion.article
                initial="rest"
                animate="rest"
                whileHover="hover"
                className="relative h-full px-7 py-12 md:px-10 md:py-14"
              >
                {/* Separador vertical interno (base) — se desvanece al hover */}
                {i < BULLETS.length - 1 && (
                  <motion.span
                    aria-hidden
                    variants={separatorVariant}
                    className="pointer-events-none absolute inset-y-6 right-0 hidden w-px bg-white/[0.07] md:block"
                  />
                )}

                {/* Borde hover — 4 líneas extendiéndose desde el centro */}
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

                {/* Icono Phosphor — thin, champagne, brillante en hover */}
                <b.Icon
                  size={32}
                  weight="thin"
                  className="mb-6 text-[#b89968] transition-colors duration-500 group-hover:text-[#d8c5a3]"
                  aria-hidden
                />

                {/* Número */}
                <div className="mb-6 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
                  {b.num}
                </div>

                {/* Frase — Albert Sans light, sin italic, lectura limpia */}
                <p className="font-[family-name:var(--font-albert)] font-light leading-[1.5] tracking-[-0.005em] text-[clamp(18px,1.6vw,22px)] text-white/80 transition-colors duration-500 group-hover:text-[#f5f1ea]">
                  {b.text}
                </p>
              </motion.article>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
