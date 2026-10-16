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
export default function Pendientes({ fecha, items = [], soloLectura = false }) {
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
      <p className="font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        Pendientes del día
      </p>

      {lista.length === 0 && soloLectura ? (
        <p className="mt-2 font-[family-name:var(--font-albert)] text-[13px] text-white/50">Nada pendiente.</p>
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
            className="min-h-[40px] w-full min-w-0 border border-white/[0.22] bg-[#0d0d0d] px-2.5 font-[family-name:var(--font-albert)] text-[14px] text-[#f5f1ea] placeholder:text-white/40 focus:border-[#b89968] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!texto.trim()}
            className="min-h-[40px] shrink-0 bg-[#f5f1ea] px-3 font-[family-name:var(--font-albert)] text-[13px] font-medium text-[#000000] disabled:opacity-40"
          >
            +
          </button>
        </form>
      )}
      {state?.error && <p role="alert" className="mt-1 text-[12px] text-[#ff7a7a]">{state.error}</p>}
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
    <li className="flex items-start gap-2">
      <button
        type="button"
        onClick={soloLectura ? undefined : alternar}
        disabled={soloLectura || pending}
        aria-label={hecho ? "Marcar como pendiente" : "Marcar como hecho"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${
          hecho ? "border-[#34d399] bg-[#34d399] text-[#000000]" : "border-white/40"
        }`}
      >
        {hecho && <CheckIcon size={13} weight="bold" />}
      </button>
      <span
        className={`min-w-0 flex-1 break-words font-[family-name:var(--font-albert)] text-[14px] leading-snug ${
          hecho ? "text-white/45 line-through" : "text-[#f5f1ea]"
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
          className="mt-0.5 shrink-0 p-0.5 text-white/40 hover:text-[#ff7a7a]"
        >
          <XIcon size={14} />
        </button>
      )}
    </li>
  );
}
