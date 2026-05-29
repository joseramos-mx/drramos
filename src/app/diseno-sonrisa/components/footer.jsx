"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WhatsappLogo, InstagramLogo, MapPin } from "@phosphor-icons/react";

const EASE = [0.22, 0.61, 0.36, 1];

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n%20para%20dise%C3%B1o%20de%20sonrisa";

const NAV_GROUPS = [
  {
    title: "La landing",
    items: [
      { label: "El proceso", href: "#proceso" },
      { label: "Galería de casos", href: "#galeria" },
      { label: "Sobre el doctor", href: "#trayectoria" },
      { label: "Inversión", href: "#financiacion" },
      { label: "Preguntas frecuentes", href: "#faq" },
    ],
  },
  {
    title: "Visítanos",
    items: [
      { label: "Durango, México", href: null },
      { label: "Lun · Vie  ·  9:00 – 19:00", href: null },
      { label: "Sáb  ·  9:00 – 14:00", href: null },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Pie de página"
      className="relative isolate overflow-hidden bg-[#0a0a0a] pt-28 md:pt-36"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* CTA final — repetición elegante */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
          className="border-t border-white/[0.08] pb-20 md:pb-28"
        >
          <p className="mt-16 max-w-[820px] font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/55">
            <span aria-hidden className="mr-3 inline-block h-px w-7 align-middle bg-[#b89968]" />
            Devolverle la sonrisa que recuerda
          </p>

          <h2 className="mt-7 max-w-[900px] font-[family-name:var(--font-cormorant)] font-light leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,76px)] text-[#f5f1ea]">
            Empieza por una valoración privada.
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              data-event="lead_whatsapp_click_footer"
              className="group inline-flex items-center gap-3 bg-[#f5f1ea] px-8 py-4 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#0a0a0a] transition-colors duration-300 hover:bg-white"
            >
              <WhatsappLogo size={18} weight="light" />
              Agendar por WhatsApp
            </Link>

            <a
              href="tel:+526182066760"
              className="border border-white/[0.18] px-7 py-4 font-[family-name:var(--font-albert)] text-[14px] font-light tracking-[0.02em] text-[#f5f1ea] transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.04]"
            >
              +52 618 206 6760
            </a>
          </div>
        </motion.div>

        {/* Navegación + contacto + redes */}
        <div className="grid grid-cols-1 gap-12 border-t border-white/[0.08] py-16 md:grid-cols-[1.2fr_0.9fr_0.9fr]">
          {/* Wordmark */}
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-cormorant)] text-[24px] font-light italic tracking-[0.01em] text-[#f5f1ea]"
            >
              Dr. Felipe de Jesús Ramos
            </Link>
            <p className="mt-3 max-w-[320px] font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/45">
              Cirujano dentista. Diseño digital de sonrisa con tecnología
              TRIOS 5. Durango, México.
            </p>

            {/* Redes */}
            <div className="mt-7 flex items-center gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="text-white/55 transition-colors duration-300 hover:text-[#f5f1ea]"
              >
                <WhatsappLogo size={22} weight="thin" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="text-white/55 transition-colors duration-300 hover:text-[#f5f1ea]"
              >
                <InstagramLogo size={22} weight="thin" />
              </a>
            </div>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-5 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
                {g.title}
              </div>
              <ul className="space-y-3">
                {g.items.map((it) =>
                  it.href ? (
                    <li key={it.label}>
                      <Link
                        href={it.href}
                        className="font-[family-name:var(--font-cormorant)] text-[17px] font-light text-white/70 transition-colors duration-300 hover:text-[#f5f1ea]"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ) : (
                    <li
                      key={it.label}
                      className="font-[family-name:var(--font-cormorant)] text-[17px] font-light text-white/70"
                    >
                      {it.label}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Strip inferior */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] py-8 md:flex-row md:items-center">
          <p className="font-[family-name:var(--font-albert)] text-[12px] font-light tracking-[0.04em] text-white/40">
            © {year} Dr. Felipe de Jesús Ramos Sotelo. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 font-[family-name:var(--font-albert)] text-[12px] font-light tracking-[0.04em] text-white/40">
            <MapPin size={14} weight="thin" />
            Durango, México
          </div>
        </div>
      </div>
    </footer>
  );
}
