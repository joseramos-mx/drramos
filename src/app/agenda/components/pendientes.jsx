"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import {
  agregarPendienteAction,
  borrarPendienteAction,
  cambiarPendienteAction,
} from "../actions";

/**
 * Pendientes del día: lo que la Dra. Gaby anota al pie de la libreta
 * ("llamar a Tía Martha", "factura Sr. Bretado"). Palomita = hecho.
 */
export default function Pendientes({ fecha, items = [], soloLectura = false, sinTitulo = false }) {
  const [state, formAction] = useActionState(agregarPendienteAction, null);
  const [texto, setTexto] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      setTexto("");
      inputRef.current?.focus();
    }
  }, [state]);

  const lista = soloLectura ? items.filter((p) => !p.hecho) : items;

  return (
    <section aria-label="Pendientes del día">
      {!sinTitulo && (
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#5b544a]">
          Pendientes del día
        </p>
      )}

      {lista.length === 0 && soloLectura ? (
        <p className="mt-2 text-[16px] text-[#8b8478]">Nada pendiente.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {lista.map((p) => (
            <Pendiente key={p.id} p={p} soloLectura={soloLectura} />
          ))}
        </ul>
      )}

      {!soloLectura && (
        <form action={formAction} className="mt-2 flex gap-2">
          <input type="hidden" name="fecha" value={fecha} />
          <input
            ref={inputRef}
            name="texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={300}
            autoComplete="off"
            placeholder="Llamar a…, factura…"
            aria-label="Nuevo pendiente"
            className="min-h-[52px] w-full min-w-0 rounded-full border-0 bg-[#f2efe9] px-4 text-[17px] text-[#1c1a17] placeholder:text-[#8b8478] focus:border-[#b89968] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!texto.trim()}
            className="min-h-[52px] shrink-0 rounded-full bg-[#1c1a17] px-4 text-[18px] font-medium text-white disabled:opacity-40"
          >
            +
          </button>
        </form>
      )}
      {state?.error && <p role="alert" className="mt-1 text-[15px] text-[#c0392b]">{state.error}</p>}
    </section>
  );
}

function Pendiente({ p, soloLectura }) {
  const [hecho, setHecho] = useState(p.hecho);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const nuevo = !hecho;
    setHecho(nuevo);
    startTransition(async () => {
      const res = await cambiarPendienteAction(p.id, nuevo);
      if (res?.error) setHecho(!nuevo);
    });
  }

  function borrar() {
    startTransition(() => borrarPendienteAction(p.id));
  }

  return (
    <li className="flex min-h-[52px] items-center gap-3">
      <button
        type="button"
        onClick={soloLectura ? undefined : alternar}
        disabled={soloLectura || pending}
        aria-label={hecho ? "Marcar como pendiente" : "Marcar como hecho"}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
          hecho ? "border-[#1f8a5b] bg-[#1f8a5b] text-white" : "border-[#1c1a17]/40"
        }`}
      >
        {hecho && <CheckIcon size={18} weight="bold" />}
      </button>
      <span
        className={`min-w-0 flex-1 break-words text-[17px] leading-snug ${
          hecho ? "text-[#8b8478] line-through" : "text-[#1c1a17]"
        }`}
      >
        {p.texto}
      </span>
      {!soloLectura && (
        <button
          type="button"
          onClick={borrar}
          disabled={pending}
          aria-label="Quitar pendiente"
          className="mt-0.5 shrink-0 p-0.5 text-[#8b8478] hover:text-[#c0392b]"
        >
          <XIcon size={14} />
        </button>
      )}
    </li>
  );
}
