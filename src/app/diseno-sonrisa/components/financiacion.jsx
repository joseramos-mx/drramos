"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Wallet } from "@phosphor-icons/react";

/**
 * Financiación · tono medio, sin lenguaje de oferta.
 * "Una inversión en ti, con pago a meses sin intereses."
 * Sin lista de precios por diente. Sin descuentos.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20me%20gustar%C3%ADa%20conocer%20mi%20plan%20personalizado%20y%20mensualidad%20para%20el%20dise%C3%B1o%20digital%20de%20sonrisa";

const PUNTOS = [
  {
    label: "Pago a meses",
    value: "Sin intereses",
  },
  {
    label: "Plan personalizado",
    value: "En tu valoración",
  },
  {
    label: "Tarjetas aceptadas",
    value: "Todas las principales",
  },
];

export default function Financiacion() {
  return (
    <section
      id="financiacion"
      aria-label="Financiación e inversión"
      className="relative isolate overflow-hidden bg-[#0a0a0a] py-28 md:py-40"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.1fr_0.9fr] md:gap-20 md:items-end">
          {/* Lado izquierdo: headline + bio */}
          <div>
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.9, ease: EASE }}
              className="mb-7 inline-flex items-center gap-3 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/55"
            >
              <span aria-hidden className="block h-px w-7 bg-[#b89968]" />
              La inversión
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
              className="max-w-[600px] font-[family-name:var(--font-cormorant)] font-light leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5vw,68px)] text-[#f5f1ea]"
            >
              Una inversión en ti, sin urgencias financieras.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
              className="mt-7 max-w-[520px] font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/55"
            >
              Cada plan se calcula sobre tu caso real, no sobre una lista
              genérica. En la valoración te entregamos el plan, la mensualidad
              y el calendario de citas — con tiempo para decidir.
            </motion.p>
          </div>

          {/* Lado derecho: panel con puntos + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
            className="relative"
          >
            <div className="border border-white/[0.08] p-8 md:p-10">
              <Wallet size={32} weight="thin" className="mb-7 text-[#b89968]" aria-hidden />

              <ul className="divide-y divide-white/[0.06]">
                {PUNTOS.map((p) => (
                  <li
                    key={p.label}
                    className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <span className="font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.22em] text-white/45">
                      {p.label}
                    </span>
                    <span className="font-[family-name:var(--font-cormorant)] text-[18px] font-light text-[#f5f1ea] md:text-[20px]">
                      {p.value}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                data-event="lead_whatsapp_click_financiacion"
                className="group mt-8 inline-flex w-full items-center justify-between gap-3 bg-[#f5f1ea] px-6 py-4 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#0a0a0a] transition-colors duration-300 hover:bg-white"
              >
                Conocer mi plan y mensualidad
                <ArrowUpRight
                  size={18}
                  weight="light"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <p className="mt-4 font-[family-name:var(--font-albert)] text-[11px] font-light leading-[1.6] text-white/35">
                El plan se calcula en consulta, después de la valoración.
                No compartimos precios por diente individual.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
