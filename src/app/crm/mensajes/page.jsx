import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { BarraInferior, BarraSuperior } from "./encabezado";
import AutoRefresh from "../../agenda/components/auto-refresh";
import { conversaciones } from "./lib";
import Avisos from "./avisos";
import Lista, { filtrar, filtrosDe } from "./lista";

export const dynamic = "force-dynamic";

/**
 * Bandeja de WhatsApp del consultorio: una fila por paciente, primero
 * las que esperan respuesta. Se actualiza sola cada 15 s. Filtros por
 * "sin contestar" y por etiqueta (?f=).
 */
export default async function MensajesPage({ searchParams }) {
  const { f } = await searchParams;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes");

  const desde = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
  const { data: mensajes, error } = await supabase
    .from("whatsapp_mensajes")
    .select("telefono, direccion, enviado_en, texto, tipo, paciente:pacientes(id, nombre, etiquetas)")
    .gte("enviado_en", desde)
    .order("enviado_en")
    .limit(10000);

  const todas = conversaciones(mensajes || []);
  const lista = filtrar(todas, f);

  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <AutoRefresh segundos={15} />
      <BarraSuperior titulo="Mensajes" />
      <Avisos compacto />

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-2xl bg-[#fde2e2] p-4 text-[17px] text-[#9b2424]">
          No pudimos cargar los mensajes. Cierra y vuelve a abrir la app; si sigue, avísale a Jesús.
        </p>
      )}

      <Lista lista={lista} filtros={filtrosDe(todas)} f={f} base="/crm/mensajes" />
      <BarraInferior activo="mensajes" />
    </main>
  );
}
