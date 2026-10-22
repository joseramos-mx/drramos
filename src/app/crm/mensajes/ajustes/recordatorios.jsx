"use client";

import { useOptimistic, useTransition } from "react";
import { cambiarRecordatoriosAction } from "../actions";

/** Interruptor: recordatorio automático por WhatsApp un día antes de cada cita. */
export default function Recordatorios({ prendido, demo = false }) {
  const [, start] = useTransition();
  const [on, setOn] = useOptimistic(prendido);
  return (
    <div className="px-5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() =>
          start(async () => {
            setOn(!on);
            if (!demo) await cambiarRecordatoriosAction(!on);
          })
        }
        className="flex w-full items-center gap-4 rounded-[20px] border-2 border-[#1c1a17]/10 bg-white p-4 text-left"
      >
        <span className="flex-1">
          <span className="block text-[18px] font-semibold text-[#1c1a17]">Recordar la cita un día antes</span>
          <span className="block text-[15px] leading-snug text-[#7a7368]">
            A las 11 de la mañana le llega al paciente: “Le recordamos su cita… el martes 28 de octubre a las 10:00”. Si contesta que quiere cambiarla, te llega a ti.
          </span>
        </span>
        <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? "bg-[#b89968]" : "bg-[#d9d3c9]"}`}>
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
        </span>
      </button>
    </div>
  );
}
