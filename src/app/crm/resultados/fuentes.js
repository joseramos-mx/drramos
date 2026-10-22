/**
 * Fuentes de pacientes: todos los canales comparados con la misma
 * regla (gasto contra lo que regresa), para empujar lo que funciona.
 * Funciones puras, sin Supabase.
 */

import { WHATSAPP_CONSULTORIO } from "@/lib/consultorio";
export { WHATSAPP_CONSULTORIO };

// Mismos valores que pacientes.origen / fuentes.canal
export const CANALES = [
  { value: "anuncio",       label: "Anuncios de Meta" },
  { value: "google_ads",    label: "Google Ads" },
  { value: "tiktok",        label: "TikTok" },
  { value: "google",        label: "Google Maps" },
  { value: "instagram",     label: "Instagram" },
  { value: "facebook",      label: "Facebook" },
  { value: "web",           label: "Página web" },
  { value: "formulario",    label: "Formulario landing" },
  { value: "doctoralia",    label: "Doctoralia" },
  { value: "recomendacion", label: "Recomendación" },
  { value: "ya_paciente",   label: "Ya era paciente" },
  { value: "otro",          label: "Otro" },
  { value: "sin_dato",      label: "Sin dato" },
];

export function labelCanal(v) {
  return CANALES.find((c) => c.value === v)?.label || v;
}

/** Mensaje prellenado con el código al final: lo que identifica la fuente. */
export function mensajeConCodigo(fuente) {
  return `${fuente.mensaje} (ref ${fuente.codigo})`;
}

export function linkWhatsapp(fuente) {
  return `https://wa.me/${WHATSAPP_CONSULTORIO}?text=${encodeURIComponent(mensajeConCodigo(fuente))}`;
}

/** Busca el código "(ref XX)" en el primer mensaje de un paciente. */
export function codigoEnMensaje(texto) {
  const m = String(texto || "").match(/\(ref\s+([A-Z0-9]{1,8})\)/i);
  return m ? m[1].toUpperCase() : null;
}

/** Primer día del mes (YYYY-MM-01) de un ISO, en hora de Durango. */
export function mesDe(iso) {
  return new Date(new Date(iso).getTime() - 6 * 3600 * 1000).toISOString().slice(0, 7) + "-01";
}

/**
 * Gasto por canal en el rango. Los gastos manuales son mensuales: entra
 * el mes si su primer día cae dentro del rango (o el rango es "todo").
 * Para Meta, si la API está conectada, su gasto reemplaza al manual.
 */
export function gastoPorCanal({ fuentes, gastos, rango, gastoMeta }) {
  const canalDe = Object.fromEntries((fuentes || []).map((f) => [f.id, f.canal]));
  const desdeMes = rango.desde ? mesDe(rango.desde) : null;
  const hastaMes = rango.hasta ? mesDe(new Date(new Date(rango.hasta).getTime() - 1000).toISOString()) : null;
  const out = {};
  for (const g of gastos || []) {
    if (desdeMes && g.mes < desdeMes) continue;
    if (hastaMes && g.mes > hastaMes) continue;
    const canal = canalDe[g.fuente_id];
    if (!canal) continue;
    out[canal] = (out[canal] || 0) + Number(g.monto || 0);
  }
  if (gastoMeta != null) out.anuncio = gastoMeta;
  return out;
}

/**
 * Tabla unificada: una fila por canal con pacientes (de la agenda),
 * gasto y retorno. Ordena por dinero cobrado (lo que más trae arriba);
 * el retorno dice si una fuente de paga se justifica.
 */
export function tablaFuentes(porOrigen, gastos, escribieron = {}) {
  const vacia = (canal) => ({ origen: canal, pacientes: 0, vinieron: 0, pagaron: 0, cobrado: 0, presupuestado: 0 });
  const filas = new Map();
  for (const o of porOrigen || []) filas.set(o.origen, { ...o });
  // Fuentes que sólo tienen gente que escribió por WhatsApp (aún sin cita)
  for (const canal of Object.keys(escribieron || {})) {
    if (!filas.has(canal)) filas.set(canal, vacia(canal));
  }
  for (const canal of Object.keys(gastos || {})) {
    if (!filas.has(canal)) {
      filas.set(canal, vacia(canal));
    }
  }
  const div = (a, b) => (b > 0 ? a / b : null);
  const rows = [...filas.values()].map((f) => {
    const gasto = gastos?.[f.origen] ?? null;
    const wa = escribieron?.[f.origen];
    return {
      ...f,
      escribieron: wa?.escribieron ?? 0,
      agendoDeWhatsapp: wa?.escribieron ? wa.agendaron / wa.escribieron : null,
      gasto,
      costoPaciente: gasto != null ? div(gasto, f.pacientes) : null,
      costoPacientePago: gasto != null ? div(gasto, f.pagaron) : null,
      retorno: gasto ? div(f.cobrado, gasto) : null,
    };
  });
  return rows.sort((a, b) => b.cobrado - a.cobrado || b.pacientes - a.pacientes || (b.gasto || 0) - (a.gasto || 0));
}
