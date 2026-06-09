"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateNotasAction } from "../actions";

/**
 * Textarea con botón "Guardar". Solo se muestra como guardado cuando
 * el server action devolvió ok.
 */
export default function NotasForm({ leadId, notas }) {
  const [state, formAction] = useActionState(updateNotasAction, null);
  const [draft, setDraft] = useState(notas || "");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (state?.ok) setSavedAt(state.savedAt);
  }, [state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={leadId} />
      <label className="sr-only" htmlFor={`notas-${leadId}`}>
        Notas
      </label>
      <textarea
        id={`notas-${leadId}`}
        name="notas"
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Notas de seguimiento..."
        className="w-full resize-y border border-white/[0.12] bg-transparent px-3 py-2 font-[family-name:var(--font-albert)] text-[13px] font-light leading-[1.55] text-[#f5f1ea] placeholder:text-white/30 transition-colors focus:border-[#b89968] focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <span
          aria-live="polite"
          className="font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.18em] text-white/45"
        >
          {state?.error
            ? <span className="text-[#ff7a7a]">No se pudo guardar</span>
            : savedAt
              ? "Guardado"
              : ""}
        </span>
        <SaveBtn />
      </div>
    </form>
  );
}

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[36px] items-center border border-white/[0.18] px-4 py-1.5 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.18em] text-[#f5f1ea] transition-colors duration-300 hover:border-[#b89968] hover:bg-[#b89968]/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}
