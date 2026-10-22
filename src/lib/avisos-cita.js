/**
 * Mandar a un paciente una plantilla de WhatsApp sobre SU cita (confirmación,
 * recordatorio, bloqueo, faltó, seguimiento de presupuesto), con los botones de
 * "Mi cita" ya ligados a esa cita, y dejarla en su chat. SÓLO SERVIDOR.
 * No se le escribe a quien tiene la etiqueta "no_contactar" (pidió que ya no).
 */

import { enviarPlantilla } from "@/lib/whatsapp";
import { normalizarTelefono } from "@/lib/telefono";
import { BOTONES_PLANTILLA, idBoton } from "@/lib/mi-cita";
import { PLANTILLAS, PLANTILLAS_SISTEMA, rellenar } from "@/app/crm/mensajes/plantillas";
import { formatFechaLarga, formatHora, hoyDurango, minutosDelDia } from "@/app/agenda/lib";

/** "María Fernanda López" → "María"; si no hay nombre real, saludo general. */
export function primerNombre(nombre) {
  if (!nombre || /^WhatsApp /.test(nombre)) return "estimado paciente";
  return nombre.trim().split(/\s+/)[0];
}

/**
 * `cita`: { id, inicio, paciente: { id, nombre, whatsapp, etiquetas } }.
 * Devuelve { ok } | { sinWhatsapp } | { noContactar } | { error }.
 */
export async function mandarPlantillaCita(admin, cita, nombrePlantilla, { via = "api", valores: propios = null } = {}) {
  const p = [...PLANTILLAS, ...PLANTILLAS_SISTEMA].find((x) => x.nombre === nombrePlantilla);
  if (!p) return { error: "Plantilla desconocida" };
  if ((cita.paciente?.etiquetas || []).includes("no_contactar")) return { noContactar: true };
  const tel = normalizarTelefono(cita.paciente?.whatsapp);
  if (!tel) return { sinWhatsapp: true };

  const fecha = formatFechaLarga(hoyDurango(new Date(cita.inicio)));
  const valores = propios || [primerNombre(cita.paciente?.nombre), fecha, formatHora(minutosDelDia(cita.inicio))].slice(0, (p.texto.match(/\{\{\d\}\}/g) || []).length);
  const botones = (BOTONES_PLANTILLA[p.nombre] || []).map((a) => idBoton(a, cita.id));
  const envio = await enviarPlantilla(tel, p.nombre, valores, "es_MX", { botones });
  if (envio.error) return { error: envio.error };

  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `${p.nombre}-${cita.id}-${Date.now()}`,
      telefono: tel,
      direccion: "salida",
      via,
      tipo: "template",
      texto: `${rellenar(p.texto, valores)}${p.botones?.length ? `\n[Botones: ${p.botones.join(" · ")}]` : ""}`,
      enviado_en: new Date().toISOString(),
      paciente_id: cita.paciente?.id || null,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  return { ok: true };
}
