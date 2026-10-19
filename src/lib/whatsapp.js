/**
 * WhatsApp Cloud API de Meta (directo, sin intermediarios). SÓLO SERVIDOR:
 * importar únicamente desde route handlers y server actions.
 *
 * Variables de entorno (nunca NEXT_PUBLIC_):
 *   WHATSAPP_TOKEN            token de usuario del sistema (permiso whatsapp_business_messaging)
 *   WHATSAPP_PHONE_NUMBER_ID  id del número del consultorio en WhatsApp Manager
 *   META_GRAPH_VERSION        opcional, default v23.0
 */

import { normalizarTelefono } from "@/lib/telefono";

const VENTANA_MS = 24 * 60 * 60 * 1000;

export function whatsappConfigurado() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Regla de Meta: texto libre sólo dentro de las 24 h siguientes al
 * último mensaje del paciente. Fuera de eso, sólo plantillas aprobadas.
 */
export function ventanaAbierta(ultimoMensajePaciente, ahora = Date.now()) {
  if (!ultimoMensajePaciente) return false;
  return ahora - new Date(ultimoMensajePaciente).getTime() < VENTANA_MS;
}

/** Manda un texto. Devuelve { ok, wa_id } o { error }. */
export async function enviarTexto(telefono, texto) {
  if (!whatsappConfigurado()) return { error: "WhatsApp todavía no está conectado." };
  const to = normalizarTelefono(telefono);
  const body = String(texto || "").trim();
  if (!to) return { error: "Teléfono inválido." };
  if (!body) return { error: "Escribe un mensaje." };
  if (body.length > 4096) return { error: "El mensaje es demasiado largo." };

  const version = process.env.META_GRAPH_VERSION || "v23.0";
  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body, preview_url: false },
        }),
        cache: "no-store",
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      console.error("[whatsapp] envío", json.error?.code, json.error?.message);
      // 131047: fuera de la ventana de 24 h
      if (json.error?.code === 131047) return { error: "Pasaron más de 24 h: sólo se puede mandar una plantilla aprobada." };
      return { error: "WhatsApp no aceptó el mensaje. Intenta de nuevo." };
    }
    return { ok: true, wa_id: json.messages?.[0]?.id || null, to };
  } catch (e) {
    console.error("[whatsapp] envío", e);
    return { error: "No se pudo contactar a WhatsApp." };
  }
}
