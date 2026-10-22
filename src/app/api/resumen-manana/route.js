import { avisar, supabaseServicio } from "@/lib/mensajes-servidor";
import { diasCerrados } from "@/lib/asistente";
import { DESCANSO, horarioDelDia, hoyDurango, isoDesde, proximaApertura, sumarDias, textoLlamar } from "@/app/agenda/lib";

export const dynamic = "force-dynamic";

/** Horas que se le dan al paciente para responder a un aviso por bloqueo antes de recordarle a la Dra. Gaby (10: lo avisado antes de las 23:00 se recuerda a las 9:00). */
const HORAS_PARA_RESPONDER = 10;

/**
 * Resumen de la mañana para la Dra. Gaby (de 21:00 a 8:00 su celular no
 * suena). Lo llama Vercel Cron a las 9:00 de Durango (vercel.json) con
 * `Authorization: Bearer CRON_SECRET`.
 *  1. Quién escribió en la noche y cuántas eran urgencias.
 *  2. Pacientes avisados por un bloqueo que no respondieron: se le deja un
 *     pendiente en su libreta ("Llamar a …") para el día en que abre.
 * Los avisos no llevan contenido (se ven con el celular bloqueado).
 */
export async function GET(req) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const admin = supabaseServicio();
  const hoy = hoyDurango();

  // 1. La noche
  const { data: filas } = await admin
    .from("whatsapp_mensajes")
    .select("telefono")
    .eq("direccion", "entrada")
    .gte("enviado_en", isoDesde(sumarDias(hoy, -1), DESCANSO.desde))
    .lt("enviado_en", isoDesde(hoy, DESCANSO.hasta));
  const telefonos = [...new Set((filas || []).map((f) => f.telefono))];
  let urgencias = 0;
  if (telefonos.length) {
    const { data: pacientes } = await admin.from("pacientes").select("etiquetas").in("whatsapp", telefonos);
    urgencias = (pacientes || []).filter((p) => (p.etiquetas || []).includes("urgencia")).length;
  }

  // 2. Avisados por un bloqueo que no hicieron nada
  const cerrados = await diasCerrados(admin);
  const abreHoy = Boolean(horarioDelDia(hoy)) && !cerrados.has(hoy);
  const fechaLibreta = abreHoy ? hoy : proximaApertura(new Date(), cerrados).fecha;
  const { data: sinRespuesta } = await admin
    .from("citas")
    .select("id, inicio, estado, aviso_bloqueo_en, paciente_id, paciente:pacientes(nombre, whatsapp)")
    .not("aviso_bloqueo_en", "is", null)
    .is("aviso_recordado_en", null)
    .lte("aviso_bloqueo_en", new Date(Date.now() - HORAS_PARA_RESPONDER * 3600 * 1000).toISOString());
  let porLlamar = 0;
  for (const c of sinRespuesta || []) {
    // Cancelada por el consultorio: si ya tiene otra cita (la agendó ella o el paciente), ya quedó
    if (c.estado === "cancelada") {
      const { count } = await admin
        .from("citas")
        .select("id", { count: "exact", head: true })
        .eq("paciente_id", c.paciente_id)
        .neq("estado", "cancelada")
        .gt("created_at", c.aviso_bloqueo_en);
      if (count) {
        await admin.from("citas").update({ aviso_bloqueo_en: null }).eq("id", c.id);
        continue;
      }
    }
    // ¿Escribió algo después del aviso (un "ok", una pregunta) sin que se resolviera? Se le dice a la Dra. Gaby que revise el chat
    const { count: escribio } = await admin
      .from("whatsapp_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("paciente_id", c.paciente_id)
      .eq("direccion", "entrada")
      .gt("enviado_en", c.aviso_bloqueo_en);
    await admin.from("pendientes").insert({
      fecha: fechaLibreta,
      texto: textoLlamar({ nombre: c.paciente?.nombre, whatsapp: c.paciente?.whatsapp, inicio: c.inicio, cancelada: c.estado === "cancelada", escribio: Boolean(escribio) }),
    });
    await admin.from("citas").update({ aviso_recordado_en: new Date().toISOString() }).eq("id", c.id);
    porLlamar++;
  }

  if (telefonos.length) {
    const n = telefonos.length;
    await avisar(admin, {
      titulo: `🌅 Anoche escribieron ${n} paciente${n === 1 ? "" : "s"}`,
      cuerpo: urgencias ? `${urgencias} marcada${urgencias === 1 ? "" : "s"} como urgencia. Revisa Pendientes.` : "El asistente ya les contestó. Revisa Pendientes.",
      url: "/crm/mensajes",
      siempre: true,
    });
  }
  if (porLlamar && abreHoy) {
    await avisar(admin, {
      titulo: `📞 ${porLlamar} paciente${porLlamar === 1 ? "" : "s"} no respondi${porLlamar === 1 ? "ó" : "eron"} al cambio de cita`,
      cuerpo: "Te los dejé en los pendientes del día para llamarles.",
      url: "/agenda",
      siempre: true,
    });
  }
  return Response.json({ escribieron: telefonos.length, urgencias, porLlamar, fechaLibreta });
}
