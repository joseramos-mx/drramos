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
        className={`max-w-[88%] rounded-[20px] p-1 shadow-[0_1px_1px_rgba(28,26,23,0.08)] sm:max-w-[75%] ${
          mio ? "rounded-br-md bg-[#efe3cc]" : "rounded-bl-md bg-white"
        }`}
      >
        {tieneArchivo && (m.tipo === "image" || m.tipo === "sticker") && (
          <a href={url} target="_blank" rel="noopener" className="block overflow-hidden rounded-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Foto" className="max-h-[340px] w-auto max-w-full object-contain" />
          </a>
        )}
        {tieneArchivo && m.tipo === "audio" && <audio controls preload="none" src={url} className="w-[270px] max-w-full" />}
        {tieneArchivo && m.tipo === "video" && <video controls preload="none" src={url} className="max-h-[340px] max-w-full rounded-[18px]" />}
        {tieneArchivo && m.tipo === "document" && (
          <a href={url} target="_blank" rel="noopener" className="flex h-14 items-center gap-2 rounded-[18px] bg-[#f5f1ea] px-4 text-[17px] font-semibold text-[#1c1a17]">
            <FileTextIcon size={26} /> Abrir documento
          </a>
        )}
        {m.texto ? (
          <p className="whitespace-pre-wrap break-words px-3 pt-1.5 text-[17px] leading-[1.4] text-[#1c1a17]">{m.texto}</p>
        ) : (
          !tieneArchivo && (
            <p className="px-3 pt-1.5 text-[16px] italic text-[#5b544a]">
              Este mensaje no se puede ver aquí. Pídele al paciente que lo mande como texto o foto.
            </p>
          )
        )}
        <p className="px-3 pb-0.5 pt-1 text-right text-[13px] tabular-nums text-[#8b8478]">
          {horaDe(m.enviado_en)}
          {m.via === "app" && " · desde el celular"}
          {m.via === "asistente" && " · 🤖 asistente"}
          {m.via === "recordatorio" && " · recordatorio automático"}
        </p>
      </div>
    </li>
  );
}
