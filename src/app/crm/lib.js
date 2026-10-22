/**
 * Helpers compartidos del CRM. No exporta nada sensible.
 */

export const ESTADOS = [
  { value: "nuevo",      label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cita",       label: "Cita" },
  { value: "cerrado",    label: "Cerrado" },
  { value: "perdido",    label: "Perdido" },
];

export const TRACKS = [
  { value: "full_mouth", label: "Reconstrucción $100k" },
  { value: "estetica",   label: "Estética" },
];

export const LABELS = {
  motivo: {
    evento_boda: "Evento o boda",
    trabajo: "Trabajo o imagen",
    merezco: "Ya me lo merezco",
    viendo: "Solo viendo opciones",
  },
  plan: {
    si_plan: "Sí, quiere su plan",
    precio_rapido: "Solo precio rápido",
  },
  dientes: {
    intactos: "Todos firmes",
    faltan_o_flojos: "Faltan o se mueven",
  },
};

export function labelMotivo(value) {
  return LABELS.motivo[value] || value || "n/d";
}
export function labelPlan(value) {
  return LABELS.plan[value] || value || "n/d";
}

/**
 * Normaliza un número a formato wa.me. Antepone "52" si quedaron 10
 * dígitos limpios (asume número mexicano sin código de país).
 */
export function normalizeWhatsapp(raw) {
  let d = String(raw || "").replace(/\D+/g, "");
  if (d.length === 10) d = "52" + d;
  return d;
}

/**
 * Abre su chat en "Mensajes" (se le escribe desde el número del consultorio).
 * Antes era wa.me, que abría la app de WhatsApp del celular: el número personal.
 */
export function buildWhatsappLink(lead) {
  const phone = normalizeWhatsapp(lead.whatsapp);
  if (!phone) return null;
  return `/crm/mensajes/${phone}`;
}

export function formatDateMX(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function computeStats(leads) {
  const now = new Date();
  const mes = now.getMonth();
  const anio = now.getFullYear();

  let nuevos = 0;
  let delMes = 0;
  let reconstruccion = 0;

  for (const l of leads) {
    if (l.estado === "nuevo") nuevos++;
    const d = l.created_at ? new Date(l.created_at) : null;
    if (d && d.getMonth() === mes && d.getFullYear() === anio) delMes++;
    if (l.track === "full_mouth") reconstruccion++;
  }

  return { nuevos, delMes, reconstruccion, total: leads.length };
}
