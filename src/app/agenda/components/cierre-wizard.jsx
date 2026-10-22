"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { cerrarCitaAction, marcarVinoAction } from "../actions";
import { TRATAMIENTOS, formatMoney, labelDe } from "../lib";

/**
 * Cierre de la cita, una pregunta por pantalla (mismo patrón que el
 * formulario de 3 preguntas de /diseno-sonrisa): barra de avance,
 * opciones grandes, avanza solo al tocar, "Anterior" para regresar y
 * un resumen final antes de guardar.
 */

const EASE = [0.22, 0.61, 0.36, 1];

// Lo más común primero; el resto aparece con "Otro tratamiento…"
const PRINCIPALES = ["carillas", "implantes", "coronas", "protesis", "diseno_sonrisa"];
const OTROS = TRATAMIENTOS.filter((t) => !PRINCIPALES.includes(t.value));
const opcion = (v) => ({ value: v, label: labelDe(TRATAMIENTOS, v) });

const SOLO_VALORACION = "__solo_valoracion";
const NADA = "__nada";

// Orden de pasos según las respuestas (si no vino, va directo al resumen)
function listaPasos(r) {
  if (r.estado !== "asistio") return ["estado", "resumen"];
  const conMonto = r.cotizado && r.cotizado !== NADA ? ["cotizadoMonto"] : [];
  return ["estado", "cotizado", ...conMonto, "realizado", "pagadoMonto", "resumen"];
}

export default function CierreWizard({ cita, onDone }) {
  const [state, formAction] = useActionState(cerrarCitaAction, null);
  const [pending, startTransition] = useTransition();

  const yaCerrada = cita.estado !== "agendada";
  // Vino con la palomita rápida pero falta contestar lo demás
  const soloPalomita = cita.estado === "asistio" && !cita.cierre_completo;
  const completa = yaCerrada && !soloPalomita;
  const [r, setR] = useState({
    estado: yaCerrada ? cita.estado : "",
    cotizado: cita.cotizado?.[0] || (completa && cita.estado === "asistio" ? NADA : ""),
    cotizadoMonto: montoInicial(cita.cotizado_monto),
    realizado: cita.realizado?.[0] || (completa && cita.estado === "asistio" ? SOLO_VALORACION : ""),
    pagadoMonto: montoInicial(cita.pagado_monto),
  });
  const [paso, setPaso] = useState(soloPalomita ? "cotizado" : completa ? "resumen" : "estado");
  const [marcando, startMarcar] = useTransition();
  const [errorMarcar, setErrorMarcar] = useState(null);

  function soloMarcarVino() {
    setErrorMarcar(null);
    startMarcar(async () => {
      const res = await marcarVinoAction(cita.id);
      if (res?.error) setErrorMarcar(res.error);
      else onDone();
    });
  }
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  const nombre = (cita.paciente?.nombre || "").split(/\s+/)[0] || "el paciente";
  const vino = r.estado === "asistio";

  const pasos = listaPasos(r);
  // Antes de contestar "¿vino?" se cuenta el camino largo ("sí vino"), no "1 de 1"
  const totalPasos = listaPasos(r.estado ? r : { ...r, estado: "asistio" }).length - 1;
  const idx = Math.max(0, pasos.indexOf(paso));
  const progreso = ((idx + 1) / pasos.length) * 100;

  function ir(siguiente) {
    setHistorial((h) => [...h, paso]);
    setPaso(siguiente);
  }
  function avanzar(cambios) {
    const nuevo = { ...r, ...cambios };
    setR(nuevo);
    const lista = listaPasos(nuevo);
    const sig = lista[lista.indexOf(paso) + 1] || "resumen";
    setTimeout(() => ir(sig), 220);
  }
  function anterior() {
    setHistorial((h) => {
      const copia = [...h];
      const prev = copia.pop();
      if (prev) setPaso(prev);
      return copia;
    });
  }

  function guardar() {
    const fd = new FormData();
    fd.set("id", cita.id);
    fd.set("estado", r.estado);
    if (vino) {
      if (r.cotizado && r.cotizado !== NADA) fd.append("cotizado", r.cotizado);
      if (r.cotizadoMonto && r.cotizado !== NADA) fd.set("cotizado_monto", r.cotizadoMonto);
      if (r.realizado && r.realizado !== SOLO_VALORACION) fd.append("realizado", r.realizado);
      if (r.pagadoMonto) fd.set("pagado_monto", r.pagadoMonto);
    }
    startTransition(() => formAction(fd));
  }

  return (
    <div className="border-t border-[#1c1a17]/[0.06] pt-6">
      {/* Barra de avance */}
      <div className="h-[2px] w-full bg-[#1c1a17]/[0.08]">
        <motion.div
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.5, ease: EASE }}
          className="h-full bg-[#b89968]"
        />
      </div>
      <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.24em] text-[#8a6d3f]">
        {paso === "resumen" ? "Revisa y guarda" : `Paso ${idx + 1} de ${totalPasos}`}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={paso}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-4"
        >
          {paso === "estado" && (
            <Pregunta titulo={`¿Vino ${nombre} a su cita?`}>
              <Opciones
                valor={r.estado}
                opciones={[
                  { value: "asistio", label: "Sí, vino" },
                  { value: "no_asistio", label: "No vino" },
                  { value: "cancelada", label: "Canceló" },
                ]}
                onElegir={(v) => avanzar({ estado: v })}
              />
              {/* Como la palomita de la libreta: marcar y contestar lo demás después */}
              <button
                type="button"
                onClick={soloMarcarVino}
                disabled={marcando}
                className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 border border-dashed border-[#1f8a5b]/60 px-5 text-[15px] text-[#1c1a17] transition-colors hover:bg-[#1f8a5b]/[0.08] disabled:opacity-60"
              >
                <CheckIcon size={18} weight="bold" className="text-[#1f8a5b]" />
                {marcando ? "Marcando..." : "Sólo marcar que vino (lo demás después)"}
              </button>
              {errorMarcar && <p role="alert" className="mt-2 text-[13px] text-[#c0392b]">{errorMarcar}</p>}
            </Pregunta>
          )}

          {paso === "cotizado" && (
            <Pregunta titulo="¿Qué tratamiento se le cotizó?">
              <OpcionesTratamiento
                valor={r.cotizado}
                primeras={[{ value: NADA, label: "Nada, sólo se valoró" }]}
                onElegir={(v) => avanzar({ cotizado: v })}
              />
            </Pregunta>
          )}

          {paso === "cotizadoMonto" && (
            <Pregunta titulo={`¿De cuánto fue el presupuesto de ${labelDe(TRATAMIENTOS, r.cotizado).toLowerCase()}?`}>
              <Monto
                valor={r.cotizadoMonto}
                onCambiar={(v) => setR({ ...r, cotizadoMonto: v })}
                onSiguiente={() => avanzar({})}
                alternativa={{ label: "No se dio presupuesto", onClick: () => avanzar({ cotizadoMonto: "" }) }}
              />
            </Pregunta>
          )}

          {paso === "realizado" && (
            <Pregunta titulo="¿Qué se le hizo hoy?">
              <OpcionesTratamiento
                valor={r.realizado}
                primeras={[
                  // Atajo: lo más común es que se haga lo mismo que se cotizó
                  ...(r.cotizado && r.cotizado !== NADA
                    ? [{ value: r.cotizado, label: `Lo mismo que se cotizó (${labelDe(TRATAMIENTOS, r.cotizado)})` }]
                    : []),
                  { value: SOLO_VALORACION, label: "Sólo la valoración" },
                ]}
                onElegir={(v) => avanzar({ realizado: v })}
              />
            </Pregunta>
          )}

          {paso === "pagadoMonto" && (
            <Pregunta titulo="¿Cuánto pagó hoy?">
              <Monto
                valor={r.pagadoMonto}
                onCambiar={(v) => setR({ ...r, pagadoMonto: v })}
                onSiguiente={() => avanzar({})}
                alternativa={{ label: "No pagó nada hoy", onClick: () => avanzar({ pagadoMonto: "" }) }}
              />
            </Pregunta>
          )}

          {paso === "resumen" && (
            <Resumen r={r} vino={vino} irA={ir} onGuardar={guardar} pending={pending} error={state?.error} />
          )}
        </motion.div>
      </AnimatePresence>

      {historial.length > 0 && paso !== "estado" && (
        <button
          type="button"
          onClick={anterior}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[#5b544a] transition-colors hover:text-[#1c1a17]"
        >
          <ArrowLeftIcon size={14} weight="regular" />
          Anterior
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Piezas
// ─────────────────────────────────────────────────────────────
function Pregunta({ titulo, children }) {
  return (
    <>
      <h3 className="tracking-tight text-[clamp(24px,3vw,30px)] font-bold leading-[1.2] text-[#1c1a17]">
        {titulo}
      </h3>
      <div className="mt-6">{children}</div>
    </>
  );
}

function Opciones({ valor, opciones, onElegir }) {
  return (
    <div className="space-y-3">
      {opciones.map((o) => {
        const sel = valor === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onElegir(o.value)}
            className={`group flex min-h-[60px] w-full items-center justify-between gap-4 border px-5 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${
              sel ? "border-[#b89968] bg-[#b89968]/[0.12]" : "border-[#1c1a17]/[0.18] hover:border-[#1c1a17]/40 hover:bg-[#1c1a17]/[0.03]"
            }`}
          >
            <span className="text-[17px] font-normal text-[#1c1a17]">
              {o.label}
            </span>
            <span
              aria-hidden
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                sel ? "border-[#b89968] bg-[#b89968]" : "border-[#1c1a17]/30 group-hover:border-[#1c1a17]/50"
              }`}
            >
              {sel && <CheckIcon size={12} weight="bold" className="text-[#1c1a17]" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Pocas opciones a la vista; el resto sólo si se pide. */
function OpcionesTratamiento({ valor, primeras, onElegir }) {
  const elegidoEnOtros = OTROS.some((o) => o.value === valor);
  const [verOtros, setVerOtros] = useState(elegidoEnOtros);
  // Lo que ya va arriba como atajo no se repite en la lista
  const arriba = new Set(primeras.map((o) => o.value));
  const resto = (verOtros ? OTROS : PRINCIPALES.map(opcion)).filter((o) => !arriba.has(o.value));
  const opciones = [...primeras, ...resto];

  return (
    <>
      <Opciones valor={valor} opciones={opciones} onElegir={onElegir} />
      <button
        type="button"
        onClick={() => setVerOtros((v) => !v)}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13px] font-medium uppercase tracking-[0.14em] text-[#8a6d3f] underline-offset-4 hover:underline"
      >
        {verOtros ? "← Ver los principales" : "Otro tratamiento…"}
      </button>
    </>
  );
}

function Monto({ valor, onCambiar, onSiguiente, alternativa }) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-[#f2efe9] px-5 focus-within:border-[#b89968]">
        <span className="tracking-tight text-[28px] text-[#5b544a]">$</span>
        <input
          autoFocus
          inputMode="numeric"
          autoComplete="off"
          aria-label="Monto en pesos"
          placeholder="0"
          value={valor}
          onChange={(e) => onCambiar(e.target.value.replace(/[^\d]/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && valor && onSiguiente()}
          className="min-h-[64px] w-full bg-transparent tracking-tight text-[32px] text-[#1c1a17] placeholder:text-[#8b8478] focus:outline-none"
        />
      </div>
      {valor && (
        <p className="mt-2 text-[14px] text-[#5b544a]">{formatMoney(valor)}</p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!valor}
          onClick={onSiguiente}
          className="inline-flex min-h-[56px] rounded-full items-center justify-between gap-3 bg-[#1c1a17] px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#3d372f] disabled:opacity-40 sm:min-w-[200px]"
        >
          Siguiente <ArrowRightIcon size={18} weight="regular" />
        </button>
        <button
          type="button"
          onClick={alternativa.onClick}
          className="inline-flex min-h-[56px] rounded-full items-center justify-center border border-[#1c1a17]/[0.18] px-6 text-[15px] text-[#3d372f] transition-colors hover:border-[#1c1a17]/40"
        >
          {alternativa.label}
        </button>
      </div>
    </div>
  );
}

function Resumen({ r, vino, irA, onGuardar, pending, error }) {
  const filas = [
    { paso: "estado", pregunta: "¿Vino?", respuesta: { asistio: "Sí, vino", no_asistio: "No vino", cancelada: "Canceló" }[r.estado] },
    ...(vino
      ? [
          { paso: "cotizado", pregunta: "Cotizado", respuesta: r.cotizado === NADA ? "Nada, sólo se valoró" : labelDe(TRATAMIENTOS, r.cotizado) },
          ...(r.cotizado !== NADA
            ? [{ paso: "cotizadoMonto", pregunta: "Presupuesto", respuesta: r.cotizadoMonto ? formatMoney(r.cotizadoMonto) : "Sin presupuesto" }]
            : []),
          { paso: "realizado", pregunta: "Se hizo hoy", respuesta: r.realizado === SOLO_VALORACION ? "Sólo la valoración" : labelDe(TRATAMIENTOS, r.realizado) },
          { paso: "pagadoMonto", pregunta: "Pagó hoy", respuesta: r.pagadoMonto ? formatMoney(r.pagadoMonto) : "Nada" },
        ]
      : []),
  ];

  return (
    <>
      <h3 className="tracking-tight text-[clamp(24px,3vw,30px)] font-bold leading-[1.2] text-[#1c1a17]">
        ¿Todo bien?
      </h3>
      <ul className="mt-5 border border-[#1c1a17]/[0.1]">
        {filas.map((f) => (
          <li key={f.paso}>
            <button
              type="button"
              onClick={() => irA(f.paso)}
              className="flex min-h-[56px] w-full items-center justify-between gap-4 border-b border-[#1c1a17]/[0.06] px-5 py-3 text-left last:border-0 hover:bg-[#1c1a17]/[0.03]"
            >
              <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#5b544a]">
                {f.pregunta}
              </span>
              <span className="text-[16px] text-[#1c1a17]">
                {f.respuesta} <span className="ml-2 text-[12px] text-[#8a6d3f]">Cambiar</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onGuardar}
        disabled={pending}
        className="mt-6 inline-flex min-h-[56px] rounded-full w-full items-center justify-between gap-3 bg-[#1c1a17] px-7 py-4 text-[15px] font-medium text-white transition-colors hover:bg-[#3d372f] disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar"}
        {!pending && <CheckIcon size={18} weight="bold" />}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#c0392b]">
          {error}
        </p>
      )}
    </>
  );
}

function montoInicial(n) {
  return n === null || n === undefined ? "" : String(Math.round(Number(n)));
}
