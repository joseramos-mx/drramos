"use client";

import { useEffect, useState } from "react";
import { BellRingingIcon, BellSlashIcon } from "@phosphor-icons/react";
import { borrarAvisoAction, guardarAvisoAction } from "./actions";

const LLAVE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function llaveBytes(base64) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b = atob((base64 + relleno).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

function nombreAparato() {
  const ua = navigator.userAgent;
  const so = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad" : /iPhone/.test(ua) ? "iPhone" : /Android/.test(ua) ? "Android" : "Computadora";
  return `${so} · ${new Date().toLocaleDateString("es-MX")}`;
}

/**
 * Activa los avisos de mensajes nuevos en ESTE aparato (celular, iPad).
 * En iPhone/iPad sólo funciona con la app agregada a la pantalla de inicio.
 */
export default function Avisos({ compacto = false }) {
  // cargando | sin-soporte | instalar-ios | sin-llave | bloqueado | apagado | activo
  const [estado, setEstado] = useState("cargando");
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    (async () => {
      const ios = /iPad|iPhone/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
      const instalada = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
      if (!("serviceWorker" in navigator)) return setEstado("sin-soporte");
      const reg = await navigator.serviceWorker.register("/sw-mensajes.js").catch(() => null);
      if (!("PushManager" in window) || !reg) return setEstado(ios && !instalada ? "instalar-ios" : "sin-soporte");
      if (!LLAVE) return setEstado("sin-llave");
      if (Notification.permission === "denied") return setEstado("bloqueado");
      const sub = await reg.pushManager.getSubscription();
      setEstado(sub ? "activo" : "apagado");
    })();
  }, []);

  async function activar() {
    setOcupado(true);
    setError(null);
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") return setEstado(permiso === "denied" ? "bloqueado" : "apagado");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: llaveBytes(LLAVE) });
      const res = await guardarAvisoAction(JSON.parse(JSON.stringify(sub)), nombreAparato());
      if (res?.error) {
        await sub.unsubscribe();
        return setError(res.error);
      }
      setEstado("activo");
    } catch {
      setError("No se pudieron activar los avisos en este aparato.");
    } finally {
      setOcupado(false);
    }
  }

  async function apagar() {
    setOcupado(true);
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await borrarAvisoAction(sub.endpoint);
      await sub.unsubscribe();
    }
    setEstado("apagado");
    setOcupado(false);
  }

  async function probar() {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification("María López (prueba)", {
      body: "Te escribió por WhatsApp",
      icon: "/fav/android-chrome-192x192.png",
      data: { url: "/crm/mensajes" },
    });
  }

  if (estado === "cargando" || estado === "sin-llave") return null;

  // En la bandeja: una sola línea, y sólo si falta activarlos
  if (compacto) {
    if (estado !== "apagado" && estado !== "instalar-ios") return null;
    return (
      <div className="mx-5 mb-3 flex items-center gap-3 rounded-2xl bg-[#fbf6ec] px-4 py-3 text-[16px] text-[#3d372f]">
        <BellSlashIcon size={24} className="shrink-0 text-[#8a6d3f]" />
        {estado === "apagado" ? (
          <>
            <span className="flex-1">Activa los avisos para que te suene el celular.</span>
            <button
              type="button"
              onClick={activar}
              disabled={ocupado}
              className="h-11 shrink-0 rounded-full bg-[#1c1a17] px-4 text-[15px] font-semibold text-white disabled:opacity-50"
            >
              Activar
            </button>
          </>
        ) : (
          <span className="flex-1">Para recibir avisos: Compartir → Agregar a inicio.</span>
        )}
      </div>
    );
  }

  const caja = "mt-3 flex flex-wrap items-center gap-3 rounded-[22px] bg-white px-5 py-4 text-[17px] leading-snug text-[#3d372f] shadow-[0_1px_3px_rgba(28,26,23,0.08)]";
  const boton = "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-[16px] font-semibold disabled:opacity-50";

  if (estado === "instalar-ios") {
    return (
      <p className={caja}>
        Para recibir avisos en el iPhone o iPad: toca <strong>Compartir</strong> →{" "}
        <strong>Agregar a inicio</strong>, abre “Mensajes” desde ese ícono y vuelve aquí.
      </p>
    );
  }
  if (estado === "sin-soporte") {
    return <p className={caja}>Este navegador no puede mostrar avisos. En Android usa Chrome; en iPhone/iPad, Safari.</p>;
  }
  if (estado === "bloqueado") {
    return (
      <p className={caja}>
        Los avisos están bloqueados en este aparato. Ábrelos en los ajustes del navegador (candado junto a la dirección →
        Notificaciones → Permitir) y recarga.
      </p>
    );
  }

  return (
    <div className={caja}>
      {estado === "activo" ? (
        <>
          <BellRingingIcon size={28} weight="fill" className="text-[#b89968]" />
          <span className="flex-1">Avisos activados: te sonará cuando escriba un paciente.</span>
          <button type="button" onClick={probar} className={`${boton} border-2 border-[#1c1a17]/15 bg-white text-[#1c1a17]`}>
            Probar aviso
          </button>
          <button type="button" onClick={apagar} disabled={ocupado} className={`${boton} text-[#8b8478] underline underline-offset-4`}>
            Apagar
          </button>
        </>
      ) : (
        <>
          <BellSlashIcon size={28} className="text-[#8b8478]" />
          <span className="flex-1">Activa los avisos para que te suene el celular cuando escriba un paciente.</span>
          <button type="button" onClick={activar} disabled={ocupado} className={`${boton} w-full bg-[#1c1a17] text-[#f5f1ea] sm:w-auto`}>
            Activar avisos
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="w-full text-[15px] font-medium text-[#9b2424]">
          {error}
        </p>
      )}
    </div>
  );
}
