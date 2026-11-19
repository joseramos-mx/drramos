"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarBlankIcon, DotsThreeVerticalIcon, PencilSimpleIcon, PhoneIcon } from "@phosphor-icons/react";
import { corregirPacienteAction } from "../actions";
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
          {corrigiendo && <Corregir pacienteId={pacienteId} nombre={nombre} telefono={telefono} onListo={() => setCorrigiendo(false)} />}
        </Hoja>
      )}
    </>
  );
}

/** Número como se escribe: 618 123 4567 (sin el 52). */
const bonito = (tel) => {
  const d = String(tel || "").replace(/\D+/g, "").slice(-10);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
};

function Corregir({ pacienteId, nombre, telefono, onListo }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);
  const [n, setN] = useState(/^WhatsApp /.test(nombre || "") ? "" : nombre || "");
  const [t, setT] = useState(bonito(telefono));
  const campo = "h-14 w-full rounded-2xl border-2 border-[#1c1a17]/10 bg-white px-4 text-[18px] text-[#1c1a17] outline-none focus:border-[#b89968]";
  return (
    <form
      className="flex flex-col gap-4 px-5 pb-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await corregirPacienteAction(pacienteId, n, t);
          if (r?.error) return setError(r.error);
          onListo();
          if (r.telefono && r.telefono !== telefono) router.replace(`/crm/mensajes/${r.telefono}`);
          else router.refresh();
        });
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-[16px] font-semibold text-[#5b544a]">Nombre</span>
        <input value={n} onChange={(e) => setN(e.target.value)} autoComplete="off" className={campo} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[16px] font-semibold text-[#5b544a]">WhatsApp (10 números)</span>
        <input value={t} onChange={(e) => setT(e.target.value)} type="tel" inputMode="tel" autoComplete="off" placeholder="618 123 4567" className={campo} />
      </label>
      <p className="text-[15px] leading-snug text-[#7a7368]">Si cambias el número, este chat se pasa al número nuevo. Los mensajes que ya se mandaron al número equivocado no se vuelven a mandar.</p>
      {error && <p className="rounded-2xl bg-[#fbe9e7] px-4 py-3 text-[16px] text-[#8a2a1c]">{error}</p>}
      <button type="submit" disabled={pending} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
