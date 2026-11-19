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

/** Motivos más comunes por los que Meta no entrega un mensaje, en palabras sencillas. */
const MOTIVOS = {
  131026: "Ese número no tiene WhatsApp o no puede recibir mensajes. Revisa que el número esté bien escrito.",
  131021: "No se puede mandar al mismo número del consultorio.",
  131047: "Pasaron más de 24 horas desde su último mensaje: hay que mandar un mensaje aprobado.",
  131049: "Meta lo detuvo para no llenar al paciente de mensajes. Intenta otro día o llámale.",
  130472: "Meta no lo entregó (lo hace a veces con números nuevos). Llámale o intenta más tarde.",
  131050: "El paciente pidió no recibir mensajes de este tipo.",
  131056: "Se le mandaron demasiados mensajes seguidos. Espera un rato.",
  131042: "Hay un problema con el pago de WhatsApp. Avísale a Jesús.",
  131053: "No se pudo mandar el archivo.",
  132000: "El mensaje aprobado no se llenó bien. Avísale a Jesús.",
  132001: "Ese mensaje aprobado no existe o todavía no lo aprueba Meta.",
  132015: "Meta pausó ese mensaje aprobado. Avísale a Jesús.",
  132016: "Meta desactivó ese mensaje aprobado. Avísale a Jesús.",
};

export function motivoDeFalla(e) {
  const codigo = Number(e?.code);
  if (MOTIVOS[codigo]) return MOTIVOS[codigo];
  const detalle = e?.error_data?.details || e?.message || e?.title;
  return `Meta no lo entregó${codigo ? ` (código ${codigo})` : ""}${detalle ? `: ${String(detalle).slice(0, 160)}` : ""}.`;
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
  const estados = [];

  for (const { campo, valor } of cambios(body)) {
    campos.push(campo);
    const negocio = diezDigitos(valor?.metadata?.display_phone_number);
    const nombres = Object.fromEntries(
      (valor?.contacts || []).map((c) => [diezDigitos(c.wa_id), c.profile?.name || null])
    );

    if (campo === "messages") {
      // ¿Llegó? Meta avisa después de mandar: sent → delivered → read, o failed con el motivo
      for (const st of valor?.statuses || []) {
        if (!st?.id || !["sent", "delivered", "read", "failed"].includes(st.status)) continue;
        const e = st.errors?.[0];
        estados.push({
          wa_id: st.id,
          estado: st.status,
          en: aIso(st.timestamp),
          error: st.status === "failed" ? motivoDeFalla(e) : null,
        });
      }
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
          // Si contestó "citando" un mensaje (o tocó un botón de uno), el id de ese mensaje
          responde_a: m.context?.id || null,
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
    estados,
    mensajes: mensajes
      .filter((m) => m.wa_id && m.telefono)
      .map(({ crudo, ...m }) => ({ ...m, media_id: mediaDe(crudo)?.id || null, media_mime: mediaDe(crudo)?.mime || null })),
  };
}
