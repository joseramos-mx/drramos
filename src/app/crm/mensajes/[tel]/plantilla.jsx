"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import Hoja from "../hoja";
import { enviarPlantillaAction } from "../actions";
import { PLANTILLAS, rellenar } from "../plantillas";

/**
 * Cuando el paciente no ha escrito (o pasaron 24 h), WhatsApp sólo deja
 * mandar un mensaje aprobado. Aquí se elige, se llenan sus datos (el
 * nombre ya viene puesto) y se ve cómo le va a llegar antes de mandarlo.
 */
export default function Plantilla({ telefono, nombre, nuevo }) {
  const [abierta, setAbierta] = useState(false);
  const [elegida, setElegida] = useState(null);
  const [valores, setValores] = useState([]);
  const [state, formAction] = useActionState(enviarPlantillaAction, null);

  useEffect(() => {
    if (state?.ok) {
      setAbierta(false);
      setElegida(null);
    }
  }, [state]);

  function elegir(p) {
    const primerNombre = (nombre || "").replace(/^WhatsApp .*/, "").split(" ")[0];
    setElegida(p);
    setValores(p.campos.map((_, i) => (i === 0 ? primerNombre : "")));
  }

  const campo =
    "h-14 w-full rounded-full bg-[#f2efe9] px-5 text-[18px] text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b89968]";

  return (
    <div className="space-y-2 px-1 py-1">
      <p className="text-[16px] leading-snug text-[#3d372f]">
        {nuevo
          ? "Este paciente todavía no te ha escrito. Para empezar, WhatsApp sólo deja mandar un mensaje aprobado."
          : "⏰ Pasaron más de 24 horas desde su último mensaje. Para volver a escribirle, manda un mensaje aprobado."}
      </p>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#b89968] text-[18px] font-bold text-white"
      >
        <PaperPlaneRightIcon size={22} weight="fill" /> Mandar mensaje para iniciar
      </button>

      <Hoja abierta={abierta} onCerrar={() => setAbierta(false)} titulo={elegida ? elegida.titulo : "Elige el mensaje"}>
        {!elegida ? (
          <ul>
            {PLANTILLAS.map((p) => (
              <li key={p.nombre}>
                <button
                  type="button"
                  onClick={() => elegir(p)}
                  className="flex w-full flex-col items-start gap-0.5 border-t border-[#1c1a17]/[0.06] px-5 py-3.5 text-left active:bg-[#f5f1ea]"
                >
                  <span className="text-[18px] font-semibold text-[#1c1a17]">{p.titulo}</span>
                  <span className="line-clamp-2 text-[15px] text-[#7a7368]">{p.texto}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <form action={formAction} className="space-y-3 px-5 pb-2 pt-1">
            <input type="hidden" name="telefono" value={telefono} />
            <input type="hidden" name="plantilla" value={elegida.nombre} />
            {elegida.campos.map((etiqueta, i) => (
              <label key={etiqueta} className="block">
                <span className="mb-1 block px-2 text-[15px] font-semibold text-[#5b544a]">{etiqueta}</span>
                <input
                  name={`v${i}`}
                  autoComplete="off"
                  autoCapitalize={i === 0 ? "words" : "sentences"}
                  enterKeyHint={i === elegida.campos.length - 1 ? "done" : "next"}
                  value={valores[i] || ""}
                  onChange={(e) => setValores((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                  className={campo}
                />
              </label>
            ))}
            <p className="px-2 pt-1 text-[14px] font-semibold uppercase tracking-wide text-[#9a9388]">Así le llega</p>
            <p className="rounded-[20px] rounded-br-md bg-[#efe3cc] px-4 py-3 text-[17px] leading-snug text-[#1c1a17]">
              {rellenar(elegida.texto, valores.map((v) => v.trim() || "____"))}
            </p>
            {state?.error && (
              <p role="alert" className="px-2 text-[16px] font-medium text-[#c0392b]">
                {state.error}
              </p>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setElegida(null)} className="h-14 flex-1 rounded-full bg-[#f2efe9] text-[17px] font-semibold text-[#1c1a17]">
                Otro mensaje
              </button>
              <Mandar />
            </div>
          </form>
        )}
      </Hoja>
    </div>
  );
}

function Mandar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="h-14 flex-1 rounded-full bg-[#1c1a17] text-[17px] font-semibold text-white disabled:opacity-50">
      {pending ? "Mandando…" : "Mandar"}
    </button>
  );
}
