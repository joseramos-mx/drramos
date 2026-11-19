import { diaDe } from "../lib";
import AlFinal from "../al-final";
import Globo from "./globo";

/** Los mensajes del chat con su encabezado de día ("Hoy", "Ayer"…). */
export default function Chat({ mensajes, archivoUrlDe }) {
  let diaAnterior = null;
  const porWaId = new Map(mensajes.filter((m) => m.wa_id).map((m) => [m.wa_id, m]));
  return (
    <ol className="flex-1 space-y-2.5 py-3">
      {mensajes.map((m, i) => {
        // Contestó citando un mensaje: se muestra cuál, salvo que sea justo el anterior (no hace falta)
        const citado = m.responde_a ? porWaId.get(m.responde_a) || { perdido: true } : null;
        const cita = citado && citado !== mensajes[i - 1] ? citado : null;
        const dia = diaDe(m.enviado_en);
        const nuevoDia = dia !== diaAnterior;
        diaAnterior = dia;
        return [
          nuevoDia && (
            <li key={`dia-${m.id}`} className="flex justify-center py-2">
              <span className="rounded-full bg-white/80 px-4 py-1 text-[14px] font-semibold capitalize text-[#7a7368] shadow-[0_1px_2px_rgba(28,26,23,0.08)]">
                {dia}
              </span>
            </li>
          ),
          <Globo key={m.id} m={m} cita={cita} archivoUrl={archivoUrlDe?.(m)} />,
        ];
      })}
      <li aria-hidden>
        <AlFinal cuantos={mensajes.length} />
      </li>
    </ol>
  );
}
