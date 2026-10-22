import { enviarPlantilla, whatsappConfigurado } from "@/lib/whatsapp";
import { supabaseServicio } from "@/lib/mensajes-servidor";
import { normalizarTelefono } from "@/lib/telefono";
import { PLANTILLAS, rellenar } from "@/app/crm/mensajes/plantillas";
import { BOTONES_RECORDATORIO, idBoton } from "@/lib/mi-cita";
import { formatFechaLarga, formatHora, hoyDurango, minutosDelDia, rangoDelDia, sumarDias } from "@/app/agenda/lib";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PLANTILLA = PLANTILLAS.find((p) => p.nombre === "recordatorio_cita");

/** "María Fernanda López" → "María"; si no hay nombre real, saludo general. */
function primerNombre(nombre) {
  if (!nombre || /^WhatsApp /.test(nombre)) return "estimado paciente";
  return nombre.trim().split(/\s+/)[0];
}

/**
 * Recordatorio de cita, un día antes, por WhatsApp (plantilla
 * `recordatorio_cita`). Lo llama Vercel Cron una vez al día (vercel.json)
 * con `Authorization: Bearer CRON_SECRET`. Un recordatorio por paciente
 * (su primera cita del día); nunca dos veces la misma cita.
 * Trae botones Confirmo / Cambiar / Cancelar que resuelve "Mi cita" (src/lib/mi-cita.js).
 */
export async function GET(req) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!whatsappConfigurado()) return Response.json({ omitido: "WhatsApp todavía no está conectado" });

  const admin = supabaseServicio();
  const { data: config } = await admin.from("asistente_config").select("recordatorios").eq("id", 1).maybeSingle();
  if (config && config.recordatorios === false) return Response.json({ omitido: "Recordatorios apagados en Ajustes" });

  const manana = sumarDias(hoyDurango(), 1);
  const { desde, hasta } = rangoDelDia(manana);
  const { data: citas, error } = await admin
    .from("citas")
    .select("id, inicio, estado, recordatorio_enviado_en, paciente:pacientes(id, nombre, whatsapp)")
    .gte("inicio", desde)
    .lt("inicio", hasta)
    .neq("estado", "cancelada")
    .order("inicio");
  if (error) return Response.json({ error: "No se pudo leer la agenda" }, { status: 500 });

  // Una por teléfono: la primera cita del día. Si ya se le mandó por otra cita, no se repite.
  const porTelefono = new Map();
  for (const c of citas || []) {
    const tel = normalizarTelefono(c.paciente?.whatsapp);
    if (!tel) continue;
    const ya = porTelefono.get(tel);
    if (!ya) porTelefono.set(tel, { cita: c, otras: [] });
    else ya.otras.push(c);
  }

  const resumen = { enviados: 0, ya_enviados: 0, sin_whatsapp: (citas || []).filter((c) => !normalizarTelefono(c.paciente?.whatsapp)).length, errores: 0 };
  for (const [telefono, { cita, otras }] of porTelefono) {
    const todas = [cita, ...otras];
    if (todas.some((c) => c.recordatorio_enviado_en)) {
      resumen.ya_enviados++;
      continue;
    }
    const valores = [primerNombre(cita.paciente.nombre), formatFechaLarga(manana), formatHora(minutosDelDia(cita.inicio))];
    const envio = await enviarPlantilla(telefono, PLANTILLA.nombre, valores, "es_MX", { botones: BOTONES_RECORDATORIO.map((a) => idBoton(a, cita.id)) });
    const ids = todas.map((c) => c.id);
    if (envio.error) {
      resumen.errores++;
      await admin.from("citas").update({ recordatorio_error: envio.error }).in("id", ids);
      continue;
    }
    const ahora = new Date().toISOString();
    await admin.from("citas").update({ recordatorio_enviado_en: ahora, recordatorio_error: null }).in("id", ids);
    await admin.from("whatsapp_mensajes").upsert(
      {
        wa_id: envio.wa_id || `recordatorio-${cita.id}`,
        telefono,
        direccion: "salida",
        via: "recordatorio",
        tipo: "template",
        texto: `${rellenar(PLANTILLA.texto, valores)}
[Botones: Confirmo mi cita · Cambiar mi cita · Cancelar mi cita]`,
        enviado_en: ahora,
        paciente_id: cita.paciente.id,
      },
      { onConflict: "wa_id", ignoreDuplicates: true }
    );
    resumen.enviados++;
  }
  return Response.json({ fecha: manana, ...resumen });
}
