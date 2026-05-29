"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useAplicacion, CTA_LABEL } from "./aplicacion-context";

/**
 * Antes & Después · galería editorial.
 * 3 a 5 casos reales en formato grande. Sin marcas de agua, sin testimonios.
 *
 * Las imágenes reales y con consentimiento las coloca el cliente en
 * /public/cases/. Mientras tanto cada caso renderiza un placeholder en
 * negro editorial (no stock) para no romper el layout ni lanzar 404 en
 * consola. Bandera `placeholder: true` en la entrada del array.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const CASES = [
  {
    num: "01",
    title: "Rehabilitación estética",
    duration: "2 citas",
    placeholder: true,
    antes: "/cases/01-antes.jpg",
    despues: "/cases/01-despues.jpg",
  },
  {
    num: "02",
    title: "Carillas de porcelana",
    duration: "3 citas",
    placeholder: true,
    antes: "/cases/02-antes.jpg",
    despues: "/cases/02-despues.jpg",
  },
  {
    num: "03",
    title: "Diseño digital completo",
    duration: "4 citas",
    placeholder: true,
    antes: "/cases/03-antes.jpg",
    despues: "/cases/03-despues.jpg",
  },
];

// ─────────────────────────────────────────────────────────────
//  Animaciones
// ─────────────────────────────────────────────────────────────
const caseEntrance = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: EASE, when: "beforeChildren", staggerChildren: 0.18 },
  },
};

const photoEntrance = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

// ─────────────────────────────────────────────────────────────
//  Componente: par antes/después
// ─────────────────────────────────────────────────────────────
function CasePhoto({ src, alt, dim }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={1125}
      sizes="(min-width: 768px) 45vw, 100vw"
      className={`aspect-[4/5] w-full object-cover ${dim ? "saturate-[0.92]" : ""}`}
    />
  );
}

function CasePlaceholder({ side }) {
  return (
    <div
      aria-hidden
      className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#000000]"
    >
      {/* Ornamento sutil, no decorativo de stock */}
      <span className="pointer-events-none absolute inset-6 border border-white/[0.04]" />
      <span className="pointer-events-none absolute h-px w-12 bg-[#b89968]/40" />
      <p className="absolute bottom-6 left-6 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.3em] text-white/35">
        {side === "antes" ? "Antes" : "Después"} · próximamente
      </p>
    </div>
  );
}

function CaseRow({ data }) {
  return (
    <motion.article
      variants={caseEntrance}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="relative"
    >
      <div className="relative grid grid-cols-1 md:grid-cols-2">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/[0.08] md:block"
        />

        {/* ANTES */}
        <motion.div variants={photoEntrance} className="relative overflow-hidden">
          {data.placeholder ? (
            <CasePlaceholder side="antes" />
          ) : (
            <CasePhoto src={data.antes} alt={`Antes: ${data.title}`} dim />
          )}
          {!data.placeholder && (
            <span className="absolute left-5 top-5 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.32em] text-white/55">
              Antes
            </span>
          )}
        </motion.div>

        {/* DESPUÉS */}
        <motion.div variants={photoEntrance} className="relative overflow-hidden">
          {data.placeholder ? (
            <CasePlaceholder side="despues" />
          ) : (
            <CasePhoto src={data.despues} alt={`Después: ${data.title}`} />
          )}
          {!data.placeholder && (
            <span className="absolute left-5 top-5 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.32em] text-white/85">
              Después
            </span>
          )}
        </motion.div>
      </div>

      {/* Meta — número + título + duración, una sola línea editorial */}
      <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-white/[0.08] pt-6">
        <span className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
          {data.num}
        </span>
        <h3 className="font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea] md:text-[22px]">
          {data.title}
        </h3>
        <span aria-hidden className="text-[#b89968]">·</span>
        <span className="font-[family-name:var(--font-albert)] text-[13px] font-light tracking-[0.04em] text-white/55">
          {data.duration}
        </span>
      </div>
    </motion.article>
  );
}

// ─────────────────────────────────────────────────────────────
//  Sección
// ─────────────────────────────────────────────────────────────
export default function AntesDespues() {
  const { openModal } = useAplicacion();
  return (
    <section
      id="galeria"
      aria-label="Galería de casos: antes y después"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      {/* Líneas decorativas verticales — coherentes con las demás secciones */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="max-w-[820px] font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,72px)] text-[#f5f1ea]"
        >
          Resultados que se ven naturales.
        </motion.h2>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="mt-7 max-w-[560px] font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/55"
        >
          Cada caso fue diseñado digitalmente desde el escaneo TRIOS,
          ajustado en consulta y entregado en pocas citas. Sin retoques,
          sin filtros.
        </motion.p>

        {/* Pila de casos */}
        <div className="mt-20 space-y-24 md:mt-28 md:space-y-32">
          {CASES.map((c) => (
            <CaseRow key={c.num} data={c} />
          ))}
        </div>

        {/* CTA #2 al pie */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-28 flex flex-col items-start gap-6 border-t border-white/[0.1] pt-12 md:mt-36 md:flex-row md:items-center md:justify-between"
        >
          <p className="max-w-[460px] font-[family-name:var(--font-cormorant)] font-light leading-[1.25] text-[clamp(22px,2.3vw,30px)] text-[#f5f1ea]">
            ¿Quieres ver si tu caso es similar?
          </p>

          <button
            type="button"
            onClick={openModal}
            data-event="open_application_gallery"
            className="group inline-flex min-h-[56px] items-center gap-3 bg-[#f5f1ea] px-7 py-4 font-[family-name:var(--font-albert)] text-[15px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
          >
            {CTA_LABEL}
            <ArrowRightIcon
              size={18}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
