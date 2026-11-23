import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { esAdmin, supabaseServicio } from "@/lib/mensajes-servidor";
import Ajustes from "./ajustes";

export const dynamic = "force-dynamic";

/** Ajustes de la app: avisos, cuenta y (sólo administradores) las otras secciones del CRM. */
export default async function AjustesPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/ajustes");

  const { data: config } = await supabase.from("asistente_config").select("modo, libres, recordatorios, aviso_falto, seguimientos, resenas").eq("id", 1).maybeSingle();
  // ¿El asistente puede trabajar? Falta la llave, o su último intento falló (llave mal puesta, sin saldo)
  let llave = process.env.ANTHROPIC_API_KEY ? { estado: "ok" } : { estado: "falta" };
  if (llave.estado === "ok") {
    try {
      const { data: ultimos } = await supabaseServicio()
        .from("asistente_registro")
        .select("accion, creado_en:created_at")
        .neq("accion", "omitido")
        .order("created_at", { ascending: false })
        .limit(1);
      if (ultimos?.[0]?.accion === "error") llave = { estado: "error", en: ultimos[0].creado_en };
    } catch {}
  }
  return <Ajustes llave={llave} email={user.email} admin={esAdmin(user.email)} modo={config?.modo || "apagado"} libres={config?.libres || "aprobar"} automaticos={{ recordatorios: config?.recordatorios, aviso_falto: config?.aviso_falto, seguimientos: config?.seguimientos, resenas: config?.resenas }} />;
}
