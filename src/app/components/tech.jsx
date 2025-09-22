"use client";

import Image from "next/image";
import {
  Scan,
  BezierCurve,
  Cube,
  Printer,
  GearSix,
  Lightning,
} from "@phosphor-icons/react";

export default function TechnologySection() {
  return (
    <section id="tecnologia" className="relative isolate overflow-hidden bg-[#0B0A0E] text-white py-24">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.22),rgba(10,10,14,0)_60%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-20%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),rgba(10,10,14,0)_60%)] blur-2xl"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-50">Tecnología que inspira <span className="italic text-amber-400">confianza</span></h2>
          <p className="mt-4 text-lg text-zinc-300">
            Flujo digital completo: <span className="text-lime-300">escaneo intraoral</span>,
            diseño CAD/CAM con <span className="text-purple-300">exocad</span> y fabricación en
            <span className="text-blue-300"> fresadora</span> e <span className="text-orange-300">impresoras 3D</span>.
          </p>
        </div>

        {/* Grid main */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          {/* Copy column */}
          <div>
            <Feature
              icon={<Scan size={28} weight="duotone" className="text-lime-400" />}
              title="Escáner intraoral TRIOS® 5"
              text="Diagnóstico sin pastas incómodas. Escaneo preciso en minutos y comunicación visual con el paciente."
              bullets={[
                "Mayor precisión y comodidad",
                "Modelos digitales inmediatos",
                "Menos citas y mejor planificación",
              ]}
            />
            <div className="my-6 h-px w-full bg-white/10" />
            <Feature
              icon={<BezierCurve size={28} weight="duotone" className="text-blue-600" />}
              title="Diseño digital con exocad"
              text="Planificación CAD/CAM personalizada para carillas, coronas e implantología con previsibilidad estética y funcional."
              bullets={[
                "Simulación de sonrisa",
                "Bibliotecas anatómicas",
                "Ajustes finos antes de fabricar",
              ]}
            />
            <div className="my-6 h-px w-full bg-white/10" />
            <Feature
              icon={<GearSix size={28} weight="duotone" className="text-amber-400" />}
              title="Fabricación in‑house"
              text="Fresado de alta precisión e impresión 3D para prototipos, férulas y provisionales rápidos."
              bullets={[
                "Fresadora para cerámicas y resinas",
                "Impresoras 3D para férulas y modelos",
                "Tiempos de entrega reducidos",
              ]}
            />
          </div>

          {/* Media stack */}
          <div className="grid grid-cols-2 gap-4">
            <MediaSquare src="/images/docscanner.jpg" alt="Escaneo intraoral TRIOS" tag="Escaneo" color="from-lime-500 to-green-400" />
            <MediaSquare src="/images/exocad.jpeg" alt="Diseño en exocad" tag="Diseño" color="from-blue-400 to-cyan-300" />
            <MediaSquare src="/images/fresadora.jpeg" alt="Fresadora CAD/CAM" tag="Fresado" color="from-lime-500 to-lime-400" />
            <MediaSquare src="/images/impresion3d.jpeg" alt="Impresión 3D dental" tag="Impresión 3D" color="from-blue-400 to-cyan-300" />
          </div>
        </div>

        {/* Process line */}
        <div className="mt-16">
          <div className="mb-6 text-center text-sm uppercase tracking-widest text-zinc-400">Proceso digital</div>
          <div className="relative mx-auto max-w-xs sm:max-w-4xl">
            {/* Horizontal line on sm+ */}
            <div className="absolute left-0 right-0 top-5 hidden h-[2px] bg-gradient-to-r from-violet-500 via-violet-400/50 to-cyan-400 sm:block" />
            {/* Vertical line on mobile */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-violet-500 via-violet-400/50 to-cyan-400 sm:hidden" />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-6">
              <Step icon={<Scan size={22} weight="duotone" />} label="Escaneo" />
              <Step icon={<BezierCurve size={22} weight="duotone" />} label="Diseño" />
              <Step icon={<Cube size={22} weight="duotone" />} label="Prototipo" />
              <Step icon={<Printer size={22} weight="duotone" />} label="Fabricación" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text, bullets }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm leading-7 text-zinc-300">{text}</p>
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-zinc-400">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <Lightning className="mt-[3px] h-4 w-4 text-violet-400" weight="bold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MediaSquare({ src, alt, tag, color = "from-violet-500 to-cyan-400" }) {
  return (
    <figure className="group relative aspect-square overflow-hidden ring-1 ring-white/10">
      <Image src={src} alt={alt} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <figcaption className="absolute left-0 top-0 m-3 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white backdrop-blur">
        {tag}
      </figcaption>
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${color}`} />
    </figure>
  );
}

function Step({ icon, label }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-gray-800/85 text-white">
        {icon}
      </div>
      <div className="text-sm text-zinc-300">{label}</div>
    </div>
  );
}
