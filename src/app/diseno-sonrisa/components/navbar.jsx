"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { ListIcon, XIcon } from "@phosphor-icons/react";

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

const EASE = [0.22, 0.61, 0.36, 1];
const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > SCROLL_THRESHOLD);
  });

  // Body scroll lock cuando el menú mobile está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ESC cierra el menú
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 font-[family-name:var(--font-albert)] transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled || mobileOpen
            ? "bg-[#000000]/65 backdrop-blur-xl backdrop-saturate-150"
            : "bg-transparent backdrop-blur-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-5 pr-0 sm:gap-6 sm:px-8 sm:pr-0 md:px-12 md:pr-0">
          {/* Wordmark */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="py-5 font-[family-name:var(--font-cormorant)] text-[18px] font-light italic tracking-[0.01em] md:py-6"
          >
            <img
              src="/signature.svg"
              alt="Dr. Felipe Ramos - Diseño de Sonrisa"
              className="h-4 inline-block sm:h-5"
            />
          </Link>

          {/* Nav central — sólo desktop grande */}
          <nav className="hidden self-stretch items-stretch gap-x-1 font-[family-name:var(--font-cormorant)] text-[15px] font-light italic text-white/65 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center px-4 transition-colors duration-300 hover:bg-[#f5f1ea] hover:text-[#000000]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-stretch self-stretch">
            {/* CTA esquina */}
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener"
              data-event="lead_whatsapp_click_nav"
              className="flex items-center gap-2 self-stretch bg-[#1a4540] px-5 py-5 font-[family-name:var(--font-cormorant)] text-[14px] font-light italic text-[#f5f1ea] transition-colors duration-300 hover:bg-[#225850] sm:text-[16px] md:px-8 md:py-6"
            >
              Agendar Cita
            </Link>

            {/* Hamburguesa — sólo mobile/tablet */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="flex items-center justify-center self-stretch border-l border-white/[0.08] px-5 text-white/85 transition-colors duration-300 hover:bg-white/[0.04] lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <XIcon size={22} weight="thin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <ListIcon size={22} weight="thin" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Línea horizontal bajo nav */}
        <div
          aria-hidden
          className={`h-px w-full transition-colors duration-500 ${
            scrolled || mobileOpen ? "bg-white/[0.1]" : "bg-white/[0.04]"
          }`}
        />
      </header>

      {/* Menú mobile/tablet — overlay full-screen */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-40 bg-[#000000]/96 backdrop-blur-2xl lg:hidden"
          >
            <nav className="mx-auto flex h-full max-w-[1440px] flex-col justify-center px-8 pt-24 sm:px-12">
              <ul className="space-y-2">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.15 + i * 0.05,
                      ease: EASE,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 font-[family-name:var(--font-cormorant)] text-[clamp(32px,8vw,52px)] font-light italic leading-tight text-[#f5f1ea] transition-colors duration-300 hover:text-[#b89968]"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Footer del menú */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
                className="mt-12 border-t border-white/[0.08] pt-8 font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.22em] text-white/45"
              >
                Durango, México
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
