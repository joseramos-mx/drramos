"use client";

import { useCallback, useState } from "react";
import {
  DENTISTAS,
  SLOT_MIN,
  carrilesColumna,
  formatHora,
  horarioDelDia,
  idsEncimados,
  labelDe,
  minutosDelDia,
  TIPOS,
} from "../lib";
import CitaSheet from "./cita-sheet";

const ROW_PX = 56; // alto de cada bloque de 30 min: cómodo para el dedo

/**
 * Vista de un día: una columna por dentista, bloques de 30 min.
 * Tocar un hueco abre "Nueva cita"; tocar una cita abre su detalle y
 * el cierre (¿se presentó?, cotizado, realizado, pagado).
 */
export default function AgendaDia({ fecha, citas, soloLectura = false }) {
  const [sheet, setSheet] = useState(null);
  const cerrar = useCallback(() => setSheet(null), []);

  const horario = horarioDelDia(fecha);
  // El rango visible cubre el horario y cualquier cita fuera de él (urgencias).
  let abre = horario?.abre ?? 9 * 60;
  let cierra = horario?.cierra ?? 14 * 60;
  for (const c of citas) {
    abre = Math.min(abre, Math.floor(minutosDelDia(c.inicio) / SLOT_MIN) * SLOT_MIN);
    cierra = Math.max(cierra, Math.ceil(minutosDelDia(c.fin) / SLOT_MIN) * SLOT_MIN);
  }
  const slots = [];
  for (let m = abre; m < cierra; m += SLOT_MIN) slots.push(m);

  const encimados = idsEncimados(citas);

  return (
    <>
      {!horario && (
        <p className="mt-6 font-[family-name:var(--font-albert)] text-[13px] font-light text-white/55">
          Domingo: consultorio cerrado. Puedes agendar una urgencia si hace falta.
        </p>
      )}

      <div
        className="mt-6 grid border border-white/[0.08]"
        style={{ gridTemplateColumns: `52px repeat(${DENTISTAS.length}, minmax(0, 1fr))` }}
      >
        {/* Encabezados */}
        <div className="border-b border-white/[0.08]" />
        {DENTISTAS.map((d) => (
          <div
            key={d.value}
            className="border-b border-l border-white/[0.08] px-3 py-3 font-[family-name:var(--font-cormorant)] text-[18px] font-light text-[#f5f1ea] md:text-[22px]"
          >
            {d.label}
          </div>
        ))}

        {/* Columna de horas */}
        <div className="relative">
          {slots.map((m) => (
            <div
              key={m}
              style={{ height: ROW_PX }}
              className="border-b border-white/[0.04] pr-2 pt-1 text-right font-[family-name:var(--font-albert)] text-[11px] font-light tabular-nums text-white/45"
            >
              {m % 60 === 0 ? formatHora(m) : ""}
            </div>
          ))}
        </div>

        {/* Una columna por dentista */}
        {DENTISTAS.map((d) => {
          const suyas = citas.filter((c) => c.dentista === d.value);
          const carriles = carrilesColumna(suyas);
          return (
            <div key={d.value} className="relative border-l border-white/[0.08]">
              {slots.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={soloLectura}
                  aria-label={`Nueva cita ${d.label} ${formatHora(m)}`}
                  onClick={() => setSheet({ modo: "nueva", dentista: d.value, minutos: m })}
                  style={{ height: ROW_PX }}
                  className={`block w-full border-b ${
                    m % 60 === 0 ? "border-white/[0.06]" : "border-white/[0.03]"
                  } transition-colors hover:bg-white/[0.03] focus-visible:bg-[#b89968]/[0.08] focus-visible:outline-none disabled:hover:bg-transparent`}
                />
              ))}

              {suyas.map((c) => (
                <CitaBloque
                  key={c.id}
                  cita={c}
                  abre={abre}
                  carril={carriles[c.id]}
                  encimada={encimados.has(c.id)}
                  onClick={soloLectura ? undefined : () => setSheet({ modo: "cita", cita: c })}
                />
              ))}
            </div>
          );
        })}
      </div>

      {sheet && (
        <CitaSheet
          fecha={fecha}
          estado={sheet}
          onClose={cerrar}
        />
      )}
    </>
  );
}

function CitaBloque({ cita, abre, carril, encimada, onClick }) {
  const ini = minutosDelDia(cita.inicio);
  const fin = minutosDelDia(cita.fin);
  const top = ((ini - abre) / SLOT_MIN) * ROW_PX;
  const height = Math.max(((fin - ini) / SLOT_MIN) * ROW_PX - 4, 28);
  // Ancho y posición del carril (mitad y mitad si dos se enciman)
  const { carril: n = 0, carriles = 1 } = carril || {};
  const left = `calc(${(n / carriles) * 100}% + 4px)`;
  const width = `calc(${100 / carriles}% - 8px)`;

  const tono =
    cita.estado === "cancelada" || cita.estado === "no_asistio"
      ? "border-white/[0.1] bg-white/[0.02] text-white/40 line-through"
      : cita.estado === "asistio"
        ? "border-emerald-400/40 bg-emerald-400/[0.08] text-[#f5f1ea]"
        : cita.tipo === "urgencia"
          ? "border-[#ff7a7a]/50 bg-[#ff7a7a]/[0.08] text-[#f5f1ea]"
          : "border-[#b89968]/60 bg-[#b89968]/[0.12] text-[#f5f1ea]";

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{ top: top + 2, height, left, width }}
      className={`absolute overflow-hidden border px-2 py-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${tono} ${
        // Mismo dentista a la misma hora: aviso discreto de doble cita
        encimada ? "border-l-2 border-l-[#ff7a7a]" : ""
      }`}
    >
      <p className="truncate font-[family-name:var(--font-albert)] text-[13px] font-normal leading-tight">
        {cita.paciente?.nombre || "Sin nombre"}
      </p>
      <p className="truncate font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.14em] opacity-70">
        {formatHora(ini)} · {labelDe(TIPOS, cita.tipo)}
        {cita.estado === "asistio" && " · ✓"}
      </p>
    </Tag>
  );
}
