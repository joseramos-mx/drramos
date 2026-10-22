"use client";

import { useOptimistic, useTransition } from "react";
import { RobotIcon, UserIcon } from "@phosphor-icons/react";
import { cambiarQuienAtiendeAction } from "../actions";

/**
 * Barrita debajo del nombre: quién lleva el chat. Si lo lleva el
 * asistente, ella puede "Tomar el chat"; si lo lleva ella, "Devolver al
 * asistente" (o se devuelve solo 8 h después de su último mensaje).
 */
export default function QuienAtiende({ pacienteId, atiende }) {
  const [, start] = useTransition();
  const [actual, setActual] = useOptimistic(atiende);
  const cambiar = (quien) =>
    start(async () => {
      setActual(quien);
      if (pacienteId !== "demo") await cambiarQuienAtiendeAction(pacienteId, quien);
    });

  const robot = actual !== "humano";
  return (
    <div className={`flex items-center gap-3 px-4 py-2 text-[15px] ${robot ? "bg-[#eef3ee] text-[#2f5a38]" : "bg-[#fbf3e3] text-[#5e4a26]"}`}>
      {robot ? <RobotIcon size={22} weight="fill" className="shrink-0" /> : <UserIcon size={22} weight="fill" className="shrink-0" />}
      <span className="min-w-0 flex-1 truncate font-semibold">{robot ? "Lo atiende el asistente" : "Lo atiendes tú"}</span>
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
