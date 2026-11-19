"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { corregirPacienteAction } from "./actions";

/** Número como se escribe: 618 123 4567 (sin el 52). */
const bonito = (tel) => {
  const d = String(tel || "").replace(/\D+/g, "").slice(-10);
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : d;
};

/**
 * Formulario para corregir el nombre o el número de un paciente (chat ⋮ y Agenda).
 * `irAlChat`: si cambió el número, abre el chat en el número nuevo.
 */
export default function CorregirPaciente({ pacienteId, nombre, telefono, onListo, irAlChat = false }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);
  const [duplicado, setDuplicado] = useState(null); // nombre del otro paciente con ese número
  const [n, setN] = useState(/^WhatsApp /.test(nombre || "") ? "" : nombre || "");
  const [t, setT] = useState(bonito(telefono));
  const campo = "h-14 w-full rounded-2xl border-2 border-[#1c1a17]/10 bg-white px-4 text-[18px] text-[#1c1a17] outline-none focus:border-[#b89968]";
  return (
    <form
      className="flex flex-col gap-4 px-5 pb-6"
      onSubmit={(e) => {
        e.preventDefault();
        const juntar = e.nativeEvent?.submitter?.value === "juntar";
        setError(null);
        start(async () => {
          const r = await corregirPacienteAction(pacienteId, n, t, { juntar });
          setDuplicado(r?.duplicado || null);
          if (r?.error) return setError(r.error);
          onListo();
          if (irAlChat && r.telefono && r.telefono !== telefono) router.replace(`/crm/mensajes/${r.telefono}`);
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
      {duplicado && (
        <button type="submit" value="juntar" disabled={pending} className="h-14 rounded-full border-2 border-[#b89968] bg-white text-[17px] font-semibold text-[#8a6d3f] disabled:opacity-60">
          Es la misma persona: juntar sus fichas
        </button>
      )}
      <button type="submit" disabled={pending} className="h-14 rounded-full bg-[#1c1a17] text-[18px] font-semibold text-white disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
