import { avisar, supabaseServicio } from "@/lib/mensajes-servidor";
import { DESCANSO, hoyDurango, isoDesde, sumarDias } from "@/app/agenda/lib";

export const dynamic = "force-dynamic";

/**
 * Resumen de la noche para la Dra. Gaby (de 21:00 a 8:00 su celular no
 * suena). Lo llama Vercel Cron a las 9:00 de Durango (vercel.json) con
 * `Authorization: Bearer CRON_SECRET`. Cuenta quién escribió en la noche
 * y cuántas eran urgencias; no lleva contenido (se ve con el celular bloqueado).
 */
export async function GET(req) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || req.headers.get("authorization") !== `Bearer ${secreto}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const admin = supabaseServicio();
  const hoy = hoyDurango();
  const desde = isoDesde(sumarDias(hoy, -1), DESCANSO.desde);
  const hasta = isoDesde(hoy, DESCANSO.hasta);

  const { data: filas } = await admin
    .from("whatsapp_mensajes")
    .select("telefono, paciente_id")
    .eq("direccion", "entrada")
    .gte("enviado_en", desde)
    .lt("enviado_en", hasta);
  const telefonos = [...new Set((filas || []).map((f) => f.telefono))];
  if (!telefonos.length) return Response.json({ escribieron: 0 });

  const { data: pacientes } = await admin.from("pacientes").select("etiquetas").in("whatsapp", telefonos);
  const urgencias = (pacientes || []).filter((p) => (p.etiquetas || []).includes("urgencia")).length;
  const n = telefonos.length;
  await avisar(admin, {
    titulo: `🌅 Anoche escribieron ${n} paciente${n === 1 ? "" : "s"}`,
    cuerpo: urgencias ? `${urgencias} marcada${urgencias === 1 ? "" : "s"} como urgencia. Revisa Pendientes.` : "El asistente ya les contestó. Revisa Pendientes.",
    url: "/crm/mensajes",
    siempre: true,
  });
  return Response.json({ escribieron: n, urgencias });
}
