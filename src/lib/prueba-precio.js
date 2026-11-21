/**
 * Prueba del costo de la valoración (Jesús, 2026-11-19): ¿conviene decir los $500 DE
 * ENTRADA o sólo si preguntan? A los pacientes NUEVOS que escriben desde el inicio de la
 * prueba se les reparte en dos grupos por el último dígito de su teléfono (es al azar y
 * siempre da lo mismo para la misma persona, sin guardar nada):
 *   par   → "dice":     el primer mensaje del asistente ya trae el costo de la valoración
 *   impar → "pregunta": como siempre, el costo sólo si lo preguntan
 * Resultados compara cuántos de cada grupo agendan, vienen y pagan.
 * PRUEBA_PRECIO_DESDE (AAAA-MM-DD) cambia el inicio; "no" la apaga.
 */
export const PRUEBA_PRECIO_DESDE = process.env.PRUEBA_PRECIO_DESDE || "2026-11-23";

export const pruebaActiva = () => /^\d{4}-\d{2}-\d{2}$/.test(PRUEBA_PRECIO_DESDE);

export function grupoPrecio(telefono) {
  const d = String(telefono || "").replace(/\D+/g, "").slice(-1);
  if (!d) return null;
  return Number(d) % 2 === 0 ? "dice" : "pregunta";
}

/** ¿Este paciente entra a la prueba? (escribió por primera vez desde el inicio) */
export function entraALaPrueba(primerMensajeEn) {
  if (!pruebaActiva() || !primerMensajeEn) return false;
  return String(primerMensajeEn).slice(0, 10) >= PRUEBA_PRECIO_DESDE;
}

/**
 * Resultados: por grupo, cuántos escribieron, agendaron, vinieron y pagaron.
 * @param pacientes [{ id, whatsapp, primer_mensaje_en }]
 * @param citas     [{ paciente: { id }, estado, pagado_monto }]
 */
export function resultadosPruebaPrecio(pacientes, citas) {
  if (!pruebaActiva()) return null;
  const conCita = new Set();
  const vino = new Set();
  const pago = new Set();
  for (const c of citas || []) {
    const id = c.paciente?.id;
    if (!id) continue;
    conCita.add(id);
    if (c.estado === "asistio") vino.add(id);
    if (c.estado === "asistio" && Number(c.pagado_monto) > 0) pago.add(id);
  }
  const grupos = { dice: { escribieron: 0, agendaron: 0, vinieron: 0, pagaron: 0 }, pregunta: { escribieron: 0, agendaron: 0, vinieron: 0, pagaron: 0 } };
  for (const p of pacientes || []) {
    const g = grupos[grupoPrecio(p.whatsapp)];
    if (!g || !entraALaPrueba(p.primer_mensaje_en)) continue;
    g.escribieron++;
    if (conCita.has(p.id)) g.agendaron++;
    if (vino.has(p.id)) g.vinieron++;
    if (pago.has(p.id)) g.pagaron++;
  }
  return { desde: PRUEBA_PRECIO_DESDE, grupos };
}
