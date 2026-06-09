"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field
        id="email"
        name="email"
        type="email"
        label="Correo"
        autoComplete="email"
        required
      />
      <Field
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        required
      />

      {state?.error && (
        <p
          role="alert"
          aria-live="polite"
          className="font-[family-name:var(--font-albert)] text-[12px] font-light leading-[1.6] text-[#ff7a7a]"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({ id, name, type, label, autoComplete, required }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.22em] text-white/55"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="min-h-[48px] w-full border border-white/[0.12] bg-transparent px-5 py-3 font-[family-name:var(--font-albert)] text-[15px] font-light text-[#f5f1ea] placeholder:text-white/25 transition-colors duration-300 focus:border-[#b89968] focus:outline-none"
      />
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center bg-[#f5f1ea] px-6 py-3 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}
