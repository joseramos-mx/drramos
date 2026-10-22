import { createHmac, timingSafeEqual } from "node:crypto";
import { parsearWebhook } from "./parsear";
import { codigoEnMensaje } from "../../crm/resultados/fuentes";
import { bajarMedia } from "@/lib/whatsapp";
import { avisarMensajeNuevo, guardarMedia, supabaseServicio } from "@/lib/mensajes-servidor";

/**
 * Buzón de WhatsApp: recibe los webhooks de la Cloud API de Meta
 * (número del consultorio, directo con Meta). Guarda cada mensaje, crea
 * al paciente la primera vez que escribe y detecta de qué fuente llegó
 * ("(ref G1)" o el click del anuncio). Si trae foto/audio la baja de
 * Meta al bucket privado, y avisa (web push) a los aparatos del
 * consultorio. Aquí NO se contesta (eso lo hace la bandeja "Mensajes").
 *
 * Seguridad (variables de entorno del servidor):
 *   META_APP_SECRET            con él se valida la firma X-Hub-Signature-256
 *                              que Meta pone en cada POST (recomendado)
 *   WHATSAPP_WEBHOOK_SECRET    "Verify token" que se escribe en Meta al
 *                              registrar el webhook; también sirve como
 *                              ?token= si algún día se usa un proveedor
 *   SUPABASE_SERVICE_ROLE_KEY  sólo aquí, nunca en el navegador
 *   WHATSAPP_GUARDAR_CRUDO     "0" para dejar de guardar el payload crudo
 *
 * Siempre responde 200 a lo autorizado (aunque algo falle por dentro)
 * para que el proveedor no reintente en bucle; los errores se registran.
 */

export const dynamic = "force-dynamic";

function iguales(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

/** Secreto válido: ?token= o hub.verify_token (mínimo 24 caracteres). */
function tokenValido(valor) {
  const esperado = process.env.WHATSAPP_WEBHOOK_SECRET || "";
  return esperado.length >= 24 && iguales(esperado, valor);
}

/**
 * POST auténtico: con META_APP_SECRET se exige la firma de Meta sobre el
 * cuerpo crudo; sin él (proveedor intermedio) se acepta el ?token=.
 */
function postAutorizado(request, crudo) {
  const appSecret = process.env.META_APP_SECRET;
  if (appSecret) {
    const firma = request.headers.get("x-hub-signature-256") || "";
    const esperada = "sha256=" + createHmac("sha256", appSecret).update(crudo).digest("hex");
    return iguales(esperada, firma);
  }
  return tokenValido(new URL(request.url).searchParams.get("token"));
}

// Verificación de Meta al registrar el webhook (Verify token)
export async function GET(request) {
  const u = new URL(request.url);
  if (u.searchParams.get("hub.mode") === "subscribe" && tokenValido(u.searchParams.get("hub.verify_token"))) {
    return new Response(u.searchParams.get("hub.challenge") || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request) {
  const crudo = await request.text();
  if (!postAutorizado(request, crudo)) return new Response("Forbidden", { status: 403 });

  let body;
  try {
    body = JSON.parse(crudo);
  } catch {
    return Response.json({ ok: false, error: "json" }, { status: 400 });
  }

  const supabase = supabaseServicio();
  const { campos, mensajes } = parsearWebhook(body);

  if (process.env.WHATSAPP_GUARDAR_CRUDO !== "0") {
    await supabase.from("whatsapp_eventos").insert({ campo: campos.join(",") || null, payload: body });
  }

  let guardados = 0;
  const avisar = new Map(); // telefono → paciente_id, un aviso por paciente
  for (const m of mensajes) {
    try {
      const pacienteId = await pacienteDe(supabase, m);
      const { data: nuevos, error } = await supabase.from("whatsapp_mensajes").upsert(
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
          media_id: m.media_id,
          media_mime: m.media_mime,
        },
        { onConflict: "wa_id", ignoreDuplicates: true }
      )
        .select("id");
      if (error) throw error;
      if (!nuevos?.length) continue; // Meta reintentó un mensaje que ya teníamos
      guardados++;

      if (m.media_id) {
        const archivo = await bajarMedia(m.media_id);
        const ruta = archivo && (await guardarMedia(supabase, m.telefono, m.wa_id, archivo.buffer, archivo.mime));
        if (ruta) await supabase.from("whatsapp_mensajes").update({ media_ruta: ruta }).eq("id", nuevos[0].id);
      }
      if (m.via === "paciente") avisar.set(m.telefono, pacienteId);
    } catch (e) {
      console.error("[whatsapp] mensaje", m.wa_id, e?.message || e);
    }
  }

  for (const [telefono, pacienteId] of avisar) {
    try {
      const { data: p } = pacienteId
        ? await supabase.from("pacientes").select("nombre").eq("id", pacienteId).maybeSingle()
        : { data: null };
      await avisarMensajeNuevo(supabase, { nombre: p?.nombre, telefono });
    } catch (e) {
      console.error("[whatsapp] aviso", telefono, e?.message || e);
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
