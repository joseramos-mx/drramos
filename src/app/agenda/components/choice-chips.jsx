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
            className={`inline-flex min-h-[48px] items-center rounded-full border-2 px-5 py-2 text-[14px] font-normal tracking-[0.02em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${
              active
                ? "border-[#b89968] bg-[#b89968] font-medium text-[#000000]"
                : "border-[#1c1a17]/[0.22] text-[#3d372f] hover:border-[#1c1a17]/45 hover:text-[#1c1a17]"
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
      className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#5b544a]"
    >
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-[52px] w-full rounded-2xl border-0 bg-[#f2efe9] px-4 py-2 text-[16px] font-normal text-[#1c1a17] placeholder:text-[#8b8478] transition-colors focus:border-[#b89968] focus:outline-none";

export const primaryBtnClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#1c1a17] px-6 py-3 text-[14px] font-medium tracking-[0.02em] text-white transition-colors duration-300 hover:bg-[#3d372f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968] disabled:opacity-60";
