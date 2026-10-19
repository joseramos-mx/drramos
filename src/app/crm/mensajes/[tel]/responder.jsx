"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { enviarMensajeAction } from "../actions";
import { RESPUESTAS_RAPIDAS } from "../respuestas";

/**
 * Caja para contestar: respuestas rápidas del manual en un toque (se
 * pueden editar antes de mandar) y aviso claro si ya pasaron 24 h.
 */
export default function Responder({ telefono, abierta, conectado }) {
  const [state, formAction] = useActionState(enviarMensajeAction, null);
  const [texto, setTexto] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (state?.ok) setTexto("");
  }, [state]);

  if (!conectado) {
    return (
      <p className="font-[family-name:var(--font-albert)] text-[14px] text-white/70">
        WhatsApp todavía no está conectado: aquí se podrá contestar cuando el número del consultorio esté dado de alta.
      </p>
    );
  }

  if (!abierta) {
    return (
      <p className="border border-white/[0.12] p-3 font-[family-name:var(--font-albert)] text-[14px] text-white/80">
        Pasaron más de 24 horas desde el último mensaje del paciente. WhatsApp sólo permite mandarle un mensaje con
        formato aprobado (por ejemplo, recordatorio de cita). Si el paciente vuelve a escribir, se puede contestar aquí.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="telefono" value={telefono} />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {RESPUESTAS_RAPIDAS.map((r) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => {
              setTexto(r.texto);
              ref.current?.focus();
            }}
            className="shrink-0 border border-white/[0.22] px-3 py-1.5 font-[family-name:var(--font-albert)] text-[13px] text-white/85 hover:border-[#b89968]"
          >
            {r.titulo}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor="respuesta" className="sr-only">Respuesta</label>
        <textarea
          id="respuesta"
          ref={ref}
          name="texto"
          rows={Math.min(6, Math.max(2, texto.split("\n").length + Math.floor(texto.length / 60)))}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="min-h-[52px] w-full resize-none border border-white/[0.22] bg-[#0d0d0d] px-3 py-2.5 font-[family-name:var(--font-albert)] text-[16px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none"
        />
        <Enviar disabled={!texto.trim()} />
      </div>
      {state?.error && (
        <p role="alert" className="font-[family-name:var(--font-albert)] text-[13px] text-[#ff7a7a]">
          {state.error}
        </p>
      )}
    </form>
  );
}

function Enviar({ disabled }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-label="Enviar"
      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-[#f5f1ea] text-[#000000] hover:bg-white disabled:opacity-40"
    >
      <PaperPlaneRightIcon size={22} weight="fill" />
    </button>
  );
}
