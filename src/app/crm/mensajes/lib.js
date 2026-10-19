/** Helpers de la bandeja de Mensajes (sin dependencias del servidor). */

/** Una fila por teléfono con su último mensaje; primero las que esperan respuesta. */
export function conversaciones(mensajes) {
  const g = new Map();
  for (const m of mensajes) {
    const c = g.get(m.telefono) || { telefono: m.telefono, nombre: null, ultimo: null };
    c.ultimo = m; // vienen ordenados por hora
    if (m.paciente?.nombre) c.nombre = m.paciente.nombre;
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
