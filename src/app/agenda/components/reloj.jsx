"use client";

import { useEffect, useState } from "react";
import { formatHora, minutosDelDia } from "../lib";

/** Hora actual de Durango, se actualiza cada 20 s. */
export default function Reloj() {
  const [ahora, setAhora] = useState(null);
  useEffect(() => {
    const tick = () => setAhora(minutosDelDia(new Date().toISOString()));
    tick();
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="font-[family-name:var(--font-cormorant)] text-[clamp(32px,3.5vw,52px)] font-light tabular-nums text-[#b89968]">
      {ahora === null ? "" : formatHora(ahora)}
    </p>
  );
}
