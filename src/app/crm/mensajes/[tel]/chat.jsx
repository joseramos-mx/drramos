import { diaDe } from "../lib";
import AlFinal from "../al-final";
import Globo from "./globo";

/** Los mensajes del chat con su encabezado de día ("Hoy", "Ayer"…). */
export default function Chat({ mensajes, archivoUrlDe }) {
  let diaAnterior = null;
  return (
    <ol className="flex-1 space-y-2 py-4">
      {mensajes.map((m) => {
        const dia = diaDe(m.enviado_en);
        const nuevoDia = dia !== diaAnterior;
        diaAnterior = dia;
        return [
          nuevoDia && (
            <li key={`dia-${m.id}`} className="flex justify-center py-2">
              <span className="border border-white/[0.1] bg-white/[0.04] px-3 py-1 font-[family-name:var(--font-albert)] text-[12px] font-medium uppercase tracking-[0.12em] text-white/65">
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
