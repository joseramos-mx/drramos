"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarBlankIcon, DotsThreeVerticalIcon, PencilSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import CorregirPaciente from "../corregir-paciente";
import Hoja from "../hoja";
import Etiquetas from "../etiquetas";

/** Botón ⋮ del chat: agendar, llamar, corregir nombre o número y etiquetas, escondidos hasta que se necesitan. */
export default function MenuChat({ pacienteId, nombre, etiquetas, telefono, agendarHref }) {
  const [abierta, setAbierta] = useState(false);
  const [corrigiendo, setCorrigiendo] = useState(false);
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
        {pacienteId && (
          <>
            <p className="px-5 pb-1 pt-4 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">Etiquetas</p>
            <Etiquetas pacienteId={pacienteId} actuales={etiquetas} />
          </>
        )}
      </Hoja>
      {pacienteId && (
        <Hoja abierta={corrigiendo} onCerrar={() => setCorrigiendo(false)} titulo="Corregir nombre o número">
          {corrigiendo && <CorregirPaciente pacienteId={pacienteId} nombre={nombre} telefono={telefono} irAlChat onListo={() => setCorrigiendo(false)} />}
        </Hoja>
      )}
    </>
  );
}
