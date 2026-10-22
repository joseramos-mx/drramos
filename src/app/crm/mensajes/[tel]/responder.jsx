"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { FileTextIcon, ImageIcon, LightningIcon, MicrophoneIcon, PaperPlaneRightIcon, PlusIcon, VideoCameraIcon, XIcon } from "@phosphor-icons/react";
import { createClient } from "@/utils/supabase/client";
import { enviarArchivoAction, enviarFotoAction, enviarMensajeAction, prepararArchivoAction, resolverBorradorAction } from "../actions";
import { ARCHIVOS, BUCKET_MEDIA, pesoLegible } from "../archivos";
import { RESPUESTAS_RAPIDAS } from "../respuestas";
import Hoja from "../hoja";
import Plantilla from "./plantilla";
import NotaDeVoz from "./nota-de-voz";

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
  "w-full rounded-[26px] border-0 bg-[#f2efe9] px-5 text-[18px] leading-snug text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";
const redondo = "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full";

/**
 * Barra para contestar, como WhatsApp: [+] [mensaje] [enviar o 🎤]. El "+"
 * abre fotos, documentos (PDF: facturas, recetas), videos y las
 * respuestas rápidas del manual. Aviso claro si ya pasaron 24 h.
 */
export default function Responder({ telefono, abierta, conectado, nombre, sinMensajes = false, borrador = null }) {
  const [state, formAction] = useActionState(enviarMensajeAction, null);
  const [texto, setTexto] = useState("");
  const [menu, setMenu] = useState(false);
  const [voz, setVoz] = useState(false);
  const [borradorVisible, setBorradorVisible] = useState(Boolean(borrador));
  const [errorBorrador, setErrorBorrador] = useState(null);
  const [resolviendo, startBorrador] = useTransition();
  const [foto, setFoto] = useState(null); // { archivo, url }
  const [errorFoto, setErrorFoto] = useState(null);
  const [mandandoFoto, startFoto] = useTransition();
  const [adjunto, setAdjunto] = useState(null); // { tipo: "video" | "document", archivo, url }
  const [errorAdjunto, setErrorAdjunto] = useState(null);
  const [subiendo, startSubida] = useTransition();
  const ref = useRef(null);
  const selector = useRef(null);
  const selectorVideo = useRef(null);
  const selectorDoc = useRef(null);

  useEffect(() => {
    if (state?.ok) setTexto("");
  }, [state]);

  useEffect(() => () => foto && URL.revokeObjectURL(foto.url), [foto]);
  useEffect(() => () => adjunto?.url && URL.revokeObjectURL(adjunto.url), [adjunto]);

  if (!conectado) {
    return (
      <p className="px-2 py-2 text-[16px] text-[#7a7368]">
        WhatsApp todavía no está conectado: aquí se podrá contestar cuando el número del consultorio esté dado de alta.
      </p>
    );
  }

  if (!abierta) {
    return <Plantilla telefono={telefono} nombre={nombre} nuevo={sinMensajes} />;
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

  function elegirAdjunto(tipo) {
    return (e) => {
      const archivo = e.target.files?.[0];
      e.target.value = "";
      if (!archivo) return;
      setErrorAdjunto(null);
      setAdjunto({ tipo, archivo, url: tipo === "video" ? URL.createObjectURL(archivo) : null });
    };
  }

  // Video/documento: 1) permiso de subida, 2) sube directo al almacén, 3) WhatsApp lo manda
  function mandarAdjunto() {
    const { tipo, archivo } = adjunto;
    startSubida(async () => {
      const prep = await prepararArchivoAction(telefono, tipo, archivo.type, archivo.size, archivo.name);
      if (prep?.error) return setErrorAdjunto(prep.error);
      const { error } = await createClient()
        .storage.from(BUCKET_MEDIA)
        .uploadToSignedUrl(prep.ruta, prep.token, archivo, { contentType: archivo.type });
      if (error) return setErrorAdjunto("No se pudo subir el archivo. Revisa tu internet e intenta de nuevo.");
      const res = await enviarArchivoAction(telefono, tipo, prep.ruta, archivo.type, archivo.name, texto);
      if (res?.error) return setErrorAdjunto(res.error);
      setAdjunto(null);
      setTexto("");
    });
  }

  if (voz) {
    return <NotaDeVoz telefono={telefono} onCerrar={() => setVoz(false)} />;
  }

  if (adjunto) {
    return (
      <div className="space-y-2.5">
        <div className="relative">
          {adjunto.tipo === "video" ? (
            <video src={adjunto.url} controls className="mx-auto max-h-[38vh] max-w-full rounded-[20px] bg-black" />
          ) : (
            <div className="flex items-center gap-3 rounded-[20px] bg-[#f2efe9] p-4 pr-14">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8a6d3f]">
                <FileTextIcon size={28} weight="fill" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[17px] font-semibold text-[#1c1a17]">{adjunto.archivo.name}</span>
                <span className="block text-[15px] text-[#7a7368]">{pesoLegible(adjunto.archivo.size)}</span>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setAdjunto(null)}
            aria-label="Quitar archivo"
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1a17]/75 text-white"
          >
            <XIcon size={22} weight="bold" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pie-archivo" className="sr-only">Texto del archivo</label>
          <input id="pie-archivo" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Texto (opcional)" className={`h-[52px] ${campo}`} />
          <button type="button" onClick={mandarAdjunto} disabled={subiendo} aria-label="Mandar archivo" className={`${redondo} bg-[#b89968] text-white disabled:opacity-40`}>
            <PaperPlaneRightIcon size={24} weight="fill" />
          </button>
        </div>
        {(errorAdjunto || subiendo) && (
          <p role={errorAdjunto ? "alert" : "status"} className={`px-2 text-[16px] font-medium ${errorAdjunto ? "text-[#c0392b]" : "text-[#7a7368]"}`}>
            {errorAdjunto || (adjunto.tipo === "video" ? "Subiendo video… puede tardar un poco." : "Mandando documento…")}
          </p>
        )}
      </div>
    );
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
      <input ref={selectorVideo} type="file" accept={ARCHIVOS.video.tipos.join(",")} onChange={elegirAdjunto("video")} className="hidden" />
      <input ref={selectorDoc} type="file" accept={ARCHIVOS.document.tipos.join(",")} onChange={elegirAdjunto("document")} className="hidden" />
      {borrador && borradorVisible && (
        <div className="mb-2.5 rounded-[20px] border-2 border-dashed border-[#b89968]/60 bg-[#fbf6ec] p-3">
          <p className="px-1 text-[14px] font-semibold uppercase tracking-wide text-[#8a6d3f]">🤖 Respuesta propuesta</p>
          <p className="whitespace-pre-wrap px-1 pt-1 text-[17px] leading-snug text-[#1c1a17]">{borrador.texto}</p>
          <div className="mt-3 flex gap-2">
            {[
              ["mandar", "Mandar", "bg-[#b89968] text-white"],
              ["editar", "Editar", "bg-white text-[#1c1a17]"],
              ["descartar", "Descartar", "bg-white text-[#c0392b]"],
            ].map(([accion, etiqueta, color]) => (
              <button
                key={accion}
                type="button"
                disabled={resolviendo}
                onClick={() =>
                  startBorrador(async () => {
                    setErrorBorrador(null);
                    const res = await resolverBorradorAction(borrador.id, accion);
                    if (res?.error) return setErrorBorrador(res.error);
                    if (accion === "editar") {
                      setTexto(borrador.texto);
                      setTimeout(() => ref.current?.focus(), 50);
                    }
                    setBorradorVisible(false);
                  })
                }
                className={`h-12 flex-1 rounded-full text-[16px] font-semibold disabled:opacity-50 ${color}`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          {errorBorrador && <p role="alert" className="px-1 pt-2 text-[15px] font-medium text-[#c0392b]">{errorBorrador}</p>}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button type="button" onClick={() => setMenu(true)} aria-label="Fotos, documentos, videos y respuestas rápidas" className={`${redondo} bg-[#f2efe9] text-[#1c1a17]`}>
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
        {texto.trim() ? (
          <Enviar />
        ) : (
          <button
            type="button"
            onClick={() => setVoz(true)}
            aria-label="Grabar nota de voz"
            className={`${redondo} bg-[#b89968] text-white`}
          >
            <MicrophoneIcon size={26} weight="fill" />
          </button>
        )}
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
        <button
          type="button"
          onClick={() => {
            setMenu(false);
            selectorDoc.current?.click();
          }}
          className={`${fila} text-[18px] font-semibold text-[#1c1a17]`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4e9f2] text-[#3d5a8a]">
            <FileTextIcon size={24} weight="fill" />
          </span>
          Mandar documento <span className="text-[15px] font-normal text-[#7a7368]">(factura, receta)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMenu(false);
            selectorVideo.current?.click();
          }}
          className={`${fila} text-[18px] font-semibold text-[#1c1a17]`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e3ece4] text-[#3f6b48]">
            <VideoCameraIcon size={24} weight="fill" />
          </span>
          Mandar video <span className="text-[15px] font-normal text-[#7a7368]">(hasta 1 min)</span>
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

function Enviar({ disabled = false }) {
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
