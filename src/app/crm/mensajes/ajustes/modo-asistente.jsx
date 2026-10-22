"use client";

import { useOptimistic, useTransition } from "react";
import { cambiarLibresAction, cambiarModoAsistenteAction } from "../actions";

const MODOS = [
  { id: "automatico", titulo: "Contesta solo", texto: "Manda las respuestas aprobadas, agenda valoraciones y te pasa lo que no le toca." },
  { id: "borrador", titulo: "Me propone y yo apruebo", texto: "Prepara cada respuesta; tú la mandas, la editas o la descartas." },
  { id: "apagado", titulo: "Apagado", texto: "Todos los mensajes te llegan a ti." },
];

/** Cómo trabaja el asistente virtual, para todos los chats. */
export default function ModoAsistente({ modo, libres = "aprobar", demo = false }) {
  const [, start] = useTransition();
  const [actual, setActual] = useOptimistic(modo);
  const [libresActual, setLibres] = useOptimistic(libres);
  return (
    <>
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
    {actual === "automatico" && (
      <div className="mx-5 mt-3 rounded-[20px] bg-[#f2efe9] p-4">
        <p className="text-[16px] font-semibold text-[#1c1a17]">Cuando ninguna respuesta aprobada sirve y el asistente escribe una propia:</p>
        <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label="Respuestas propias">
          {[
            ["aprobar", "Me la pasa para revisarla (recomendado)"],
            ["auto", "La manda sola si el verificador la aprueba"],
          ].map(([id, texto]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={libresActual === id}
              onClick={() =>
                start(async () => {
                  setLibres(id);
                  if (!demo) await cambiarLibresAction(id);
                })
              }
              className={`flex min-h-12 items-center gap-3 rounded-full px-4 text-left text-[16px] ${
                libresActual === id ? "bg-white font-semibold text-[#1c1a17] shadow-[0_1px_2px_rgba(28,26,23,0.12)]" : "text-[#5b544a]"
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${libresActual === id ? "border-[#b89968]" : "border-[#cfc8bc]"}`}>
                {libresActual === id && <span className="h-3 w-3 rounded-full bg-[#b89968]" />}
              </span>
              {texto}
            </button>
          ))}
        </div>
      </div>
    )}
    </>
  );
}
