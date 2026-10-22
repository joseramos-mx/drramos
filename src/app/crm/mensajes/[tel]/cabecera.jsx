import Link from "next/link";
import { ArrowLeftIcon, CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr";
import { labelCanal } from "../../resultados/fuentes";

/** Barra de arriba del chat: regresar, nombre grande y botón Agendar. */
export default function Cabecera({ nombre, telefono, origen, volver, agendarHref }) {
  return (
    <header className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-[#f5f1ea]/95 px-4 py-3 backdrop-blur">
      <Link
        href={volver}
        aria-label="Regresar a Mensajes"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1c1a17] shadow-[0_1px_3px_rgba(28,26,23,0.12)]"
      >
        <ArrowLeftIcon size={26} weight="bold" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[22px] font-bold leading-tight text-[#1c1a17]">{nombre}</h1>
        <p className="truncate text-[15px] text-[#5b544a]">
          {telefono.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
          {origen && ` · llegó por ${labelCanal(origen)}`}
        </p>
      </div>
      {agendarHref && (
        <Link
          href={agendarHref}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#1c1a17] px-5 text-[17px] font-semibold text-[#f5f1ea]"
        >
          <CalendarBlankIcon size={22} weight="bold" /> Agendar
        </Link>
      )}
    </header>
  );
}
