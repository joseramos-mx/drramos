"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ImageIcon, PaperPlaneRightIcon, XIcon } from "@phosphor-icons/react";
import { enviarFotoAction, enviarMensajeAction } from "../actions";
import { RESPUESTAS_RAPIDAS } from "../respuestas";

/**
 * Reduce la foto en el navegador (lado mayor 1600 px, JPEG) para que
 * suba rápido con datos móviles y quepa en el límite de WhatsApp.
 */
async function reducirFoto(archivo) {
  const img = await createImageBitmap(archivo).catch(() => null);
  if (!img) return archivo;
  const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : archivo;
}

/**
 * Caja para contestar: respuestas rápidas del manual en un toque (se
 * pueden editar antes de mandar), fotos, y aviso claro si ya pasaron 24 h.
 */
export default function Responder({ telefono, abierta, conectado }) {
  const [state, formAction] = useActionState(enviarMensajeAction, null);
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState(null); // { archivo, url }
  const [errorFoto, setErrorFoto] = useState(null);
  const [mandandoFoto, startFoto] = useTransition();
  const ref = useRef(null);
  const selector = useRef(null);

  useEffect(() => {
    if (state?.ok) setTexto("");
  }, [state]);

  useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto]);

  if (!conectado) {
    return (
      <p className="font-[family-name:var(--font-albert)] text-[14px] text-white/70">
        WhatsApp todavía no está conectado: aquí se podrá contestar cuando el número del consultorio esté dado de alta.
      </p>
    );
  }

  if (!abierta) {
    return (
      <p className="border border-white/[0.12] p-3 font-[family-name:var(--font-albert)] text-[14px] text-white/80">
        Pasaron más de 24 horas desde el último mensaje del paciente. WhatsApp sólo permite mandarle un mensaje con
        formato aprobado (por ejemplo, recordatorio de cita). Si el paciente vuelve a escribir, se puede contestar aquí.
      </p>
    );
  }

  async function elegirFoto(e) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setErrorFoto(null);
    const reducida = await reducirFoto(archivo);
    setFoto({ archivo: reducida, url: URL.createObjectURL(reducida) });
  }

  function mandarFoto() {
    const datos = new FormData();
    datos.set("telefono", telefono);
    datos.set("foto", foto.archivo);
    datos.set("pie", texto);
    startFoto(async () => {
      const res = await enviarFotoAction(null, datos);
      if (res?.error) return setErrorFoto(res.error);
      setFoto(null);
      setTexto("");
    });
  }

  if (foto) {
    return (
      <div className="space-y-2">
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt="Foto por mandar" className="max-h-[40vh] max-w-full border border-white/[0.15]" />
          <button
            type="button"
            onClick={() => setFoto(null)}
            aria-label="Quitar foto"
            className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center bg-black/70 text-[#f5f1ea]"
          >
            <XIcon size={20} />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <label htmlFor="pie" className="sr-only">Texto de la foto</label>
          <input
            id="pie"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Agrega un texto (opcional)…"
            className="min-h-[52px] w-full border border-white/[0.22] bg-[#0d0d0d] px-3 font-[family-name:var(--font-albert)] text-[16px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none"
          />
          <button
            type="button"
            onClick={mandarFoto}
            disabled={mandandoFoto}
            aria-label="Mandar foto"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-[#f5f1ea] text-[#000000] hover:bg-white disabled:opacity-40"
          >
            <PaperPlaneRightIcon size={22} weight="fill" />
          </button>
        </div>
        {(errorFoto || mandandoFoto) && (
          <p role={errorFoto ? "alert" : "status"} className={`font-[family-name:var(--font-albert)] text-[13px] ${errorFoto ? "text-[#ff7a7a]" : "text-white/65"}`}>
            {errorFoto || "Mandando foto…"}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="telefono" value={telefono} />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {RESPUESTAS_RAPIDAS.map((r) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => {
              setTexto(r.texto);
              ref.current?.focus();
            }}
            className="shrink-0 border border-white/[0.22] px-3 py-1.5 font-[family-name:var(--font-albert)] text-[13px] text-white/85 hover:border-[#b89968]"
          >
            {r.titulo}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <input ref={selector} type="file" accept="image/*" onChange={elegirFoto} className="hidden" />
        <button
          type="button"
          onClick={() => selector.current?.click()}
          aria-label="Mandar foto"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-white/[0.22] text-white/85 hover:border-[#b89968]"
        >
          <ImageIcon size={24} />
        </button>
        <label htmlFor="respuesta" className="sr-only">Respuesta</label>
        <textarea
          id="respuesta"
          ref={ref}
          name="texto"
          rows={Math.min(6, Math.max(2, texto.split("\n").length + Math.floor(texto.length / 60)))}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="min-h-[52px] w-full resize-none border border-white/[0.22] bg-[#0d0d0d] px-3 py-2.5 font-[family-name:var(--font-albert)] text-[16px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none"
        />
        <Enviar disabled={!texto.trim()} />
      </div>
      {state?.error && (
        <p role="alert" className="font-[family-name:var(--font-albert)] text-[13px] text-[#ff7a7a]">
          {state.error}
        </p>
      )}
    </form>
  );
}

function Enviar({ disabled }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-label="Enviar"
      className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-[#f5f1ea] text-[#000000] hover:bg-white disabled:opacity-40"
    >
      <PaperPlaneRightIcon size={22} weight="fill" />
    </button>
  );
}
