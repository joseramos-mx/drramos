import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { parsearWebhook } from "./parsear";
import { codigoEnMensaje } from "../../crm/resultados/fuentes";

/**
 * Buzón de WhatsApp (360dialog, número en coexistencia). SÓLO LEE:
 * guarda cada mensaje, crea al paciente la primera vez que escribe y
 * detecta de qué fuente llegó ("(ref G1)" o el click del anuncio).
 * Nunca manda mensajes.
 *
 * Variables de entorno (servidor):
 *   WHATSAPP_WEBHOOK_SECRET    secreto en la URL: /api/whatsapp?token=…
 *   SUPABASE_SERVICE_ROLE_KEY  sólo aquí, nunca en el navegador
 *   WHATSAPP_GUARDAR_CRUDO     "0" para dejar de guardar el payload crudo
 *
 * Siempre responde 200 a lo autorizado (aunque algo falle por dentro)
 * para que el proveedor no reintente en bucle; los errores se registran.
 */

export const dynamic = "force-dynamic";

function autorizado(request) {
  const esperado = process.env.WHATSAPP_WEBHOOK_SECRET || "";
  const recibido = new URL(request.url).searchParams.get("token") || "";
  if (!esperado || esperado.length < 24) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  return a.length === b.length && timingSafeEqual(a, b);
}

function supabaseServicio() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// Verificación estilo Meta (por si se registra el webhook directo con Meta)
export async function GET(request) {
  const u = new URL(request.url);
  if (u.searchParams.get("hub.mode") === "subscribe" && autorizado(request)) {
    return new Response(u.searchParams.get("hub.challenge") || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request) {
  if (!autorizado(request)) return new Response("Forbidden", { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "json" }, { status: 400 });
  }

  const supabase = supabaseServicio();
  const { campos, mensajes } = parsearWebhook(body);

  if (process.env.WHATSAPP_GUARDAR_CRUDO !== "0") {
    await supabase.from("whatsapp_eventos").insert({ campo: campos.join(",") || null, payload: body });
  }

  let guardados = 0;
  for (const m of mensajes) {
    try {
      const pacienteId = await pacienteDe(supabase, m);
      const { error } = await supabase.from("whatsapp_mensajes").upsert(
        {
          wa_id: m.wa_id,
          telefono: m.telefono,
          direccion: m.direccion,
          via: m.via,
          tipo: m.tipo,
          texto: m.texto,
          enviado_en: m.enviado_en,
          paciente_id: pacienteId,
          ctwa_clid: m.ctwa_clid,
          referencia: m.referencia,
        },
        { onConflict: "wa_id", ignoreDuplicates: true }
      );
      if (error) throw error;
      guardados++;
    } catch (e) {
      console.error("[whatsapp] mensaje", m.wa_id, e?.message || e);
    }
  }

  return Response.json({ ok: true, recibidos: mensajes.length, guardados });
}

/**
 * Encuentra o crea al paciente por su teléfono. La fuente se fija con el
 * primer mensaje del paciente: código "(ref XX)" del link, o el click del
 * anuncio. Si el paciente ya tenía fuente, no se cambia.
 */
async function pacienteDe(supabase, m) {
  const { data: existente } = await supabase
    .from("pacientes")
    .select("id, origen, whatsapp_ctwa_clid, primer_mensaje_en")
    .eq("whatsapp", m.telefono)
    .limit(1)
    .maybeSingle();

  const fuente = m.direccion === "entrada" ? await fuenteDe(supabase, m) : null;

  if (existente) {
    const cambios = {};
    if (!existente.origen && fuente?.origen) {
      cambios.origen = fuente.origen;
      cambios.fuente_id = fuente.fuente_id;
    }
    if (!existente.whatsapp_ctwa_clid && m.ctwa_clid) cambios.whatsapp_ctwa_clid = m.ctwa_clid;
    if (m.direccion === "entrada" && (!existente.primer_mensaje_en || m.enviado_en < existente.primer_mensaje_en)) {
      cambios.primer_mensaje_en = m.enviado_en;
    }
    if (Object.keys(cambios).length) await supabase.from("pacientes").update(cambios).eq("id", existente.id);
    return existente.id;
  }

  // Sólo se crea paciente por quien escribe (no por mensajes que salen)
  if (m.direccion !== "entrada") return null;

  const { data: nuevo, error } = await supabase
    .from("pacientes")
    .insert({
      nombre: m.nombre_contacto || `WhatsApp ${m.telefono.slice(-10)}`,
      whatsapp: m.telefono,
      origen: fuente?.origen || null,
      fuente_id: fuente?.fuente_id || null,
      whatsapp_ctwa_clid: m.ctwa_clid,
      primer_mensaje_en: m.enviado_en,
    })
    .select("id")
    .single();
  if (error) throw error;
  return nuevo.id;
}

async function fuenteDe(supabase, m) {
  const codigo = codigoEnMensaje(m.texto);
  if (codigo) {
    const { data: f } = await supabase.from("fuentes").select("id, canal").eq("codigo", codigo).maybeSingle();
    if (f) return { origen: f.canal, fuente_id: f.id };
  }
  if (m.ctwa_clid || m.referencia?.source_type === "ad") return { origen: "anuncio", fuente_id: null };
  return null;
}
