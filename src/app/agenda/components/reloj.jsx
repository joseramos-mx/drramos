"use client";

import { useEffect, useState } from "react";
import { formatHora, minutosDelDia } from "../lib";

/**
 * Hora actual de Durango en dorado. Se actualiza al cambiar el minuto.
 * `grande` para el monitor del consultorio.
 */
export default function Reloj({ grande = false }) {
  const [ahora, setAhora] = useState(null);
  useEffect(() => {
    const tick = () => setAhora(minutosDelDia(new Date().toISOString()));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <p
      aria-label="Hora actual"
      className={`font-[family-name:var(--font-cormorant)] font-light tabular-nums leading-none text-[#b89968] ${
        grande ? "text-[clamp(32px,3.5vw,52px)]" : "text-[clamp(28px,4vw,40px)]"
      }`}
    >
      {ahora === null ? " " : formatHora(ahora)}
    </p>
  );
}
