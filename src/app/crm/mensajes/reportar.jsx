"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { reportarProblemaAction } from "./reportes-actions";

/**
 * "Reportar un problema": ella escribe (o dicta con el micrófono del teclado) qué pasó.
 * El sistema guarda solo en qué chat, a qué hora, el modo del asistente y los últimos mensajes.
 */
export default function Reportar({ telefono = null, onListo }) {
  const [texto, setTexto] = useState("");
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  if (listo) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 pb-8 pt-2 text-center">
        <CheckCircleIcon size={48} weight="fill" className="text-[#2f5a38]" />
        <p className="text-[18px] font-semibold text-[#1c1a17]">¡Gracias! Ya quedó guardado.</p>
        <p className="text-[16px] leading-snug text-[#7a7368]">Lo revisamos y lo corregimos. Cualquier otra cosa que veas, repórtala igual.</p>
        <button type="button" onClick={onListo} className="mt-2 h-12 w-full rounded-full bg-[#1c1a17] text-[17px] font-semibold text-white">
          Listo
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 px-5 pb-6">
      <p className="text-[16px] leading-snug text-[#5b544a]">
        Cuéntanos qué pasó, con tus palabras. {telefono ? "Se guarda también lo que pasó en este chat." : ""} No hay reportes tontos: todo sirve.
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={5}
        maxLength={2000}
        placeholder="Ej.: tomé el chat y aun así le llegó un mensaje solo"
        className="w-full rounded-[18px] border-2 border-[#1c1a17]/10 bg-white px-4 py-3 text-[17px] leading-snug text-[#1c1a17] outline-none focus:border-[#b89968]"
      />
      {error && <p className="rounded-2xl bg-[#fbe9e7] px-4 py-3 text-[16px] text-[#8a2a1c]">{error}</p>}
      <button
        type="button"
        disabled={pending || !texto.trim()}
        onClick={() =>
          start(async () => {
            const r = await reportarProblemaAction({ telefono, texto, pagina: typeof window !== "undefined" ? window.location.pathname : null });
            if (r?.error) return setError(r.error);
            setListo(true);
          })
        }
        className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Mandar reporte"}
      </button>
    </div>
  );
}
