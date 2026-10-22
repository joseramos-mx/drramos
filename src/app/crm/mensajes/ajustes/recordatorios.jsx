"use client";

import { useOptimistic, useTransition } from "react";
import { cambiarAutomaticoAction } from "../actions";

const MENSAJES = [
  {
    campo: "recordatorios",
    titulo: "Recordar la cita un día antes",
    texto: "A las 11 de la mañana: “Le recordamos su cita… el martes 28 de octubre a las 10:00”, con botones para confirmar, cambiar o cancelar.",
  },
  {
    campo: "aviso_falto",
    titulo: "Mensaje a quien no vino",
    texto: "Al marcar “No vino”: “Notamos que no pudo venir…”, con botones para elegir otro horario. Puedes quitarlo en cada cita.",
  },
  {
    campo: "seguimientos",
    titulo: "Seguimiento de presupuestos",
    texto: "A los 3 días y al mes de la valoración, si no agendó: “¿Pudo revisar el plan de tratamiento?”. Si quiere agendar o tiene dudas, te llega a ti.",
  },
  {
    campo: "resenas",
    titulo: "Pedir opinión en Google",
    texto: "Cuando termina su tratamiento (pagó y ya no tiene citas), 2 días después: “¿Nos ayudaría con su opinión en Google?”. Una sola vez por paciente.",
  },
];

function Interruptor({ campo, titulo, texto, prendido, demo }) {
  const [, start] = useTransition();
  const [on, setOn] = useOptimistic(prendido);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() =>
        start(async () => {
          setOn(!on);
          if (!demo) await cambiarAutomaticoAction(campo, !on);
        })
      }
      className="flex w-full items-center gap-4 rounded-[20px] border-2 border-[#1c1a17]/10 bg-white p-4 text-left"
    >
      <span className="flex-1">
        <span className="block text-[18px] font-semibold text-[#1c1a17]">{titulo}</span>
        <span className="block text-[15px] leading-snug text-[#7a7368]">{texto}</span>
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? "bg-[#b89968]" : "bg-[#d9d3c9]"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </span>
    </button>
  );
}

/** Mensajes automáticos a los pacientes, cada uno con su interruptor. `estado` = { recordatorios, aviso_falto, seguimientos }. */
export default function Recordatorios({ estado = {}, demo = false }) {
  return (
    <div className="flex flex-col gap-2 px-5">
      {MENSAJES.map((m) => (
        <Interruptor key={m.campo} {...m} prendido={estado[m.campo] !== false} demo={demo} />
      ))}
    </div>
  );
}
