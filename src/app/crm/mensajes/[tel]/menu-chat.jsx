"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarBlankIcon, DotsThreeVerticalIcon, PencilSimpleIcon, PhoneIcon, UsersThreeIcon, WarningIcon } from "@phosphor-icons/react";
import Reportar from "../reportar";
import { juntarPacientesAction } from "../actions";
import CorregirPaciente from "../corregir-paciente";
import Hoja from "../hoja";
import Etiquetas from "../etiquetas";

/** Botón ⋮ del chat: agendar, llamar, corregir nombre o número y etiquetas, escondidos hasta que se necesitan. */
export default function MenuChat({ pacienteId, repetidas = 1, nombre, etiquetas, telefono, agendarHref }) {
  const [abierta, setAbierta] = useState(false);
  const [corrigiendo, setCorrigiendo] = useState(false);
  const [juntando, setJuntando] = useState(false);
  const [reportando, setReportando] = useState(false);
  const fila = "flex h-16 items-center gap-4 px-5 text-[18px] font-semibold text-[#1c1a17] active:bg-[#f5f1ea]";
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label="Más opciones"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#1c1a17] active:bg-[#f2efe9]"
      >
        <DotsThreeVerticalIcon size={28} weight="bold" />
      </button>
      <Hoja abierta={abierta} onCerrar={() => setAbierta(false)} titulo="Opciones">
        {agendarHref && (
          <Link href={agendarHref} className={fila}>
            <CalendarBlankIcon size={26} className="text-[#8a6d3f]" /> Agendar cita
          </Link>
        )}
        <a href={`tel:+${telefono}`} className={fila}>
          <PhoneIcon size={26} className="text-[#8a6d3f]" /> Llamar
        </a>
        {pacienteId && (
          <button type="button" onClick={() => { setAbierta(false); setCorrigiendo(true); }} className={`${fila} w-full text-left`}>
            <PencilSimpleIcon size={26} className="text-[#8a6d3f]" /> Corregir nombre o número
          </button>
        )}
        {repetidas > 1 && (
          <button type="button" onClick={() => { setAbierta(false); setJuntando(true); }} className={`${fila} w-full text-left`}>
            <UsersThreeIcon size={26} className="text-[#c0392b]" /> Juntar fichas repetidas ({repetidas})
          </button>
        )}
        <button type="button" onClick={() => { setAbierta(false); setReportando(true); }} className={`${fila} w-full text-left`}>
          <WarningIcon size={26} className="text-[#c0392b]" /> Reportar un problema
        </button>
        {pacienteId && (
          <>
            <p className="px-5 pb-1 pt-4 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">Etiquetas</p>
            <Etiquetas pacienteId={pacienteId} actuales={etiquetas} />
          </>
        )}
      </Hoja>
      <Hoja abierta={reportando} onCerrar={() => setReportando(false)} titulo="Reportar un problema">
        {reportando && <Reportar telefono={telefono} onListo={() => setReportando(false)} />}
      </Hoja>
      {repetidas > 1 && (
        <Hoja abierta={juntando} onCerrar={() => setJuntando(false)} titulo="Juntar fichas repetidas">
          {juntando && <Juntar telefono={telefono} repetidas={repetidas} onListo={() => setJuntando(false)} />}
        </Hoja>
      )}
      {pacienteId && (
        <Hoja abierta={corrigiendo} onCerrar={() => setCorrigiendo(false)} titulo="Corregir nombre o número">
          {corrigiendo && <CorregirPaciente pacienteId={pacienteId} nombre={nombre} telefono={telefono} irAlChat onListo={() => setCorrigiendo(false)} />}
        </Hoja>
      )}
    </>
  );
}

/** Confirmación para juntar las fichas del mismo número en una sola. */
function Juntar({ telefono, repetidas, onListo }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);
  return (
    <div className="flex flex-col gap-4 px-5 pb-6">
      <p className="text-[17px] leading-snug text-[#1c1a17]">
        Este número está guardado en {repetidas} fichas. Si es la misma persona, se juntan en una sola: sus citas, pagos y mensajes quedan juntos.
      </p>
      <p className="text-[15px] leading-snug text-[#7a7368]">No se borra ninguna cita ni ningún mensaje.</p>
      {error && <p className="rounded-2xl bg-[#fbe9e7] px-4 py-3 text-[16px] text-[#8a2a1c]">{error}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await juntarPacientesAction(telefono);
            if (r?.error) return setError(r.error);
            onListo();
            router.refresh();
          })
        }
        className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Juntando…" : "Sí, es la misma persona"}
      </button>
      <button type="button" onClick={onListo} className="h-12 text-[16px] font-semibold text-[#7a7368]">
        No, son personas distintas
      </button>
    </div>
  );
}
