import Link from "next/link";
import { horaCorta, resumenDe } from "./lib";

/** Pestañas fijas de la bandeja: pocas y claras. */
export function filtrosDe(todas) {
  const esperan = todas.filter((c) => c.esperando).length;
  const urgentes = todas.filter((c) => c.etiquetas.includes("urgencia")).length;
  return [
    { id: null, label: "Todos", n: 0 },
    { id: "esperan", label: "Pendientes", n: esperan },
    { id: "urgencia", label: "Urgentes", n: urgentes },
  ];
}

export function filtrar(todas, f) {
  if (f === "esperan") return todas.filter((c) => c.esperando);
  if (f === "urgencia") return todas.filter((c) => c.etiquetas.includes("urgencia"));
  return todas;
}

// Color del círculo con la inicial, fijo por paciente
const TONOS = ["bg-[#efe3cc] text-[#8a6d3f]", "bg-[#e3ece4] text-[#3f6b48]", "bg-[#e4e9f2] text-[#3d5a8a]", "bg-[#f2e4e4] text-[#8a3d3d]"];
const tono = (tel) => TONOS[Number(String(tel).slice(-1)) % TONOS.length];

/** Pestañas y lista de conversaciones (la usa la bandeja y la demo). */
export default function Lista({ lista, filtros, f, base }) {
  return (
    <>
      <nav className="flex border-b border-[#1c1a17]/[0.08] px-2" aria-label="Filtrar conversaciones">
        {filtros.map((x) => {
          const activo = (f || null) === x.id;
          return (
            <Link
              key={x.id || "todos"}
              href={x.id ? `${base}?f=${x.id}` : base}
              aria-current={activo ? "page" : undefined}
              className={`relative flex h-14 flex-1 items-center justify-center gap-1.5 text-[16px] font-semibold ${
                activo ? "text-[#1c1a17]" : "text-[#9a9388]"
              }`}
            >
              {x.label}
              {x.n > 0 && (
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-bold ${
                    x.id === "urgencia" ? "bg-[#c0392b] text-white" : "bg-[#b89968] text-white"
                  }`}
                >
                  {x.n}
                </span>
              )}
              {activo && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-full bg-[#b89968]" />}
            </Link>
          );
        })}
      </nav>

      <ul>
        {lista.length === 0 && (
          <li className="px-8 py-16 text-center text-[18px] leading-relaxed text-[#9a9388]">
            {f ? "Nada por aquí. 👍" : "Todavía no hay mensajes. Cuando un paciente escriba, aparecerá aquí."}
          </li>
        )}
        {lista.map((c) => (
          <FilaChat key={c.telefono} c={c} base={base} />
        ))}
      </ul>
    </>
  );
}

/** Un renglón de la lista: inicial, nombre, último mensaje, hora y si falta contestar. */
export function FilaChat({ c, base }) {
    const urgente = c.etiquetas.includes("urgencia");
    return (
      <li>
        <Link href={`${base}/${c.telefono}`} className="flex items-center gap-4 px-5 py-3 active:bg-[#f5f1ea]">
          <span
            aria-hidden
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[22px] font-bold ${tono(c.telefono)}`}
          >
            {c.nombre.replace(/^WhatsApp /, "#").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 border-b border-[#1c1a17]/[0.07] py-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[18px] font-bold text-[#1c1a17]">{c.nombre}</p>
              <span className={`shrink-0 text-[14px] tabular-nums ${c.esperando ? "font-semibold text-[#8a6d3f]" : "text-[#9a9388]"}`}>
                {horaCorta(c.ultimo.enviado_en)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <p className={`truncate text-[16px] ${c.esperando ? "text-[#1c1a17]" : "text-[#7a7368]"}`}>
                {urgente && <span className="font-bold text-[#c0392b]">Urgente · </span>}
                      {!urgente && c.paraElla && c.esperando && <span className="font-bold text-[#8a6d3f]">Para ti · </span>}
                {c.ultimo.direccion === "salida" && (c.ultimo.via === "asistente" ? "🤖 " : "Tú: ")}
                {resumenDe(c.ultimo)}
              </p>
              {c.esperando && <span aria-label="Sin contestar" className="h-3.5 w-3.5 shrink-0 rounded-full bg-[#b89968]" />}
            </div>
          </div>
        </Link>
      </li>
    );
}
