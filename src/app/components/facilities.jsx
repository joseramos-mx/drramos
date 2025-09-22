"use client";
import Image from "next/image";

export default function FacilitiesSection() {
  return (
    <section id="instalaciones" className="relative bg-white py-20 overflow-hidden">
      {/* BLOBS envueltos y recortados */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-6%] h-[24rem] w-[24rem] rounded-full
                     bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.22),rgba(255,255,255,0)_60%)] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-10%] left-[-6%] h-[18rem] w-[18rem] rounded-full
                     bg-[radial-gradient(circle_at_center,rgba(132,204,22,0.16),rgba(255,255,255,0)_60%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/3 h-[16rem] w-[16rem] -translate-x-1/2 rounded-full
                     bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),rgba(255,255,255,0)_60%)] blur-2xl"
        />
      </div>

      {/* barra superior */}
      <div className="mx-auto mb-10 h-[3px] w-11/12 max-w-7xl bg-gradient-to-r from-amber-400 via-lime-400 to-blue-500" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-2">
        {/* Texto + mapa */}
        <div className="flex flex-col">
          <div className="mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 mb-3">
              Nuestras instalaciones
            </h2>
            <h3 className="text-lg text-zinc-700 mb-6">
              Localización <span className="font-semibold text-zinc-900">accesible</span> en Durango
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-8 max-w-xl">
              Espacios amplios y cómodos, gabinetes con tecnología de última generación, laboratorio propio y flujo
              digital de trabajo. Todo está diseñado para ofrecer precisión clínica y una experiencia impecable.
            </p>
            <div className="space-y-4 flex gap-5">
              <a href="https://www.centralmedicasantaana.com" className="group block w-max text-sm font-medium text-zinc-900">
                LA CLÍNICA
                <span className="block h-[2px] w-10 bg-amber-400 transition-all group-hover:w-16" />
              </a>
              <a href="#ubicacion" className="group block w-max text-sm font-medium text-zinc-900">
                NUESTRA UBICACIÓN
                <span className="block h-[2px] w-16 bg-blue-500 transition-all group-hover:w-24" />
              </a>
            </div>
          </div>

          {/* Mapa */}
          <div id="ubicacion" className="mt-0">
            <div className="aspect-[16/8] w-full overflow-hidden">
              <iframe
                title="Mapa de la clínica"
                src="https://www.google.com/maps/embed?pb="
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* Galería 2x2 1:1 */}
        <div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <GalleryItem src="/images/ins1.jpeg" alt="Recepción de la clínica" accent="from-amber-400 to-amber-500" />
            <GalleryItem src="/images/ins2.jpeg" alt="Unidad de vanguardia" accent="from-lime-400 to-lime-500" />
            <GalleryItem src="/images/ins3.jpeg" alt="Pasillo y áreas amplias" accent="from-blue-500 to-blue-600" />
            <GalleryItem src="/images/ins4.jpeg" alt="Tecnología intraoral TRIOS®" accent="from-amber-400 to-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryItem({ src, alt, accent = "from-amber-400 to-blue-500" }) {
  return (
    <figure className="group relative aspect-square overflow-hidden ring-1 ring-zinc-200">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] translate-y-[3px] bg-gradient-to-r ${accent} opacity-80 transition-all duration-300 group-hover:translate-y-0`} />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-3 text-[11px] tracking-wide text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {alt}
      </figcaption>
    </figure>
  );
}
