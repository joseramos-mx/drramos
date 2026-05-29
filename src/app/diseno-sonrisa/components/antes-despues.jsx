"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";

/**
 * Antes & Después · galería editorial.
 * 3-5 casos reales en formato grande. Sin marcas de agua, sin testimonios encima.
 * Función: validar visualmente la promesa del hero. CTA #2 al pie.
 */

// ─────────────────────────────────────────────────────────────
//  AJUSTES FINOS
// ─────────────────────────────────────────────────────────────
const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20vi%20la%20galer%C3%ADa%20de%20casos%20y%20me%20gustar%C3%ADa%20saber%20si%20mi%20caso%20es%20similar.%20Quisiera%20agendar%20una%20valoraci%C3%B3n";

// Sustituir por casos reales — foto + meta breve. Aspect 4/5 recomendado.
const CASES = [
  {
    num: "01",
    title: "Rehabilitación estética",
    duration: "2 citas",
    antes:   "/cases/01-antes.jpg",
    despues: "/cases/01-despues.jpg",
  },
  {
    num: "02",
    title: "Carillas de porcelana",
    duration: "3 citas",
    antes:   "/cases/02-antes.jpg",
    despues: "/cases/02-despues.jpg",
  },
  {
    num: "03",
    title: "Diseño digital completo",
    duration: "4 citas",
    antes:   "/cases/03-antes.jpg",
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
function CaseRow({ data }) {
  return (
    <motion.article
      variants={caseEntrance}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="relative"
    >
      {/* Par de fotos — grid 2 columnas con línea divisora delgada */}
      <div className="relative grid grid-cols-1 md:grid-cols-2">
        {/* Línea divisora vertical, sólo desktop */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/[0.08] md:block"
        />

        {/* ANTES */}
        <motion.div variants={photoEntrance} className="relative overflow-hidden">
          <Image
            src={data.antes}
            alt={`Antes: ${data.title}`}
            width={900}
            height={1125}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[4/5] w-full object-cover saturate-[0.92]"
          />
          {/* Etiqueta sutil — caps tracked, top-left */}
          <span className="absolute left-5 top-5 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.32em] text-white/55">
            Antes
          </span>
        </motion.div>

        {/* DESPUÉS */}
        <motion.div variants={photoEntrance} className="relative overflow-hidden">
          <Image
            src={data.despues}
            alt={`Después: ${data.title}`}
            width={900}
            height={1125}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[4/5] w-full object-cover"
          />
          <span className="absolute left-5 top-5 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.32em] text-white/85">
            Después
          </span>
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

          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener"
            data-event="lead_whatsapp_click_gallery"
            aria-label="Agendar valoración por WhatsApp después de ver la galería"
            className="group inline-flex items-center gap-3 bg-[#f5f1ea] px-7 py-4 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white"
          >
            Agendar valoración
            <ArrowUpRight
              size={18}
              weight="light"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
