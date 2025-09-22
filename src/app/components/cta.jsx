"use client";

import Link from "next/link";

export default function CTASection({ accent = "blue" }) {
  // "blue" | "lime"
  const accentFrom =
    accent === "lime" ? "from-lime-400 via-lime-300" : "from-blue-500 via-blue-400";
  const accentTo = accent === "lime" ? "to-lime-200" : "to-blue-200";

  return (
    <section id="contacto" className="relative bg-white py-16 sm:py-24 overflow-hidden">
      {/* fondo sutil para separar del resto */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80rem_40rem_at_50%_-10%,rgba(59,130,246,0.08),transparent)]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Card flotante */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#0B0A0E] text-white shadow-2xl ring-1 ring-white/10">
          {/* Glow borde superior */}
          <div
            aria-hidden
            className={`absolute inset-x-6 -top-px h-[2px] bg-gradient-to-r ${accentFrom} ${accentTo} opacity-90`}
          />

          <div className="relative grid grid-cols-1 items-center gap-8 px-6 py-12 sm:px-12 md:grid-cols-2 md:py-16">
            {/* Copy */}
            <div>
              <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
                ¿Reservamos tu valoración?
              </h2>
              <p className="mt-3 max-w-xl text-zinc-300">
                En cada detalle de nuestro trabajo hay ciencia, arte y humanidad. Agenda tu valoración y da el primer paso hacia una sonrisa que refleje tu esencia. Estamos aquí para escucharte, guiarte y cuidar de ti como parte de nuestra familia.
              </p>

              {/* Botones */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <CTAButton
                  href="https://wa.me/526182066760?text=Hola%2C%20quiero%20agendar%20mi%20valoraci%C3%B3n%20con%20el%20Dr.%20Felipe%20Ramos"
                  label="Agendar por WhatsApp"
                  variant="solid"
                />
                <CTAButton
                  href="https://www.google.com/maps?q=Prol.+G%C3%B3mez+Palacio+501+Pte,+Zona+Centro,+Durango,+Dgo."
                  label="Ver ubicación"
                  variant="ghost"
                />
              </div>
            </div>

            {/* Lado derecho: IMAGEN en lugar de gradients */}
            <div className="relative h-40 w-full overflow-hidden rounded-2xl md:h-70">
              <img
                src="/images/smile.jpg" // 🔁 reemplaza por tu imagen (recepción/equipo/instalación)
                alt="Instalaciones de la clínica"
                className="h-full w-full object-cover"
              />
              {/* Overlay sutil para cohesión con el card */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/30 via-black/10 to-transparent" />
            </div>
          </div>

          {/* borde inferior en gradiente */}
          <div
            aria-hidden
            className={`absolute inset-x-6 bottom-0 h-[2px] bg-gradient-to-r ${accentFrom} ${accentTo} opacity-90`}
          />
        </div>
      </div>
    </section>
  );
}

/* Botón estilo “pill” con brillo animado */
function CTAButton({ href, label, variant = "solid", className = "" }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50";
  const solid =
    "bg-lime-500/70 text-white hover:bg-black/70 ring-1 ring-white/15 shadow-[inset_0_-2px_0_rgba(255,255,255,0.06)]";
  const ghost =
    "bg-blue-500/55 text-white hover:bg-white/10 ring-1 ring-white/15";

  return (
    <Link href={href} className={`${base} ${variant === "ghost" ? ghost : solid} ${className}`}>
      {/* glossy dot con pulso */}
      <span className="relative mr-1 inline-flex h-2.5 w-2.5 items-center justify-center">
        {/* punto base */}
        <span className="absolute h-2.5 w-2.5 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
        {/* halo animado (ping) */}
        <span className="absolute h-2.5 w-2.5 rounded-full bg-white/60 animate-ping" />
      </span>
      {label}
    </Link>
  );
}
