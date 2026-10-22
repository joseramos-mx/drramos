import Link from "next/link";
import { etiquetaLabel, horaCorta, resumenDe } from "./lib";

/** Filtros y lista de conversaciones (la usa la bandeja y la demo). */
export default function Lista({ lista, filtros, f, base, hrefChat }) {
  return (
    <>
      <nav className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Filtrar conversaciones">
        {filtros.map((x) => (
          <Link
            key={x.id || "todos"}
            href={x.id ? `${base}?f=${x.id}` : base}
            aria-current={(f || null) === x.id ? "page" : undefined}
            className={`shrink-0 border px-3 py-1.5 font-[family-name:var(--font-albert)] text-[13px] ${
              (f || null) === x.id ? "border-[#b89968] bg-[#b89968]/[0.18] text-[#f5f1ea]" : "border-white/[0.18] text-white/65 hover:border-white/40"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </nav>

      <ul className="mt-3 border border-white/[0.1]">
        {lista.length === 0 && (
          <li className="p-6 font-[family-name:var(--font-albert)] text-[14px] text-white/65">
            {f
              ? "No hay conversaciones con este filtro."
              : "Todavía no hay conversaciones. Cuando un paciente escriba al WhatsApp del consultorio, aparecerá aquí."}
          </li>
        )}
        {lista.map((c) => (
          <li key={c.telefono}>
            <Link
              href={hrefChat ? hrefChat(c) : `${base}/${c.telefono}`}
              className={`flex min-h-[68px] items-center gap-4 border-b border-white/[0.06] px-4 py-3 last:border-0 hover:bg-white/[0.03] ${
                c.esperando ? "bg-[#b89968]/[0.06]" : ""
              }`}
            >
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.05] font-[family-name:var(--font-cormorant)] text-[20px] text-[#f5f1ea]"
              >
                {c.nombre.replace(/^WhatsApp /, "#").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-albert)] text-[16px] font-medium text-[#f5f1ea]">
                  {c.nombre}
                </p>
                <p className="truncate font-[family-name:var(--font-albert)] text-[14px] text-white/70">
                  {c.ultimo.direccion === "salida" && <span className="text-white/45">Tú: </span>}
                  {resumenDe(c.ultimo)}
                </p>
                {c.etiquetas.length > 0 && (
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    {c.etiquetas.map((e) => (
                      <span
                        key={e}
                        className={`border px-1.5 py-0.5 font-[family-name:var(--font-albert)] text-[11px] ${
                          e === "urgencia" ? "border-[#ff7a7a]/60 text-[#ffb1b1]" : "border-[#b89968]/50 text-[#d9c39e]"
                        }`}
                      >
                        {etiquetaLabel(e)}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`font-[family-name:var(--font-albert)] text-[12px] tabular-nums ${c.esperando ? "text-[#b89968]" : "text-white/60"}`}>
                  {horaCorta(c.ultimo.enviado_en)}
                </span>
                {c.esperando && <span aria-label="Espera respuesta" className="h-2.5 w-2.5 rounded-full bg-[#b89968]" />}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
