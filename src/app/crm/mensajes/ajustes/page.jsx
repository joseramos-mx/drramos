import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Ajustes from "./ajustes";

export const dynamic = "force-dynamic";

/** Ajustes de la app: avisos, cuenta y (para Jesús) las otras secciones del CRM. */
export default async function AjustesPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/ajustes");

  return <Ajustes email={user.email} />;
}
