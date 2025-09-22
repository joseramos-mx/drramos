"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Hero section en JSX (sin TypeScript) con foto del doctor y estadísticas de confianza

export default function HeroDoctor() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0A0E] text-white min-h-screen">
      {/* Glow background */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(116,95,255,0.25),rgba(35,31,60,0)_60%)] blur-3xl"
        aria-hidden
      />

      {/* Top bar */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <Link href="#" className="">
          <Image src="/logo.svg" alt="Logo Dr. Felipe Ramos" width={200} height={60} />
        </Link>
        <div className="hidden items-center gap-8 text-xs text-zinc-300 md:flex">
          <Link href="#trayectoria" className="hover:text-white uppercase">Trayectoria</Link>
          <Link href="#servicios" className="hover:text-white uppercase">Servicios</Link>
          <Link href="#tecnologia" className="hover:text-white uppercase">Tecnología</Link>
          <Link href="#instalaciones" className="hover:text-white uppercase">instalaciones</Link>
          <Link href="#contacto" className="hover:text-white uppercase">Contacto</Link>
        </div>
        <Button asChild size="lg" className="bg-lime-500 rounded-none hover:bg-lime-400 text-white font-bold">
          <Link href="https://wa.me/526182066760" aria-label="Contactar por WhatsApp">
            Contactar <Phone className="ml-1 h-3 w-4" />
          </Link>
        </Button>
      </nav>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px w-full bg-white/10" />
      </div>

      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-[1.05fr_0.95fr] items-center">
        {/* Left copy */}
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 border rounded-full border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
          >
            Cirujano Dentista • Odontología Estética e Implantes
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-serif text-5xl leading-tight text-zinc-50 sm:text-5xl md:text-6xl"
          >
            Volver a <span className="italic text-amber-500">sonreir</span> sin miedo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 max-w-xl md:text-lg leading-relaxed text-zinc-300"
          >
            30+ años transformando sonrisas en Durango, Dgo. Autor de <em>El Arte de Hacer Dientes</em>,
            fundador del IAN y pionero del flujo digital. Valoración diagnóstica con TRIOS® para planes
            precisos, cómodos y rápidos.
          </motion.p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-400 rounded-none" >
              <Link href="https://wa.me/526182066760?text=Hola%2C%20quiero%20agendar%20mi%20valoraci%C3%B3n%20con%20el%20Dr.%20Felipe%20Ramos">Agenda tu valoración</Link>
            </Button>
            <Link
              href="#servicios"
              className="text-sm text-zinc-300 underline-offset-4 hover:text-white hover:underline"
            >
              <Button className="bg-white/5 hover:bg-white/10 rounded-none" size="lg" variant="outline">
                Ver servicios
              </Button>
            </Link>
          </div>

          {/* Bottom tags */}
          <div className="mt-10 hidden items-center gap-3 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex">
            <Badge className="rounded-full border-white/30 bg-purple-500/20">Estética</Badge>
            <Badge className="rounded-full border-white/30 bg-red-500/20">Implantes</Badge>
            <Badge className="rounded-full border-white/30 bg-teal-500/20">Rehabilitación</Badge>
            <Badge className="rounded-full border-white/30 bg-blue-500/20">Prótesis</Badge>
            <Badge className="rounded-full border-white/30 bg-yellow-500/20">Digital Workflow</Badge>
          </div>
        </div>

        {/* Right full photo with trust stats */}
        <div className="relative h-[28rem] md:h-[34rem] lg:h-[38rem] overflow-hidden border border-white/10 bg-white/5">
          {/* Photo (reemplaza src por la foto del Dr.) */}
          <img
            src="/images/snow.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0A0E]/70 via-transparent to-transparent" />

          {/* Stats row */}
          <div className="absolute top-4 left-4 right-4 grid grid-cols-3 gap-3">
            <StatPill value="12,000+" label="Sonrisas restauradas" />
            <StatPill value="30+" label="Años de experiencia" />
            <StatPill value="4.9★" label="Reseñas promedio" />
          </div>

          {/* Bottom caption */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="text-sm text-zinc-200">
              Atención ética y personalizada
            </div>
            <a
              href="https://wa.me/526182066760?text=Hola%2C%20quiero%20agendar%20mi%20valoraci%C3%B3n"
              className=" bg-lime-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-lime-400"
            >
              Agenda por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="border border-white/15 bg-black/30 px-4 py-3 backdrop-blur">
      <div className="text-center">
        <div className="font-serif text-2xl text-white">{value}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-300">{label}</div>
      </div>
    </div>
  );
}
