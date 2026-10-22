"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PaperPlaneRightIcon, StopIcon, TrashIcon } from "@phosphor-icons/react";
import { createClient } from "@/utils/supabase/client";
import { enviarArchivoAction, prepararArchivoAction } from "../actions";
import { BUCKET_MEDIA } from "../archivos";
import { webmAOgg } from "./ogg";

const MAX_SEG = 5 * 60;
const redondo = "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full";

/** Formato que mejor sirve para WhatsApp según el navegador. */
function formatoGrabacion() {
  for (const t of ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/mp4"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

const reloj = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Nota de voz como en WhatsApp: empieza a grabar al abrirse; ■ para,
 * se puede escuchar antes, 🗑 la descarta y ➤ la manda. Chrome graba
 * WebM y aquí se pasa a OGG para que llegue como nota de voz.
 */
export default function NotaDeVoz({ telefono, onCerrar }) {
  const [estado, setEstado] = useState("pidiendo"); // pidiendo | grabando | lista | error
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState(null); // { blob, url }
  const [error, setError] = useState(null);
  const [mandando, start] = useTransition();
  const grabadora = useRef(null);
  const flujo = useRef(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
        if (!vivo) return stream.getTracks().forEach((t) => t.stop());
        flujo.current = stream;
        const tipo = formatoGrabacion();
        const rec = new MediaRecorder(stream, tipo ? { mimeType: tipo, audioBitsPerSecond: 32000 } : undefined);
        const trozos = [];
        rec.ondataavailable = (e) => e.data.size && trozos.push(e.data);
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(trozos, { type: rec.mimeType || tipo });
          setAudio({ blob, url: URL.createObjectURL(blob) });
          setEstado("lista");
        };
        grabadora.current = rec;
        rec.start();
        setEstado("grabando");
      } catch {
        setError("No se pudo usar el micrófono. Revisa que la app tenga permiso de micrófono en los ajustes del celular.");
        setEstado("error");
      }
    })();
    return () => {
      vivo = false;
      flujo.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (estado !== "grabando") return;
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [estado]);

  useEffect(() => {
    if (segundos >= MAX_SEG) grabadora.current?.state === "recording" && grabadora.current.stop();
  }, [segundos]);

  useEffect(() => () => audio && URL.revokeObjectURL(audio.url), [audio]);

  function parar() {
    if (grabadora.current?.state === "recording") grabadora.current.stop();
  }

  function descartar() {
    if (grabadora.current?.state === "recording") {
      grabadora.current.onstop = () => flujo.current?.getTracks().forEach((t) => t.stop());
      grabadora.current.stop();
    }
    onCerrar();
  }

  function mandar() {
    start(async () => {
      setError(null);
      let archivo = audio.blob;
      if (archivo.type.includes("webm")) archivo = await webmAOgg(archivo);
      if (!archivo) return setError("No se pudo preparar la nota de voz. Intenta grabarla de nuevo.");
      const mime = archivo.type.includes("ogg") ? "audio/ogg" : "audio/mp4";
      const nombre = mime === "audio/ogg" ? "nota.ogg" : "nota.m4a";

      const prep = await prepararArchivoAction(telefono, "audio", mime, archivo.size, nombre);
      if (prep?.error) return setError(prep.error);
      const { error: e } = await createClient()
        .storage.from(BUCKET_MEDIA)
        .uploadToSignedUrl(prep.ruta, prep.token, archivo, { contentType: mime });
      if (e) return setError("No se pudo subir la nota de voz. Revisa tu internet e intenta de nuevo.");
      const res = await enviarArchivoAction(telefono, "audio", prep.ruta, mime, nombre, "");
      if (res?.error) return setError(res.error);
      onCerrar();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={descartar} aria-label="Borrar nota de voz" className={`${redondo} bg-[#f2efe9] text-[#c0392b]`}>
          <TrashIcon size={24} weight="bold" />
        </button>

        <div className="flex h-[52px] min-w-0 flex-1 items-center gap-3 rounded-full bg-[#f2efe9] px-5">
          {estado === "grabando" && (
            <>
              <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-[#c0392b]" />
              <span className="text-[18px] font-semibold tabular-nums text-[#1c1a17]">{reloj(segundos)}</span>
              <span className="truncate text-[16px] text-[#7a7368]">Grabando…</span>
            </>
          )}
          {estado === "pidiendo" && <span className="text-[16px] text-[#7a7368]">Abriendo micrófono…</span>}
          {estado === "lista" && audio && <audio src={audio.url} controls className="h-10 w-full" />}
          {estado === "error" && <span className="truncate text-[16px] text-[#c0392b]">Sin micrófono</span>}
        </div>

        {estado === "grabando" ? (
          <button type="button" onClick={parar} aria-label="Terminar de grabar" className={`${redondo} bg-[#1c1a17] text-white`}>
            <StopIcon size={24} weight="fill" />
          </button>
        ) : (
          <button
            type="button"
            onClick={mandar}
            disabled={estado !== "lista" || mandando}
            aria-label="Mandar nota de voz"
            className={`${redondo} bg-[#b89968] text-white disabled:bg-[#e6dccb]`}
          >
            <PaperPlaneRightIcon size={24} weight="fill" />
          </button>
        )}
      </div>
      {(error || mandando) && (
        <p role={error ? "alert" : "status"} className={`px-2 text-[16px] font-medium ${error ? "text-[#c0392b]" : "text-[#7a7368]"}`}>
          {error || "Mandando nota de voz…"}
        </p>
      )}
    </div>
  );
}
