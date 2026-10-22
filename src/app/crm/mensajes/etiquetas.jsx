"use client";

import { useOptimistic, useTransition } from "react";
import { alternarEtiquetaAction } from "./actions";
import { ETIQUETAS } from "./lib";

/** Etiquetas del chat: un toque pone o quita. */
export default function Etiquetas({ pacienteId, actuales }) {
  const [, start] = useTransition();
  const [lista, setLista] = useOptimistic(actuales || [], (prev, id) =>
    prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
  );

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-3" role="group" aria-label="Etiquetas">
      {ETIQUETAS.map((e) => {
        const activa = lista.includes(e.id);
        return (
          <button
            key={e.id}
            type="button"
            aria-pressed={activa}
            onClick={() =>
              start(async () => {
                setLista(e.id);
                await alternarEtiquetaAction(pacienteId, e.id);
              })
            }
            className={`shrink-0 border px-3 py-1.5 font-[family-name:var(--font-albert)] text-[13px] ${
              activa
                ? e.id === "urgencia"
                  ? "border-[#ff7a7a] bg-[#ff7a7a]/[0.15] text-[#ffd0d0]"
                  : "border-[#b89968] bg-[#b89968]/[0.18] text-[#f5f1ea]"
                : "border-white/[0.18] text-white/60 hover:border-white/40"
            }`}
          >
            {activa ? "✓ " : ""}
            {e.label}
          </button>
        );
      })}
    </div>
  );
}
