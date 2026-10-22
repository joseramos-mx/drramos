"use client";

import { useState, useTransition } from "react";
import { agregarFestivosAction, crearBloqueoAction, quitarBloqueoAction, revisarBloqueoAction } from "../actions";
import { formatFechaLarga, formatHora, horarioDelDia, minutosDelDia } from "../lib";

const TIPOS = [
  { value: "dia", label: "Un día" },
  { value: "varios", label: "Varios días" },
  { value: "horas", label: "Unas horas" },
];
const MOTIVOS = ["Vacaciones", "Congreso o curso", "Día festivo", "Sin consulta"];
const HORAS = Array.from({ length: 29 }, (_, i) => formatHora(7 * 60 + i * 30)); // 7:00 a 21:00
const EVENTOS_RAPIDOS = ["Junta", "Laboratorio", "Proveedor", "Trámite", "Curso"];

const chip = (on) =>
  `h-12 rounded-full px-5 text-[16px] font-semibold ${on ? "bg-[#1c1a17] text-white" : "border-2 border-[#1c1a17]/10 bg-white text-[#1c1a17]"}`;
const campo = "h-12 w-full rounded-2xl border-0 bg-[#f2efe9] px-4 text-[17px] text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";
const etiqueta = "mb-1.5 block text-[15px] font-semibold text-[#5b544a]";
const COLOR = { ok: "text-[#2f7a4b]", aviso: "text-[#9a5b16]", error: "text-[#c0392b]" };

/** Texto corto de un bloqueo: "lunes, 3 de noviembre · 16:00 a 19:00". */
export function describirBloqueo(b) {
  const dias = b.desde_fecha === b.hasta_fecha ? formatFechaLarga(b.desde_fecha) : `${formatFechaLarga(b.desde_fecha)} al ${formatFechaLarga(b.hasta_fecha)}`;
  return b.desde_min == null ? dias : `${dias} · ${formatHora(b.desde_min)} a ${formatHora(b.hasta_min)}`;
}

/** Su nota, con sus palabras ("Congreso en Monterrey, regreso el jueves"). */
function CampoNota({ id, valor, onCambio }) {
  return (
    <div>
      <label htmlFor={id} className={etiqueta}>
        Nota para ti <span className="font-normal text-[#9a9388]">(opcional)</span>
      </label>
      <textarea
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        maxLength={200}
        rows={2}
        autoCapitalize="sentences"
        placeholder="Escríbelo como tú lo entiendas"
        className="w-full resize-none rounded-2xl border-0 bg-[#f2efe9] px-4 py-3 text-[17px] leading-snug text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]"
      />
    </div>
  );
}

/** Mensaje final después de guardar, según qué se hizo con las citas. */
function resumen(r, que) {
  const partes = ["Guardado ✓"];
  if (r.citas && que === "dejar") partes.push(`Quedaron ${r.citas} cita${r.citas === 1 ? "" : "s"} encima: acomódalas en la agenda.`);
  if (r.avisados) partes.push(`Se avisó por WhatsApp a ${r.avisados} paciente${r.avisados === 1 ? "" : "s"}.`);
  if (r.sinWhatsapp?.length) partes.push(`Llámale a: ${r.sinWhatsapp.join(", ")} (no tiene WhatsApp).`);
  if (r.errores?.length) partes.push(`No se pudo avisar a: ${r.errores.join("; ")}.`);
  return { tipo: r.sinWhatsapp?.length || r.errores?.length || (r.citas && que === "dejar") ? "aviso" : "ok", texto: partes.join(" ") };
}

/**
 * Lógica compartida: antes de guardar revisa si caen citas; si caen,
 * pregunta qué hacer con ellas (avisar / cancelar / dejar) y luego guarda.
 * `demoCitas`: en la demo, las citas que se encimarían (no hay base).
 */
function useGuardarBloqueo({ demo, demoCitas = [], onListo }) {
  const [afectadas, setAfectadas] = useState(null); // { datos, citas }
  const [msg, setMsg] = useState(null);
  const [pendiente, start] = useTransition();

  function confirmar(datos, que) {
    start(async () => {
      if (demo) {
        setAfectadas(null);
        return setMsg(resumen({ citas: demoCitas.length, avisados: que === "dejar" ? 0 : demoCitas.filter((c) => c.whatsapp).length, sinWhatsapp: que === "dejar" ? [] : demoCitas.filter((c) => !c.whatsapp).map((c) => c.nombre) }, que));
      }
      const r = await crearBloqueoAction({ ...datos, citas: que });
      setAfectadas(null);
      if (r?.error) return setMsg({ tipo: "error", texto: r.error });
      const m = resumen(r, que);
      if (m.tipo === "ok" && onListo) return onListo();
      setMsg(m);
    });
  }

  function guardar(datos) {
    setMsg(null);
    start(async () => {
      const r = demo ? { citas: demoCitas } : await revisarBloqueoAction(datos);
      if (r?.error) return setMsg({ tipo: "error", texto: r.error });
      if (r.citas.length) return setAfectadas({ datos, citas: r.citas });
      confirmar(datos, "dejar");
    });
  }

  return { afectadas, msg, pendiente, guardar, confirmar, cancelarPaso: () => setAfectadas(null) };
}

/** Paso intermedio: "En ese horario hay 3 citas. ¿Qué hacemos con ellas?" */
function PasoCitas({ afectadas, pendiente, onElegir, onRegresar }) {
  const { citas } = afectadas;
  const opciones = [
    { que: "avisar", titulo: "Avisarles para que elijan otro horario", texto: "Les llega WhatsApp con disculpa y botones para cambiar su cita solos", recomendada: true },
    { que: "cancelar", titulo: "Cancelar las citas y avisarles", texto: "Se cancelan y les llega la disculpa; tú les escribes para acomodarlas" },
    { que: "dejar", titulo: "Bloquear, yo las acomodo", texto: "Las citas se quedan como están" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[20px] bg-[#fdf3e6] p-4">
        <p className="text-[17px] font-bold text-[#1c1a17]">
          Ahí hay {citas.length} cita{citas.length === 1 ? "" : "s"}:
        </p>
        <ul className="mt-2 space-y-1">
          {citas.map((c) => (
            <li key={c.id} className="text-[16px] text-[#1c1a17]">
              <b>{c.nombre}</b> · <span className="first-letter:uppercase">{c.cuando}</span>
              {!c.whatsapp && <span className="ml-1 text-[14px] font-semibold text-[#9a5b16]">(sin WhatsApp: llámale)</span>}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[17px] font-semibold text-[#1c1a17]">¿Qué hacemos con ellas?</p>
      {opciones.map((o) => (
        <button
          key={o.que}
          type="button"
          disabled={pendiente}
          onClick={() => onElegir(o.que)}
          className={`rounded-[20px] border-2 p-4 text-left disabled:opacity-50 ${o.recomendada ? "border-[#b89968] bg-[#fbf6ec]" : "border-[#1c1a17]/10 bg-white"}`}
        >
          <span className="block text-[18px] font-semibold text-[#1c1a17]">
            {o.titulo}
            {o.recomendada && <span className="ml-2 text-[13px] font-semibold text-[#8a6d3f]">Recomendado</span>}
          </span>
          <span className="block text-[15px] leading-snug text-[#7a7368]">{o.texto}</span>
        </button>
      ))}
      <button type="button" onClick={onRegresar} disabled={pendiente} className="h-12 rounded-full bg-[#f2efe9] text-[17px] font-semibold text-[#1c1a17]">
        No bloquear
      </button>
      {pendiente && <p className="text-[16px] text-[#7a7368]">Guardando y avisando…</p>}
    </div>
  );
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
  const [nota, setNota] = useState("");
  const [otro, setOtro] = useState(null); // mensaje de festivos / quitar
  const g = useGuardarBloqueo({ demo });
  const [pendienteOtro, start] = useTransition();

  const datos = { tipo, desde, hasta, horaDesde, horaHasta, motivo, nota };

  function festivos() {
    start(async () => {
      if (demo) return setOtro({ tipo: "ok", texto: "Festivos agregados (demo)" });
      const r = await agregarFestivosAction();
      if (r?.error) return setOtro({ tipo: "error", texto: r.error });
      setOtro({ tipo: "ok", texto: r.agregados ? `Se agregaron ${r.agregados} días festivos ✓` : "Los días festivos ya estaban." });
    });
  }

  function quitar(id) {
    start(async () => {
      if (demo) return setOtro({ tipo: "ok", texto: "Quitado (demo)" });
      const r = await quitarBloqueoAction(id);
      setOtro(r?.error ? { tipo: "error", texto: r.error } : { tipo: "ok", texto: "Quitado ✓" });
    });
  }

  if (g.afectadas) {
    return (
      <div className="px-5 pb-4">
        <PasoCitas afectadas={g.afectadas} pendiente={g.pendiente} onElegir={(que) => g.confirmar(g.afectadas.datos, que)} onRegresar={g.cancelarPaso} />
      </div>
    );
  }

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
          <input
            type="date"
            min={hoy}
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              if (hasta < e.target.value) setHasta(e.target.value);
            }}
            className={campo}
          />
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

      <CampoNota id="bloqueo-nota" valor={nota} onCambio={setNota} />

      <button type="button" onClick={() => g.guardar(datos)} disabled={g.pendiente} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-50">
        {g.pendiente ? "Revisando…" : "Bloquear"}
      </button>
      {g.msg && (
        <p role={g.msg.tipo === "error" ? "alert" : "status"} className={`text-[16px] font-medium ${COLOR[g.msg.tipo]}`}>
          {g.msg.texto}
        </p>
      )}

      <div className="border-t border-[#1c1a17]/[0.08] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[17px] font-bold text-[#1c1a17]">Próximos bloqueos</h3>
          <button type="button" onClick={festivos} disabled={pendienteOtro} className="text-[15px] font-semibold text-[#8a6d3f] underline underline-offset-4">
            Agregar días festivos
          </button>
        </div>
        {otro && <p className={`mt-2 text-[15px] font-medium ${COLOR[otro.tipo]}`}>{otro.texto}</p>}
        {proximos.length === 0 ? (
          <p className="mt-2 text-[15px] text-[#7a7368]">No hay días bloqueados.</p>
        ) : (
          <ul className="mt-2">
            {proximos.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 border-b border-[#1c1a17]/[0.06] py-3 last:border-0">
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold text-[#1c1a17]">
                    {b.motivo}
                    {b.evento && <span className="ml-2 text-[13px] font-semibold text-[#5b7083]">Evento</span>}
                  </span>
                  <span className="block text-[14px] text-[#7a7368] first-letter:uppercase">{describirBloqueo(b)}</span>
                  {b.nota && <span className="block text-[14px] italic text-[#5b544a]">{b.nota}</span>}
                </span>
                <button type="button" onClick={() => quitar(b.id)} disabled={pendienteOtro} className="h-10 shrink-0 rounded-full bg-[#f2efe9] px-4 text-[15px] font-semibold text-[#1c1a17]">
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

/**
 * Desde una hora tocada en la agenda: agregar un EVENTO (junta, laboratorio…)
 * o BLOQUEAR sin consulta a partir de esa hora. Pocos toques: duración en botones.
 * `citasDelDia`: sólo para la demo (calcular qué citas se encimarían).
 */
export function HoraRapida({ fecha, minutos, modo, onListo, demo = false, citasDelDia = [] }) {
  const cierra = horarioDelDia(fecha)?.cierra ?? minutos + 60;
  const duraciones = [
    { value: 30, label: "30 min" },
    { value: 60, label: "1 h" },
    { value: 90, label: "1 h 30" },
    { value: 120, label: "2 h" },
    ...(modo === "evento" ? [{ value: 180, label: "3 h" }] : []),
    ...(cierra - minutos > 120 ? [{ value: cierra - minutos, label: "Hasta cerrar" }] : []),
    ...(modo === "bloquear" ? [{ value: "dia", label: "Todo el día" }] : []),
  ];
  const [duracion, setDuracion] = useState(60);
  const [titulo, setTitulo] = useState("");
  const [motivo, setMotivo] = useState("Sin consulta");
  const [nota, setNota] = useState("");
  const [falta, setFalta] = useState(null);
  const hasta = duracion === "dia" ? null : Math.min(minutos + duracion, 24 * 60);

  const ini = duracion === "dia" ? 0 : minutos;
  const fin = duracion === "dia" ? 24 * 60 : hasta;
  const demoCitas = citasDelDia
    .filter((c) => c.estado !== "cancelada" && minutosDelDia(c.inicio) < fin && minutosDelDia(c.fin) > ini)
    .sort((a, b) => new Date(a.inicio) - new Date(b.inicio))
    .map((c) => ({ id: c.id, nombre: c.paciente?.nombre || "Sin nombre", cuando: `${formatFechaLarga(fecha)}, ${formatHora(minutosDelDia(c.inicio))}`, whatsapp: Boolean(c.paciente?.whatsapp) }));
  const g = useGuardarBloqueo({ demo, demoCitas, onListo });

  function guardar() {
    if (modo === "evento" && !titulo.trim()) return setFalta("Escribe qué es (o toca uno de los botones).");
    setFalta(null);
    g.guardar(
      duracion === "dia"
        ? { tipo: "dia", desde: fecha, motivo, nota }
        : { tipo: "horas", desde: fecha, horaDesde: formatHora(minutos), horaHasta: formatHora(hasta), motivo: modo === "evento" ? titulo : motivo, evento: modo === "evento", nota }
    );
  }

  if (g.afectadas) {
    return (
      <div className="px-5 pb-4">
        <PasoCitas afectadas={g.afectadas} pendiente={g.pendiente} onElegir={(que) => g.confirmar(g.afectadas.datos, que)} onRegresar={g.cancelarPaso} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 pb-4">
      {modo === "evento" ? (
        <div>
          <label htmlFor="evento-titulo" className={etiqueta}>
            ¿Qué es?
          </label>
          <input
            id="evento-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={80}
            autoComplete="off"
            autoCapitalize="sentences"
            placeholder="Ej. Junta con el laboratorio"
            className={campo}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {EVENTOS_RAPIDOS.map((t) => (
              <button key={t} type="button" onClick={() => setTitulo(t)} className={chip(titulo === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : (
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
      )}

      <div>
        <span className={etiqueta}>¿Cuánto tiempo?</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Duración">
          {duraciones.map((d) => (
            <button key={d.label} type="button" role="radio" aria-checked={duracion === d.value} onClick={() => setDuracion(d.value)} className={chip(duracion === d.value)}>
              {d.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[15px] text-[#7a7368]">
          {duracion === "dia" ? `Todo el ${formatFechaLarga(fecha)}` : `De ${formatHora(minutos)} a ${formatHora(hasta)}`}
        </p>
      </div>

      <CampoNota id={`nota-${modo}`} valor={nota} onCambio={setNota} />

      {g.msg?.tipo === "aviso" || (g.msg?.tipo === "ok" && demo) ? (
        <button type="button" onClick={onListo} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white">
          Listo
        </button>
      ) : (
        <button type="button" onClick={guardar} disabled={g.pendiente} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-50">
          {g.pendiente ? "Revisando…" : modo === "evento" ? "Agregar evento" : "Bloquear"}
        </button>
      )}
      {(falta || g.msg) && (
        <p role={falta || g.msg?.tipo === "error" ? "alert" : "status"} className={`text-[16px] font-medium ${falta ? COLOR.error : COLOR[g.msg.tipo]}`}>
          {falta || g.msg.texto}
        </p>
      )}
    </div>
  );
}
