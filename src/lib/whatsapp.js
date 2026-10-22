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

const graphUrl = (ruta) => `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}/${ruta}`;
const auth = () => ({ Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` });

/**
 * Baja un archivo (foto, audio, documento) que mandó el paciente.
 * Meta da primero una URL temporal y luego el archivo con el mismo token.
 * Devuelve { buffer, mime } o null.
 */
export async function bajarMedia(mediaId) {
  if (!whatsappConfigurado() || !mediaId) return null;
  try {
    const info = await fetch(graphUrl(mediaId), { headers: auth(), cache: "no-store" }).then((r) => r.json());
    if (!info?.url) return null;
    const res = await fetch(info.url, { headers: auth(), cache: "no-store" });
    if (!res.ok) return null;
    return { buffer: Buffer.from(await res.arrayBuffer()), mime: info.mime_type || res.headers.get("content-type") };
  } catch (e) {
    console.error("[whatsapp] bajar media", mediaId, e?.message || e);
    return null;
  }
}

/** Sube una imagen a Meta para poder mandarla. Devuelve el id o null. */
async function subirMedia(buffer, mime) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mime);
  form.append("file", new Blob([buffer], { type: mime }), "foto.jpg");
  const res = await fetch(graphUrl(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`), {
    method: "POST",
    headers: auth(),
    body: form,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id) {
    console.error("[whatsapp] subir media", json.error?.code, json.error?.message);
    return null;
  }
  return json.id;
}

/** Manda una foto (con texto opcional). Devuelve { ok, wa_id, media_id } o { error }. */
export async function enviarImagen(telefono, buffer, mime, pie) {
  if (!whatsappConfigurado()) return { error: "WhatsApp todavía no está conectado." };
  const to = normalizarTelefono(telefono);
  if (!to) return { error: "Teléfono inválido." };
  const mediaId = await subirMedia(buffer, mime);
  if (!mediaId) return { error: "No se pudo subir la foto. Intenta de nuevo." };

  const image = { id: mediaId };
  if (pie?.trim()) image.caption = pie.trim().slice(0, 1024);
  try {
    const res = await fetch(graphUrl(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`), {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "image", image }),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      console.error("[whatsapp] envío foto", json.error?.code, json.error?.message);
      if (json.error?.code === 131047) return { error: "Pasaron más de 24 h: sólo se puede mandar una plantilla aprobada." };
      return { error: "WhatsApp no aceptó la foto. Intenta de nuevo." };
    }
    return { ok: true, wa_id: json.messages?.[0]?.id || null, media_id: mediaId, to };
  } catch (e) {
    console.error("[whatsapp] envío foto", e);
    return { error: "No se pudo contactar a WhatsApp." };
  }
}
