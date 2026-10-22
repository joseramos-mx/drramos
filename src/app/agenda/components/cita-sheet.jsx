"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { WhatsappLogoIcon, XIcon } from "@phosphor-icons/react";
import {
  buscarPacientesAction,
  guardarCitaAction,
} from "../actions";
import {
  DENTISTAS,
  DURACIONES,
  ORIGENES,
  TIPOS,
  formatHora,
  labelDe,
  minutosDelDia,
} from "../lib";
import ChoiceChips, { FieldLabel, inputClass, primaryBtnClass } from "./choice-chips";
import CierreWizard from "./cierre-wizard";

/**
 * Panel que sube desde abajo (celular) o aparece al centro (iPad).
 * `estado.modo`: "nueva" (hueco tocado) o "cita" (cita existente).
 */
export default function CitaSheet({ fecha, estado, preseleccion, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1c1a17]/40 md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl md:rounded-[28px] md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="text-[11px] font-normal uppercase tracking-[0.28em] text-[#8a6d3f]">
            {estado.modo === "nueva" ? "Nueva cita" : "Cita"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-m-2 p-2 text-[#5b544a] hover:text-[#1c1a17]"
          >
            <XIcon size={20} weight="light" />
          </button>
        </div>

        {estado.modo === "nueva" ? (
          <NuevaCita fecha={fecha} dentista={estado.dentista} minutos={estado.minutos} preseleccion={preseleccion} onDone={onClose} />
        ) : (
          <DetalleCita fecha={fecha} cita={estado.cita} onDone={onClose} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Nueva cita
// ─────────────────────────────────────────────────────────────
function NuevaCita({ fecha, dentista: dentistaInicial, minutos: minutosIniciales, preseleccion, onDone }) {
  const [state, formAction] = useActionState(guardarCitaAction, null);
  // {tipo, id, nombre, whatsapp}; si viene de Mensajes, ya va elegido
  const [paciente, setPaciente] = useState(
    preseleccion ? { tipo: "paciente", id: preseleccion.id, nombre: preseleccion.nombre, whatsapp: preseleccion.whatsapp } : null
  );
  const [dentista, setDentista] = useState(dentistaInicial);
  const [tipo, setTipo] = useState("valoracion");
  const [duracion, setDuracion] = useState("30");
  const [origen, setOrigen] = useState("");

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="fecha" value={fecha} />

      <HoraField minutosIniciales={minutosIniciales} />

      <div>
        <FieldLabel>Paciente</FieldLabel>
        {paciente ? (
          <PacienteElegido paciente={paciente} onCambiar={() => setPaciente(null)} />
        ) : (
          <BuscarPaciente onElegir={setPaciente} />
        )}
      </div>

      {/* Datos de paciente nuevo: sólo si no se eligió uno existente */}
      {!paciente && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <input id="nombre" name="nombre" autoComplete="off" placeholder="Nombre y apellido" className={inputClass} />
            </div>
            <div>
              <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
              <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="off" placeholder="618 123 4567" className={inputClass} />
            </div>
          </div>
          <div>
            <FieldLabel>¿Cómo nos conoció? (opcional)</FieldLabel>
            <ChoiceChips name="origen" options={ORIGENES} value={origen} onChange={(v) => setOrigen(v === origen ? "" : v)} />
            {origen === "recomendacion" && (
              <input name="origen_detalle" autoComplete="off" placeholder="¿Quién lo recomendó?" className={`${inputClass} mt-3`} />
            )}
          </div>
        </>
      )}
      {paciente?.tipo === "paciente" && <input type="hidden" name="paciente_id" value={paciente.id} />}
      {paciente?.tipo === "lead" && <input type="hidden" name="lead_id" value={paciente.id} />}

      <div>
        <FieldLabel>Tipo</FieldLabel>
        <ChoiceChips name="tipo" options={TIPOS} value={tipo} onChange={setTipo} />
      </div>

      <div>
        <FieldLabel>Duración</FieldLabel>
        <ChoiceChips name="duracion" options={DURACIONES} value={duracion} onChange={setDuracion} />
      </div>

      {DENTISTAS.length > 1 ? (
        <div>
          <FieldLabel>Con</FieldLabel>
          <ChoiceChips name="dentista" options={DENTISTAS} value={dentista} onChange={setDentista} />
        </div>
      ) : (
        <input type="hidden" name="dentista" value={dentista} />
      )}

      <div>
        <FieldLabel htmlFor="notas">Nota (opcional)</FieldLabel>
        <input id="notas" name="notas" autoComplete="off" className={inputClass} />
      </div>

      <AvisarWhatsApp id="avisar-nueva" texto="Mandarle su cita por WhatsApp" detalle="Con botones para confirmar, cambiar o cancelar (si tiene WhatsApp)." />

      <Encimada state={state} label="Agendar de todos modos" />
      <Acciones state={state} label="Agendar" />
    </form>
  );
}

function HoraField({ minutosIniciales }) {
  const [valor, setValor] = useState(formatHora24(minutosIniciales));
  const [h, m] = valor.split(":").map(Number);
  const minutos = Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : minutosIniciales;
  return (
    <div>
      <FieldLabel htmlFor="hora">Hora</FieldLabel>
      <input
        id="hora"
        type="time"
        step={1800}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className={`${inputClass} max-w-[160px] [color-scheme:dark]`}
      />
      <input type="hidden" name="minutos" value={minutos} />
    </div>
  );
}

function formatHora24(min) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function BuscarPaciente({ onElegir }) {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState([]);
  const [pending, startTransition] = useTransition();
  const timer = useRef(null);

  function onChange(e) {
    const v = e.target.value;
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setResultados([]);
      return;
    }
    timer.current = setTimeout(() => {
      startTransition(async () => setResultados(await buscarPacientesAction(v)));
    }, 300);
  }

  return (
    <div>
      <input
        value={q}
        onChange={onChange}
        autoComplete="off"
        placeholder="Buscar por nombre o teléfono…"
        aria-label="Buscar paciente"
        className={inputClass}
      />
      {(resultados.length > 0 || pending) && (
        <ul className="mt-2 overflow-hidden rounded-2xl border border-[#1c1a17]/[0.08]">
          {pending && resultados.length === 0 && (
            <li className="px-3 py-3 text-[12px] font-normal text-[#5b544a]">Buscando…</li>
          )}
          {resultados.map((r) => (
            <li key={`${r.tipo}-${r.id}`}>
              <button
                type="button"
                onClick={() => onElegir(r)}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 border-b border-[#1c1a17]/[0.04] px-3 py-2 text-left text-[14px] font-normal text-[#1c1a17] last:border-0 hover:bg-[#1c1a17]/[0.04]"
              >
                <span className="truncate">{r.nombre || "Sin nombre"}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-[#5b544a]">
                  {r.tipo === "lead" ? "Formulario" : r.whatsapp || ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] font-normal text-[#5b544a]">
        Si no aparece, escribe sus datos abajo y se registra solo.
      </p>
    </div>
  );
}

function PacienteElegido({ paciente, onCambiar }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border border-[#b89968]/60 bg-[#b89968]/[0.08] px-3 py-2">
      <span className="truncate text-[14px] font-normal text-[#1c1a17]">
        {paciente.nombre}
        {paciente.whatsapp && <span className="ml-2 text-[#5b544a]">{paciente.whatsapp}</span>}
      </span>
      <button
        type="button"
        onClick={onCambiar}
        className="shrink-0 text-[11px] font-normal uppercase tracking-[0.18em] text-[#5b544a] hover:text-[#1c1a17]"
      >
        Cambiar
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Cita existente: cierre y cambios
// ─────────────────────────────────────────────────────────────
function DetalleCita({ fecha, cita, onDone }) {
  const [editando, setEditando] = useState(false);
  const ini = minutosDelDia(cita.inicio);
  const fin = minutosDelDia(cita.fin);
  const wa = cita.paciente?.whatsapp ? normalizar(cita.paciente.whatsapp) : null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="tracking-tight text-[28px] font-bold leading-tight text-[#1c1a17]">
          {cita.paciente?.nombre || "Sin nombre"}
        </h2>
        <p className="mt-1 text-[12px] font-normal uppercase tracking-[0.16em] text-[#5b544a]">
          {formatHora(ini)}–{formatHora(fin)} · {labelDe(TIPOS, cita.tipo)}
          {DENTISTAS.length > 1 && ` · ${labelDe(DENTISTAS, cita.dentista)}`}
        </p>
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 text-[14px] font-normal text-[#1c1a17] underline decoration-[#b89968]/50 underline-offset-4 hover:text-[#8a6d3f]"
          >
            <WhatsappLogoIcon size={16} weight="light" /> {cita.paciente.whatsapp}
          </a>
        )}
        {cita.notas && (
          <p className="mt-3 text-[13px] font-normal text-[#5b544a]">{cita.notas}</p>
        )}
      </header>

      {editando ? (
        <EditarCita fecha={fecha} cita={cita} onDone={onDone} onCancel={() => setEditando(false)} />
      ) : (
        <>
          <CierreWizard cita={cita} onDone={onDone} />
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-[11px] font-normal uppercase tracking-[0.18em] text-[#5b544a] underline-offset-4 hover:text-[#1c1a17] hover:underline"
          >
            Mover o cambiar la cita
          </button>
        </>
      )}
    </div>
  );
}

function EditarCita({ fecha, cita, onDone, onCancel }) {
  const [state, formAction] = useActionState(guardarCitaAction, null);
  const ini = minutosDelDia(cita.inicio);
  const dur = String(minutosDelDia(cita.fin) - ini);
  const [dentista, setDentista] = useState(cita.dentista);
  const [tipo, setTipo] = useState(cita.tipo);
  const [duracion, setDuracion] = useState(DURACIONES.some((d) => d.value === dur) ? dur : "30");

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-6 border-t border-[#1c1a17]/[0.06] pt-6">
      <input type="hidden" name="id" value={cita.id} />
      <input type="hidden" name="fecha" value={fecha} />
      <HoraField minutosIniciales={ini} />
      <div>
        <FieldLabel>Duración</FieldLabel>
        <ChoiceChips name="duracion" options={DURACIONES} value={duracion} onChange={setDuracion} />
      </div>
      <div>
        <FieldLabel>Tipo</FieldLabel>
        <ChoiceChips name="tipo" options={TIPOS} value={tipo} onChange={setTipo} />
      </div>
      {DENTISTAS.length > 1 ? (
        <div>
          <FieldLabel>Con</FieldLabel>
          <ChoiceChips name="dentista" options={DENTISTAS} value={dentista} onChange={setDentista} />
        </div>
      ) : (
        <input type="hidden" name="dentista" value={dentista} />
      )}
      <div>
        <FieldLabel htmlFor="notas-edit">Nota</FieldLabel>
        <input id="notas-edit" name="notas" defaultValue={cita.notas || ""} autoComplete="off" className={inputClass} />
      </div>
      <AvisarWhatsApp id="avisar-editar" texto="Si cambió la hora, avisarle por WhatsApp" detalle="Le llega su nueva hora con botones para confirmar o cambiar." />
      <Encimada state={state} label="Guardar de todos modos" />
      <Acciones state={state} label="Guardar cambios" onCancel={onCancel} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
//  Piezas
// ─────────────────────────────────────────────────────────────
/** Si choca con otra cita o un bloqueo: lo dice y deja guardar de todos modos (o cambiar la hora). */
function Encimada({ state, label }) {
  if (!state?.encima) return null;
  return (
    <div role="alert" className="rounded-2xl bg-[#fdf3e6] p-4">
      <p className="text-[17px] font-semibold text-[#1c1a17]">Ojo: {state.encima}</p>
      <p className="mt-1 text-[15px] text-[#7a7368]">Cambia la hora arriba, o guárdala encimada si así lo quieres.</p>
      <button type="submit" name="forzar" value="1" className="mt-3 h-12 rounded-full border-2 border-[#1c1a17]/15 bg-white px-5 text-[16px] font-semibold text-[#1c1a17]">
        {label}
      </button>
    </div>
  );
}

/** Palomita (prendida por omisión) para mandarle la cita al paciente por WhatsApp. */
function AvisarWhatsApp({ id, texto, detalle }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#f2efe9] p-4">
      <input id={id} type="checkbox" name="avisar" value="1" defaultChecked className="mt-1 h-6 w-6 shrink-0 accent-[#b89968]" />
      <span>
        <span className="block text-[17px] font-semibold text-[#1c1a17]">{texto}</span>
        <span className="block text-[14px] leading-snug text-[#7a7368]">{detalle}</span>
      </span>
    </label>
  );
}

function Acciones({ state, label, disabled, onCancel }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-[#1c1a17]/[0.06] pt-5">
      <SubmitBtn label={label} disabled={disabled} />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-2 text-[11px] font-normal uppercase tracking-[0.18em] text-[#5b544a] hover:text-[#1c1a17]"
        >
          Cancelar
        </button>
      )}
      {state?.error && (
        <span role="alert" className="text-[13px] font-normal text-[#c0392b]">
          {state.error}
        </span>
      )}
    </div>
  );
}

function SubmitBtn({ label, disabled }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={primaryBtnClass}>
      {pending ? "Guardando..." : label}
    </button>
  );
}

function normalizar(raw) {
  let d = String(raw || "").replace(/\D+/g, "");
  if (d.length === 10) d = "52" + d;
  return d;
}
