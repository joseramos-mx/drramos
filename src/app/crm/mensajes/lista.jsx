import Link from "next/link";
import { etiquetaLabel, horaCorta, resumenDe } from "./lib";

export const chipEtiqueta = (id) =>
  id === "urgencia" ? "bg-[#fde2e2] text-[#9b2424]" : "bg-[#efe3cc] text-[#5e4a26]";

/** Filtros y lista de conversaciones (la usa la bandeja y la demo). */
export default function Lista({ lista, filtros, f, base, hrefChat }) {
  return (
    <>
      <nav className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Filtrar conversaciones">
        {filtros.map((x) => {
          const activo = (f || null) === x.id;
          return (
            <Link
              key={x.id || "todos"}
              href={x.id ? `${base}?f=${x.id}` : base}
              aria-current={activo ? "page" : undefined}
              className={`inline-flex h-12 shrink-0 items-center rounded-full px-5 text-[16px] font-semibold ${
                activo ? "bg-[#b89968] text-[#1c1a17]" : "border-2 border-[#1c1a17]/10 bg-white text-[#3d372f]"
              }`}
            >
              {x.label}
            </Link>
          );
        })}
      </nav>

      <ul className="mt-3 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_3px_rgba(28,26,23,0.08)]">
        {lista.length === 0 && (
          <li className="p-8 text-center text-[18px] leading-relaxed text-[#5b544a]">
            {f
              ? "No hay conversaciones con este filtro."
              : "Todavía no hay mensajes. Cuando un paciente escriba al WhatsApp del consultorio, aparecerá aquí."}
          </li>
        )}
        {lista.map((c) => (
          <li key={c.telefono} className="border-b border-[#1c1a17]/[0.07] last:border-0">
            <Link
              href={hrefChat ? hrefChat(c) : `${base}/${c.telefono}`}
              className={`flex min-h-[92px] items-center gap-4 px-4 py-3.5 active:bg-[#f5f1ea] ${c.esperando ? "bg-[#fbf6ec]" : ""}`}
            >
              <span
                aria-hidden
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#efe3cc] text-[24px] font-bold text-[#8a6d3f]"
              >
                {c.nombre.replace(/^WhatsApp /, "#").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[19px] font-bold text-[#1c1a17]">{c.nombre}</p>
                <p className={`truncate text-[16px] ${c.esperando ? "font-semibold text-[#1c1a17]" : "text-[#5b544a]"}`}>
                  {c.ultimo.direccion === "salida" && <span className="font-normal text-[#8b8478]">Tú: </span>}
                  {resumenDe(c.ultimo)}
                </p>
                {c.etiquetas.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.etiquetas.map((e) => (
                      <span key={e} className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${chipEtiqueta(e)}`}>
                        {etiquetaLabel(e)}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <span className="flex shrink-0 flex-col items-end gap-2">
                <span className={`text-[14px] tabular-nums ${c.esperando ? "font-bold text-[#8a6d3f]" : "text-[#8b8478]"}`}>
                  {horaCorta(c.ultimo.enviado_en)}
                </span>
                {c.esperando && (
                  <span className="rounded-full bg-[#b89968] px-2.5 py-0.5 text-[13px] font-bold text-[#1c1a17]">Nuevo</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
