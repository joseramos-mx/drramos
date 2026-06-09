import Link from "next/link";
import { ESTADOS, TRACKS } from "../lib";

/**
 * Filtros simples por query string. Sin JS del cliente: cada chip es
 * un Link que reescribe la URL. El server component lee searchParams
 * y aplica los filtros en la consulta a Supabase.
 */
export default function Filters({ estado, track }) {
  const baseParams = new URLSearchParams();
  if (estado) baseParams.set("estado", estado);
  if (track) baseParams.set("track", track);

  function urlForEstado(value) {
    const p = new URLSearchParams(baseParams);
    if (value) p.set("estado", value);
    else p.delete("estado");
    const q = p.toString();
    return `/crm${q ? `?${q}` : ""}`;
  }

  function urlForTrack(value) {
    const p = new URLSearchParams(baseParams);
    if (value) p.set("track", value);
    else p.delete("track");
    const q = p.toString();
    return `/crm${q ? `?${q}` : ""}`;
  }

  return (
    <div className="space-y-3">
      <FilterRow label="Estado" current={estado}>
        <FilterChip href={urlForEstado(null)} active={!estado} label="Todos" />
        {ESTADOS.map((e) => (
          <FilterChip
            key={e.value}
            href={urlForEstado(e.value)}
            active={estado === e.value}
            label={e.label}
          />
        ))}
      </FilterRow>

      <FilterRow label="Track" current={track}>
        <FilterChip href={urlForTrack(null)} active={!track} label="Todos" />
        {TRACKS.map((t) => (
          <FilterChip
            key={t.value}
            href={urlForTrack(t.value)}
            active={track === t.value}
            label={t.label}
          />
        ))}
      </FilterRow>
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.26em] text-white/45">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({ href, active, label }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[32px] items-center border px-3 py-1 font-[family-name:var(--font-albert)] text-[12px] font-light tracking-[0.04em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${
        active
          ? "border-[#b89968] bg-[#b89968]/[0.15] text-[#f5f1ea]"
          : "border-white/[0.12] text-white/65 hover:border-white/30 hover:text-[#f5f1ea]"
      }`}
    >
      {label}
    </Link>
  );
}
