"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-[#0B0A0E] text-zinc-300">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Links */}
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
          <Link href="#trayectoria" className="hover:text-white uppercase text-xs tracking-wider">
            Trayectoria
          </Link>
          <Link href="#servicios" className="hover:text-white uppercase text-xs tracking-wider">
            Servicios
          </Link>
          <Link href="#tecnologia" className="hover:text-white uppercase text-xs tracking-wider">
            Tecnología
          </Link>
          <Link href="#instalaciones" className="hover:text-white uppercase text-xs tracking-wider">
            Instalaciones
          </Link>
          <Link href="#contacto" className="hover:text-white uppercase text-xs tracking-wider">
            Contacto
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/10" />

        {/* Bottom */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Dr. Felipe de Jesús Ramos. Todos los derechos reservados.</p>
          <p className="text-zinc-400">Diseño y desarrollo por RMS Innovation Industries</p>
        </div>
      </div>
    </footer>
  );
}
