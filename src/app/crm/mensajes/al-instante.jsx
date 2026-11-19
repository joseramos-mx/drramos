"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Mensajes al instante: escucha la tabla de mensajes (Supabase Realtime) y
 * vuelve a pedir la pantalla en cuanto llega o cambia uno (p. ej. "le llegó").
 * También al volver a abrir la app (celular que se despierta). De respaldo,
 * si Realtime no está prendido, sigue refrescando cada `respaldo` segundos.
 * `telefono`: sólo ese chat; sin él, todos (la lista).
 */
export default function AlInstante({ telefono = null, respaldo = 15 }) {
  const router = useRouter();
  useEffect(() => {
    let espera = null;
    const refrescar = () => {
      clearTimeout(espera);
      espera = setTimeout(() => router.refresh(), 300); // varios avisos juntos = un solo refresco
    };

    const supabase = createClient();
    const canal = supabase
      .channel(`mensajes-${telefono || "todos"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_mensajes", ...(telefono ? { filter: `telefono=eq.${telefono}` } : {}) },
        refrescar
      )
      .subscribe();

    const alVolver = () => document.visibilityState === "visible" && refrescar();
    document.addEventListener("visibilitychange", alVolver);
    const t = setInterval(() => document.visibilityState === "visible" && router.refresh(), respaldo * 1000);

    return () => {
      clearTimeout(espera);
      clearInterval(t);
      document.removeEventListener("visibilitychange", alVolver);
      supabase.removeChannel(canal);
    };
  }, [router, telefono, respaldo]);
  return null;
}
