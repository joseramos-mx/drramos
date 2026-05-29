import crypto from "node:crypto";

/**
 * POST /api/lead
 *
 * Recibe el lead del formulario de aplicación, lo persiste y dispara el
 * mismo evento (LeadReconstruccion o LeadDisenoSonrisa) a la Conversions
 * API de Meta usando el MISMO eventId del cliente para deduplicar.
 *
 * Variables de entorno requeridas (todas opcionales; el handler degrada
 * con elegancia si faltan):
 *   - LEAD_WEBHOOK_URL        URL del webhook de n8n (o CRM/Supabase)
 *   - LEAD_WEBHOOK_SECRET     (opcional) bearer token para el webhook
 *   - META_PIXEL_ID           ID del Pixel de Meta
 *   - META_CAPI_ACCESS_TOKEN  Access token de la Conversions API
 *   - META_TEST_EVENT_CODE    (opcional) para validar en Events Manager
 *
 * Devuelve 200 si el lead se persistió correctamente. El cliente sólo
 * dispara fbq tras recibir 200, garantizando que no haya pixel sin lead.
 */

const META_GRAPH_VERSION = "v19.0";

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function sha256(value) {
  if (!value) return undefined;
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(raw) {
  if (!raw) return "";
  return String(raw).replace(/\D+/g, "");
}

function firstName(fullName) {
  if (!fullName) return "";
  return String(fullName).trim().split(/\s+/)[0] || "";
}

// ─────────────────────────────────────────────────────────────
//  Persistencia · webhook n8n / Supabase / CRM
// ─────────────────────────────────────────────────────────────
async function persistLead(lead) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    // Dev / staging sin destino configurado: log y devolver ok.
    // En producción el webhook DEBE estar definido.
    console.log("[lead] LEAD_WEBHOOK_URL no configurado, dump local:", lead);
    return { ok: true, fallback: true };
  }

  const headers = { "Content-Type": "application/json" };
  if (process.env.LEAD_WEBHOOK_SECRET) {
    headers.Authorization = `Bearer ${process.env.LEAD_WEBHOOK_SECRET}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(lead),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`webhook ${res.status}: ${text}`);
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
//  Meta Conversions API (server-side, mismo eventId que el cliente)
// ─────────────────────────────────────────────────────────────
async function sendToMetaCAPI({ lead, request }) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    // Credenciales aún sin configurar: el cliente igual disparará fbq
    // si el Pixel está cargado en el head.
    return { ok: false, skipped: true };
  }

  const headers = request.headers;
  const eventSourceUrl =
    headers.get("referer") ||
    headers.get("origin") ||
    "https://www.drfelipedejesusramos.com/diseno-sonrisa";

  const userAgent = headers.get("user-agent") || "";
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim();

  const fbp = lead.fbp || undefined;
  const fbc = lead.fbc || undefined;

  const phone = normalizePhone(lead.whatsapp);
  const fn = firstName(lead.nombre);

  const event = {
    event_name: lead.evento,
    event_time: Math.floor(Date.now() / 1000),
    event_id: lead.eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: {
      ph: phone ? [sha256(phone)] : undefined,
      fn: fn ? [sha256(fn)] : undefined,
      client_user_agent: userAgent || undefined,
      client_ip_address: clientIp || undefined,
      fbp,
      fbc,
    },
    custom_data: {
      track: lead.track,
      motivo: lead.answers?.motivo,
      plan: lead.answers?.plan,
    },
  };

  // Limpia keys undefined
  event.user_data = Object.fromEntries(
    Object.entries(event.user_data).filter(([, v]) => v !== undefined)
  );

  const body = {
    data: [event],
    access_token: token,
  };
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[capi] error", res.status, text);
    return { ok: false, error: text };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { eventId, evento, track, nombre, whatsapp, answers, fbp, fbc } =
    payload || {};

  // Validación mínima
  if (!eventId || !evento || !track || !nombre || !whatsapp || !answers) {
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  if (evento !== "LeadReconstruccion" && evento !== "LeadDisenoSonrisa") {
    return Response.json({ ok: false, error: "invalid_event" }, { status: 400 });
  }

  const lead = {
    eventId,
    evento,
    track,
    nombre: String(nombre).trim(),
    whatsapp: String(whatsapp).trim(),
    answers,
    fbp,
    fbc,
    receivedAt: new Date().toISOString(),
    ua: request.headers.get("user-agent") || "",
  };

  // 1) Persistir SIEMPRE primero. Sin lead persistido no hay a quién contactar
  //    y por tanto no debemos disparar el pixel.
  try {
    await persistLead(lead);
  } catch (err) {
    console.error("[lead] persistencia falló", err);
    return Response.json({ ok: false, error: "persistence_failed" }, { status: 502 });
  }

  // 2) CAPI server-side con el mismo eventId. No bloquea la respuesta si falla.
  const capi = await sendToMetaCAPI({ lead, request }).catch((err) => {
    console.error("[capi] excepción", err);
    return { ok: false, error: String(err) };
  });

  return Response.json({ ok: true, capi });
}
