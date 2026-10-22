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
export default function Avisos() {
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

  const caja = "mt-6 flex flex-wrap items-center gap-3 border border-white/[0.12] p-4 font-[family-name:var(--font-albert)] text-[14px] text-white/80";
  const boton = "inline-flex min-h-[44px] items-center gap-2 px-4 text-[14px] font-medium disabled:opacity-50";

  if (estado === "instalar-ios") {
    return (
      <p className={caja}>
        Para recibir avisos en el iPhone o iPad: toca <strong className="text-[#f5f1ea]">Compartir</strong> →{" "}
        <strong className="text-[#f5f1ea]">Agregar a inicio</strong>, abre “Mensajes” desde ese ícono y vuelve aquí.
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
          <BellRingingIcon size={22} className="text-[#b89968]" />
          <span className="flex-1">Avisos activados en este aparato: te sonará cuando escriba un paciente.</span>
          <button type="button" onClick={probar} className={`${boton} border border-white/[0.22] text-white/85 hover:border-[#b89968]`}>
            Probar aviso
          </button>
          <button type="button" onClick={apagar} disabled={ocupado} className={`${boton} text-white/60 hover:text-[#f5f1ea]`}>
            Apagar
          </button>
        </>
      ) : (
        <>
          <BellSlashIcon size={22} className="text-white/60" />
          <span className="flex-1">Activa los avisos para que te suene el celular cuando escriba un paciente.</span>
          <button type="button" onClick={activar} disabled={ocupado} className={`${boton} bg-[#f5f1ea] text-[#000000] hover:bg-white`}>
            Activar avisos
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="w-full text-[13px] text-[#ff7a7a]">
          {error}
        </p>
      )}
    </div>
  );
}
