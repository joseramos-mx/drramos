import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { esAdmin } from "@/lib/mensajes-servidor";
import { CASOS, GRUPOS } from "@/lib/asistente/pruebas";
import { BarraInferior } from "../encabezado";
import Probador from "./probador";

export const dynamic = "force-dynamic";

/** Probar asistente: corre la batería de conversaciones antes de prenderlo. Sólo administradores. */
export default async function PruebasPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/pruebas");
  if (!esAdmin(user.email)) redirect("/crm/mensajes/ajustes");

  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <Probador casos={CASOS} grupos={GRUPOS} llave={Boolean(process.env.ANTHROPIC_API_KEY)} />
      <BarraInferior activo="ajustes" />
    </main>
  );
}
