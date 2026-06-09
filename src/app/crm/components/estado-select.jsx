"use client";

import { useState, useTransition } from "react";
import { updateEstadoAction } from "../actions";
import { ESTADOS } from "../lib";

/**
 * Select de estado con auto-save. No abre formulario: el onChange
 * dispara el server action en una transition, sin recargar la página.
 */
export default function EstadoSelect({ leadId, estado }) {
  const [value, setValue] = useState(estado || "nuevo");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function handleChange(e) {
    const next = e.target.value;
    setValue(next);
    setError(null);

    const fd = new FormData();
    fd.set("id", leadId);
    fd.set("estado", next);

    startTransition(async () => {
      const res = await updateEstadoAction(fd);
      if (res?.error) {
        setError(res.error);
        setValue(estado || "nuevo");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label="Estado del lead"
        value={value}
        onChange={handleChange}
        disabled={pending}
        className={`min-h-[40px] w-full border bg-transparent px-3 py-1.5 font-[family-name:var(--font-albert)] text-[13px] font-light tracking-[0.02em] text-[#f5f1ea] transition-colors focus:border-[#b89968] focus:outline-none disabled:opacity-60 ${
          value === "nuevo"
            ? "border-[#b89968]/50 bg-[#b89968]/[0.06]"
            : value === "cita"
              ? "border-emerald-400/40 bg-emerald-400/[0.06]"
              : value === "cerrado"
                ? "border-white/30 bg-white/[0.06]"
                : value === "perdido"
                  ? "border-white/[0.12] bg-transparent text-white/45"
                  : "border-white/[0.18]"
        }`}
      >
        {ESTADOS.map((e) => (
          <option key={e.value} value={e.value} className="bg-[#000000]">
            {e.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          role="alert"
          className="font-[family-name:var(--font-albert)] text-[10px] font-light text-[#ff7a7a]"
        >
          No se pudo guardar
        </span>
      )}
    </div>
  );
}
