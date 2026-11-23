import Link from "next/link";
import {
  COMIDA,
  SLOT_MIN,
  TONOS,
  bloqueosDelDia,
  carrilesColumna,
  diaSemana,
  formatHora,
  horarioDelDia,
  hoyDurango,
  minutosDelDia,
  sumarDias,
  tonoDeCita,
} from "../lib";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ABRE = 9 * 60;
const CIERRA = 20 * 60;
const FILA = 30; // px por cada 30 min

/** Lunes de la semana de `fecha` (la semana va de lunes a sábado; el domingo está cerrado). */
export function lunesDe(fecha) {
  const dow = diaSemana(fecha);
  return sumarDias(fecha, dow === 0 ? -6 : 1 - dow);
}

/** Huecos libres de un día: dentro del horario, fuera de la comida, sin cita ni bloqueo. */
function libresDelDia(fecha, citas, bloqueos) {
  const h = horarioDelDia(fecha);
  if (!h) return [];
  const libres = [];
  for (let m = h.abre; m < h.cierra; m += SLOT_MIN) {
    const fin = m + SLOT_MIN;
    if (m < COMIDA.hasta && fin > COMIDA.desde) continue;
    if (bloqueos.some((b) => b.desde < fin && b.hasta > m)) continue;
    if (citas.some((c) => minutosDelDia(c.inicio) < fin && minutosDelDia(c.fin) > m)) continue;
    libres.push(m);
  }
  return libres;
}

/**
 * Semana completa (lunes a sábado) de un vistazo: cada paciente en su hora y los
 * huecos libres marcados. Tocar un hueco abre ese día con el menú para agendar en
 * esa hora; tocar una cita abre su detalle. Las canceladas no aparecen.
 */
export default function AgendaSemana({ lunes, citas, bloqueos, extra = "" }) {
  const hoy = hoyDurango();
  const dias = Array.from({ length: 6 }, (_, i) => sumarDias(lunes, i));
  const activas = (citas || []).filter((c) => c.estado !== "cancelada");
  const slots = [];
  for (let m = ABRE; m < CIERRA; m += SLOT_MIN) slots.push(m);

  const porDia = dias.map((fecha) => {
    const suyas = activas.filter((c) => hoyDurango(new Date(c.inicio)) === fecha);
    const blq = bloqueosDelDia(bloqueos, fecha);
    return { fecha, citas: suyas, bloqueos: blq, libres: libresDelDia(fecha, suyas, blq), carriles: carrilesColumna(suyas) };
  });
  const totalLibres = porDia.reduce((n, d) => n + (d.fecha >= hoy ? d.libres.length : 0), 0);

  return (
    <div className="mt-5">
      <p className="mb-3 text-[16px] text-[#5b544a]">
        {totalLibres > 0 ? (
          <>
            <strong className="font-bold text-[#1c1a17]">{totalLibres} espacios libres</strong> de 30 min esta semana (sin contar la comida). Toca uno para agendar.
          </>
        ) : (
          "No quedan espacios libres esta semana."
        )}
      </p>

      {/* En el celular la semana se desliza de lado dentro del cuadro; la página no */}
      <div className="overflow-x-auto rounded-2xl border border-[#1c1a17]/[0.08] bg-white">
        <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `48px repeat(6, minmax(0, 1fr))` }}>
          {/* Encabezados */}
          <div className="sticky left-0 z-20 border-b border-[#1c1a17]/[0.08] bg-white" />
          {porDia.map((d) => {
            const esHoy = d.fecha === hoy;
            const pasado = d.fecha < hoy;
            return (
              <Link
                key={d.fecha}
                href={`/agenda?fecha=${d.fecha}${extra}`}
                className={`border-b border-l border-[#1c1a17]/[0.08] px-2 py-2.5 text-center ${esHoy ? "bg-[#fbf3e3]" : ""}`}
              >
                <span className={`block text-[15px] font-bold ${esHoy ? "text-[#8a6d3f]" : "text-[#1c1a17]"}`}>
                  {DIAS[diaSemana(d.fecha)]} {Number(d.fecha.slice(8, 10))}
                </span>
                <span className="block text-[12px] text-[#7a7368]">
                  {d.bloqueos.some((b) => b.todoElDia)
                    ? d.bloqueos.find((b) => b.todoElDia).motivo
                    : pasado
                      ? `${d.citas.length} cita${d.citas.length === 1 ? "" : "s"}`
                      : `${d.libres.length} libre${d.libres.length === 1 ? "" : "s"}`}
                </span>
              </Link>
            );
          })}

          {/* Columna de horas */}
          <div className="sticky left-0 z-10 bg-white">
            {slots.map((m) => (
              <div
                key={m}
                style={{ height: FILA }}
                className={`border-b pr-1.5 pt-0.5 text-right text-[11px] tabular-nums text-[#7a7368] ${m % 60 === 0 ? "border-[#1c1a17]/[0.10]" : "border-[#1c1a17]/[0.04]"}`}
              >
                {m % 60 === 0 ? formatHora(m) : ""}
              </div>
            ))}
          </div>

          {porDia.map((d) => {
            const h = horarioDelDia(d.fecha);
            const pasado = d.fecha < hoy;
            const libres = new Set(d.libres);
            return (
              <div key={d.fecha} className={`relative border-l border-[#1c1a17]/[0.08] ${d.fecha === hoy ? "bg-[#fbf3e3]/40" : ""}`}>
                {slots.map((m) => {
                  const cerrado = !h || m < h.abre || m >= h.cierra;
                  const comida = !cerrado && m < COMIDA.hasta && m + SLOT_MIN > COMIDA.desde;
                  const libre = !pasado && libres.has(m);
                  const borde = m % 60 === 0 ? "border-[#1c1a17]/[0.10]" : "border-[#1c1a17]/[0.04]";
                  if (cerrado) return <div key={m} style={{ height: FILA }} className={`border-b ${borde} bg-[#1c1a17]/[0.035]`} />;
                  return (
                    <Link
                      key={m}
                      href={`/agenda?fecha=${d.fecha}&hora=${m}${extra}`}
                      aria-label={`${libre ? "Libre" : "Agendar"} ${DIAS[diaSemana(d.fecha)]} ${formatHora(m)}`}
                      style={{ height: FILA }}
                      className={`flex items-center justify-center border-b ${borde} text-[11px] font-semibold ${
                        comida ? "bg-[repeating-linear-gradient(135deg,rgba(28,26,23,0.045)_0_6px,transparent_6px_12px)]" : ""
                      } ${libre ? "text-[#1f8a5b]/70 hover:bg-[#e6f4ec]" : "hover:bg-[#1c1a17]/[0.03]"}`}
                    >
                      {libre ? "Libre" : ""}
                    </Link>
                  );
                })}

                {/* Bloqueos y eventos */}
                {d.bloqueos.map((b) => {
                  const desde = Math.max(b.desde, ABRE);
                  const hasta = Math.min(b.hasta, CIERRA);
                  if (hasta <= desde) return null;
                  return (
                    <div
                      key={b.id}
                      className={`pointer-events-none absolute inset-x-1 overflow-hidden rounded-lg px-1.5 py-0.5 text-[11px] font-semibold ${
                        b.evento ? "bg-[#e8edf3] text-[#3f5670]" : "bg-[repeating-linear-gradient(135deg,rgba(28,26,23,0.07)_0_6px,rgba(28,26,23,0.02)_6px_12px)] text-[#7a7368]"
                      }`}
                      style={{ top: ((desde - ABRE) / SLOT_MIN) * FILA + 1, height: ((hasta - desde) / SLOT_MIN) * FILA - 2 }}
                    >
                      {b.motivo}
                    </div>
                  );
                })}

                {/* Citas */}
                {d.citas.map((c) => {
                  const ini = Math.max(minutosDelDia(c.inicio), ABRE);
                  const fin = Math.min(minutosDelDia(c.fin), CIERRA);
                  if (fin <= ini) return null;
                  const tono = TONOS[tonoDeCita(c)];
                  const { carril = 0, carriles = 1 } = d.carriles[c.id] || {};
                  const alto = ((fin - ini) / SLOT_MIN) * FILA - 2;
                  return (
                    <Link
                      key={c.id}
                      href={`/agenda?fecha=${d.fecha}&cita=${c.id}${extra}`}
                      className="absolute overflow-hidden rounded-lg border-l-4 px-1.5 py-0.5 text-left leading-tight shadow-[0_1px_2px_rgba(28,26,23,0.08)]"
                      style={{
                        top: ((ini - ABRE) / SLOT_MIN) * FILA + 1,
                        height: alto,
                        left: `calc(${(carril / carriles) * 100}% + 3px)`,
                        width: `calc(${100 / carriles}% - 6px)`,
                        background: tono.bg,
                        borderColor: tono.barra,
                      }}
                    >
                      <span className="block truncate text-[12px] font-semibold text-[#1c1a17]">{c.paciente?.nombre || "Sin nombre"}</span>
                      {alto > 34 && <span className="block truncate text-[11px] text-[#5b544a]">{formatHora(minutosDelDia(c.inicio))}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
