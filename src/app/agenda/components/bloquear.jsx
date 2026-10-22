"use client";

import { useState, useTransition } from "react";
import { agregarFestivosAction, crearBloqueoAction, quitarBloqueoAction } from "../actions";
import { formatFechaLarga, formatHora } from "../lib";

const TIPOS = [
  { value: "dia", label: "Un día" },
  { value: "varios", label: "Varios días" },
  { value: "horas", label: "Unas horas" },
];
const MOTIVOS = ["Vacaciones", "Congreso o curso", "Día festivo", "Sin consulta"];
const HORAS = Array.from({ length: 29 }, (_, i) => formatHora(7 * 60 + i * 30)); // 7:00 a 21:00

const chip = (on) =>
  `h-12 rounded-full px-5 text-[16px] font-semibold ${on ? "bg-[#1c1a17] text-white" : "border-2 border-[#1c1a17]/10 bg-white text-[#1c1a17]"}`;
const campo = "h-12 w-full rounded-2xl border-0 bg-[#f2efe9] px-4 text-[17px] text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";
const etiqueta = "mb-1.5 block text-[15px] font-semibold text-[#5b544a]";

/** Texto corto de un bloqueo: "lunes, 3 de noviembre · 16:00 a 19:00". */
export function describirBloqueo(b) {
  const dias = b.desde_fecha === b.hasta_fecha ? formatFechaLarga(b.desde_fecha) : `${formatFechaLarga(b.desde_fecha)} al ${formatFechaLarga(b.hasta_fecha)}`;
  return b.desde_min == null ? dias : `${dias} · ${formatHora(b.desde_min)} a ${formatHora(b.hasta_min)}`;
}

/**
 * Bloquear días u horas sin consulta (vacaciones, congreso, festivo). El
 * asistente y los botones de "Mi cita" no ofrecen lo bloqueado; ella sí
 * puede agendar encima a mano. Abajo, los próximos bloqueos para quitarlos.
 */
export default function Bloquear({ fecha, hoy, proximos = [], demo = false }) {
  const [tipo, setTipo] = useState("dia");
  const [desde, setDesde] = useState(fecha < hoy ? hoy : fecha);
  const [hasta, setHasta] = useState(fecha < hoy ? hoy : fecha);
  const [horaDesde, setHoraDesde] = useState("16:00");
  const [horaHasta, setHoraHasta] = useState("19:00");
  const [motivo, setMotivo] = useState("Vacaciones");
  const [msg, setMsg] = useState(null); // { tipo: "ok" | "aviso" | "error", texto }
  const [pendiente, start] = useTransition();

  function guardar() {
    start(async () => {
      if (demo) return setMsg({ tipo: "ok", texto: "Bloqueado (demo)" });
      const r = await crearBloqueoAction({ tipo, desde, hasta, horaDesde, horaHasta, motivo });
      if (r?.error) return setMsg({ tipo: "error", texto: r.error });
      setMsg(
        r.citas
          ? { tipo: "aviso", texto: `Bloqueado ✓ Ojo: ahí hay ${r.citas} cita${r.citas === 1 ? "" : "s"}. Muévelas o cancélalas en la agenda.` }
          : { tipo: "ok", texto: "Bloqueado ✓ El asistente ya no ofrecerá ese horario." }
      );
    });
  }

  function festivos() {
    start(async () => {
      if (demo) return setMsg({ tipo: "ok", texto: "Festivos agregados (demo)" });
      const r = await agregarFestivosAction();
      if (r?.error) return setMsg({ tipo: "error", texto: r.error });
      setMsg({ tipo: "ok", texto: r.agregados ? `Se agregaron ${r.agregados} días festivos ✓` : "Los días festivos ya estaban." });
    });
  }

  function quitar(id) {
    start(async () => {
      if (demo) return setMsg({ tipo: "ok", texto: "Quitado (demo)" });
      const r = await quitarBloqueoAction(id);
      setMsg(r?.error ? { tipo: "error", texto: r.error } : { tipo: "ok", texto: "Quitado ✓" });
    });
  }

  const color = { ok: "text-[#2f7a4b]", aviso: "text-[#9a5b16]", error: "text-[#c0392b]" };
  return (
    <div className="flex flex-col gap-5 px-5 pb-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Qué bloquear">
        {TIPOS.map((t) => (
          <button key={t.value} type="button" role="radio" aria-checked={tipo === t.value} onClick={() => setTipo(t.value)} className={chip(tipo === t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className={tipo === "varios" ? "" : "col-span-2"}>
          <span className={etiqueta}>{tipo === "varios" ? "Desde" : "Día"}</span>
          <input type="date" min={hoy} value={desde} onChange={(e) => {
              setDesde(e.target.value);
              if (hasta < e.target.value) setHasta(e.target.value);
            }} className={campo} />
        </label>
        {tipo === "varios" && (
          <label>
            <span className={etiqueta}>Hasta</span>
            <input type="date" min={desde} value={hasta} onChange={(e) => setHasta(e.target.value)} className={campo} />
          </label>
        )}
        {tipo === "horas" && (
          <>
            <label>
              <span className={etiqueta}>De</span>
              <select value={horaDesde} onChange={(e) => setHoraDesde(e.target.value)} className={campo}>
                {HORAS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={etiqueta}>A</span>
              <select value={horaHasta} onChange={(e) => setHoraHasta(e.target.value)} className={campo}>
                {HORAS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div>
        <span className={etiqueta}>Motivo</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Motivo">
          {MOTIVOS.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={motivo === m} onClick={() => setMotivo(m)} className={chip(motivo === m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={guardar} disabled={pendiente} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-50">
        {pendiente ? "Guardando…" : "Bloquear"}
      </button>
      {msg && (
        <p role={msg.tipo === "error" ? "alert" : "status"} className={`text-[16px] font-medium ${color[msg.tipo]}`}>
          {msg.texto}
        </p>
      )}

      <div className="border-t border-[#1c1a17]/[0.08] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[17px] font-bold text-[#1c1a17]">Próximos bloqueos</h3>
          <button type="button" onClick={festivos} disabled={pendiente} className="text-[15px] font-semibold text-[#8a6d3f] underline underline-offset-4">
            Agregar días festivos
          </button>
        </div>
        {proximos.length === 0 ? (
          <p className="mt-2 text-[15px] text-[#7a7368]">No hay días bloqueados.</p>
        ) : (
          <ul className="mt-2">
            {proximos.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 border-b border-[#1c1a17]/[0.06] py-3 last:border-0">
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold text-[#1c1a17]">{b.motivo}</span>
                  <span className="block text-[14px] text-[#7a7368] first-letter:uppercase">{describirBloqueo(b)}</span>
                </span>
                <button type="button" onClick={() => quitar(b.id)} disabled={pendiente} className="h-10 shrink-0 rounded-full bg-[#f2efe9] px-4 text-[15px] font-semibold text-[#1c1a17]">
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
