"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useAplicacion, CTA_LABEL } from "./aplicacion-context";

/**
 * CTA final · sección autónoma antes del footer.
 * Fondo /images/snow.jpg con overlays oscuros. Un único CTA al formulario
 * de aplicación. WhatsApp y teléfono no aparecen aquí, sólo después de
 * que el lead se haya guardado.
 */

const EASE = [0.22, 0.61, 0.36, 1];

export default function CTAFinal() {
  const { openModal } = useAplicacion();

  return (
    <section
      aria-label="Empieza por una valoración privada"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/images/snow.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#000000]/85 via-[#000000]/55 to-[#000000]/90"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#000000]/60 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#000000]/60 to-transparent"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <p className="max-w-[820px] font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.28em] text-white/65">
            <span
              aria-hidden
              className="mr-3 inline-block h-px w-7 align-middle bg-[#b89968]"
            />
            Devolverle la sonrisa que recuerda
          </p>

          <h2 className="mt-7 max-w-[900px] font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,76px)] text-[#f5f1ea]">
            Empieza por una valoración privada.
          </h2>

          <p className="mt-6 max-w-[560px] font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/65">
            Tres preguntas. Te contactamos para coordinar tu valoración. Sin
            compromiso, sin lista de precios genérica.
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={openModal}
              data-event="open_application_cta_final"
              className="group inline-flex min-h-[56px] items-center gap-3 bg-[#f5f1ea] px-8 py-4 font-[family-name:var(--font-albert)] text-[15px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
            >
              {CTA_LABEL}
              <ArrowRightIcon
                size={18}
                weight="light"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
