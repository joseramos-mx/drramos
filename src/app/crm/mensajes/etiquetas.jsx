"use client";

import { useOptimistic, useTransition } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { alternarEtiquetaAction } from "./actions";
import { ETIQUETAS } from "./lib";

/** Lista de etiquetas con palomita: un toque pone o quita. */
export default function Etiquetas({ pacienteId, actuales }) {
  const [, start] = useTransition();
  const [lista, setLista] = useOptimistic(actuales || [], (prev, id) =>
    prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
  );

  return (
    <ul role="group" aria-label="Etiquetas">
      {ETIQUETAS.map((e) => {
        const activa = lista.includes(e.id);
        return (
          <li key={e.id}>
            <button
              type="button"
              aria-pressed={activa}
              onClick={() =>
                start(async () => {
                  setLista(e.id);
                  if (pacienteId !== "demo") await alternarEtiquetaAction(pacienteId, e.id);
                })
              }
              className="flex h-16 w-full items-center gap-4 px-5 text-left text-[18px] text-[#1c1a17] active:bg-[#f5f1ea]"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  activa ? (e.id === "urgencia" ? "border-[#c0392b] bg-[#c0392b]" : "border-[#b89968] bg-[#b89968]") : "border-[#cfc8bc]"
                }`}
              >
                {activa && <CheckIcon size={18} weight="bold" className="text-white" />}
              </span>
              <span className={e.id === "urgencia" ? "font-semibold text-[#c0392b]" : ""}>{e.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
