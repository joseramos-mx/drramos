import { enviarPlantilla, whatsappConfigurado } from "@/lib/whatsapp";
import { supabaseServicio } from "@/lib/mensajes-servidor";
import { normalizarTelefono } from "@/lib/telefono";
import { primerNombre } from "@/lib/avisos-cita";
import { BOTONES_INICIO, enviarConMenu } from "@/lib/menu";
import { anuncioDe } from "@/lib/anuncios";
import { imagenWhatsapp } from "@/lib/consultorio";
import { PLANTILLAS_SISTEMA, plantillasV2, rellenar } from "@/app/crm/mensajes/plantillas";
import { minutosDelDia } from "@/app/agenda/lib";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HORA_MS = 3600 * 1000;
const HUMANO_HORAS = 8; // igual que en el asistente: si ella tomó el chat, es suyo 8 h
/** Texto libre ~22 h después de su último mensaje (debe ir antes de que se cierre la ventana de 24 h). */
const VENTANA_22H = { desde: 20 * HORA_MS, hasta: 23.5 * HORA_MS };
/** Horas de Durango en que se puede mandar cada mensaje (nada de madrugada). */
const HORAS_22H = { desde: 8, hasta: 21 };
const HORAS_D3 = { desde: 10, hasta: 19 };
const DIAS_MAX = 7; // a quien escribió hace más de esto ya no se le da seguimiento

const PLANTILLA_D3 = "seguimiento_anuncio";
// Botones de seguimiento_anuncio, en el mismo orden que en WhatsApp Manager:
// Agendar valoración · Tengo una duda (menú "¿Qué le gustaría saber?") · No me interesa (no_contactar)
const PAYLOADS_D3 = ["menu|agendar", "menu|opciones", "cita|no_interesa||"];

/**
 * Seguimiento a quien llegó de un anuncio de Meta y no agendó (Vercel Cron cada hora,
 * vercel.json, `Authorization: Bearer CRON_SECRET`). Interruptor en Ajustes →
 * Mensajes automáticos ("seguimiento_anuncios", apagado por omisión).
 *   a) ~22 h después de su último mensaje (todavía dentro de las 24 h): "¿Pudo revisar la
 *      información?" con los 3 botones de inicio. Una vez.
 *   b) Día 3: plantilla seguimiento_anuncio con la foto de su anuncio. Una vez. Sólo con
 *      PLANTILLAS_V2=1 (cuando Meta la apruebe) y si no ha escrito en las últimas 24 h.
 * Nunca a quien: ya tiene (o tuvo) una cita, pidió que no le escriban (no_contactar), o
 * la Dra. Gaby lleva o atendió el chat.
 */
export async function GET(req) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!whatsappConfigurado()) return Response.json({ omitido: "WhatsApp todavía no está conectado" });

  const admin = supabaseServicio();
  // Consulta aparte: si la migración no se ha corrido, la columna no existe y se queda APAGADO
  const { data: config, error: errConfig } = await admin.from("asistente_config").select("seguimiento_anuncios").eq("id", 1).maybeSingle();
  if (errConfig || config?.seguimiento_anuncios !== true) return Response.json({ omitido: "apagado en Ajustes (o falta la migración)" });

  const ahora = Date.now();
  const { data: candidatos, error } = await admin
    .from("pacientes")
    .select("id, nombre, whatsapp, anuncio_id, primer_mensaje_en, seguimiento_anuncio_22h_en, seguimiento_anuncio_d3_en")
    .not("anuncio_id", "is", null)
    .gte("primer_mensaje_en", new Date(ahora - DIAS_MAX * 24 * HORA_MS).toISOString())
    .or("seguimiento_anuncio_22h_en.is.null,seguimiento_anuncio_d3_en.is.null");
  if (error) return Response.json({ error: "No se pudo leer pacientes" });

  const hora = Math.floor(minutosDelDia(new Date(ahora).toISOString()) / 60);
  const resumen = { revisados: 0, enviados_22h: 0, enviados_d3: 0, errores: 0 };
  const vistos = new Set();
  for (const c of candidatos || []) {
    const tel = normalizarTelefono(c.whatsapp);
    if (!tel || vistos.has(tel)) continue;
    vistos.add(tel);
    resumen.revisados++;
    try {
      const r = await revisar(admin, tel, c, { ahora, hora });
      if (r === "22h") resumen.enviados_22h++;
      if (r === "d3") resumen.enviados_d3++;
      if (r === "error") resumen.errores++;
    } catch (e) {
      console.error("[seguimiento-anuncios]", tel, e?.message || e);
      resumen.errores++;
    }
  }
  return Response.json(resumen);
}

async function revisar(admin, tel, c, { ahora, hora }) {
  // El mismo teléfono puede estar en dos fichas (la del chat y la de la agenda)
  const { data: fichas } = await admin.from("pacientes").select("id, etiquetas, atiende, atiende_desde").eq("whatsapp", tel);
  const ids = (fichas || []).map((f) => f.id);
  if (!ids.length) return null;
  if (fichas.some((f) => (f.etiquetas || []).includes("no_contactar"))) return null;
  if (fichas.some((f) => f.atiende === "humano" && f.atiende_desde && ahora - new Date(f.atiende_desde).getTime() < HUMANO_HORAS * HORA_MS)) return null;

  const { count: citas } = await admin.from("citas").select("id", { count: "exact", head: true }).in("paciente_id", ids);
  if (citas) return null; // ya agendó (o tuvo cita): no es para este seguimiento

  // ¿La Dra. Gaby ya le escribió? Entonces ella lo está atendiendo
  const { count: deElla } = await admin
    .from("whatsapp_mensajes")
    .select("id", { count: "exact", head: true })
    .eq("telefono", tel)
    .eq("direccion", "salida")
    .eq("via", "api");
  if (deElla) return null;

  const { data: ultimo } = await admin
    .from("whatsapp_mensajes")
    .select("enviado_en")
    .eq("telefono", tel)
    .eq("direccion", "entrada")
    .order("enviado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ultimo?.enviado_en) return null;
  const desdeSuUltimo = ahora - new Date(ultimo.enviado_en).getTime();
  const marcar = (campo) => admin.from("pacientes").update({ [campo]: new Date().toISOString() }).in("id", ids);
  const nombre = c.nombre && !/^WhatsApp /.test(c.nombre) ? primerNombre(c.nombre) : null;

  // a) ~22 h: texto libre dentro de la ventana de 24 h
  if (!c.seguimiento_anuncio_22h_en && desdeSuUltimo >= VENTANA_22H.desde && desdeSuUltimo < VENTANA_22H.hasta && hora >= HORAS_22H.desde && hora < HORAS_22H.hasta) {
    const texto = `Hola${nombre ? ` ${nombre}` : ""} 😊 ¿Pudo revisar la información? Si gusta, le busco un horario para su valoración esta semana.`;
    const { envio, guardado } = await enviarConMenu(tel, texto, BOTONES_INICIO);
    if (envio.error) return "error";
    await guardar(admin, tel, ids[0], envio.wa_id, "text", guardado);
    await marcar("seguimiento_anuncio_22h_en");
    return "22h";
  }

  // b) Día 3: plantilla con la foto de su anuncio (sólo cuando Meta la aprobó)
  const desdeElPrimero = ahora - new Date(c.primer_mensaje_en).getTime();
  if (
    plantillasV2() &&
    !c.seguimiento_anuncio_d3_en &&
    desdeElPrimero >= 72 * HORA_MS &&
    desdeSuUltimo >= 24 * HORA_MS && // si sigue platicando, no se le manda
    hora >= HORAS_D3.desde &&
    hora < HORAS_D3.hasta
  ) {
    const p = PLANTILLAS_SISTEMA.find((x) => x.nombre === PLANTILLA_D3);
    if (!p) return null;
    // La plantilla lleva encabezado de imagen: la de su anuncio (A1-A4) o, si vino de otro anuncio, la de A1
    const imagen = anuncioDe(c.anuncio_id)?.imagen || imagenWhatsapp("A1-valoracion.jpg");
    const valores = [nombre || "estimado paciente"];
    const envio = await enviarPlantilla(tel, p.nombre, valores, "es_MX", { botones: PAYLOADS_D3, imagen });
    if (envio.error) return "error";
    await guardar(admin, tel, ids[0], envio.wa_id, "template", `[Foto] ${rellenar(p.texto, valores)}\n[Botones: ${p.botones.join(" · ")}]`);
    await marcar("seguimiento_anuncio_d3_en");
    return "d3";
  }
  return null;
}

async function guardar(admin, telefono, pacienteId, waId, tipo, texto) {
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: waId || `seg-anuncio-${telefono}-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "recordatorio", // automático (no es el robot ni ella)
      tipo,
      texto,
      enviado_en: new Date().toISOString(),
      paciente_id: pacienteId,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
}
