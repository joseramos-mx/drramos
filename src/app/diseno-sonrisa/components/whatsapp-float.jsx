"use client";

import { motion } from "framer-motion";
import { WhatsappLogoIcon } from "@phosphor-icons/react";

/**
 * Botón flotante de WhatsApp.
 * - Verde brand de WhatsApp con pulso lento para llamar la atención sin agredir.
 * - 64px de diámetro (target táctil cómodo, accesible para usuarios mayores).
 * - Tooltip al hover en desktop.
 */

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n%20para%20dise%C3%B1o%20de%20sonrisa";

const EASE = [0.22, 0.61, 0.36, 1];

export default function WhatsappFloat() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener"
      data-event="lead_whatsapp_click_float"
      aria-label="Contactar por WhatsApp con el Dr. Felipe Ramos"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 1.8, ease: EASE }}
      className="group fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.55)] transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]"
    >
      {/* Pulso lento */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-ping"
      />
      <WhatsappLogoIcon size={34} weight="fill" className="relative" />

      {/* Tooltip — sólo desktop */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-full top-1/2 mr-4 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#f5f1ea] px-4 py-2 font-[family-name:var(--font-albert)] text-[12px] font-medium tracking-[0.04em] text-[#000000] opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
      >
        Escríbenos por WhatsApp
      </span>
    </motion.a>
  );
}
