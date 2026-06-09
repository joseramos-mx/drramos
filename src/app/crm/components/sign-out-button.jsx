"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "../actions";

export default function SignOutButton({ email }) {
  return (
    <form action={signOutAction} className="flex items-center gap-3">
      {email && (
        <span className="hidden font-[family-name:var(--font-albert)] text-[12px] font-light tracking-[0.04em] text-white/55 sm:inline">
          {email}
        </span>
      )}
      <Btn />
    </form>
  );
}

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[40px] items-center border border-white/[0.18] px-4 py-2 font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.18em] text-white/70 transition-colors duration-300 hover:border-white/40 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] disabled:opacity-60"
    >
      {pending ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
