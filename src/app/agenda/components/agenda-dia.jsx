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
        <p className="mt-6 font-[family-name:var(--font-albert)] text-[14px] font-normal text-white/75">
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
              className={`border-b ${m % 60 === 0 ? "border-white/[0.10]" : "border-white/[0.05]"} pr-2 pt-1 text-right font-[family-name:var(--font-albert)] text-[12px] font-normal tabular-nums text-white/70`}
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
                    m % 60 === 0 ? "border-white/[0.10]" : "border-white/[0.05]"
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

  // Fondos sólidos (no translúcidos) + barra de color a la izquierda
  // para leer el estado de un vistazo. Paleta de /diseno-sonrisa.
  const apagada = cita.estado === "cancelada" || cita.estado === "no_asistio";
  const tono = apagada
    ? { bg: "#111111", barra: "rgba(255,255,255,0.18)", texto: "text-white/50" }
    : cita.estado === "asistio"
      ? { bg: "#0f1d17", barra: "#34d399", texto: "text-[#f5f1ea]" }
      : cita.tipo === "urgencia"
        ? { bg: "#241212", barra: "#ff7a7a", texto: "text-[#f5f1ea]" }
        : { bg: "#1d1913", barra: "#b89968", texto: "text-[#f5f1ea]" };

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{ top: top + 2, height, left, width, background: tono.bg, borderLeftColor: tono.barra }}
      className={`absolute overflow-hidden border border-l-4 border-white/[0.08] py-1.5 pl-2.5 pr-2 text-left transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${tono.texto}`}
    >
      <p
        className={`truncate font-[family-name:var(--font-albert)] text-[14px] font-medium leading-snug md:text-[15px] ${
          apagada ? "line-through" : ""
        }`}
      >
        {cita.paciente?.nombre || "Sin nombre"}
      </p>
      <p className="truncate font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.06em] opacity-80 md:text-[12px]">
        {formatHora(ini)} · {labelDe(TIPOS, cita.tipo)}
        {cita.estado === "asistio" && " · ✓ Vino"}
        {cita.estado === "no_asistio" && " · No vino"}
        {cita.estado === "cancelada" && " · Canceló"}
      </p>
      {encimada && (
        // Mismo dentista a la misma hora: aviso de doble cita
        <span
          title="Se encima con otra cita"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff7a7a]"
        />
      )}
    </Tag>
  );
}
