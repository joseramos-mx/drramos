"use client";

import { motion } from "framer-motion";

/**
 * Marquee · Strip de afiliaciones / credenciales bajo el hero.
 * - Líneas finas grises arriba/abajo + separadores entre celdas (estado base).
 * - Hover (Framer Motion): cada línea SE EXTIENDE desde el centro hacia los lados
 *   (scaleX para horizontales, scaleY para verticales), con overshoot fuera del cell.
 * - Degradados negros en los flancos para sensación de marquee infinito.
 * - Entrada del bloque suavizada al entrar en viewport.
 */

// ─────────────────────────────────────────────────────────────
//  AJUSTES FINOS
// ─────────────────────────────────────────────────────────────
const OVERSHOOT = {
  // Cuánto sobresalen las líneas verticales por arriba y abajo de la celda
  vertical:   "-top-6 -bottom-6",
  // Cuánto sobresalen las líneas horizontales hacia los lados
  horizontal: "-left-6 -right-6",
};

const FADE_W = "w-120";       // ancho del degradado lateral
const ROW_PADDING_Y = "py-12";

// Ease "luxury" — easeOutExpo-like; trazo lento al final
const EASE = [0.22, 0.61, 0.36, 1];
const LINE_DURATION = 0.7;

// Sustituir por logos reales (SVG / Image). Por ahora marcas placeholder.
const LOGOS = [
  { mark: "IAN", label: "Fundador",             name: "Instituto IAN" },
  { mark: "3S",  label: "Operador certificado", name: "3Shape TRIOS 5" },
  { mark: "EX",  label: "Flujo digital",        name: "exocad" },
  { mark: "AM",  label: "Miembro",              name: "AMOOI" },
  { mark: "EAD", label: "Autor",                name: "El Arte de Hacer Dientes" },
];

// Variantes — el cell coordina las 4 líneas
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

function LogoMark({ mark, label, name }) {
  return (
    <div className="flex items-center gap-3.5 text-white/45 transition-colors duration-500 group-hover:text-[#f5f1ea]">
      {/* Mark — placeholder geométrico; sustituir por SVG real */}
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center border border-current font-[family-name:var(--font-cormorant)] text-[12px] italic"
      >
        {mark}
      </span>
      <div className="text-left">
        <div className="font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.22em] text-white/35 transition-colors duration-500 group-hover:text-white/65">
          {label}
        </div>
        <div className="font-[family-name:var(--font-cormorant)] text-[16px] font-light italic leading-tight">
          {name}
        </div>
      </div>
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
      className="relative isolate overflow-hidden bg-[#0a0a0a] py-8"
    >
      <div className="relative">
        {/* Líneas horizontales sutiles, arriba y abajo del strip */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.1]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/[0.1]" />

        {/* Grid de logos */}
        <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {LOGOS.map((logo, i) => (
            <motion.div
              key={logo.name}
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
          className={`pointer-events-none absolute inset-y-0 left-0 ${FADE_W} bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 ${FADE_W} bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10`}
        />
      </div>
    </motion.section>
  );
}
