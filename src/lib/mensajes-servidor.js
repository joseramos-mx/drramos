/**
 * Piezas de servidor de la bandeja "Mensajes": guardar fotos/archivos en
 * el bucket privado y mandar avisos (web push) a los aparatos del
 * consultorio. SÓLO SERVIDOR (usa service_role y la llave privada VAPID).
 *
 * Variables de entorno:
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  llave pública (la usa el navegador al activar avisos)
 *   VAPID_PRIVATE_KEY             llave privada, nunca NEXT_PUBLIC_
 *   VAPID_SUBJECT                 opcional, "mailto:…" de contacto
 *   (generarlas una vez con: npx web-push generate-vapid-keys)
 */

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const BUCKET = "whatsapp-media";

export function supabaseServicio() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

const EXT = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac", "audio/amr": "amr",
  "video/mp4": "mp4", "video/3gpp": "3gp", "application/pdf": "pdf",
};

/** Guarda el archivo y devuelve su ruta en el bucket (o null). */
export async function guardarMedia(admin, telefono, waId, buffer, mime) {
  const tipo = String(mime || "application/octet-stream").split(";")[0].trim();
  const ruta = `${telefono}/${String(waId).replace(/[^\w.-]/g, "_")}.${EXT[tipo] || "bin"}`;
  const { error } = await admin.storage.from(BUCKET).upload(ruta, buffer, { contentType: tipo, upsert: true });
  if (error) {
    console.error("[mensajes] guardar media", ruta, error.message);
    return null;
  }
  return ruta;
}

function vapidListo() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:drfeliperamos.consultorio@gmail.com", pub, priv);
  return true;
}

/**
 * Avisa a todos los aparatos con avisos activados. Por privacidad, el
 * aviso NO lleva el contenido del mensaje (se ve en la pantalla
 * bloqueada): sólo el nombre del paciente.
 */
export async function avisarMensajeNuevo(admin, { nombre, telefono }) {
  return avisar(admin, { titulo: nombre || "WhatsApp del consultorio", cuerpo: "Te escribió por WhatsApp", telefono });
}

/** Aviso genérico (mensaje nuevo, caso que pasa el asistente, borrador listo). Al tocarlo abre ese chat. */
export async function avisar(admin, { titulo, cuerpo, telefono, url }) {
  if (!vapidListo()) return;
  const { data: subs } = await admin.from("push_suscripciones").select("id, endpoint, p256dh, auth");
  const payload = JSON.stringify({
    title: titulo,
    body: cuerpo,
    url: url || (telefono ? `/crm/mensajes/${telefono}` : "/crm/mensajes"),
    tag: telefono ? `wa-${telefono}` : "mensajes",
  });
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
        TTL: 60 * 60,
        urgency: "high",
      });
    } catch (e) {
      // 404/410: el aparato ya no acepta avisos (se desinstaló o se revocó)
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await admin.from("push_suscripciones").delete().eq("id", s.id);
      } else {
        console.error("[mensajes] aviso", e?.statusCode, e?.body || e?.message);
      }
    }
  }
}

/**
 * Quién ve "Otras secciones" y "Probar asistente": los correos de
 * CRM_ADMIN_EMAILS (separados por coma; p. ej. el de Jesús y el del
 * doctor). La Dra. Gaby sólo ve Avisos y Cuenta. Si la variable está
 * vacía, todos las ven (para no dejar a nadie fuera).
 */
export function esAdmin(email) {
  const lista = (process.env.CRM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.length === 0 || lista.includes(String(email || "").toLowerCase());
}
