"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "@phosphor-icons/react";

/**
 * FAQ · Acordeón editorial.
 * Responde objeciones prácticas — sin lenguaje vendedor.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const FAQS = [
  {
    q: "¿Es doloroso?",
    a: "No. El diseño digital de sonrisa es un procedimiento estético, no quirúrgico. Trabajamos sobre la superficie del diente con anestesia local mínima cuando se requiere. La mayoría de pacientes describen las citas como cómodas y breves.",
  },
  {
    q: "¿En cuántas citas está listo?",
    a: "Entre dos y cuatro citas según la complejidad del caso. La primera es de valoración y escaneo; en la siguiente ves tu sonrisa diseñada en pantalla; las posteriores son ajuste y entrega. El calendario completo se define tras tu valoración.",
  },
  {
    q: "¿Se nota artificial?",
    a: "No, si el criterio es el correcto. Diseñamos cada caso atendiendo a la proporción del rostro, color de piel y forma original. El objetivo es que tu sonrisa siga siendo tuya, solo restaurada.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Cada caso se calcula individualmente. En la valoración recibes el plan, la inversión total y la mensualidad sin intereses. No publicamos lista de precios porque cada sonrisa es diferente.",
  },
  {
    q: "¿Aceptan pago a meses sin intereses?",
    a: "Sí. Trabajamos con las principales tarjetas y planes de financiación a meses sin intereses. Los términos exactos los revisamos contigo en la valoración.",
  },
  {
    q: "¿Qué pasa si no me gusta el diseño en pantalla?",
    a: "Lo ajustamos hasta que se sienta tuyo. Esa es justamente la ventaja del flujo digital: tomar decisiones sobre tu sonrisa antes de empezar el tratamiento, no después.",
  },
];

function Item({ q, a, isOpen, onToggle, index }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: EASE }}
      className="border-b border-white/[0.08]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between gap-6 py-7 text-left transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
      >
        <span className="font-[family-name:var(--font-cormorant)] text-[clamp(20px,2vw,26px)] font-light leading-[1.3] text-[#f5f1ea]">
          {q}
        </span>
        <span
          aria-hidden
          className="relative flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.15] text-[#b89968] transition-colors duration-300 group-hover:border-white/40"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="minus"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <Minus size={16} weight="thin" />
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <Plus size={16} weight="thin" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="max-w-[760px] pb-8 pr-12 font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/65">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section
      id="faq"
      aria-label="Preguntas frecuentes"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[0.4fr_0.6fr] md:gap-20">
          {/* Lado izquierdo: header sticky */}
          <div className="md:sticky md:top-32 md:self-start">
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
              className="font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(36px,4.4vw,58px)] text-[#f5f1ea]"
            >
              Lo que suelen
              <br />
              preguntar antes.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
              className="mt-7 max-w-[380px] font-[family-name:var(--font-albert)] text-[14px] font-light leading-[1.7] text-white/55"
            >
              Sin tecnicismos, sin lenguaje vendedor. Si te queda alguna
              duda, la respondemos en tu valoración.
            </motion.p>
          </div>

          {/* Lado derecho: acordeón */}
          <ul className="md:mt-2">
            {FAQS.map((f, i) => (
              <Item
                key={f.q}
                q={f.q}
                a={f.a}
                index={i}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
