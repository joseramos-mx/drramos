import { FileTextIcon } from "@phosphor-icons/react/dist/ssr";
import { horaDe } from "../lib";

/**
 * Un mensaje del chat. Fotos, audios, videos y documentos se abren con
 * /crm/mensajes/archivo/[id] (link firmado al bucket privado).
 */
export default function Globo({ m, archivoUrl }) {
  const mio = m.direccion === "salida";
  const url = archivoUrl || `/crm/mensajes/archivo/${m.id}`;
  const tieneArchivo = Boolean(m.media_id || m.media_ruta || archivoUrl);

  return (
    <li className={`flex ${mio ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] border px-2 py-2 sm:max-w-[70%] ${
          mio ? "border-[#b89968]/40 bg-[#b89968]/[0.14]" : "border-white/[0.1] bg-white/[0.04]"
        }`}
      >
        {tieneArchivo && (m.tipo === "image" || m.tipo === "sticker") && (
          <a href={url} target="_blank" rel="noopener" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Foto" className="max-h-[320px] w-auto max-w-full bg-white/[0.04] object-contain" />
          </a>
        )}
        {tieneArchivo && m.tipo === "audio" && <audio controls preload="none" src={url} className="w-[260px] max-w-full" />}
        {tieneArchivo && m.tipo === "video" && <video controls preload="none" src={url} className="max-h-[320px] max-w-full" />}
        {tieneArchivo && m.tipo === "document" && (
          <a href={url} target="_blank" rel="noopener" className="flex items-center gap-2 px-1.5 py-1 font-[family-name:var(--font-albert)] text-[15px] text-[#f5f1ea] underline decoration-[#b89968]/60 underline-offset-4">
            <FileTextIcon size={22} /> Abrir documento
          </a>
        )}
        {m.texto ? (
          <p className="whitespace-pre-wrap break-words px-1.5 pt-1 font-[family-name:var(--font-albert)] text-[15px] leading-snug text-[#f5f1ea]">
            {m.texto}
          </p>
        ) : (
          !tieneArchivo && (
            <p className="px-1.5 font-[family-name:var(--font-albert)] text-[14px] italic text-white/55">
              Mensaje que no se puede mostrar aquí ({m.tipo || "desconocido"}). Pídele que lo mande como texto o foto.
            </p>
          )
        )}
        <p className="mt-1 px-1.5 text-right font-[family-name:var(--font-albert)] text-[11px] tabular-nums text-white/50">
          {horaDe(m.enviado_en)}
          {m.via === "app" && " · desde el celular"}
        </p>
      </div>
    </li>
  );
}
