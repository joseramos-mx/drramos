/**
 * Convierte lo que manda la WhatsApp Cloud API de Meta en una lista
 * plana de mensajes (también entiende ecos e historial de coexistencia,
 * por si algún día se usa). Funciones puras: no
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

/** Qué botón u opción tocó el paciente (id/payload), o null. */
export function respuestaDe(m) {
  if (m?.type === "button") return m.button?.payload || m.button?.text || null;
  if (m?.type === "interactive") return m.interactive?.button_reply?.id || m.interactive?.list_reply?.id || null;
  return null;
}

/** Foto, audio, video, documento o sticker: { id, mime } o null. */
export function mediaDe(m) {
  const tipos = ["image", "audio", "video", "document", "sticker"];
  if (!m || !tipos.includes(m.type) || !m[m.type]?.id) return null;
  return { id: m[m.type].id, mime: m[m.type].mime_type || null };
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
 *   nombre_contacto, ctwa_clid, referencia, media_id, media_mime }> }}
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
          respuesta: respuestaDe(m),
          crudo: m,
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
          crudo: m,
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
              crudo: m,
            });
          }
        }
      }
    }
  }

  // El mensaje original sigue en `crudo` para sacar foto/audio si trae
  return {
    campos,
    mensajes: mensajes
      .filter((m) => m.wa_id && m.telefono)
      .map(({ crudo, ...m }) => ({ ...m, media_id: mediaDe(crudo)?.id || null, media_mime: mediaDe(crudo)?.mime || null })),
  };
}
