import Link from "next/link";
import { CalendarBlankIcon, ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr";

/** Título grande y dos botones claros: Mensajes y Agenda. */
export default function Encabezado({ base = "/crm/mensajes" }) {
  const pill = "inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[18px] font-semibold";
  return (
    <header className="pb-4">
      <p className="text-[15px] font-medium text-[#8a6d3f]">WhatsApp del consultorio</p>
      <h1 className="mt-1 text-[34px] font-bold leading-tight tracking-tight text-[#1c1a17]">Mensajes</h1>
      <nav className="mt-4 flex gap-3" aria-label="Secciones">
        <Link href={base} aria-current="page" className={`${pill} bg-[#1c1a17] text-[#f5f1ea]`}>
          <ChatCircleTextIcon size={24} weight="fill" /> Mensajes
        </Link>
        <Link href="/agenda" className={`${pill} border-2 border-[#1c1a17]/15 bg-white text-[#1c1a17]`}>
          <CalendarBlankIcon size={24} weight="bold" /> Agenda
        </Link>
      </nav>
    </header>
  );
}


/** Tarjeta grande: cuántos pacientes esperan respuesta. */
export function Resumen({ pendientes }) {
  return (
    <p className="mt-2 flex items-center gap-3 rounded-[22px] bg-white px-5 py-4 text-[18px] font-semibold shadow-[0_1px_3px_rgba(28,26,23,0.08)]">
      {pendientes > 0 ? (
        <>
          <span className="h-4 w-4 shrink-0 rounded-full bg-[#b89968]" />
          {pendientes} {pendientes === 1 ? "paciente espera" : "pacientes esperan"} respuesta
        </>
      ) : (
        <>✓ Todo contestado</>
      )}
    </p>
  );
}
