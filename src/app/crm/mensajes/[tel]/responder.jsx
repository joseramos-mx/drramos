"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ImageIcon, LightningIcon, PaperPlaneRightIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { enviarFotoAction, enviarMensajeAction } from "../actions";
import { RESPUESTAS_RAPIDAS } from "../respuestas";
import Hoja from "../hoja";

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

const campo =
  "w-full rounded-[26px] border-0 bg-[#f2efe9] px-5 text-[18px] leading-snug text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-2 focus:outline-[#b89968]";
const redondo = "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full";

/**
 * Barra para contestar, como WhatsApp: [+] [mensaje] [enviar]. El "+"
 * abre las fotos y las respuestas rápidas del manual (se pueden editar
 * antes de mandar). Aviso claro si ya pasaron 24 h.
 */
export default function Responder({ telefono, abierta, conectado }) {
  const [state, formAction] = useActionState(enviarMensajeAction, null);
  const [texto, setTexto] = useState("");
  const [menu, setMenu] = useState(false);
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
      <p className="px-2 py-2 text-[16px] text-[#7a7368]">
        WhatsApp todavía no está conectado: aquí se podrá contestar cuando el número del consultorio esté dado de alta.
      </p>
    );
  }

  if (!abierta) {
    return (
      <p className="px-2 py-2 text-[16px] leading-snug text-[#3d372f]">
        ⏰ Pasaron más de 24 horas desde su último mensaje y WhatsApp ya no deja contestarle. Si vuelve a escribir, podrás
        contestarle aquí. Si es urgente, márcale por teléfono (menú ⋮).
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
      <div className="space-y-2.5">
        <div className="relative mx-auto w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt="Foto por mandar" className="max-h-[38vh] max-w-full rounded-[20px]" />
          <button
            type="button"
            onClick={() => setFoto(null)}
            aria-label="Quitar foto"
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1a17]/75 text-white"
          >
            <XIcon size={22} weight="bold" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pie" className="sr-only">Texto de la foto</label>
          <input id="pie" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Texto (opcional)" className={`h-[52px] ${campo}`} />
          <button type="button" onClick={mandarFoto} disabled={mandandoFoto} aria-label="Mandar foto" className={`${redondo} bg-[#b89968] text-white disabled:opacity-40`}>
            <PaperPlaneRightIcon size={24} weight="fill" />
          </button>
        </div>
        {(errorFoto || mandandoFoto) && (
          <p role={errorFoto ? "alert" : "status"} className={`px-2 text-[16px] font-medium ${errorFoto ? "text-[#c0392b]" : "text-[#7a7368]"}`}>
            {errorFoto || "Mandando foto…"}
          </p>
        )}
      </div>
    );
  }

  const fila = "flex w-full items-center gap-4 px-5 py-3.5 text-left active:bg-[#f5f1ea]";
  return (
    <form action={formAction}>
      <input type="hidden" name="telefono" value={telefono} />
      <input ref={selector} type="file" accept="image/*" onChange={elegirFoto} className="hidden" />
      <div className="flex items-end gap-2">
        <button type="button" onClick={() => setMenu(true)} aria-label="Fotos y respuestas rápidas" className={`${redondo} bg-[#f2efe9] text-[#1c1a17]`}>
          <PlusIcon size={26} weight="bold" />
        </button>
        <label htmlFor="respuesta" className="sr-only">Mensaje</label>
        <textarea
          id="respuesta"
          ref={ref}
          name="texto"
          rows={Math.min(5, Math.max(1, texto.split("\n").length + Math.floor(texto.length / 30)))}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Mensaje"
          className={`min-h-[52px] resize-none py-3.5 ${campo}`}
        />
        <Enviar disabled={!texto.trim()} />
      </div>
      {state?.error && (
        <p role="alert" className="px-2 pt-2 text-[16px] font-medium text-[#c0392b]">
          {state.error}
        </p>
      )}

      <Hoja abierta={menu} onCerrar={() => setMenu(false)} titulo="Agregar">
        <button
          type="button"
          onClick={() => {
            setMenu(false);
            selector.current?.click();
          }}
          className={`${fila} text-[18px] font-semibold text-[#1c1a17]`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efe3cc] text-[#8a6d3f]">
            <ImageIcon size={24} weight="fill" />
          </span>
          Mandar una foto
        </button>
        <p className="flex items-center gap-2 px-5 pb-1 pt-4 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">
          <LightningIcon size={16} weight="fill" /> Respuestas rápidas
        </p>
        {RESPUESTAS_RAPIDAS.map((r) => (
          <button
            key={r.titulo}
            type="button"
            onClick={() => {
              setTexto(r.texto);
              setMenu(false);
              setTimeout(() => ref.current?.focus(), 50);
            }}
            className="flex w-full flex-col items-start gap-0.5 border-t border-[#1c1a17]/[0.06] px-5 py-3.5 text-left active:bg-[#f5f1ea]"
          >
            <span className="text-[18px] font-semibold text-[#1c1a17]">{r.titulo}</span>
            <span className="line-clamp-2 text-[15px] text-[#7a7368]">{r.texto}</span>
          </button>
        ))}
      </Hoja>
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
      className={`${redondo} bg-[#b89968] text-white disabled:bg-[#e6dccb]`}
    >
      <PaperPlaneRightIcon size={24} weight="fill" />
    </button>
  );
}
