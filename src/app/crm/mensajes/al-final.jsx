"use client";

import { useEffect, useRef } from "react";

/**
 * Al abrir el chat (y al llegar mensajes nuevos) baja hasta el último,
 * como WhatsApp. Repite al cargar las fotos, que cambian la altura.
 */
export default function AlFinal({ cuantos }) {
  const ref = useRef(null);
  useEffect(() => {
    const bajar = () => window.scrollTo(0, document.documentElement.scrollHeight);
    bajar();
    const tiempos = [150, 600, 1500].map((ms) => setTimeout(bajar, ms));
    const lista = ref.current?.closest("ol");
    const alCargar = (e) => e.target.tagName === "IMG" && bajar();
    lista?.addEventListener("load", alCargar, true);
    return () => {
      tiempos.forEach(clearTimeout);
      lista?.removeEventListener("load", alCargar, true);
    };
  }, [cuantos]);
  return <div ref={ref} aria-hidden />;
}
