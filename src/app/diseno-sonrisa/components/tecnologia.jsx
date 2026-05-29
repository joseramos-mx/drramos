"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Tecnología · sección con foto del equipo de fondo y descripción breve
 * de las tres piezas del flujo digital. Va entre Proceso y Autoridad.
 */

const EASE = [0.22, 0.61, 0.36, 1];

const EQUIPOS = [
  {
    num: "01",
    name: "TRIOS 5",
    maker: "Escáner intraoral · 3Shape",
    description:
      "Captura tu sonrisa sin moldes, en pocos minutos, con precisión microscópica. Base de todo el flujo digital.",
  },
  {
    num: "02",
    name: "BSM",
    maker: "Fresadora de cerámica",
    description:
      "Tallado de carillas y coronas con control numérico. Ajuste perfecto a la pieza diseñada en pantalla.",
  },
  {
    num: "03",
    name: "Elegoo Mars 5 Ultra",
    maker: "Impresión 3D de resina",
    description:
      "Modelos, guías y prototipos impresos en consulta. Validamos cada pieza antes de la entrega final.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};

export default function Tecnologia() {
  return (
    <section
      id="tecnologia"
      aria-label="Tecnología y equipo de flujo digital"
      className="relative isolate overflow-hidden bg-[#000000]"
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <Image
          src="/equipment.png"
          alt="Equipo de flujo digital del consultorio del Dr. Felipe Ramos"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        {/* Velo oscuro principal — asegura lectura del texto */}

        {/* Fade lateral izquierdo */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#000000]/50 to-transparent"
        />
        {/* Fade lateral derecho */}
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#000000]/50 to-transparent"
        />
      </div>

      {/* Líneas decorativas verticales */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20"
      />

      {/* Contenido */}
      <div className="relative mx-auto w-full max-w-[1280px] px-8 py-32 md:px-12 md:py-48">
        {/* Headline centrado */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="mx-auto max-w-[860px] text-center font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,72px)] text-[#f5f1ea]"
        >
          Flujo digital propio,
          <br />
          de principio a fin.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="mx-auto mt-7 max-w-[560px] text-center font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/60"
        >
          Cada pieza de tu sonrisa pasa por nuestro propio equipo. Escaneo,
          diseño, fresado e impresión bajo el mismo techo. Sin laboratorios
          externos, sin tiempos perdidos.
        </motion.p>

        {/* 3 columnas con los equipos */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="mt-24 grid grid-cols-1 gap-12 md:mt-32 md:grid-cols-3 md:gap-8"
        >
          {EQUIPOS.map((eq) => (
            <motion.article
              key={eq.num}
              variants={item}
              className="relative border-white/[0.18] pt-7"
            >


              <h3 className="mt-4 font-[family-name:var(--font-albert)] text-[28px] font-thin leading-[1.1] tracking-[-0.005em] text-[#f5f1ea] md:text-[32px]">
                {eq.name}
              </h3>

              <div className="mt-2 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.24em] text-white/55">
                {eq.maker}
              </div>

              <p className="mt-5 max-w-[320px] font-[family-name:var(--font-albert)] text-[14px] font-thin leading-[1.65] text-white/70">
                {eq.description}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
