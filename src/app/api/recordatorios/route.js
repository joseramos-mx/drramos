import { whatsappConfigurado } from "@/lib/whatsapp";
import { supabaseServicio } from "@/lib/mensajes-servidor";
import { normalizarTelefono } from "@/lib/telefono";
import { mandarPlantillaCita, primerNombre } from "@/lib/avisos-cita";
import { hoyDurango, rangoDelDia, sumarDias } from "@/app/agenda/lib";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Días después de la valoración en que se manda el seguimiento del presupuesto (1.º y 2.º). */
const SEGUIMIENTO_DIAS = [3, 30];
/** Más allá de esto ya no se da seguimiento (para no escribirle a alguien de hace meses). */
const SEGUIMIENTO_MAX_DIAS = 45;

/**
 * Tareas de las 11:00 (Vercel Cron, vercel.json, `Authorization: Bearer CRON_SECRET`):
 *  1. Recordatorio de cita un día antes (plantilla recordatorio_cita con botones de "Mi cita").
 *     Una por paciente (su primera cita del día); nunca dos veces la misma cita.
 *  2. Seguimiento de presupuestos no aceptados: a los 3 días y al mes de la valoración
 *     (plantilla seguimiento_presupuesto: Quiero agendar · Tengo una duda · Ya no, gracias).
 *  3. Pedir opinión en Google (resena_google) cuando terminó su tratamiento: pagó algo, pasaron
 *     2 días y no tiene otra cita. Una vez por paciente. Necesita RESENA_GOOGLE_URL.
 * Cada una se apaga en Ajustes. No se le escribe a quien pidió que ya no ("no_contactar").
 */
export async function GET(req) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!whatsappConfigurado()) return Response.json({ omitido: "WhatsApp todavía no está conectado" });

  const admin = supabaseServicio();
  const { data: config } = await admin.from("asistente_config").select("recordatorios, seguimientos, resenas").eq("id", 1).maybeSingle();
  return Response.json({
    recordatorios: config?.recordatorios === false ? "apagados en Ajustes" : await recordatorios(admin),
    seguimientos: config?.seguimientos === false ? "apagados en Ajustes" : await seguimientos(admin),
    resenas: config?.resenas === false ? "apagadas en Ajustes" : await resenas(admin),
  });
}

async function recordatorios(admin) {
  const manana = sumarDias(hoyDurango(), 1);
  const { desde, hasta } = rangoDelDia(manana);
  const { data: citas, error } = await admin
    .from("citas")
    .select("id, inicio, estado, recordatorio_enviado_en, paciente:pacientes(id, nombre, whatsapp, etiquetas)")
    .gte("inicio", desde)
    .lt("inicio", hasta)
    .neq("estado", "cancelada")
    .order("inicio");
  if (error) return { error: "No se pudo leer la agenda" };

  // Una por teléfono: la primera cita del día. Si ya se le mandó por otra cita, no se repite.
  const porTelefono = new Map();
  for (const c of citas || []) {
    const tel = normalizarTelefono(c.paciente?.whatsapp);
    if (!tel) continue;
    const ya = porTelefono.get(tel);
    if (!ya) porTelefono.set(tel, { cita: c, otras: [] });
    else ya.otras.push(c);
  }

  const resumen = { fecha: manana, enviados: 0, ya_enviados: 0, sin_whatsapp: (citas || []).filter((c) => !normalizarTelefono(c.paciente?.whatsapp)).length, errores: 0 };
  for (const { cita, otras } of porTelefono.values()) {
    const todas = [cita, ...otras];
    if (todas.some((c) => c.recordatorio_enviado_en)) {
      resumen.ya_enviados++;
      continue;
    }
    const ids = todas.map((c) => c.id);
    const r = await mandarPlantillaCita(admin, cita, "recordatorio_cita", { via: "recordatorio" });
    if (r.error) {
      resumen.errores++;
      await admin.from("citas").update({ recordatorio_error: r.error }).in("id", ids);
      continue;
    }
    if (r.ok) {
      await admin.from("citas").update({ recordatorio_enviado_en: new Date().toISOString(), recordatorio_error: null }).in("id", ids);
      resumen.enviados++;
    }
  }
  return resumen;
}

/**
 * Valoraciones con presupuesto (cotizado) donde no se hizo ni se pagó nada, el
 * paciente no tiene otra cita después y no dijo que no. Una por paciente por día.
 */
async function seguimientos(admin) {
  const hoy = hoyDurango();
  const { data: candidatas, error } = await admin
    .from("citas")
    .select("id, inicio, cotizado, realizado, pagado_monto, seguimiento_enviados, paciente_id, paciente:pacientes(id, nombre, whatsapp, etiquetas)")
    .eq("estado", "asistio")
    .not("cotizado", "is", null)
    .eq("seguimiento_cerrado", false)
    .lt("seguimiento_enviados", SEGUIMIENTO_DIAS.length)
    .gte("inicio", rangoDelDia(sumarDias(hoy, -SEGUIMIENTO_MAX_DIAS)).desde)
    .lt("inicio", rangoDelDia(sumarDias(hoy, -SEGUIMIENTO_DIAS[0])).hasta)
    .order("inicio", { ascending: false });
  if (error) return { error: "No se pudo leer la agenda" };

  const vistos = new Set();
  const resumen = { enviados: 0, cerrados: 0, errores: 0 };
  for (const c of candidatas || []) {
    if (vistos.has(c.paciente_id)) continue;
    vistos.add(c.paciente_id);
    // ¿Ya le toca? (3 días para el primero, 30 para el segundo)
    const toca = SEGUIMIENTO_DIAS[c.seguimiento_enviados || 0];
    if (hoyDurango(new Date(c.inicio)) > sumarDias(hoy, -toca)) continue;
    // Aceptó (se hizo o pagó algo) o ya tiene otra cita después → ya no
    const { count } = await admin
      .from("citas")
      .select("id", { count: "exact", head: true })
      .eq("paciente_id", c.paciente_id)
      .neq("estado", "cancelada")
      .gt("inicio", c.inicio);
    if ((c.realizado && c.realizado.length) || Number(c.pagado_monto) > 0 || count) {
      await admin.from("citas").update({ seguimiento_cerrado: true }).eq("id", c.id);
      resumen.cerrados++;
      continue;
    }
    const r = await mandarPlantillaCita(admin, c, "seguimiento_presupuesto");
    if (r.ok) {
      await admin
        .from("citas")
        .update({ seguimiento_enviados: (c.seguimiento_enviados || 0) + 1, seguimiento_ultimo: new Date().toISOString() })
        .eq("id", c.id);
      resumen.enviados++;
    } else if (r.sinWhatsapp || r.noContactar) {
      await admin.from("citas").update({ seguimiento_cerrado: true }).eq("id", c.id);
    } else {
      resumen.errores++;
    }
  }
  return resumen;
}

/**
 * Pacientes que terminaron (pagaron algo en una cita de hace 2 a 7 días y no tienen
 * cita después): se les pide su opinión en Google, una sola vez en la vida.
 */
async function resenas(admin) {
  const link = process.env.RESENA_GOOGLE_URL;
  if (!link) return "falta RESENA_GOOGLE_URL";
  const hoy = hoyDurango();
  const { data: candidatas, error } = await admin
    .from("citas")
    .select("id, inicio, pagado_monto, paciente_id, paciente:pacientes(id, nombre, whatsapp, etiquetas, resena_pedida_en)")
    .eq("estado", "asistio")
    .gt("pagado_monto", 0)
    .gte("inicio", rangoDelDia(sumarDias(hoy, -7)).desde)
    .lt("inicio", rangoDelDia(sumarDias(hoy, -2)).hasta)
    .order("inicio", { ascending: false });
  if (error) return { error: "No se pudo leer la agenda" };

  const vistos = new Set();
  const resumen = { enviadas: 0 };
  for (const c of candidatas || []) {
    if (vistos.has(c.paciente_id) || c.paciente?.resena_pedida_en) continue;
    vistos.add(c.paciente_id);
    // ¿Sigue en tratamiento? (tiene otra cita después)
    const { count } = await admin
      .from("citas")
      .select("id", { count: "exact", head: true })
      .eq("paciente_id", c.paciente_id)
      .neq("estado", "cancelada")
      .gt("inicio", c.inicio);
    if (count) continue;
    const r = await mandarPlantillaCita(admin, c, "resena_google", { valores: [primerNombre(c.paciente?.nombre), link] });
    if (r.ok || r.sinWhatsapp || r.noContactar) {
      await admin.from("pacientes").update({ resena_pedida_en: new Date().toISOString() }).eq("id", c.paciente_id);
      if (r.ok) resumen.enviadas++;
    }
  }
  return resumen;
}
