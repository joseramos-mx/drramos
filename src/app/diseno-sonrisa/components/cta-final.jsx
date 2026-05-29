"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { WhatsappLogoIcon } from "@phosphor-icons/react";

/**
 * CTA final · sección autónoma antes del footer.
 * Fondo /images/snow.jpg con overlays oscuros para mantener legibilidad.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n%20para%20dise%C3%B1o%20de%20sonrisa";

export default function CTAFinal() {
  return (
    <section
      aria-label="Cierre — Empieza por una valoración privada"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      {/* Imagen de fondo snow.jpg con overlays */}
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

      {/* Líneas decorativas */}
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

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              data-event="lead_whatsapp_click_cta_final"
              className="group inline-flex min-h-[56px] items-center gap-3 bg-[#f5f1ea] px-8 py-4 font-[family-name:var(--font-albert)] text-[15px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
            >
              <WhatsappLogoIcon size={20} weight="light" />
              Agendar por WhatsApp
            </Link>

            <a
              href="tel:+526182066760"
              className="inline-flex min-h-[56px] items-center border border-white/[0.2] px-7 py-4 font-[family-name:var(--font-albert)] text-[15px] font-light tracking-[0.02em] text-[#f5f1ea] transition-colors duration-300 hover:border-white/45 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
            >
              +52 618 206 6760
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
