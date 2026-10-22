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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1" role="group" aria-label="Etiquetas">
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
            className={`inline-flex h-11 shrink-0 items-center rounded-full px-4 text-[16px] font-semibold ${
              activa
                ? e.id === "urgencia"
                  ? "bg-[#9b2424] text-white"
                  : "bg-[#b89968] text-[#1c1a17]"
                : "border-2 border-[#1c1a17]/10 bg-white text-[#5b544a]"
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
