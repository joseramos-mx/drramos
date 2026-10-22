"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react";

/**
 * Hoja que sube desde abajo (como en WhatsApp) para opciones que no
 * deben estar siempre en pantalla. Se cierra tocando afuera o la X.
 * Va en un portal a <body>: dentro de una barra con backdrop-blur el
 * "fixed" quedaría atrapado en la barra.
 */
export default function Hoja({ abierta, onCerrar, titulo, children }) {
  useEffect(() => {
    if (!abierta) return;
    const esc = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierta, onCerrar]);

  if (!abierta) return null;
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#1c1a17]/40" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-[720px] overflow-y-auto rounded-t-[28px] bg-white pb-[calc(16px+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between bg-white px-5 pb-2 pt-4">
          <h2 className="text-[20px] font-bold text-[#1c1a17]">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2efe9] text-[#1c1a17]"
          >
            <XIcon size={22} weight="bold" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
