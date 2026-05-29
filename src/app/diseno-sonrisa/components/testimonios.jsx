"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Testimonios · scroll horizontal normal con drag.
 * - Touch / móvil: swipe nativo.
 * - Desktop: arrastrar con el cursor del mouse.
 * - Sin scroll-snap forzado, sin captura de la rueda, sin auto-loop.
 */

const EASE = [0.22, 0.61, 0.36, 1];

// 10 reseñas reales, mínimamente editadas (puntuación + acentos)
const TESTIMONIOS = [
  {
    quote: "Excelente profesional en su área. Me explicó perfectamente el tratamiento que llevaría a cabo, los tiempos.",
    author: "Yesenia Muñoz",
    source: "Doctoralia",
    context: "Visita odontología",
  },
  {
    quote: "Tratamientos de calidad y la mejor atención durante y después del procedimiento. Lo recomiendo ampliamente.",
    author: "Dayana",
    source: "Doctoralia",
    context: "Diseño de sonrisa",
  },
  {
    quote: "Trabajo dental garantizado. Tengo varios años con mi trabajo dental y se ven igual que al inicio.",
    author: "Lma",
    source: "Doctoralia",
    context: "Diseño de sonrisa",
  },
  {
    quote: "El doctor muy humano y al pendiente en cada momento del paciente.",
    author: "PGS",
    source: "Doctoralia",
    context: "Visitas sucesivas",
  },
  {
    quote: "Muy puntual, explicación muy detallada y un trabajo de gran calidad.",
    author: "Laura Muñoz",
    source: "Doctoralia",
    context: "Visita odontología",
  },
  {
    quote: "Excelente trato al paciente, instrucciones de primera.",
    author: "Mg",
    source: "Doctoralia",
    context: "Visita odontología",
  },
  {
    quote: "Excelente servicio, calidad en sus tratamientos y un trato agradable.",
    author: "María de Jesús Zepeda",
    source: "Doctoralia",
    context: null,
  },
  {
    quote: "Un trabajo con excelencia y rapidez, además de un trato especial a los pacientes por todo el personal.",
    author: "Sony Hernández",
    source: "Facebook",
    context: null,
  },
  {
    quote: "Accesibles y sobre todo porque el trabajo es garantía y rapidez.",
    author: "Julia Mora",
    source: "Facebook",
    context: null,
  },
  {
    quote: "El mejor tratamiento que he tenido en años.",
    author: "Alejandro Ramos",
    source: "Facebook",
    context: null,
  },
];

const SOURCE_LOGO = {
  Doctoralia: {
    src: "/doctoralia-mktpl-symbol-turquoise.png",
    alt: "Doctoralia",
  },
  Facebook: {
    src: "/Facebook_Logo_(2019).png",
    alt: "Facebook",
  },
};

function TestimonioCard({ quote, author, source, context }) {
  const logo = SOURCE_LOGO[source];

  return (
    <article className="group relative flex h-full w-[320px] shrink-0 flex-col justify-between border border-white/[0.08] p-8 transition-colors duration-500 hover:border-white/25 md:w-[400px] md:p-10">
      {/* Logo de la fuente — sustituye a las comillas */}
      {logo && (
        <div className="mb-7 flex h-7 items-center">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={120}
            height={28}
            className="h-7 w-auto opacity-70 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>
      )}

      <blockquote className="grow font-[family-name:var(--font-cormorant)] text-[clamp(18px,1.6vw,22px)] font-light leading-[1.5] tracking-[-0.005em] text-white/80 transition-colors duration-500 group-hover:text-[#f5f1ea]">
        {quote}
      </blockquote>

      <footer className="mt-7 border-t border-white/[0.08] pt-5">
        <div className="font-[family-name:var(--font-cormorant)] text-[16px] font-light text-[#f5f1ea]">
          {author}
        </div>
        {context && (
          <div className="mt-1 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.24em] text-white/40">
            {context}
          </div>
        )}
      </footer>
    </article>
  );
}

export default function Testimonios() {
  const scrollerRef = useRef(null);

  // Drag-to-scroll con el cursor del mouse.
  // Touch ya funciona nativo gracias a overflow-x: auto.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    const onDown = (e) => {
      isDown = true;
      el.classList.add("is-dragging");
      startX = e.pageX - el.offsetLeft;
      scrollStart = el.scrollLeft;
    };
    const stop = () => {
      isDown = false;
      el.classList.remove("is-dragging");
    };
    const onMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollStart - (x - startX);
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", stop);
    el.addEventListener("mouseup", stop);
    el.addEventListener("mousemove", onMove);

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", stop);
      el.removeEventListener("mouseup", stop);
      el.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <section
      id="testimonios"
      aria-label="Reseñas de pacientes"
      className="relative isolate overflow-hidden bg-[#000000] py-28 md:py-36"
    >
      {/* Líneas decorativas */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-white/[0.08] sm:block md:left-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-16 hidden w-px bg-white/[0.08] sm:block md:right-20" />

      <div className="relative mx-auto w-full max-w-[1280px] px-8 md:px-12">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          className="max-w-[820px] font-[family-name:var(--font-albert)] font-thin leading-[1.05] tracking-[-0.01em] text-[clamp(36px,5vw,64px)] text-[#f5f1ea]"
        >
          Las palabras son de ellos.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          className="mt-7 max-w-[560px] font-[family-name:var(--font-albert)] text-[15px] font-light leading-[1.7] text-white/55"
        >
          Reseñas verificadas en Doctoralia y comentarios en redes.
          Sin edición, sin filtro.
        </motion.p>
      </div>

      {/* Track scrollable */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, delay: 0.4, ease: EASE }}
        className="relative mt-16 md:mt-20"
      >
        <div
          ref={scrollerRef}
          data-lenis-prevent
          className="testimonios-scroller flex select-none gap-5 overflow-x-auto px-8 md:gap-7 md:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{
            cursor: "grab",
            overscrollBehaviorX: "contain",
          }}
        >
          {TESTIMONIOS.map((t) => (
            <TestimonioCard key={t.author} {...t} />
          ))}
        </div>

        {/* Side gradients — fade editorial */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#000000] via-[#000000]/70 to-transparent md:w-40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#000000] via-[#000000]/70 to-transparent md:w-40"
        />

        {/* Hint sutil */}
        <p className="mx-auto mt-7 max-w-[1280px] px-8 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-white/35 md:px-12">
          Arrastra o desliza
        </p>
      </motion.div>

      <style jsx>{`
        .testimonios-scroller.is-dragging {
          cursor: grabbing !important;
        }
      `}</style>
    </section>
  );
}
