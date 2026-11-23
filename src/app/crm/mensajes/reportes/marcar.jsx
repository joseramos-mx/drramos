"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarReporteAction } from "../reportes-actions";

/** Botón "Resuelto" / "Reabrir" de un reporte. */
export default function MarcarReporte({ id, estado }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const resuelto = estado === "resuelto";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await marcarReporteAction(id, resuelto ? "nuevo" : "resuelto");
          router.refresh();
        })
      }
      className="h-10 shrink-0 rounded-full border-2 border-[#1c1a17]/10 px-4 text-[15px] font-semibold text-[#1c1a17] disabled:opacity-50"
    >
      {resuelto ? "Reabrir" : "Resuelto"}
    </button>
  );
}
