"use client";

/**
 * Botones grandes de opción (radio o checkbox) con la estética de los
 * filtros del CRM. Pensado para el dedo en un celular: min 44px.
 */
export default function ChoiceChips({
  name,
  options,
  value,
  onChange,
  multiple = false,
}) {
  const selected = multiple ? new Set(value || []) : null;

  function toggle(v) {
    if (multiple) {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next]);
    } else {
      onChange(v);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = multiple ? selected.has(o.value) : value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(o.value)}
            className={`inline-flex min-h-[44px] items-center border px-4 py-2 font-[family-name:var(--font-albert)] text-[13px] font-light tracking-[0.04em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${
              active
                ? "border-[#b89968] bg-[#b89968]/[0.15] text-[#f5f1ea]"
                : "border-white/[0.12] text-white/65 hover:border-white/30 hover:text-[#f5f1ea]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
      {/* Valores para el server action */}
      {multiple
        ? [...(selected || [])].map((v) => (
            <input key={v} type="hidden" name={name} value={v} />
          ))
        : value && <input type="hidden" name={name} value={value} />}
    </div>
  );
}

export function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.22em] text-white/45"
    >
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-[44px] w-full border border-white/[0.12] bg-transparent px-3 py-2 font-[family-name:var(--font-albert)] text-[15px] font-light text-[#f5f1ea] placeholder:text-white/30 transition-colors focus:border-[#b89968] focus:outline-none";

export const primaryBtnClass =
  "inline-flex min-h-[48px] items-center justify-center bg-[#f5f1ea] px-6 py-3 font-[family-name:var(--font-albert)] text-[14px] font-medium tracking-[0.02em] text-[#000000] transition-colors duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] disabled:opacity-60";
