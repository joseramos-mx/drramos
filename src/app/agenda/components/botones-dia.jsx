"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDotsIcon, CaretLeftIcon, CaretRightIcon, NotebookIcon } from "@phosphor-icons/react";
import Hoja from "../../crm/mensajes/hoja";
import Pendientes from "./pendientes";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

const redondo =
  "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#1c1a17]/10 bg-white text-[#1c1a17]";

/**
 * Dos botones redondos junto a la fecha: la libreta (pendientes del día,
 * con cuántos faltan) y el calendario del mes para saltar a cualquier día.
 * `conteo` = { "2026-10-21": 5, … } citas por día del mes que se ve.
 * `irA` = inicio de la liga de cada día (p. ej. "/agenda?fecha=").
 */
export default function BotonesDia({ fecha, hoy, pendientes = [], conteo = {}, irA = "/agenda?fecha=", extra = "" }) {
  const [hoja, setHoja] = useState(null); // "pendientes" | "mes"
  const faltan = pendientes.filter((p) => !p.hecho).length;

  return (
    <>
      <button type="button" onClick={() => setHoja("pendientes")} aria-label={`Pendientes del día (${faltan})`} className={redondo}>
        <NotebookIcon size={26} />
        {faltan > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#b89968] px-1.5 text-[13px] font-bold text-white">
            {faltan}
          </span>
        )}
      </button>
      <button type="button" onClick={() => setHoja("mes")} aria-label="Ver el calendario del mes" className={redondo}>
        <CalendarDotsIcon size={26} />
      </button>

      <Hoja abierta={hoja === "pendientes"} onCerrar={() => setHoja(null)} titulo="Pendientes del día">
        <div className="px-5 pb-2">
          <Pendientes fecha={fecha} items={pendientes} sinTitulo />
        </div>
      </Hoja>

      <Hoja abierta={hoja === "mes"} onCerrar={() => setHoja(null)} titulo="Calendario">
        <Mes fecha={fecha} hoy={hoy} conteo={conteo} irA={irA} extra={extra} onElegir={() => setHoja(null)} />
      </Hoja>
    </>
  );
}

function Mes({ fecha, hoy, conteo, irA, extra, onElegir }) {
  const [anio0, mes0] = fecha.split("-").map(Number);
  const [vista, setVista] = useState({ anio: anio0, mes: mes0 }); // mes 1-12
  const { anio, mes } = vista;

  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const diasEnMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7; // semana empieza en lunes
  const celdas = [...Array(hueco).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];
  const mover = (n) => {
    const d = new Date(Date.UTC(anio, mes - 1 + n, 1));
    setVista({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 });
  };
  const iso = (d) => `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between px-1 py-2">
        <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2efe9]">
          <CaretLeftIcon size={24} weight="bold" />
        </button>
        <p className="text-[22px] font-bold text-[#1c1a17]">
          {MESES[mes - 1]} {anio}
        </p>
        <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2efe9]">
          <CaretRightIcon size={24} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d, i) => (
          <span key={i} className={`py-2 text-[14px] font-semibold ${i === 6 ? "text-[#c0392b]/70" : "text-[#9a9388]"}`}>
            {d}
          </span>
        ))}
        {celdas.map((d, i) => {
          if (!d) return <span key={`h${i}`} />;
          const dia = iso(d);
          const n = conteo[dia] || 0;
          const elegido = dia === fecha;
          const esHoy = dia === hoy;
          return (
            <Link
              key={dia}
              href={`${irA}${dia}${extra}`}
              onClick={onElegir}
              aria-label={`${d} de ${MESES[mes - 1]}${n ? `, ${n} citas` : ""}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-full text-[18px] ${
                elegido
                  ? "bg-[#1c1a17] font-bold text-white"
                  : esHoy
                    ? "border-2 border-[#b89968] font-bold text-[#1c1a17]"
                    : "text-[#1c1a17] active:bg-[#f2efe9]"
              }`}
            >
              {d}
              <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${n ? (elegido ? "bg-white" : "bg-[#b89968]") : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-[14px] text-[#7a7368]">
        <span className="h-2 w-2 rounded-full bg-[#b89968]" /> Día con citas
      </p>
    </div>
  );
}
