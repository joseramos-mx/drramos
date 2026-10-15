"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { WhatsappLogoIcon, XIcon } from "@phosphor-icons/react";
import {
  buscarPacientesAction,
  cerrarCitaAction,
  guardarCitaAction,
} from "../actions";
import {
  DENTISTAS,
  DURACIONES,
  ESTADOS_CITA,
  ORIGENES,
  TIPOS,
  TRATAMIENTOS,
  formatHora,
  formatMoney,
  labelDe,
  minutosDelDia,
} from "../lib";
import ChoiceChips, { FieldLabel, inputClass, primaryBtnClass } from "./choice-chips";

/**
 * Panel que sube desde abajo (celular) o aparece al centro (iPad).
 * `estado.modo`: "nueva" (hueco tocado) o "cita" (cita existente).
 */
export default function CitaSheet({ fecha, estado, onClose }) {
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto border border-white/[0.1] bg-[#0a0a0a] p-5 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="font-[family-name:var(--font-albert)] text-[11px] font-normal uppercase tracking-[0.28em] text-[#b89968]">
            {estado.modo === "nueva" ? "Nueva cita" : "Cita"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-m-2 p-2 text-white/75 hover:text-[#f5f1ea]"
          >
            <XIcon size={20} weight="light" />
          </button>
        </div>

        {estado.modo === "nueva" ? (
          <NuevaCita fecha={fecha} dentista={estado.dentista} minutos={estado.minutos} onDone={onClose} />
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
function NuevaCita({ fecha, dentista: dentistaInicial, minutos: minutosIniciales, onDone }) {
  const [state, formAction] = useActionState(guardarCitaAction, null);
  const [paciente, setPaciente] = useState(null); // {tipo, id, nombre, whatsapp}
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

      <div>
        <FieldLabel>Con</FieldLabel>
        <ChoiceChips name="dentista" options={DENTISTAS} value={dentista} onChange={setDentista} />
      </div>

      <div>
        <FieldLabel htmlFor="notas">Nota (opcional)</FieldLabel>
        <input id="notas" name="notas" autoComplete="off" className={inputClass} />
      </div>

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
        <ul className="mt-2 border border-white/[0.08]">
          {pending && resultados.length === 0 && (
            <li className="px-3 py-3 font-[family-name:var(--font-albert)] text-[12px] font-normal text-white/65">Buscando…</li>
          )}
          {resultados.map((r) => (
            <li key={`${r.tipo}-${r.id}`}>
              <button
                type="button"
                onClick={() => onElegir(r)}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 border-b border-white/[0.04] px-3 py-2 text-left font-[family-name:var(--font-albert)] text-[14px] font-normal text-[#f5f1ea] last:border-0 hover:bg-white/[0.04]"
              >
                <span className="truncate">{r.nombre || "Sin nombre"}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/65">
                  {r.tipo === "lead" ? "Formulario" : r.whatsapp || ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 font-[family-name:var(--font-albert)] text-[11px] font-normal text-white/60">
        Si no aparece, escribe sus datos abajo y se registra solo.
      </p>
    </div>
  );
}

function PacienteElegido({ paciente, onCambiar }) {
  return (
    <div className="flex min-h-[48px] items-center justify-between gap-3 border border-[#b89968]/60 bg-[#b89968]/[0.08] px-3 py-2">
      <span className="truncate font-[family-name:var(--font-albert)] text-[14px] font-normal text-[#f5f1ea]">
        {paciente.nombre}
        {paciente.whatsapp && <span className="ml-2 text-white/75">{paciente.whatsapp}</span>}
      </span>
      <button
        type="button"
        onClick={onCambiar}
        className="shrink-0 font-[family-name:var(--font-albert)] text-[11px] font-normal uppercase tracking-[0.18em] text-white/60 hover:text-[#f5f1ea]"
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
        <h2 className="font-[family-name:var(--font-cormorant)] text-[28px] font-light leading-tight text-[#f5f1ea]">
          {cita.paciente?.nombre || "Sin nombre"}
        </h2>
        <p className="mt-1 font-[family-name:var(--font-albert)] text-[12px] font-normal uppercase tracking-[0.16em] text-white/75">
          {formatHora(ini)}–{formatHora(fin)} · {labelDe(TIPOS, cita.tipo)} · {labelDe(DENTISTAS, cita.dentista)}
        </p>
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 font-[family-name:var(--font-albert)] text-[14px] font-normal text-[#f5f1ea] underline decoration-[#b89968]/50 underline-offset-4 hover:text-[#b89968]"
          >
            <WhatsappLogoIcon size={16} weight="light" /> {cita.paciente.whatsapp}
          </a>
        )}
        {cita.notas && (
          <p className="mt-3 font-[family-name:var(--font-albert)] text-[13px] font-normal text-white/70">{cita.notas}</p>
        )}
      </header>

      {editando ? (
        <EditarCita fecha={fecha} cita={cita} onDone={onDone} onCancel={() => setEditando(false)} />
      ) : (
        <>
          <CierreCita cita={cita} onDone={onDone} />
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="font-[family-name:var(--font-albert)] text-[11px] font-normal uppercase tracking-[0.18em] text-white/75 underline-offset-4 hover:text-[#f5f1ea] hover:underline"
          >
            Mover o cambiar la cita
          </button>
        </>
      )}
    </div>
  );
}

function CierreCita({ cita, onDone }) {
  const [state, formAction] = useActionState(cerrarCitaAction, null);
  const [estado, setEstado] = useState(cita.estado === "agendada" ? "" : cita.estado);
  const [cotizado, setCotizado] = useState(cita.cotizado || []);
  const [realizado, setRealizado] = useState(cita.realizado || []);
  const [cotizadoMonto, setCotizadoMonto] = useState(montoInicial(cita.cotizado_monto));
  const [pagadoMonto, setPagadoMonto] = useState(montoInicial(cita.pagado_monto));

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-6 border-t border-white/[0.06] pt-6">
      <input type="hidden" name="id" value={cita.id} />

      <div>
        <FieldLabel>¿Se presentó?</FieldLabel>
        <ChoiceChips name="estado" options={ESTADOS_CITA} value={estado} onChange={setEstado} />
      </div>

      {estado === "asistio" && (
        <>
          <div>
            <FieldLabel>¿Qué se cotizó?</FieldLabel>
            <ChoiceChips name="cotizado" options={TRATAMIENTOS} value={cotizado} onChange={setCotizado} multiple />
            <MontoInput name="cotizado_monto" label="Monto cotizado" value={cotizadoMonto} onChange={setCotizadoMonto} />
          </div>

          <div>
            <FieldLabel>¿Qué se hizo hoy?</FieldLabel>
            <ChoiceChips name="realizado" options={TRATAMIENTOS} value={realizado} onChange={setRealizado} multiple />
          </div>

          <MontoInput name="pagado_monto" label="¿Cuánto pagó hoy?" value={pagadoMonto} onChange={setPagadoMonto} />
        </>
      )}

      <Acciones state={state} label="Guardar" disabled={!estado} />
    </form>
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
    <form action={formAction} className="space-y-6 border-t border-white/[0.06] pt-6">
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
      <div>
        <FieldLabel>Con</FieldLabel>
        <ChoiceChips name="dentista" options={DENTISTAS} value={dentista} onChange={setDentista} />
      </div>
      <div>
        <FieldLabel htmlFor="notas-edit">Nota</FieldLabel>
        <input id="notas-edit" name="notas" defaultValue={cita.notas || ""} autoComplete="off" className={inputClass} />
      </div>
      <Acciones state={state} label="Guardar cambios" onCancel={onCancel} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
//  Piezas
// ─────────────────────────────────────────────────────────────
function MontoInput({ name, label, value, onChange }) {
  return (
    <div className="mt-3">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          inputMode="numeric"
          autoComplete="off"
          placeholder="$"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          className={`${inputClass} max-w-[200px]`}
        />
        {value && (
          <span className="font-[family-name:var(--font-albert)] text-[13px] font-normal text-white/75">
            {formatMoney(value)}
          </span>
        )}
      </div>
    </div>
  );
}

function Acciones({ state, label, disabled, onCancel }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-5">
      <SubmitBtn label={label} disabled={disabled} />
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-2 font-[family-name:var(--font-albert)] text-[11px] font-normal uppercase tracking-[0.18em] text-white/75 hover:text-[#f5f1ea]"
        >
          Cancelar
        </button>
      )}
      {state?.error && (
        <span role="alert" className="font-[family-name:var(--font-albert)] text-[13px] font-normal text-[#ff7a7a]">
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

function montoInicial(n) {
  return n === null || n === undefined ? "" : String(Math.round(Number(n)));
}

function normalizar(raw) {
  let d = String(raw || "").replace(/\D+/g, "");
  if (d.length === 10) d = "52" + d;
  return d;
}
