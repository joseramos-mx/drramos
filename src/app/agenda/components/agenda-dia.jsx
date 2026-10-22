"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
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
  TONOS,
  tonoDeCita,
} from "../lib";
import CitaSheet from "./cita-sheet";
import Pendientes from "./pendientes";

const ROW_PX = 56; // alto de cada bloque de 30 min: cómodo para el dedo
const ROW_MIN_PX = 18; // límite inferior al encoger para que quepa todo
const ANCHO_PANTALLA = 600; // desde tableta (cualquier iPad, parado o acostado) "auto" ajusta el alto

/**
 * Vista de un día: una columna por dentista, bloques de 30 min.
 * Tocar un hueco abre "Nueva cita"; tocar una cita abre su detalle y
 * el cierre (¿se presentó?, cotizado, realizado, pagado).
 *
 * `ajustarAlto`: true = el día completo cabe en la ventana sin scroll
 * (monitor del consultorio); "auto" = sólo en pantallas anchas, en el
 * celular se queda con bloques altos para el dedo.
 */
export default function AgendaDia({ fecha, citas, pendientes, preseleccion = null, soloLectura = false, ajustarAlto = false }) {
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
  const rowPx = useAltoDeFila(ajustarAlto, slots.length);
  const gridRef = rowPx.ref;

  return (
    <>
      {!horario && (
        <p className="mt-6 text-[14px] font-normal text-[#5b544a]">
          Domingo: consultorio cerrado. Puedes agendar una urgencia si hace falta.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 lg:flex-row-reverse lg:items-start">
      {/* A un costado (arriba en celular): pendientes del día y colores */}
      <div className="flex shrink-0 flex-col gap-4 lg:sticky lg:top-6 lg:w-[230px]">
        {pendientes && (
          <div className="rounded-2xl border border-[#1c1a17]/[0.08] bg-white p-3 lg:p-4">
            <Pendientes fecha={fecha} items={pendientes} soloLectura={soloLectura} />
          </div>
        )}
        <Leyenda />
      </div>
      <div
        ref={gridRef}
        className="grid min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#1c1a17]/[0.08] bg-white"
        style={{ gridTemplateColumns: `52px repeat(${DENTISTAS.length}, minmax(0, 1fr))` }}
      >
        {/* Encabezados */}
        <div className="border-b border-[#1c1a17]/[0.08]" />
        {DENTISTAS.map((d) => (
          <div
            key={d.value}
            className="border-b border-l border-[#1c1a17]/[0.08] px-3 py-3 tracking-tight text-[18px] font-bold text-[#1c1a17] md:text-[22px]"
          >
            {d.label}
          </div>
        ))}

        {/* Columna de horas */}
        <div className="relative">
          {slots.map((m) => (
            <div
              key={m}
              style={{ height: rowPx.alto }}
              className={`border-b ${m % 60 === 0 ? "border-[#1c1a17]/[0.10]" : "border-[#1c1a17]/[0.05]"} pr-2 pt-1 text-right text-[12px] font-normal tabular-nums text-[#5b544a]`}
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
            <div key={d.value} className="relative border-l border-[#1c1a17]/[0.08]">
              {slots.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={soloLectura}
                  aria-label={`Nueva cita ${d.label} ${formatHora(m)}`}
                  onClick={() => setSheet({ modo: "nueva", dentista: d.value, minutos: m })}
                  style={{ height: rowPx.alto }}
                  className={`block w-full border-b ${
                    m % 60 === 0 ? "border-[#1c1a17]/[0.10]" : "border-[#1c1a17]/[0.05]"
                  } transition-colors hover:bg-[#1c1a17]/[0.03] focus-visible:bg-[#b89968]/[0.08] focus-visible:outline-none disabled:hover:bg-transparent`}
                />
              ))}

              {suyas.map((c) => (
                <CitaBloque
                  key={c.id}
                  cita={c}
                  abre={abre}
                  rowPx={rowPx.alto}
                  carril={carriles[c.id]}
                  encimada={encimados.has(c.id)}
                  onClick={soloLectura ? undefined : () => setSheet({ modo: "cita", cita: c })}
                />
              ))}
            </div>
          );
        })}
      </div>
      </div>

      {sheet && (
        <CitaSheet
          fecha={fecha}
          preseleccion={preseleccion}
          estado={sheet}
          onClose={cerrar}
        />
      )}
    </>
  );
}

function CitaBloque({ cita, abre, rowPx, carril, encimada, onClick }) {
  const ini = minutosDelDia(cita.inicio);
  const fin = minutosDelDia(cita.fin);
  const top = ((ini - abre) / SLOT_MIN) * rowPx;
  const height = Math.max(((fin - ini) / SLOT_MIN) * rowPx - 4, Math.min(28, rowPx - 2));
  // Ficha bajita (filas encogidas): hora y nombre en un solo renglón
  const compacta = height < 44;
  // Ancho y posición del carril (mitad y mitad si dos se enciman)
  const { carril: n = 0, carriles = 1 } = carril || {};
  const left = `calc(${(n / carriles) * 100}% + 4px)`;
  const width = `calc(${100 / carriles}% - 8px)`;

  const clave = tonoDeCita(cita);
  const apagada = clave === "apagada";
  const tono = { ...TONOS[clave], texto: apagada ? "text-[#8b8478]" : "text-[#1c1a17]" };

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{ top: top + 2, height, left, width, background: tono.bg, borderLeftColor: tono.barra }}
      className={`absolute overflow-hidden rounded-lg border border-l-4 border-[#1c1a17]/[0.08] ${compacta ? "py-0.5" : "py-1.5"} pl-2.5 pr-2 text-left transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968] ${tono.texto}`}
    >
      {compacta ? (
        <p
          className={`truncate text-[13px] font-medium leading-tight md:text-[14px] ${
            apagada ? "line-through" : ""
          }`}
        >
          <span className="opacity-80">{formatHora(ini)}</span> {cita.paciente?.nombre || "Sin nombre"}
          {cita.estado === "asistio" && (cita.cierre_completo ? " ✓" : " ✓…")}
        </p>
      ) : (
        <>
      <p
        className={`line-clamp-2 break-words text-[14px] font-medium leading-snug md:text-[15px] ${
          apagada ? "line-through" : ""
        }`}
      >
        {cita.paciente?.nombre || "Sin nombre"}
        </p>
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.06em] opacity-80 md:text-[12px]">
        {formatHora(ini)} · {labelDe(TIPOS, cita.tipo)}
        {cita.estado === "asistio" && (cita.cierre_completo ? " · ✓ Vino" : " · ✓ Vino · por cerrar")}
        {cita.estado === "no_asistio" && " · No vino"}
        {cita.estado === "cancelada" && " · Canceló"}
        </p>
        </>
      )}
      {encimada && (
        // Mismo dentista a la misma hora: aviso de doble cita
        <span
          title="Se encima con otra cita"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#c0392b]"
        />
      )}
    </Tag>
  );
}

/**
 * Qué significa cada color. En pantalla ancha va a un costado de la
 * agenda; en celular, arriba en una fila.
 */
function Leyenda() {
  return (
    <aside
      aria-label="Colores de las citas"
      className="hidden flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-[#1c1a17]/[0.08] bg-white p-3 md:flex lg:flex-col lg:gap-3 lg:p-4"
    >
      <p className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[#5b544a] lg:block">
        Colores
      </p>
      {Object.entries(TONOS).map(([k, t]) => (
        <div key={k} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-5 w-7 shrink-0 rounded border border-l-4 border-[#1c1a17]/[0.08]"
            style={{ background: t.bg, borderLeftColor: t.barra }}
          />
          <span className="text-[13px] font-normal text-[#3d372f]">
            {t.label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="flex h-5 w-7 shrink-0 items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-[#c0392b]" />
        </span>
        <span className="text-[13px] font-normal text-[#3d372f]">
          Se encima con otra cita
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="flex h-5 w-7 shrink-0 items-center justify-center text-[13px] font-medium text-[#1f8a5b]">
          ✓…
        </span>
        <span className="text-[13px] font-normal text-[#3d372f]">
          Vino, falta cerrar la cita
        </span>
      </div>
    </aside>
  );
}

/**
 * Alto de cada fila de 30 min. Con `ajustar` mide cuánto espacio queda
 * debajo del inicio de la agenda y reparte la ventana entre las filas
 * para que el día completo quepa sin scroll; se recalcula al cambiar el
 * tamaño de la ventana.
 */
function useAltoDeFila(ajustar, filas) {
  const ref = useRef(null);
  const [alto, setAlto] = useState(ROW_PX);

  useLayoutEffect(() => {
    if (!ajustar) return;
    const calcular = () => {
      const el = ref.current;
      if (!el) return;
      if (ajustar === "auto" && window.innerWidth < ANCHO_PANTALLA) {
        setAlto(ROW_PX);
        return;
      }
      const encabezado = el.firstElementChild?.getBoundingClientRect().height || 0;
      const arriba = el.getBoundingClientRect().top + window.scrollY;
      // Margen de abajo de la página + bordes, para que no aparezca scroll
      const main = el.closest("main");
      const margenAbajo = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0;
      const disponible = window.innerHeight - arriba - encabezado - margenAbajo - 4;
      setAlto(Math.max(ROW_MIN_PX, Math.floor(disponible / filas)));
    };
    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, [ajustar, filas]);

  return { ref, alto };
}
