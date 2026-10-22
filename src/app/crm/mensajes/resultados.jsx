import Link from "next/link";
import { fragmento, horaCorta } from "./lib";
import { FilaChat } from "./lista";

/** Resultados de la búsqueda: chats que coinciden y mensajes con la palabra. */
export default function Resultados({ q, chats, hits, base }) {
  const titulo = "px-5 pb-1 pt-4 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]";
  if (!chats.length && !hits.length) {
    return <p className="px-8 py-16 text-center text-[18px] text-[#9a9388]">No encontramos “{q}”.</p>;
  }
  return (
    <>
      {chats.length > 0 && (
        <>
          <h2 className={titulo}>Chats</h2>
          <ul>
            {chats.map((c) => (
              <FilaChat key={c.telefono} c={c} base={base} />
            ))}
          </ul>
        </>
      )}
      {hits.length > 0 && (
        <>
          <h2 className={titulo}>Mensajes</h2>
          <ul>
            {hits.map((m, i) => {
              const f = fragmento(m.texto, q);
              return (
                <li key={`${m.telefono}-${m.enviado_en}-${i}`}>
                  <Link href={`${base}/${m.telefono}`} className="block border-b border-[#1c1a17]/[0.07] px-5 py-3 active:bg-[#f5f1ea]">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[17px] font-bold text-[#1c1a17]">{m.nombre}</span>
                      <span className="shrink-0 text-[14px] text-[#9a9388]">{horaCorta(m.enviado_en)}</span>
                    </span>
                    <span className="line-clamp-2 text-[16px] text-[#5b544a]">
                      {m.direccion === "salida" && "Tú: "}
                      {f.antes}
                      <mark className="rounded bg-[#efe3cc] px-0.5 font-semibold text-[#1c1a17]">{f.igual}</mark>
                      {f.despues}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
