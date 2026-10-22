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
      <p className="rounded-[22px] bg-white p-4 text-[17px] text-[#5b544a]">
        WhatsApp todavía no está conectado: aquí se podrá contestar cuando el número del consultorio esté dado de alta.
      </p>
    );
  }

  if (!abierta) {
    return (
      <p className="rounded-[22px] bg-white p-4 text-[17px] leading-snug text-[#3d372f]">
        ⏰ Pasaron más de 24 horas desde el último mensaje del paciente, y WhatsApp ya no deja contestarle libre. Si el
        paciente vuelve a escribir, podrás contestarle aquí. Si es urgente, márcale por teléfono.
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
          <img src={foto.url} alt="Foto por mandar" className="max-h-[40vh] max-w-full rounded-[22px]" />
          <button
            type="button"
            onClick={() => setFoto(null)}
            aria-label="Quitar foto"
            className="absolute right-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1a17]/80 text-white"
          >
            <XIcon size={24} weight="bold" />
          </button>
        </div>
        <div className="flex items-end gap-2">
          <label htmlFor="pie" className="sr-only">Texto de la foto</label>
          <input
            id="pie"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Texto (opcional)…"
            className="h-14 w-full rounded-full border-2 border-[#1c1a17]/10 bg-white px-5 text-[18px] text-[#1c1a17] placeholder:text-[#8b8478] focus:border-[#b89968] focus:outline-none"
          />
          <button
            type="button"
            onClick={mandarFoto}
            disabled={mandandoFoto}
            aria-label="Mandar foto"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1c1a17] text-[#f5f1ea] disabled:opacity-30"
          >
            <PaperPlaneRightIcon size={26} weight="fill" />
          </button>
        </div>
        {(errorFoto || mandandoFoto) && (
          <p role={errorFoto ? "alert" : "status"} className={`text-[16px] font-medium ${errorFoto ? "text-[#9b2424]" : "text-[#5b544a]"}`}>
            {errorFoto || "Mandando foto…"}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="telefono" value={telefono} />
      <p className="text-[14px] font-semibold text-[#8b8478]">Respuestas rápidas</p>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RESPUESTAS_RAPIDAS.map((r) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => {
              setTexto(r.texto);
              ref.current?.focus();
            }}
            className="inline-flex h-11 shrink-0 items-center rounded-full border-2 border-[#b89968]/50 bg-white px-4 text-[16px] font-semibold text-[#5e4a26]"
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
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#1c1a17]/10 bg-white text-[#1c1a17]"
        >
          <ImageIcon size={28} />
        </button>
        <label htmlFor="respuesta" className="sr-only">Respuesta</label>
        <textarea
          id="respuesta"
          ref={ref}
          name="texto"
          rows={Math.min(6, Math.max(1, texto.split("\n").length + Math.floor(texto.length / 60)))}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe aquí…"
          className="min-h-14 w-full resize-none rounded-[28px] border-2 border-[#1c1a17]/10 bg-white px-5 py-3.5 text-[18px] leading-snug text-[#1c1a17] placeholder:text-[#8b8478] focus:border-[#b89968] focus:outline-none"
        />
        <Enviar disabled={!texto.trim()} />
      </div>
      {state?.error && (
        <p role="alert" className="text-[16px] font-medium text-[#9b2424]">
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
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1c1a17] text-[#f5f1ea] disabled:opacity-30"
    >
      <PaperPlaneRightIcon size={26} weight="fill" />
    </button>
  );
}
