"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScanSmiley, PencilLine, Tooth } from "@phosphor-icons/react";

/**
 * Proceso · "Cómo funciona" en 3 pasos.
 * Baja el riesgo percibido: la lectora ve su sonrisa antes de comprometerse.
 * GSAP ScrollTrigger anima un track horizontal interno que avanza con scroll.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EASE = [0.22, 0.61, 0.36, 1];

const STEPS = [
  {
    num: "01",
    Icon: ScanSmiley,
    title: "Escaneo TRIOS 5",
    description:
      "Capturamos tu sonrisa con un escáner intraoral de última generación. Sin moldes incómodos, sin radiación.",
    meta: "20 minutos",
  },
  {
    num: "02",
    Icon: PencilLine,
    title: "Diseño en pantalla",
    description:
      "Ves tu nueva sonrisa antes de aprobar nada. Ajustamos forma, color y proporción hasta que se sienta tuya.",
    meta: "Próxima cita",
  },
  {
    num: "03",
    Icon: Tooth,
    title: "Resultado entregado",
    description:
      "Fabricación con flujo digital propio. Colocación y ajuste fino en consulta. Te vas sonriendo distinto.",
    meta: "2 a 4 citas",
  },
];

export default function Proceso() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(
    () => {
      const line = trackRef.current?.querySelector("[data-line]");
      if (!line) return;

      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: trackRef.current,
            start: "top 70%",
            end: "bottom 40%",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="proceso"
      ref={sectionRef}
      aria-label="Cómo funciona el proceso"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="max-w-[820px] font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(40px,5.5vw,72px)] text-[#f5f1ea]"
        >
          Ves tu sonrisa antes
          <br />
          de decidir.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="mt-7 max-w-[560px] font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/55"
        >
          Sin moldes incómodos, sin sorpresas. Diseñamos en pantalla,
          afinamos contigo, y te vas con el resultado decidido antes
          de empezar el tratamiento.
        </motion.p>

        {/* Steps track */}
        <div ref={trackRef} className="relative mt-24 md:mt-32">
          {/* Línea base + línea progreso (GSAP scrub) */}
          <div className="absolute left-0 right-0 top-[44px] hidden h-px bg-white/[0.08] md:block" />
          <div
            data-line
            className="absolute left-0 right-0 top-[44px] hidden h-px origin-left bg-[#b89968]/70 md:block"
            style={{ transform: "scaleX(0)" }}
          />

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 1, delay: i * 0.15, ease: EASE }}
                className="relative"
              >
                {/* Punto pivote sobre la línea */}
                <div className="relative z-10 mb-7 inline-flex h-[88px] w-[88px] items-center justify-center rounded-full border border-white/[0.1] bg-[#000000]">
                  <s.Icon size={36} weight="thin" className="text-[#b89968]" aria-hidden />
                </div>

                <div className="mb-4 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.3em] text-[#b89968]">
                  Paso {s.num}
                </div>

                <h3 className="mb-3 font-[family-name:var(--font-cormorant)] text-[26px] font-light leading-[1.2] text-[#f5f1ea] md:text-[30px]">
                  {s.title}
                </h3>

                <p className="mb-5 font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.65] text-white/65">
                  {s.description}
                </p>

                <span className="font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.22em] text-white/45">
                  {s.meta}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
