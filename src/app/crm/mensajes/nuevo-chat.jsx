"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChatCircleTextIcon } from "@phosphor-icons/react";
import Hoja from "./hoja";
import { buscarPacientesAction, crearContactoAction } from "./actions";
import { sinAcentos } from "./lib";

const campo =
  "h-14 w-full rounded-full bg-[#f2efe9] px-5 text-[18px] text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";

/**
 * Botón flotante "Nuevo chat" (como WhatsApp). Busca a un paciente que
 * ya está en la agenda o escribe nombre y número de alguien nuevo; abre
 * su chat, donde se le manda un mensaje aprobado para iniciar.
 * `demo` = lista de contactos falsos para la demo local (sin servidor).
 */
export default function NuevoChat({ base = "/crm/mensajes", demo = null }) {
  const [abierta, setAbierta] = useState(false);
  const [q, setQ] = useState("");
  const [encontrados, setEncontrados] = useState([]);
  const [buscando, start] = useTransition();
  const [state, crear] = useActionState(crearContactoAction, null);

  useEffect(() => {
    const texto = q.trim();
    if (texto.length < 2) return setEncontrados([]);
    if (demo) {
      return setEncontrados(demo.filter((p) => sinAcentos(p.nombre).includes(sinAcentos(texto)) || p.whatsapp.includes(texto)));
    }
    const t = setTimeout(() => start(async () => setEncontrados(await buscarPacientesAction(texto))), 300);
    return () => clearTimeout(t);
  }, [q, demo]);

  const titulo = "px-5 pb-2 pt-4 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]";
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label="Nuevo chat"
        className="fixed bottom-[88px] right-5 z-20 flex h-16 items-center gap-2 rounded-full bg-[#b89968] px-5 text-[17px] font-bold text-white shadow-[0_6px_20px_rgba(138,109,63,0.45)] active:scale-95 sm:right-[max(20px,calc(50vw-340px))]"
      >
        <ChatCircleTextIcon size={26} weight="fill" /> Nuevo
      </button>

      <Hoja abierta={abierta} onCerrar={() => setAbierta(false)} titulo="Nuevo chat">
        <div className="px-5 pt-1">
          <label className="sr-only" htmlFor="buscar-paciente">Buscar paciente</label>
          <input
            id="buscar-paciente"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar paciente por nombre o teléfono"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            className={`${campo} [&::-webkit-search-cancel-button]:hidden`}
          />
        </div>
        {q.trim().length >= 2 && (
          <ul className="mt-2">
            {encontrados.map((p) => (
              <li key={p.id}>
                <Link
                  href={`${base}/${p.whatsapp}`}
                  onClick={() => setAbierta(false)}
                  className="flex items-center gap-4 px-5 py-3 active:bg-[#f5f1ea]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efe3cc] text-[20px] font-bold text-[#8a6d3f]">
                    {p.nombre.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[18px] font-semibold text-[#1c1a17]">{p.nombre}</span>
                    <span className="block text-[15px] text-[#7a7368]">
                      {p.whatsapp.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            {!buscando && encontrados.length === 0 && (
              <li className="px-5 py-3 text-[16px] text-[#9a9388]">No está en la lista. Agrégalo abajo 👇</li>
            )}
          </ul>
        )}

        <h3 className={titulo}>Alguien nuevo</h3>
        <form action={demo ? undefined : crear} className="space-y-3 px-5 pb-2">
          <input name="nombre" placeholder="Nombre" autoComplete="off" autoCapitalize="words" enterKeyHint="next" className={campo} />
          <input name="telefono" type="tel" inputMode="tel" placeholder="WhatsApp (10 dígitos)" autoComplete="off" maxLength={14} enterKeyHint="go" className={campo} />
          {state?.error && (
            <p role="alert" className="px-2 text-[16px] font-medium text-[#c0392b]">
              {state.error}
            </p>
          )}
          <button type="submit" className="h-14 w-full rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white">
            Abrir chat
          </button>
        </form>
      </Hoja>
    </>
  );
}
