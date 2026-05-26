"use client";

import Link from "next/link";
import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20vi%20su%20landing%20de%20dise%C3%B1o%20de%20sonrisa%20y%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n";

const NAV_ITEMS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Galería", href: "#galeria" },
  { label: "Proceso", href: "#proceso" },
  { label: "Trayectoria", href: "#trayectoria" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "FAQ", href: "#faq" },
];

// Threshold (px) a partir del cual el header gana fondo translúcido + blur
const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD);
  });

  return (
    <header
      className={`sticky top-0 z-50 font-[family-name:var(--font-albert)] transition-[background-color,backdrop-filter,border-color] duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/65 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-6 px-8 pr-0 md:px-12 md:pr-0">
        {/* Wordmark — firma editorial */}
        <Link
          href="/"
          className="py-6 font-[family-name:var(--font-cormorant)] text-[18px] font-light italic tracking-[0.01em]"
        >
          <img
            src="/signature.svg"
            alt="Dr. Felipe Ramos - Diseño de Sonrisa"
            className="h-5 inline-block"
          />
        </Link>

        {/* Nav central — italic light, hover cubre todo el alto del header */}
        <nav className="hidden self-stretch items-stretch gap-x-1 font-[family-name:var(--font-cormorant)] text-[15px] font-light italic text-white/65 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center px-4 transition-colors duration-300 hover:bg-[#f5f1ea] hover:text-[#0a0a0a]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA esquina — verde profundo old money */}
        <Link
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener"
          data-event="lead_whatsapp_click_nav"
          className="flex items-center gap-2 self-stretch bg-[#1a4540] px-8 py-6 font-[family-name:var(--font-cormorant)] text-[16px] font-light italic text-[#f5f1ea] transition-colors duration-300 hover:bg-[#225850]"
        >
          Agendar Cita
        </Link>
      </div>

      {/* Línea horizontal bajo nav — sólo visible cuando hay backdrop activo */}
      <div
        aria-hidden
        className={`h-px w-full transition-colors duration-500 ${
          scrolled ? "bg-white/[0.1]" : "bg-white/[0.04]"
        }`}
      />
    </header>
  );
}
