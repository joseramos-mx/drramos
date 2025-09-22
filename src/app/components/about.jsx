"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Sección "Acerca del Doctor" en JSX (sin TypeScript)
// Mantiene el lenguaje visual del hero: fondo oscuro premium, acentos violeta, serif + sans

export default function AboutDoctor() {
  return (
    <section
      id="trayectoria"
      className="relative isolate overflow-hidden bg-[#0B0A0E] text-white"
    >
      {/* transición suave con una banda sutil arriba */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        {/* Texto */}
        <div className="max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-3xl leading-tight text-zinc-50 sm:text-4xl"
          >
            <span className="text-[22px]">Acerca del</span> <br /><span className="font-serif">Dr. Felipe de Jesús Ramos</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 text- text-zinc-300 text-justify md:mr-15"
          >
            <span className="font-bold text-amber-400">Más de 30 años transformando sonrisas.</span> <br />
            El proyecto del Dr. Felipe nació con un consultorio modesto y mucha
            determinación: un sillón dental financiado por su padre y el deseo
            de ofrecer atención ética y accesible. Con formación continua y
            adopción temprana de tecnología, el consultorio creció, cambió
            a una ubicación céntrica y elevó la calidad clínica. La incorporación
            de procesos digitales y un laboratorio propio redujo tiempos y mejoró
            la precisión, consolidando una práctica reconocida por su trato humano,
            innovación y resultados confiables.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-zinc-400 text-justify text-sm md:mr-15"
          >
            La valoración diagnóstica con TRIOS® permite planes de tratamiento personalizados, cómodos y rápidos,
            reduciendo citas innecesarias y mejorando los resultados funcionales y estéticos.
          </motion.p>

          {/* Logos / acreditaciones */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-4 md:mr-15"
          >
            {/* Reemplaza los src con tus logotipos en versión monocroma */}
            <LogoBox src="/logos/ian.svg" alt="IAN" />
            <LogoBox src="logos/rmszahn.svg" alt="zahnfacturing" />
            <LogoBox src="logos/lisermed.svg" alt="lisermed" />
            <LogoBox src="/logos/3shape.svg" alt="3shape" />
            
          </motion.div>
        </div>

        {/* Imagen del doctor */}
        <div className="relative h-[26rem] md:h-[32rem] lg:h-[36rem] overflow-hidden border border-white/10 bg-white/5">
          {/* Usa next/image si ya tienes las imágenes optimizadas */}
          <Image
            src="/images/A599 (1).jpg"
            alt="Dr. Felipe de Jesús Ramos"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay sutil para coherencia visual */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0A0E]/50 via-transparent to-transparent" />
        </div>
      </div>

      {/* línea inferior para transición a la siguiente sección */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </section>
  );
}

function LogoBox({ src, alt }) {
  return (
    <div className="flex h-14 items-center justify-center rounded-xl p-3">
      {/* placeholder si no hay logo */}
      {src ? (
        <Image src={src} alt={alt} width={70} height={20} className="opacity-80" />
      ) : (
        <span className="text-xs text-zinc-400">Logo</span>
      )}
    </div>
  );
}
