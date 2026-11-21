"use client";

import { useOptimistic, useTransition } from "react";
import { RobotIcon, UserIcon } from "@phosphor-icons/react";
import { cambiarQuienAtiendeAction } from "../actions";

const hora = (d) => new Date(d).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" });

/**
 * Barrita debajo del nombre: quién CONVERSA con el paciente, el asistente virtual o ella.
 * Sólo decide eso: los botones de cita, recordatorios y mensajes automáticos salen igual.
 * Si ella lo toma (o le escribe), es suyo 8 h; luego vuelve solo al asistente.
 * Con el asistente apagado, siempre contesta ella.
 */
export default function QuienAtiende({ pacienteId, atiende, desde, modo }) {
  const [, start] = useTransition();
  const [actual, setActual] = useOptimistic({ atiende, desde });
  const cambiar = (quien) =>
    start(async () => {
      setActual({ atiende: quien, desde: quien === "humano" ? new Date().toISOString() : null });
      if (pacienteId !== "demo") await cambiarQuienAtiendeAction(pacienteId, quien);
    });

  if (modo === "apagado") {
    return (
      <div className="flex items-center gap-3 bg-[#fbf3e3] px-4 py-2 text-[15px] text-[#5e4a26]">
        <UserIcon size={22} weight="fill" className="shrink-0" />
        <span className="min-w-0 flex-1 font-semibold">Contestas tú (asistente apagado)</span>
      </div>
    );
  }
  const robot = actual.atiende !== "humano";
  const hasta = !robot && actual.desde ? hora(new Date(actual.desde).getTime() + 8 * 3600 * 1000) : null;
  return (
    <div className={`flex items-center gap-3 px-4 py-2 text-[15px] ${robot ? "bg-[#eef3ee] text-[#2f5a38]" : "bg-[#fbf3e3] text-[#5e4a26]"}`}>
      {robot ? <RobotIcon size={22} weight="fill" className="shrink-0" /> : <UserIcon size={22} weight="fill" className="shrink-0" />}
      <span className="min-w-0 flex-1 font-semibold leading-tight">
        {robot ? "Contesta el asistente" : "Contestas tú"}
        {hasta && <span className="block text-[13px] font-normal">El asistente no contesta hasta las {hasta}</span>}
      </span>
      <button
        type="button"
        onClick={() => cambiar(robot ? "humano" : "asistente")}
        className="h-10 shrink-0 rounded-full bg-white px-4 text-[15px] font-semibold text-[#1c1a17] shadow-[0_1px_2px_rgba(28,26,23,0.12)]"
      >
        {robot ? "Tomar chat" : "Devolver al asistente"}
      </button>
    </div>
  );
}
