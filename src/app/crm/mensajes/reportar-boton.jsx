"use client";

import { useState } from "react";
import { WarningIcon } from "@phosphor-icons/react";
import Hoja from "./hoja";
import Reportar from "./reportar";

/** Fila "Reportar un problema" de Ajustes (sin chat). */
export default function ReportarBoton() {
  const [abierta, setAbierta] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="mx-5 mt-3 flex h-16 w-[calc(100%-2.5rem)] items-center gap-3 rounded-[20px] border-2 border-[#1c1a17]/10 bg-white px-5 text-left text-[18px] font-semibold text-[#1c1a17]"
      >
        <WarningIcon size={24} className="text-[#c0392b]" /> Reportar un problema
      </button>
      <Hoja abierta={abierta} onCerrar={() => setAbierta(false)} titulo="Reportar un problema">
        {abierta && <Reportar onListo={() => setAbierta(false)} />}
      </Hoja>
    </>
  );
}
