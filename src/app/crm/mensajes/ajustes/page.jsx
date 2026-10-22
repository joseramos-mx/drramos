import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Ajustes from "./ajustes";

export const dynamic = "force-dynamic";

/**
 * Quién ve "Otras secciones" (Resultados, monitor, leads): los correos de
 * CRM_ADMIN_EMAILS (separados por coma; p. ej. el de Jesús y el del
 * doctor). La Dra. Gaby sólo ve Avisos y Cuenta. Si la variable está
 * vacía, todos las ven (para no dejar a nadie fuera).
 */
function esAdmin(email) {
  const lista = (process.env.CRM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return lista.length === 0 || lista.includes(String(email || "").toLowerCase());
}

/** Ajustes de la app: avisos, cuenta y (sólo administradores) las otras secciones del CRM. */
export default async function AjustesPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/ajustes");

  const { data: config } = await supabase.from("asistente_config").select("modo, libres").eq("id", 1).maybeSingle();
  return <Ajustes email={user.email} admin={esAdmin(user.email)} modo={config?.modo || "apagado"} libres={config?.libres || "aprobar"} />;
}
