"use client";

import { useState } from "react";
import Link from "next/link";
import {
  WhatsappLogoIcon,
  InstagramLogoIcon,
  FacebookLogoIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

/**
 * Footer · estructura editorial sobre fondo azul brand #09a5ff.
 * - Grid 3 col (Páginas / Redes / Newsletter).
 * - Grid 3 col (Ubicación / Horario / Contacto).
 * - Strip legal.
 * - Wordmark gigante cortado al pie.
 *
 * El CTA "Empieza por una valoración privada" vive ahora como sección
 * autónoma <CTAFinal /> justo encima del footer.
 *
 * Accesibilidad: tap targets ≥44px, contraste alto (los acentos pasan a
 * cream/blanco en vez de champagne para verse bien sobre azul), focus
 * visible cream.
 */

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n%20para%20dise%C3%B1o%20de%20sonrisa";

const PAGES = [
  { label: "El proceso", href: "#proceso" },
  { label: "Galería de casos", href: "#galeria" },
  { label: "Sobre el doctor", href: "#trayectoria" },
  { label: "Tecnología", href: "#tecnologia" },
  { label: "Inversión", href: "#financiacion" },
  { label: "Preguntas frecuentes", href: "#faq" },
];

const SOCIAL = [
  { label: "WhatsApp", href: WHATSAPP_URL, Icon: WhatsappLogoIcon, external: true },
  { label: "Instagram", href: "#", Icon: InstagramLogoIcon, external: true },
  { label: "Facebook", href: "#", Icon: FacebookLogoIcon, external: true },
];

// Color de la línea/divisor sobre azul — más opacidad que sobre negro
// para garantizar visibilidad.
const DIVIDER = "border-white/25";
const RULE = "bg-white/30";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: conectar a backend (Mailchimp / Resend / n8n) cuando esté listo.
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 4000);
  };

  return (
    <footer
      aria-label="Pie de página"
      className="relative isolate overflow-hidden bg-[#09a5ff] pt-20 text-[#f5f1ea] md:pt-28"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-6 hidden w-px sm:block md:left-10 ${RULE}`} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-16 hidden w-px sm:block md:right-20 ${RULE}`} />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* ─────────────────── Grid 1: Páginas · Redes · Newsletter ─────────────────── */}
        <div className={`grid grid-cols-1 gap-12 border-t ${DIVIDER} py-16 md:grid-cols-3 md:gap-10`}>
          {/* Páginas */}
          <div>
            <div className="mb-6 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/85">
              Páginas
            </div>
            <ul className="space-y-3">
              {PAGES.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    className="inline-flex min-h-[36px] items-center font-[family-name:var(--font-cormorant)] text-[18px] font-light text-[#f5f1ea] transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <div className="mb-6 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/85">
              Redes sociales
            </div>
            <ul className="space-y-3">
              {SOCIAL.map(({ label, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener" : undefined}
                    className="group inline-flex min-h-[36px] items-center gap-3 font-[family-name:var(--font-cormorant)] text-[18px] font-light text-[#f5f1ea] transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    aria-label={label}
                  >
                    <Icon size={20} weight="thin" className="shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-2 font-[family-name:var(--font-cormorant)] text-[22px] font-light text-[#f5f1ea] md:text-[24px]">
              Mantente al día
            </h3>
            <p className="mb-6 max-w-[300px] font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.65] text-white/80">
              Recibe novedades sobre nuestros casos clínicos y nuevas técnicas de
              diseño digital.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                aria-label="Correo electrónico"
                className="min-h-[48px] flex-1 border border-white/30 bg-transparent px-4 py-3 font-[family-name:var(--font-albert)] text-[15px] font-light text-[#f5f1ea] placeholder:text-white/55 transition-colors duration-300 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="group inline-flex min-h-[48px] items-center justify-center gap-2 bg-[#f5f1ea] px-6 font-[family-name:var(--font-albert)] text-[13px] font-medium tracking-[0.04em] text-[#09a5ff] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {submitted ? "Gracias" : "Suscribirse"}
                {!submitted && (
                  <ArrowRightIcon
                    size={16}
                    weight="light"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>
            <p className="mt-3 font-[family-name:var(--font-albert)] text-[11px] font-light leading-[1.6] text-white/65">
              {submitted
                ? "Te avisaremos cuando publiquemos novedades."
                : "Al suscribirte aceptas nuestra política de privacidad."}
            </p>
          </div>
        </div>

        {/* ─────────────────── Grid 2: Ubicación · Horario · Contacto ─────────────────── */}
        <div className={`grid grid-cols-1 gap-10 border-t ${DIVIDER} py-14 md:grid-cols-3`}>
          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/85">
              Ubicación
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea]">
              Durango, México
            </p>
            <p className="mt-2 max-w-[260px] font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/75">
              Consultorio privado en zona céntrica. Estacionamiento disponible.
            </p>
          </div>

          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/85">
              Horario
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea]">
              Lun &ndash; Vie
            </p>
            <p className="mt-2 font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.7] text-white/75">
              9:00 &ndash; 19:00 hrs
              <br />
              Sábado: 9:00 &ndash; 14:00 hrs
            </p>
          </div>

          <div>
            <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/85">
              Contacto
            </div>
            <a
              href="tel:+526182066760"
              className="block font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea] transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              +52 618 206 6760
            </a>
            <a
              href="mailto:contacto@drfelipedejesusramos.com"
              className="mt-2 inline-block font-[family-name:var(--font-albert)] text-[13px] font-light text-white/80 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              contacto@drfelipedejesusramos.com
            </a>
          </div>
        </div>

        {/* ─────────────────── Strip legal ─────────────────── */}
        <div className={`flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t ${DIVIDER} py-8 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.16em] text-white/75`}>
          <p>{year} · Dr. Felipe de Jesús Ramos · Durango, México</p>
          <Link
            href="#"
            className="transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Aviso legal
          </Link>
          <a
            href="mailto:contacto@drfelipedejesusramos.com"
            className="transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            contacto@drfelipedejesusramos.com
          </a>
          <p>
            Powered by{" "}
            <a
              href="mailto:rms.innovationindustries@gmail.com"
              className="transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              RMS Innovation
            </a>
          </p>
        </div>
      </div>

      {/* ─────────────────── Wordmark gigante cortado ─────────────────── */}
      <div
        aria-hidden
        className="relative -mb-[6vw] select-none overflow-hidden pt-8"
      >
        <div className="mx-auto max-w-[1440px] px-8 md:px-12">
          <p className="whitespace-nowrap font-[family-name:var(--font-albert)] font-thin uppercase leading-[0.85] tracking-[-0.04em] text-white/20 text-[clamp(72px,18vw,260px)]">
            Dr. Felipe Ramos
          </p>
        </div>
      </div>
    </footer>
  );
}
