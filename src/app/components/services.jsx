"use client";

import {
  Diamond,
  Tooth,
  Wrench,
  Cube,
  DesktopTower,
  Leaf,
} from "@phosphor-icons/react";

export default function ServicesSection() {
  return (
    <section id="servicios" className="relative bg-white text-zinc-800 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl mb-4 text-zinc-900">
            Servicios <span className="text-amber-500 italic font-serif">Odontológicos</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Tratamientos especializados con tecnología avanzada y un enfoque humano
            para cuidar tu sonrisa.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            title="Odontología Estética"
            description="Carillas, blanqueamiento y diseño de sonrisa para lograr resultados naturales y armónicos."
            icon={<Diamond size={40} weight="duotone" className="text-blue-500" />}
          />
          <ServiceCard
            title="Implantes Dentales"
            description="Reemplazo seguro y duradero de piezas dentales con la más alta tecnología."
            icon={<Tooth size={40} weight="duotone" className="text-lime-500" />}
          />
          <ServiceCard
            title="Rehabilitación Oral"
            description="Soluciones integrales para recuperar función y estética en casos complejos."
            icon={<Wrench size={40} weight="duotone" className="text-blue-500" />}
          />
          <ServiceCard
            title="Prótesis Dental"
            description="Prótesis fijas y removibles con máxima comodidad y precisión."
            icon={<Cube size={40} weight="duotone" className="text-lime-500" />}
          />
          <ServiceCard
            title="Tecnología Digital TRIOS®"
            description="Escaneo intraoral 3D sin pastas incómodas, diagnóstico más claro y rápido."
            icon={<DesktopTower size={40} weight="duotone" className="text-blue-500" />}
          />
          <ServiceCard
            title="Atención Preventiva"
            description="Chequeos regulares, limpieza y orientación personalizada para mantener tu salud bucal."
            icon={<Leaf size={40} weight="duotone" className="text-lime-500" />}
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ title, description, icon }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="font-serif text-xl text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
