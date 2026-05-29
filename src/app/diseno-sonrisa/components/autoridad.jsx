"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, GraduationCap, Certificate } from "@phosphor-icons/react";

/**
 * Autoridad · El Dr. Felipe.
 * Para este avatar, el criterio (libro, IAN, trayectoria) pesa tanto como la técnica.
 * GSAP anima un contador en la cifra de años de experiencia.
 */

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const EASE = [0.22, 0.61, 0.36, 1];

const CREDENTIALS = [
  {
    Icon: BookOpen,
    title: "Autor",
    detail: "El Arte de Hacer Dientes, referencia editorial en odontología estética.",
  },
  {
    Icon: GraduationCap,
    title: "Fundador del IAN",
    detail: "Instituto para la Actualización de profesionales Odontólogos.",
  },
  {
    Icon: Certificate,
    title: "Pionero del flujo digital",
    detail: "Tecnología TRIOS 5 + diseño exocad + impresión 3D propia en Durango.",
  },
];

export default function Autoridad() {
  const sectionRef = useRef(null);
  const counterRef = useRef(null);

  useGSAP(
    () => {
      if (!counterRef.current) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: 30,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: counterRef.current,
          start: "top 80%",
          once: true,
        },
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.round(obj.val).toString();
          }
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="trayectoria"
      ref={sectionRef}
      aria-label="Sobre el Dr. Felipe Ramos"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-40"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-[0.9fr_1.1fr] md:gap-20 lg:gap-28">
          {/* Retrato editorial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1.1, ease: EASE }}
            className="relative"
          >
            <div className="relative overflow-hidden">
              <Image
                src="/drramos.jpg"
                alt="Dr. Felipe de Jesús Ramos Sotelo, cirujano dentista en Durango."
                width={900}
                height={1125}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="aspect-[4/5] w-full object-cover saturate-[0.92]"
              />
            </div>
            {/* Caption discreto bajo la foto */}
            <p className="mt-5 font-[family-name:var(--font-cormorant)] text-[14px] font-light italic text-white/55">
              Dr. Felipe de Jesús Ramos Sotelo
              <span className="mx-2 text-[#b89968]">·</span>
              Cirujano Dentista
            </p>
          </motion.div>

          {/* Copy + credenciales */}
          <div>
            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
              className="max-w-[560px] font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(36px,4.4vw,58px)] text-[#f5f1ea]"
            >
              Criterio antes que técnica.
            </motion.h2>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
              className="mt-7 max-w-[560px] font-[family-name:var(--font-albert)] text-[16px] font-light leading-[1.7] text-white/65"
            >
              El Dr. Felipe lleva tres décadas diseñando sonrisas en Durango.
              Lo que distingue su trabajo no es la tecnología, esa la tienen
              otros también, sino el criterio para usarla con mesura.
              Resultados naturales, proporcionados al rostro, que pasan
              inadvertidos en una foto familiar.
            </motion.p>

            {/* Stat con contador */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1, delay: 0.4, ease: EASE }}
              className="mt-12 flex items-baseline gap-5 border-y border-white/[0.08] py-8"
            >
              <span
                ref={counterRef}
                className="font-[family-name:var(--font-cormorant)] text-[64px] font-light leading-none text-[#f5f1ea] md:text-[80px]"
              >
                0
              </span>
              <span className="text-[#b89968] font-light">+</span>
              <span className="font-[family-name:var(--font-albert)] text-[13px] font-light uppercase tracking-[0.22em] text-white/55">
                años perfeccionando<br />el diseño digital de sonrisa
              </span>
            </motion.div>

            {/* Credenciales */}
            <div className="mt-12 space-y-7">
              {CREDENTIALS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: EASE }}
                  className="flex items-start gap-5"
                >
                  <c.Icon
                    size={28}
                    weight="thin"
                    className="mt-1 shrink-0 text-[#b89968]"
                    aria-hidden
                  />
                  <div>
                    <div className="font-[family-name:var(--font-albert)] text-[20px] font-thin text-[#f5f1ea]">
                      {c.title}
                    </div>
                    <p className="mt-1 max-w-[460px] font-[family-name:var(--font-albert)] text-[14px] font-light leading-[1.6] text-white/55">
                      {c.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
