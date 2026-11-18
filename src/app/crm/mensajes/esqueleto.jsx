import { BarraInferior, BarraSuperior } from "./encabezado";

/**
 * Siluetas grises mientras llegan los datos: la pantalla cambia al
 * instante al tocar el menú y no parece trabada (las usan los loading.jsx).
 */
const gris = "animate-pulse rounded-full bg-[#ebe5da]";

export function EsqueletoLista({ titulo = "Mensajes", activo = "mensajes" }) {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-[720px] pb-28">
      <BarraSuperior titulo={titulo} />
      <div className={`mx-5 mb-4 h-14 ${gris}`} />
      <ul>
        {Array.from({ length: 7 }, (_, i) => (
          <li key={i} className="flex items-center gap-3 border-b border-[#1c1a17]/[0.06] px-5 py-3.5">
            <span className={`h-12 w-12 shrink-0 ${gris}`} />
            <span className="flex flex-1 flex-col gap-2">
              <span className={`h-4 w-2/5 ${gris}`} />
              <span className={`h-3.5 w-4/5 ${gris}`} />
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only" role="status">Cargando…</p>
      <BarraInferior activo={activo} />
    </main>
  );
}

export function EsqueletoChat() {
  return (
    <main aria-busy="true" className="mx-auto flex min-h-[100dvh] w-full max-w-[720px] flex-col bg-[#f5f1ea]">
      <header className="flex items-center gap-3 border-b border-[#1c1a17]/[0.08] bg-white px-3 py-3">
        <span className={`h-11 w-11 ${gris}`} />
        <span className={`h-5 w-40 ${gris}`} />
      </header>
      <div className="flex flex-1 flex-col justify-end gap-3 px-4 py-6">
        <span className={`h-12 w-3/5 rounded-[20px] ${gris}`} />
        <span className={`ml-auto h-16 w-2/3 rounded-[20px] ${gris}`} />
        <span className={`h-10 w-1/2 rounded-[20px] ${gris}`} />
      </div>
      <div className="border-t border-[#1c1a17]/[0.08] bg-white px-3 py-3">
        <span className={`block h-[52px] w-full ${gris}`} />
      </div>
      <p className="sr-only" role="status">Cargando…</p>
    </main>
  );
}

export function EsqueletoPantalla({ titulo, activo = "ajustes" }) {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-[720px] pb-28">
      <BarraSuperior titulo={titulo} />
      <div className="flex flex-col gap-4 px-5 pt-2">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`h-16 w-full rounded-[20px] ${gris}`} />
        ))}
      </div>
      <p className="sr-only" role="status">Cargando…</p>
      <BarraInferior activo={activo} />
    </main>
  );
}

export function EsqueletoAgenda() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 sm:px-6">
      <h1 className="text-[30px] font-bold tracking-tight text-[#1c1a17]">Agenda</h1>
      <span className={`mt-2 block h-5 w-56 ${gris}`} />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <span key={i} className={`h-12 flex-1 sm:w-32 sm:flex-none ${gris}`} />
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`h-14 w-full rounded-2xl ${gris}`} />
        ))}
      </div>
      <p className="sr-only" role="status">Cargando…</p>
      <BarraInferior activo="agenda" />
    </main>
  );
}
