import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { esAdmin } from "@/lib/mensajes-servidor";
import { probarConversacion } from "@/lib/asistente";
import { textosEfectivos } from "@/lib/asistente/respuestas";
import { CASOS, calificar } from "@/lib/asistente/pruebas";

export const maxDuration = 120;

/**
 * POST { id }: corre un caso de la batería con el modelo real (sin mandar
 * nada ni tocar la agenda). Sólo administradores. Es ruta y no server
 * action para que varios casos corran a la vez.
 */
export async function POST(req) {
  const { id } = await req.json().catch(() => ({}));
  const caso = CASOS.find((c) => c.id === id);
  if (!caso) return Response.json({ error: "Ese caso no existe." });
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !esAdmin(user.email)) return Response.json({ error: "Sólo para administradores." }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "Falta la llave ANTHROPIC_API_KEY." });

  const { data: editadas } = await supabase.from("asistente_respuestas").select("id, texto");
  const r = await probarConversacion({ conversacion: caso.conversacion, agendaLlena: caso.agendaLlena, citaProxima: caso.citaProxima, textos: textosEfectivos(editadas || []) });
  return Response.json({ ...calificar(caso, r), resultado: r });
}
