"use client";

import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react";

/**
 * Footer · estructura editorial sobre fondo dark.
 * Sin newsletter (distrae del único objetivo de conversión).
 * Sin WhatsApp directo: el contacto se canaliza por el formulario.
 * Conserva info esencial: ubicación, horario, contacto, legal,
 * y wordmark gigante al pie.
 */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Pie de página"
      className="relative isolate overflow-hidden bg-[#000000] pt-20 text-[#f5f1ea] md:pt-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* Grid: Ubicación · Horario · Contacto */}
        <div className="grid grid-cols-1 gap-10 border-t border-white/[0.1] py-14 md:grid-cols-3">
          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
              Ubicación
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea]">
              Durango, México
            </p>
            <p className="mt-2 max-w-[260px] font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/55">
              Consultorio privado en zona céntrica. Estacionamiento disponible.
            </p>
          </div>

          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
              Horario
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea]">
              Lun a Vie
            </p>
            <p className="mt-2 font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/55">
              9:00 a 19:00 hrs
              <br />
              Sábado: 9:00 a 14:00 hrs
            </p>
          </div>

          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
              Contacto
            </div>
            <a
              href="mailto:contacto@drfelipedejesusramos.com"
              className="inline-block font-[family-name:var(--font-cormorant)] text-[18px] font-light text-[#f5f1ea] transition-colors duration-300 hover:text-[#b89968] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
            >
              contacto@drfelipedejesusramos.com
            </a>
            <p className="mt-2 max-w-[260px] font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/55">
              Respondemos contactos en horario de consultorio.
            </p>
          </div>
        </div>

        {/* Strip legal */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-white/[0.08] py-8 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.16em] text-white/50">
          <p>{year} · Dr. Felipe de Jesús Ramos · Durango, México</p>
          <Link
            href="#"
            className="transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
          >
            Aviso legal
          </Link>
          <Link
            href="#"
            className="transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
          >
            Privacidad
          </Link>
          <p className="inline-flex items-center gap-2">
            <MapPinIcon size={14} weight="thin" />
            Durango, México
          </p>
        </div>
      </div>

      {/* Wordmark gigante cortado */}
      <div
        aria-hidden
        className="relative -mb-[6vw] select-none overflow-hidden pt-8"
      >
        <div className="mx-auto max-w-[1440px] px-8 md:px-12">
          <p className="whitespace-nowrap font-[family-name:var(--font-albert)] font-thin uppercase leading-[0.85] tracking-[-0.04em] text-white/[0.06] text-[clamp(72px,18vw,260px)]">
            Dr. Felipe Ramos
          </p>
        </div>
      </div>
    </footer>
  );
}
