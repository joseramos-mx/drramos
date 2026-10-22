/** Helpers de la bandeja de Mensajes (sin dependencias del servidor). */

/** Etiquetas del chat (un toque). El id se guarda en pacientes.etiquetas. */
export const ETIQUETAS = [
  { id: "valoracion", label: "Quiere valoración" },
  { id: "presupuesto", label: "Presupuesto" },
  { id: "seguimiento", label: "Seguimiento" },
  { id: "urgencia", label: "Urgencia" },
  { id: "paciente", label: "Ya es paciente" },
];

export const etiquetaLabel = (id) => ETIQUETAS.find((e) => e.id === id)?.label || id;

/** Una fila por teléfono con su último mensaje; primero las que esperan respuesta. */
export function conversaciones(mensajes) {
  const g = new Map();
  for (const m of mensajes) {
    const c = g.get(m.telefono) || { telefono: m.telefono, nombre: null, ultimo: null, etiquetas: [] };
    c.ultimo = m; // vienen ordenados por hora
    if (m.paciente?.nombre) c.nombre = m.paciente.nombre;
    if (m.paciente?.etiquetas) c.etiquetas = m.paciente.etiquetas;
    g.set(m.telefono, c);
  }
  return [...g.values()]
    .map((c) => ({
      ...c,
      nombre: c.nombre || `WhatsApp ${c.telefono.slice(-10)}`,
      esperando: c.ultimo.direccion === "entrada",
    }))
    .sort((a, b) => {
      if (a.esperando !== b.esperando) return a.esperando ? -1 : 1;
      return a.ultimo.enviado_en < b.ultimo.enviado_en ? 1 : -1;
    });
}

/** "10:42" si es de hoy, "ayer", o "17 oct". Hora de Durango. */
export function horaCorta(iso) {
  const d = new Date(iso);
  const opts = { timeZone: "America/Mexico_City" };
  const dia = (x) => x.toLocaleDateString("es-MX", opts);
  const hoy = new Date();
  if (dia(d) === dia(hoy)) return d.toLocaleTimeString("es-MX", { ...opts, hour: "numeric", minute: "2-digit" });
  const ayer = new Date(hoy.getTime() - 86400000);
  if (dia(d) === dia(ayer)) return "ayer";
  return d.toLocaleDateString("es-MX", { ...opts, day: "numeric", month: "short" });
}

/** Encabezado de día en el chat: "Hoy", "Ayer" o "lunes 13 de octubre". */
export function diaDe(iso) {
  const opts = { timeZone: "America/Mexico_City" };
  const dia = (x) => x.toLocaleDateString("es-MX", opts);
  const d = new Date(iso);
  const hoy = new Date();
  if (dia(d) === dia(hoy)) return "Hoy";
  if (dia(d) === dia(new Date(hoy.getTime() - 86400000))) return "Ayer";
  return d.toLocaleDateString("es-MX", { ...opts, weekday: "long", day: "numeric", month: "long" });
}

/** Hora exacta para cada globo del chat. */
export function horaDe(iso) {
  return new Date(iso).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "numeric", minute: "2-digit" });
}

/** Texto de la lista cuando el último mensaje no es texto. */
export function resumenDe(m) {
  if (m.texto) return m.texto;
  const t = { image: "📷 Foto", audio: "🎤 Audio", video: "🎥 Video", document: "📄 Documento", sticker: "Sticker", location: "📍 Ubicación" };
  return t[m.tipo] || "📎 Archivo";
}
