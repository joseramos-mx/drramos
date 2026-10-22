import { diaDe } from "../lib";
import AlFinal from "../al-final";
import Globo from "./globo";

/** Los mensajes del chat con su encabezado de día ("Hoy", "Ayer"…). */
export default function Chat({ mensajes, archivoUrlDe }) {
  let diaAnterior = null;
  return (
    <ol className="flex-1 space-y-2.5 py-3">
      {mensajes.map((m) => {
        const dia = diaDe(m.enviado_en);
        const nuevoDia = dia !== diaAnterior;
        diaAnterior = dia;
        return [
          nuevoDia && (
            <li key={`dia-${m.id}`} className="flex justify-center py-2">
              <span className="rounded-full bg-[#e9e1d2] px-4 py-1.5 text-[15px] font-semibold capitalize text-[#5b544a]">
                {dia}
              </span>
            </li>
          ),
          <Globo key={m.id} m={m} archivoUrl={archivoUrlDe?.(m)} />,
        ];
      })}
      <li aria-hidden>
        <AlFinal cuantos={mensajes.length} />
      </li>
    </ol>
  );
}
