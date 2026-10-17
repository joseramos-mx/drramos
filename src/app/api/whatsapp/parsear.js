/**
 * Convierte lo que manda WhatsApp (Cloud API vía 360dialog, número en
 * coexistencia) en una lista plana de mensajes. Funciones puras: no
 * tocan la base, para poder probarlas con ejemplos.
 *
 * Campos que se leen (formato de Meta):
 *   messages           → mensajes del paciente (y estados de entrega, que se ignoran)
 *   smb_message_echoes → lo que la Dra. Gaby manda desde su app
 *   history            → historial al conectar (hasta 6 meses)
 * Cualquier otro campo se guarda crudo en whatsapp_eventos y se ignora.
 */

import { diezDigitos, normalizarTelefono } from "@/lib/telefono";

const aIso = (ts) => {
  const n = Number(ts);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString() : new Date().toISOString();
};

/** Texto legible de cualquier tipo de mensaje. */
export function textoDe(m) {
  if (!m) return null;
  switch (m.type) {
    case "text": return m.text?.body ?? null;
    case "button": return m.button?.text ?? null;
    case "interactive":
      return m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? null;
    case "image": case "video": case "document":
      return m[m.type]?.caption ?? null;
    case "reaction": return m.reaction?.emoji ?? null;
    default: return null;
  }
}

/** Saca los cambios (field + value) de un cuerpo de webhook. */
function cambios(body) {
  if (Array.isArray(body?.entry)) {
    return body.entry.flatMap((e) => (e.changes || []).map((c) => ({ campo: c.field, valor: c.value })));
  }
  // Algunos proveedores mandan el "value" directo, sin entry/changes
  if (body?.messages || body?.statuses) return [{ campo: "messages", valor: body }];
  return [];
}

/**
 * @returns {{ campos: string[], mensajes: Array<{
 *   wa_id, telefono, direccion, via, tipo, texto, enviado_en,
 *   nombre_contacto, ctwa_clid, referencia }> }}
 */
export function parsearWebhook(body) {
  const mensajes = [];
  const campos = [];

  for (const { campo, valor } of cambios(body)) {
    campos.push(campo);
    const negocio = diezDigitos(valor?.metadata?.display_phone_number);
    const nombres = Object.fromEntries(
      (valor?.contacts || []).map((c) => [diezDigitos(c.wa_id), c.profile?.name || null])
    );

    if (campo === "messages") {
      for (const m of valor?.messages || []) {
        mensajes.push({
          wa_id: m.id,
          telefono: normalizarTelefono(m.from),
          direccion: "entrada",
          via: "paciente",
          tipo: m.type || null,
          texto: textoDe(m),
          enviado_en: aIso(m.timestamp),
          nombre_contacto: nombres[diezDigitos(m.from)] || null,
          ctwa_clid: m.referral?.ctwa_clid || null,
          referencia: m.referral || null,
        });
      }
    }

    if (campo === "smb_message_echoes") {
      for (const m of valor?.message_echoes || []) {
        mensajes.push({
          wa_id: m.id,
          telefono: normalizarTelefono(m.to),
          direccion: "salida",
          via: "app",
          tipo: m.type || null,
          texto: textoDe(m),
          enviado_en: aIso(m.timestamp),
          nombre_contacto: null,
          ctwa_clid: null,
          referencia: null,
        });
      }
    }

    if (campo === "history") {
      for (const h of valor?.history || []) {
        for (const t of h.threads || []) {
          for (const m of t.messages || []) {
            const delNegocio = negocio && diezDigitos(m.from) === negocio;
            mensajes.push({
              wa_id: m.id,
              telefono: normalizarTelefono(delNegocio ? (m.to || t.id) : m.from),
              direccion: delNegocio ? "salida" : "entrada",
              via: "historial",
              tipo: m.type || null,
              texto: textoDe(m),
              enviado_en: aIso(m.timestamp),
              nombre_contacto: null,
              ctwa_clid: null,
              referencia: null,
            });
          }
        }
      }
    }
  }

  return { campos, mensajes: mensajes.filter((m) => m.wa_id && m.telefono) };
}
