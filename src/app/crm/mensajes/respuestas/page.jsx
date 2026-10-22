import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { seccionesParaEditar } from "@/lib/asistente/respuestas";
import { BarraInferior } from "../encabezado";
import EditorRespuestas from "./editor";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/respuestas");
  const { data: editadas } = await supabase.from("asistente_respuestas").select("id, texto");

  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <EditorRespuestas secciones={seccionesParaEditar(editadas)} />
      <BarraInferior activo="ajustes" />
    </main>
  );
}
