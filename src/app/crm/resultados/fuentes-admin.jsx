"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { crearFuenteAction, guardarGastoMesAction } from "./actions";
import { CANALES, labelCanal, linkWhatsapp, mensajeConCodigo } from "./fuentes";

/**
 * Links de WhatsApp por fuente (con su código) y gasto del mes de las
 * fuentes de paga. Meta no se captura: su gasto llega solo de la API.
 */
export default function FuentesAdmin({ fuentes, gastoMes, mes, mesLabel, metaConectado }) {
  const [nueva, setNueva] = useState(false);

  return (
    <div>
      <ul className="border border-white/[0.1]">
        {fuentes.map((f) => (
          <li key={f.id} className="grid gap-3 border-b border-white/[0.06] px-4 py-4 last:border-0 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-albert)] text-[15px] font-medium text-[#f5f1ea]">
                <span className="mr-2 inline-flex min-w-[44px] justify-center border border-[#b89968]/60 px-1.5 text-[12px] text-[#b89968]">
                  {f.codigo}
                </span>
                {f.nombre}
                <span className="ml-2 text-[12px] font-normal uppercase tracking-[0.12em] text-white/55">
                  {labelCanal(f.canal)}
                </span>
              </p>
              <p className="mt-1 truncate font-[family-name:var(--font-albert)] text-[13px] text-white/65">
                “{mensajeConCodigo(f)}”
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopiarLink fuente={f} />
              {f.de_pago && (f.canal !== "anuncio" || !metaConectado) && (
                <GastoMes fuente={f} mes={mes} mesLabel={mesLabel} valor={gastoMes[f.id]} />
              )}
              {f.canal === "anuncio" && metaConectado && (
                <span className="font-[family-name:var(--font-albert)] text-[12px] text-white/55">Gasto automático de Meta</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {nueva ? (
        <NuevaFuente onListo={() => setNueva(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setNueva(true)}
          className="mt-4 inline-flex min-h-[44px] items-center border border-[#b89968]/60 px-5 font-[family-name:var(--font-albert)] text-[13px] font-medium uppercase tracking-[0.14em] text-[#f5f1ea] hover:bg-[#b89968]/[0.12]"
        >
          + Nueva fuente
        </button>
      )}
    </div>
  );
}

function CopiarLink({ fuente }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(linkWhatsapp(fuente));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      window.prompt("Copia el link:", linkWhatsapp(fuente));
    }
  }
  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex min-h-[40px] items-center gap-2 border border-white/[0.22] px-3 font-[family-name:var(--font-albert)] text-[13px] text-white/85 hover:border-[#b89968]"
    >
      {copiado ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      {copiado ? "Copiado" : "Copiar link"}
    </button>
  );
}

function GastoMes({ fuente, mes, mesLabel, valor }) {
  const [state, formAction] = useActionState(guardarGastoMesAction, null);
  const [monto, setMonto] = useState(valor != null ? String(Math.round(valor)) : "");
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="fuente_id" value={fuente.id} />
      <input type="hidden" name="mes" value={mes} />
      <label className="sr-only" htmlFor={`gasto-${fuente.id}`}>Gasto de {mesLabel}</label>
      <input
        id={`gasto-${fuente.id}`}
        name="monto"
        inputMode="numeric"
        placeholder={`Gasto ${mesLabel}`}
        value={monto}
        onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ""))}
        className="min-h-[40px] w-[150px] border border-white/[0.22] bg-[#0d0d0d] px-3 font-[family-name:var(--font-albert)] text-[14px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none"
      />
      <Btn label={state?.ok ? "Guardado" : "Guardar"} />
      {state?.error && <span role="alert" className="text-[12px] text-[#ff7a7a]">{state.error}</span>}
    </form>
  );
}

function NuevaFuente({ onListo }) {
  const [state, formAction] = useActionState(crearFuenteAction, null);
  useEffect(() => {
    if (state?.ok) onListo();
  }, [state, onListo]);

  const campo =
    "min-h-[44px] w-full border border-white/[0.22] bg-[#0d0d0d] px-3 font-[family-name:var(--font-albert)] text-[15px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none";
  const etiqueta = "mb-2 block font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.14em] text-white/70";

  return (
    <form action={formAction} className="mt-4 grid gap-4 border border-white/[0.1] p-5 md:grid-cols-2">
      <div>
        <label className={etiqueta} htmlFor="f-codigo">Código (corto)</label>
        <input id="f-codigo" name="codigo" placeholder="A2, RADIO1, VOLANTE" className={`${campo} uppercase`} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="f-nombre">Nombre</label>
        <input id="f-nombre" name="nombre" placeholder="Anuncio carillas video" className={campo} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="f-canal">Canal</label>
        <select id="f-canal" name="canal" defaultValue="" className={campo}>
          <option value="" disabled>Elige…</option>
          {CANALES.filter((c) => c.value !== "sin_dato").map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={etiqueta} htmlFor="f-pago">¿Se paga?</label>
        <select id="f-pago" name="de_pago" defaultValue="no" className={campo}>
          <option value="no">No, es gratis</option>
          <option value="si">Sí, tiene costo</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className={etiqueta} htmlFor="f-mensaje">Mensaje que verá el paciente en WhatsApp</label>
        <input id="f-mensaje" name="mensaje" placeholder="Hola, vi su anuncio de carillas y quiero agendar una valoración" className={campo} />
        <p className="mt-1 font-[family-name:var(--font-albert)] text-[12px] text-white/55">Al final se agrega solo “(ref CÓDIGO)”.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <Btn label="Crear fuente" grande />
        <button type="button" onClick={onListo} className="min-h-[44px] px-2 font-[family-name:var(--font-albert)] text-[12px] uppercase tracking-[0.14em] text-white/65 hover:text-[#f5f1ea]">
          Cancelar
        </button>
        {state?.error && <span role="alert" className="font-[family-name:var(--font-albert)] text-[13px] text-[#ff7a7a]">{state.error}</span>}
      </div>
    </form>
  );
}

function Btn({ label, grande }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center bg-[#f5f1ea] font-[family-name:var(--font-albert)] font-medium text-[#000000] hover:bg-white disabled:opacity-60 ${
        grande ? "min-h-[48px] px-6 text-[14px]" : "min-h-[40px] px-4 text-[13px]"
      }`}
    >
      {pending ? "Guardando..." : label}
    </button>
  );
}
