"use client";

import { useState, useTransition } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { marcarListoAction } from "../actions";

/**
 * "Ya quedó": para un "gracias", un sticker o algo que no hay que contestar.
 * Quita el chat de Pendientes sin mandarle nada al paciente; si vuelve a
 * escribir, regresa solo.
 */
export default function YaQuedo({ pacienteId }) {
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(null);
  const [pendiente, start] = useTransition();
  if (listo) return null;

  const marcar = () =>
    start(async () => {
      setError(null);
      const res = pacienteId === "demo" ? { ok: true } : await marcarListoAction(pacienteId);
      if (res?.error) return setError(res.error);
      setListo(true);
    });

  return (
    <div className="mb-2.5 flex items-center gap-3 px-1">
      <p className="min-w-0 flex-1 text-[15px] leading-snug text-[#5b544a]">
        {error || "¿No hay que contestarle? Quítalo de Pendientes."}
      </p>
      <button
        type="button"
        onClick={marcar}
        disabled={pendiente}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-[#1c1a17]/10 bg-white px-4 text-[16px] font-semibold text-[#1c1a17] disabled:opacity-50"
      >
        <CheckIcon size={20} weight="bold" /> Ya quedó
      </button>
    </div>
  );
}
