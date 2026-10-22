"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

const A_LA_VEZ = 3;

function Burbuja({ m }) {
  const paciente = m.de === "paciente";
  const texto = m.texto ? (m.texto.length > 220 ? `${m.texto.slice(0, 220)}…` : m.texto) : `[${m.tipo === "audio" ? "nota de voz" : m.tipo}]`;
  return (
    <p className={`max-w-[85%] whitespace-pre-wrap rounded-[18px] px-3.5 py-2 text-[15px] leading-snug ${paciente ? "self-start bg-[#f2efe9]" : "self-end bg-[#efe3cc]"}`}>
      {texto}
    </p>
  );
}

function QueHizo({ r }) {
  const que =
    r.tipo === "aprobada"
      ? `respuestas aprobadas (${r.ids.join(", ")})`
      : r.tipo === "libre"
        ? "respuesta propia (aprobada por el verificador)"
        : r.tipo === "cita"
          ? `flujo de su cita: ${r.accion}`
        : `pasó a la Dra. Gaby${r.urgente ? " como URGENCIA" : ""}`;
  return (
    <div className="mt-2 rounded-[16px] border-2 border-[#1c1a17]/10 bg-white p-3 text-[14px] text-[#5b544a]">
      <p>
        <b>Qué hizo:</b> {que}
        {r.agendadas.length > 0 && ` · agendó ${r.agendadas.length}`}
      </p>
      {r.motivo && (
        <p>
          <b>Motivo:</b> {r.motivo}
        </p>
      )}
      <p className="mt-1 whitespace-pre-wrap text-[#1c1a17]">
        <b>Mandaría:</b> {r.texto}
      </p>
      {r.borrador && (
        <p className="mt-1 whitespace-pre-wrap">
          <b>Borrador rechazado:</b> {r.borrador}
        </p>
      )}
    </div>
  );
}

function Caso({ caso, estado }) {
  const [abierto, setAbierto] = useState(false);
  const r = estado?.resultado;
  const fallo = estado?.paso === false || estado?.error;
  return (
    <li className="border-b border-[#1c1a17]/[0.07]">
      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex min-h-14 w-full items-center gap-3 px-5 py-2 text-left">
        <span className="w-7 shrink-0">
          {estado?.corriendo ? (
            <span className="block h-5 w-5 animate-spin rounded-full border-2 border-[#b89968] border-t-transparent" />
          ) : estado?.paso === true ? (
            <CheckCircleIcon size={26} weight="fill" className="text-[#2f7a4b]" />
          ) : fallo ? (
            <XCircleIcon size={26} weight="fill" className="text-[#c0392b]" />
          ) : (
            <span className="block h-5 w-5 rounded-full border-2 border-[#cfc8bc]" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] text-[#1c1a17]">{caso.conversacion.at(-1).texto || "[nota de voz]"}</span>
          {fallo && <span className="block text-[14px] text-[#c0392b]">{estado.error || estado.fallas.join(" · ")}</span>}
        </span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-1.5 px-5 pb-4">
          {caso.conversacion.map((m, i) => (
            <Burbuja key={i} m={m} />
          ))}
          {r && !r.error && <QueHizo r={r} />}
        </div>
      )}
    </li>
  );
}

async function probarCaso(url, id) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  return res.json();
}

/** Corre la batería de pruebas del asistente y muestra cuáles pasan. */
export default function Probador({ casos, grupos, llave, url = "/crm/mensajes/pruebas/correr" }) {
  const [estados, setEstados] = useState({});
  const [corriendo, setCorriendo] = useState(false);
  const poner = (id, v) => setEstados((e) => ({ ...e, [id]: v }));

  async function correr(lista) {
    setCorriendo(true);
    const cola = [...lista];
    const trabajador = async () => {
      for (let c = cola.shift(); c; c = cola.shift()) {
        poner(c.id, { corriendo: true });
        try {
          poner(c.id, await probarCaso(url, c.id));
        } catch {
          poner(c.id, { error: "No respondió el servidor" });
        }
      }
    };
    await Promise.all(Array.from({ length: A_LA_VEZ }, trabajador));
    setCorriendo(false);
  }

  const hechos = Object.values(estados).filter((e) => !e.corriendo);
  const pasaron = hechos.filter((e) => e.paso).length;
  const fallidos = casos.filter((c) => estados[c.id]?.paso === false || estados[c.id]?.error);
  const tokens = hechos.reduce(
    (t, e) => {
      const u = e.resultado?.uso;
      return u ? { entrada: t.entrada + u.entrada, cache: t.cache + u.cache, salida: t.salida + u.salida } : t;
    },
    { entrada: 0, cache: 0, salida: 0 }
  );
  const miles = (n) => `${Math.round(n / 1000)} mil`;

  return (
    <>
      <header className="flex items-center gap-2 px-2 pb-1 pt-4">
        <Link href="/crm/mensajes/ajustes" aria-label="Regresar a Ajustes" className="flex h-12 w-12 items-center justify-center rounded-full active:bg-[#f2efe9]">
          <ArrowLeftIcon size={26} weight="bold" />
        </Link>
        <h1 className="text-[26px] font-bold tracking-tight text-[#1c1a17]">Probar asistente</h1>
      </header>
      <p className="px-5 pb-3 text-[16px] leading-snug text-[#5b544a]">
        {casos.length} conversaciones inventadas, con lo que el asistente debe hacer. Usa el modelo real, pero <b>no se manda nada</b> a nadie ni se toca la
        agenda. Córrelas antes de prenderlo y cada vez que cambien las respuestas.
      </p>
      {!llave && <p className="mx-5 mb-3 rounded-[16px] bg-[#fdf0e6] p-3 text-[15px] text-[#9a5b16]">Falta la llave de Claude (ANTHROPIC_API_KEY) en Vercel.</p>}

      <div className="flex flex-wrap gap-2 px-5">
        <button
          type="button"
          disabled={corriendo || !llave}
          onClick={() => {
            setEstados({});
            correr(casos);
          }}
          className="h-12 rounded-full bg-[#1c1a17] px-6 text-[17px] font-semibold text-white disabled:opacity-40"
        >
          {corriendo ? "Probando…" : "Probar todas"}
        </button>
        {!corriendo && fallidos.length > 0 && (
          <button type="button" onClick={() => correr(fallidos)} className="h-12 rounded-full bg-[#f2efe9] px-5 text-[17px] font-semibold text-[#1c1a17]">
            Repetir las que fallaron
          </button>
        )}
      </div>

      {hechos.length > 0 && (
        <p className="px-5 pt-3 text-[16px] text-[#1c1a17]" role="status">
          <b className={pasaron === hechos.length ? "text-[#2f7a4b]" : "text-[#c0392b]"}>
            {pasaron} de {hechos.length} pasaron
          </b>
          <span className="block text-[14px] text-[#7a7368]">
            Tokens: {miles(tokens.entrada)} de entrada · {miles(tokens.cache)} desde caché · {miles(tokens.salida)} de salida
          </span>
        </p>
      )}

      {Object.entries(grupos).map(([g, titulo]) => (
        <section key={g}>
          <h2 className="px-5 pb-1 pt-6 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">{titulo}</h2>
          <ul>
            {casos
              .filter((c) => c.grupo === g)
              .map((c) => (
                <Caso key={c.id} caso={c} estado={estados[c.id]} />
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
