"use client";

import { useOptimistic, useTransition } from "react";
import { cambiarModoAsistenteAction } from "../actions";

const MODOS = [
  { id: "automatico", titulo: "Contesta solo", texto: "Responde, agenda valoraciones y te pasa lo que no le toca." },
  { id: "borrador", titulo: "Me propone y yo apruebo", texto: "Prepara cada respuesta; tú la mandas, la editas o la descartas." },
  { id: "apagado", titulo: "Apagado", texto: "Todos los mensajes te llegan a ti." },
];

/** Cómo trabaja el asistente virtual, para todos los chats. */
export default function ModoAsistente({ modo, demo = false }) {
  const [, start] = useTransition();
  const [actual, setActual] = useOptimistic(modo);
  return (
    <ul className="space-y-2 px-5" role="radiogroup" aria-label="Modo del asistente">
      {MODOS.map((m) => {
        const on = actual === m.id;
        return (
          <li key={m.id}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() =>
                start(async () => {
                  setActual(m.id);
                  if (!demo) await cambiarModoAsistenteAction(m.id);
                })
              }
              className={`flex w-full items-center gap-4 rounded-[20px] border-2 p-4 text-left ${
                on ? "border-[#b89968] bg-[#fbf6ec]" : "border-[#1c1a17]/10 bg-white"
              }`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-[#b89968]" : "border-[#cfc8bc]"}`}>
                {on && <span className="h-3.5 w-3.5 rounded-full bg-[#b89968]" />}
              </span>
              <span>
                <span className="block text-[18px] font-semibold text-[#1c1a17]">{m.titulo}</span>
                <span className="block text-[15px] leading-snug text-[#7a7368]">{m.texto}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
