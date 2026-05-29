"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Hero · Landing /diseno-sonrisa
 * Dirección: dark luxury / old money — fondo casi negro, líneas finas de adorno,
 * tipografía editorial Cormorant Garamond (display) + Albert Sans (UI), variantes light.
 */

const WHATSAPP_URL =
  "https://wa.me/526182066760?text=Hola%20Dr.%20Felipe%2C%20vi%20su%20landing%20de%20dise%C3%B1o%20de%20sonrisa%20y%20me%20gustar%C3%ADa%20agendar%20una%20valoraci%C3%B3n";

const ease = [0.22, 0.61, 0.36, 1];

// ─────────────────────────────────────────────────────────────
//  AJUSTES FINOS — modifica aquí distancias, anchos e insets
// ─────────────────────────────────────────────────────────────

// Líneas decorativas verticales (clases Tailwind sueltas)
const LINES = {
  // Línea exterior izquierda — distancia desde el borde izquierdo
  left:   "left-6 md:left-10",
  // Línea exterior derecha — distancia desde el borde derecho
  right:  "right-16 md:right-20",
  // Línea interior — separa la columna de copy de la caja de imagen
  center: "left-[42%]",
  // Color/grosor de las líneas
  color:  "bg-white/10",
  centerColor: "bg-white/10",
};

// Caja de imagen — cuadro a la derecha (sólo desktop)
// El right inset DEBE coincidir con LINES.right para que la imagen
// respete la línea decorativa de la derecha y no la sobrepase.
// En mobile el retrato se OCULTA — el copy luce mejor solo, y la foto
// del doctor reaparece en la sección Autoridad.
const IMAGE_BOX = {
  width: "w-full md:w-[35%]",
  inset: "top-0 right-16 bottom-0 md:right-53",
  border: "md:border-l md:border-white/[0.08]",
  visibility: "hidden md:block",
};

export default function Hero() {
  return (
    <section
      aria-label="Diseño digital de sonrisa"
      className="relative isolate overflow-hidden bg-[#000000] text-[#f5f1ea] font-[family-name:var(--font-albert)]"
    >
      {/* ──────────────────────────────────────────────────────────
         Líneas decorativas — ajusta posiciones en la constante LINES
         ────────────────────────────────────────────────────────── */}
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 hidden w-px sm:block ${LINES.left} ${LINES.color}`} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 hidden w-px sm:block ${LINES.right} ${LINES.color}`} />

      {/* ──────────────────────────────────────────────────────────
         Cuerpo del hero — caja de imagen a la derecha, copy sobrepuesto
         ────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[640px] md:min-h-[680px] lg:min-h-[760px]">
        {/* Imagen de fondo SOLO mobile — retrato a pantalla completa con overlay oscuro */}
        <div className="absolute inset-0 overflow-hidden md:hidden">
          <Image
            src="/drramos.jpg"
            alt=""
            aria-hidden
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[60%_top]"
          />
          {/* Overlays para garantizar lectura del copy */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[#000000]/70"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#000000]/80 via-[#000000]/40 to-[#000000]"
          />
        </div>

        {/* Imagen — cuadro derecho, sin gradients (sólo desktop) */}
        <div className={`absolute ${IMAGE_BOX.inset} ${IMAGE_BOX.width} ${IMAGE_BOX.border} ${IMAGE_BOX.visibility} overflow-hidden`}>
          {/*
            Visual principal — retrato editorial del Dr. Felipe,
            iluminación cálida, fondo neutro. Reemplazar /drramos.jpg por el render final.
          */}
          <Image
            src="/drramos.jpg"
            alt="Retrato editorial del Dr. Felipe de Jesús Ramos Sotelo, cirujano dentista en Durango."
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover object-top"
          />
        </div>

        {/* Contenido sobrepuesto */}
        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-8 py-20 md:px-12 md:py-28 lg:py-32">
          <div className="max-w-[1000px]">
            {/*
              Subheader posicionado sobre el headline (small, light, max-w corto).
            */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease }}
              className="mb-10 max-w-[420px] font-[family-name:var(--font-albert)] text-[14px] font-light leading-[1.65] text-white/70"
            >
              Tres décadas perfeccionando el diseño digital de sonrisa en
              Durango. Resultados naturales, sin cirugías invasivas, en pocas
              citas, con la tranquilidad de pagar a meses sin intereses.
            </motion.p>

            {/*
              Tres opciones de headline. La más fuerte queda activa.
              Reglas: message-match con "devolver/recuperar la sonrisa",
              tono reposado, sin "el mejor", sin signos de exclamación.

              OPCIÓN A (ACTIVA):
                "Devolverle la sonrisa que recuerda."
                Promesa emocional + restauración + tono sobrio.

              OPCIÓN B:
                "La sonrisa que dejó de sonreír, vuelve."
                Más literaria, refleja "carga hace años con una sonrisa que dejó de gustarle".

              OPCIÓN C:
                "Una sonrisa propia, hecha a medida."
                Énfasis en naturalidad y resultado a la medida.
            */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease }}
              className="font-[family-name:var(--font-albert)] font-light leading-[0.98] tracking-[-0.012em] text-[clamp(44px,8.8vw,120px)] text-[#f5f1ea]"
            >
              Devolverle <em className="italic font-light font-[family-name:var(--font-cormorant)]">la sonrisa</em>
              <br />
              que recuerda
            </motion.h1>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease }}
              className="mt-14 flex flex-wrap items-center gap-3"
            >
              {/* CTA primario — WhatsApp */}
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                data-event="lead_whatsapp_click"
                aria-label="Agendar valoración privada por WhatsApp con el Dr. Felipe Ramos"
                className="bg-[#f5f1ea] px-7 py-4 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white"
              >
                Agendar valoración privada
              </Link>

              {/* CTA secundario — ancla a sección autoridad */}
              <Link
                href="#trayectoria"
                data-event="secondary_cta_click"
                className="border border-white/30 px-7 py-4 font-[family-name:var(--font-albert)] text-[14px] font-light tracking-[0.02em] text-[#f5f1ea] transition-all duration-300 hover:border-white hover:bg-white/[0.04]"
              >
                Conocer al Dr. Ramos
              </Link>
            </motion.div>

            {/* Trust strip — discreta, separadores en champagne */}
            {/* En mobile cada credencial se apila para evitar overflow.
                En md+ vuelven a fluir inline con separadores. */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.85, ease }}
              className="mt-16 max-w-[760px] font-[family-name:var(--font-albert)] text-[12px] font-light leading-[1.8] tracking-[0.04em] text-white/55"
            >
              <ul className="flex flex-col gap-y-1.5 md:flex-row md:flex-wrap md:items-center md:gap-y-0">
                <li>
                  Autor de{" "}
                  <em className="font-[family-name:var(--font-cormorant)] italic text-white/75">
                    El Arte de Hacer Dientes
                  </em>
                </li>
                <li aria-hidden className="hidden text-[#b89968] md:mx-3 md:inline">·</li>
                <li>Fundador del IAN</li>
                <li aria-hidden className="hidden text-[#b89968] md:mx-3 md:inline">·</li>
                <li>Tecnología TRIOS 5</li>
                <li aria-hidden className="hidden text-[#b89968] md:mx-3 md:inline">·</li>
                <li>30+ años en Durango</li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Gradient de transición hacia la siguiente sección — funde la imagen a negro */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-32 bg-gradient-to-t from-[#000000] via-[#000000]/80 to-transparent md:h-40"
        />
      </div>
    </section>
  );
}
