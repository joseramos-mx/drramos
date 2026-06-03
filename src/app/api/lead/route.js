import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/lead
 *
 * 1. Persiste el lead en Supabase (tabla public.leads). Sin persistencia
 *    no disparamos pixel: en producción devolvemos 502.
 * 2. Dispara el mismo evento neutral (LeadCualificado) a la Conversions
 *    API de Meta, usando el mismo event_id que el cliente para
 *    deduplicar contra el Pixel browser side. El estado de salud
 *    (track, dientes, motivo, plan) NO se envía a Meta, queda solo en
 *    Supabase.
 * 3. Devuelve la configuración del pixel para que el cliente dispare
 *    fbq con exactamente los mismos parámetros y eventID.
 *
 * Variables de entorno:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   META_PIXEL_ID
 *   META_CAPI_ACCESS_TOKEN
 *   META_TEST_EVENT_CODE (opcional)
 */

const META_GRAPH_VERSION = "v22.0";

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
  let d = String(raw || "").replace(/\D+/g, "");
  if (d.length === 10) d = "52" + d;
  return d;
}

function firstName(fullName) {
  if (!fullName) return "";
  return String(fullName).trim().split(/\s+/)[0] || "";
}

// Mapeo del evento interno al evento neutral que va a Meta.
// Sin pistas de padecimiento (HIPAA, política de Meta). Solo value
// y currency como custom_data para optimización de ad spend.
// Los valores son placeholders, hay que afinarlos con el ticket real.
function toMetaEvent(evento) {
  const value = evento === "LeadReconstruccion" ? 100000 : 35000;
  return { name: "LeadCualificado", value, currency: "MXN" };
}

// ─────────────────────────────────────────────────────────────
//  Supabase
// ─────────────────────────────────────────────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function persistToSupabase(lead) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, skipped: "supabase_unconfigured" };

  const { error } = await supabase.from("leads").insert({
    event_id: lead.eventId,
    evento: lead.evento,
    track: lead.track,
    nombre: lead.nombre,
    whatsapp: lead.whatsapp,
    dientes: lead.answers?.dientes ?? null,
    motivo: lead.answers?.motivo ?? null,
    plan: lead.answers?.plan ?? null,
    fbp: lead.fbp ?? null,
    fbc: lead.fbc ?? null,
    ua: lead.ua ?? null,
    referer: lead.referer ?? null,
  });

  if (error) throw new Error(`supabase: ${error.message}`);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
//  Meta Conversions API
// ─────────────────────────────────────────────────────────────
async function sendToMetaCAPI({ lead, meta, request }) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return { ok: false, skipped: "capi_unconfigured" };
  }

  const headers = request.headers;
  const eventSourceUrl =
    headers.get("referer") ||
    headers.get("origin") ||
    "https://www.drfelipedejesusramos.com/diseno-sonrisa";

  const userAgent = headers.get("user-agent") || "";
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim();

  const phone = normalizePhone(lead.whatsapp);
  const fn = firstName(lead.nombre);

  const event = {
    event_name: meta.name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: lead.eventId,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: {
      ph: phone ? [sha256(phone)] : undefined,
      fn: fn ? [sha256(fn)] : undefined,
      client_user_agent: userAgent || undefined,
      client_ip_address: clientIp || undefined,
      fbp: lead.fbp || undefined,
      fbc: lead.fbc || undefined,
    },
    custom_data: {
      value: meta.value,
      currency: meta.currency,
    },
  };

  event.user_data = Object.fromEntries(
    Object.entries(event.user_data).filter(([, v]) => v !== undefined)
  );

  const body = { data: [event], access_token: token };
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
    referer: request.headers.get("referer") || "",
  };

  // 1) Persistir en Supabase (único destino).
  let persisted = false;
  try {
    const supa = await persistToSupabase(lead);
    if (supa.ok) persisted = true;
  } catch (err) {
    console.error("[lead] persistencia falló", err);
    // En dev devolvemos el detalle al cliente para debug rápido.
    // En producción solo el código genérico.
    const body =
      process.env.NODE_ENV === "production"
        ? { ok: false, error: "persistence_failed" }
        : { ok: false, error: "persistence_failed", detail: String(err?.message || err) };
    return Response.json(body, { status: 502 });
  }

  if (!persisted) {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ ok: false, error: "no_persistence" }, { status: 502 });
    }
    console.log("[lead] dev, sin destino persistente:", lead);
  }

  // 2) Meta CAPI con evento neutral.
  const meta = toMetaEvent(lead.evento);
  const capi = await sendToMetaCAPI({ lead, meta, request }).catch((err) => {
    console.error("[capi] excepción", err);
    return { ok: false, error: String(err) };
  });

  // 3) Devolver config para que el cliente dispare fbq con mismos params.
  return Response.json({
    ok: true,
    persisted,
    capi,
    pixel: {
      eventName: meta.name,
      eventId: lead.eventId,
      value: meta.value,
      currency: meta.currency,
    },
  });
}
