import { CheckIcon, ChecksIcon, FileTextIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { horaDe, resumenDe, separarBotones } from "../lib";

/**
 * Un mensaje del chat. Fotos, audios, videos y documentos se abren con
 * /crm/mensajes/archivo/[id] (link firmado al bucket privado).
 */
export default function Globo({ m, archivoUrl, cita = null }) {
  const mio = m.direccion === "salida";
  const url = archivoUrl || `/crm/mensajes/archivo/${m.id}`;
  const tieneArchivo = Boolean(m.media_id || m.media_ruta || archivoUrl);
  // "[Botones: A · B]" al final del texto → botoncitos, como los ve el paciente
  const { texto, botones } = separarBotones(m.texto);

  return (
    <li className={`flex ${mio ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-[20px] p-1 shadow-[0_1px_1px_rgba(28,26,23,0.08)] sm:max-w-[75%] ${
          mio ? "rounded-br-md bg-[#efe3cc]" : "rounded-bl-md bg-white"
        }`}
      >
        {cita && (
          // A qué mensaje contesta (como en WhatsApp: una cajita arriba con el mensaje citado)
          <div className="mx-1 mt-1 rounded-[14px] border-l-4 border-[#b89968] bg-[#1c1a17]/[0.05] px-3 py-1.5">
            <p className="text-[13px] font-semibold text-[#8a6d3f]">
              {cita.perdido ? "Contestó a un mensaje anterior" : cita.direccion === "salida" ? "Contestó a tu mensaje" : "Contestó a su mensaje"}
            </p>
            {!cita.perdido && <p className="line-clamp-2 text-[15px] leading-snug text-[#5b544a]">{separarBotones(resumenDe(cita)).texto}</p>}
          </div>
        )}
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
        {texto ? (
          <p className="whitespace-pre-wrap break-words px-3 pt-1.5 text-[17px] leading-[1.4] text-[#1c1a17]">{texto}</p>
        ) : (
          !tieneArchivo && (
            <p className="px-3 pt-1.5 text-[16px] italic text-[#5b544a]">
              Este mensaje no se puede ver aquí. Pídele al paciente que lo mande como texto o foto.
            </p>
          )
        )}
        {botones.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1 px-1" aria-label="Botones que le aparecen al paciente">
            {botones.map((b) => (
              <span key={b} className="flex h-10 items-center justify-center rounded-[14px] bg-white/70 px-3 text-center text-[16px] font-semibold text-[#8a6d3f]">
                {b}
              </span>
            ))}
          </div>
        )}
        <p className="px-3 pb-0.5 pt-1 text-right text-[13px] tabular-nums text-[#8b8478]">
          {horaDe(m.enviado_en)}
          {m.via === "app" && " · desde el celular"}
          {m.via === "asistente" && " · asistente"}
          {m.via === "recordatorio" && " · recordatorio automático"}
          {mio && <Estado estado={m.estado} />}
        </p>
        {mio && m.estado === "failed" && (
          <p className="mx-1 mb-1 flex items-start gap-2 rounded-[14px] bg-[#fbe9e7] px-3 py-2 text-[15px] leading-snug text-[#8a2a1c]">
            <WarningCircleIcon size={20} weight="fill" className="mt-0.5 shrink-0" />
            <span>
              <span className="block font-semibold">No le llegó.</span>
              {m.estado_error || "Meta no lo entregó."}
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

/** Palomitas como en WhatsApp: una = enviado, dos = le llegó, dos doradas = lo leyó. */
function Estado({ estado }) {
  if (estado === "sent") return <CheckIcon size={15} weight="bold" className="ml-1 inline align-[-2px]" aria-label="Enviado" />;
  if (estado === "delivered") return <ChecksIcon size={15} weight="bold" className="ml-1 inline align-[-2px]" aria-label="Le llegó" />;
  if (estado === "read") return <ChecksIcon size={15} weight="bold" className="ml-1 inline align-[-2px] text-[#b89968]" aria-label="Lo leyó" />;
  return null;
}
