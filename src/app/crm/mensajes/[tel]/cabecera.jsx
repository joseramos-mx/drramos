import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { labelCanal } from "../../resultados/fuentes";
import { etiquetaLabel } from "../lib";
import MenuChat from "./menu-chat";

/** Barra de arriba del chat: regresar, nombre y menú ⋮ (agendar, llamar, etiquetas). */
export default function Cabecera({ nombre, telefono, origen, etiquetas = [], pacienteId, volver, agendarHref }) {
  const urgente = etiquetas.includes("urgencia");
  const detalle = etiquetas.length ? etiquetas.map(etiquetaLabel).join(" · ") : origen ? `Llegó por ${labelCanal(origen)}` : "";
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#1c1a17]/[0.08] bg-white/95 px-2 py-2 backdrop-blur">
      <Link href={volver} aria-label="Regresar a Mensajes" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full active:bg-[#f2efe9]">
        <ArrowLeftIcon size={26} weight="bold" />
      </Link>
      <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe3cc] text-[19px] font-bold text-[#8a6d3f]">
        {nombre.replace(/^WhatsApp /, "#").charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1 pl-1">
        <h1 className="truncate text-[19px] font-bold leading-tight text-[#1c1a17]">{nombre}</h1>
        {detalle && <p className={`truncate text-[14px] ${urgente ? "font-semibold text-[#c0392b]" : "text-[#7a7368]"}`}>{detalle}</p>}
      </div>
      <MenuChat pacienteId={pacienteId} etiquetas={etiquetas} telefono={telefono} agendarHref={agendarHref} />
    </header>
  );
}
