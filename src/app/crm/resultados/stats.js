/**
 * Cálculos de /crm/resultados a partir de las citas de la agenda.
 * Funciones puras (sin Supabase) para poder probarlas con datos falsos.
 *
 * Reglas de suma (acordadas con el dueño):
 *  - Dinero que entró = SÓLO `pagado_monto`. Nunca cotizado + pagado.
 *  - Presupuesto = la cotización MÁS RECIENTE por paciente y
 *    tratamiento, no la suma de todas las citas: en tratamientos de
 *    varias citas la cotización se puede repetir.
 */

const DIA = 24 * 60 * 60 * 1000;

export const PERIODOS = [
  { value: "mes", label: "Este mes" },
  { value: "mes_pasado", label: "Mes pasado" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "todo", label: "Todo" },
];

/** Rango [desde, hasta) del periodo en hora de Durango (UTC-6). */
export function rangoPeriodo(periodo, now = new Date()) {
  const local = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const iso = (yy, mm) => new Date(Date.UTC(yy, mm, 1, 6)).toISOString();
  if (periodo === "mes_pasado") return { desde: iso(y, m - 1), hasta: iso(y, m) };
  if (periodo === "90d") return { desde: new Date(now.getTime() - 90 * DIA).toISOString(), hasta: null };
  if (periodo === "todo") return { desde: null, hasta: null };
  return { desde: iso(y, m), hasta: null };
}

function enRango(iso, { desde, hasta }) {
  if (desde && iso < desde) return false;
  if (hasta && iso >= hasta) return false;
  return true;
}

const num = (x) => Number(x) || 0;

/**
 * Presupuesto vigente: por cada paciente y tratamiento, el monto de su
 * cotización más reciente. Devuelve [{paciente, tratamiento, monto, fecha}].
 */
export function cotizacionesVigentes(citas) {
  const ultima = new Map();
  for (const c of citas) {
    if (c.estado !== "asistio" || !(num(c.cotizado_monto) > 0)) continue;
    const trat = c.cotizado?.[0] || "otro";
    const key = `${c.paciente?.id}|${trat}`;
    const prev = ultima.get(key);
    if (!prev || c.inicio > prev.fecha) {
      ultima.set(key, { paciente: c.paciente, tratamiento: trat, monto: num(c.cotizado_monto), fecha: c.inicio });
    }
  }
  return [...ultima.values()];
}

/**
 * @param citas  todas las citas (con `paciente` embebido)
 * @param rango  { desde, hasta } del periodo
 * @param ahora  ISO de "ahora" para detectar citas sin cerrar
 */
export function calcularResultados(citas, rango, ahora = new Date().toISOString()) {
  const delPeriodo = citas.filter((c) => enRango(c.inicio, rango));

  // ── Embudo por paciente ──────────────────────────────────────
  const agendaron = new Set();
  const vinieron = new Set();
  const conPresupuesto = new Set();
  const pagaron = new Set();
  let citasTotal = 0;
  let noVino = 0;
  let cancelo = 0;
  let cobrado = 0;

  for (const c of delPeriodo) {
    const pid = c.paciente?.id;
    citasTotal++;
    agendaron.add(pid);
    if (c.estado === "no_asistio") noVino++;
    if (c.estado === "cancelada") cancelo++;
    if (c.estado !== "asistio") continue;
    vinieron.add(pid);
    if (num(c.cotizado_monto) > 0) conPresupuesto.add(pid);
    if (num(c.pagado_monto) > 0) {
      pagaron.add(pid);
      cobrado += num(c.pagado_monto);
    }
  }

  const vigentesPeriodo = cotizacionesVigentes(delPeriodo);
  const presupuestado = vigentesPeriodo.reduce((s, v) => s + v.monto, 0);

  // ── Por origen (pacientes del periodo) ───────────────────────
  const porOrigen = {};
  const fila = (o) => (porOrigen[o] ??= { pacientes: new Set(), vinieron: new Set(), pagaron: new Set(), cobrado: 0, presupuestado: 0 });
  for (const c of delPeriodo) {
    const f = fila(c.paciente?.origen || "sin_dato");
    f.pacientes.add(c.paciente?.id);
    if (c.estado === "asistio") f.vinieron.add(c.paciente?.id);
    if (num(c.pagado_monto) > 0 && c.estado === "asistio") {
      f.pagaron.add(c.paciente?.id);
      f.cobrado += num(c.pagado_monto);
    }
  }
  for (const v of vigentesPeriodo) fila(v.paciente?.origen || "sin_dato").presupuestado += v.monto;

  // ── Por tratamiento ──────────────────────────────────────────
  const porTratamiento = {};
  const ft = (t) => (porTratamiento[t] ??= { cotizados: 0, presupuestado: 0, realizados: 0 });
  for (const v of vigentesPeriodo) {
    ft(v.tratamiento).cotizados++;
    ft(v.tratamiento).presupuestado += v.monto;
  }
  for (const c of delPeriodo) {
    if (c.estado !== "asistio") continue;
    for (const t of c.realizado || []) ft(t).realizados++;
  }

  // ── Listas de acción (sin importar el periodo) ───────────────
  // Citas que ya pasaron y nadie cerró: datos que faltan.
  const sinCerrar = citas
    .filter((c) => c.estado === "agendada" && c.fin < ahora)
    .sort((a, b) => (a.inicio < b.inicio ? 1 : -1));

  // Presupuestos que nunca se pagaron: seguimiento.
  const pagoAlgunaVez = new Set(
    citas.filter((c) => c.estado === "asistio" && num(c.pagado_monto) > 0).map((c) => c.paciente?.id)
  );
  const porPensar = cotizacionesVigentes(citas)
    .filter((v) => !pagoAlgunaVez.has(v.paciente?.id))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return {
    citasTotal,
    noVino,
    cancelo,
    embudo: {
      agendaron: agendaron.size,
      vinieron: vinieron.size,
      conPresupuesto: conPresupuesto.size,
      pagaron: pagaron.size,
    },
    cobrado,
    presupuestado,
    ticketPromedio: pagaron.size ? cobrado / pagaron.size : 0,
    porOrigen: Object.entries(porOrigen)
      .map(([origen, f]) => ({
        origen,
        pacientes: f.pacientes.size,
        vinieron: f.vinieron.size,
        pagaron: f.pagaron.size,
        cobrado: f.cobrado,
        presupuestado: f.presupuestado,
      }))
      .sort((a, b) => b.cobrado - a.cobrado || b.pacientes - a.pacientes),
    porTratamiento: Object.entries(porTratamiento)
      .map(([tratamiento, f]) => ({ tratamiento, ...f }))
      .sort((a, b) => b.presupuestado - a.presupuestado),
    sinCerrar,
    porPensar,
  };
}

export function porcentaje(parte, total) {
  if (!total) return "—";
  return `${Math.round((parte / total) * 100)}%`;
}
