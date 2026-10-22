import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "../actions";
import Encabezado, { Resumen } from "./encabezado";
import AutoRefresh from "../../agenda/components/auto-refresh";
import { ETIQUETAS, conversaciones } from "./lib";
import Avisos from "./avisos";
import Lista from "./lista";

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
  const pendientes = todas.filter((c) => c.esperando).length;
  const lista = !f ? todas : f === "esperan" ? todas.filter((c) => c.esperando) : todas.filter((c) => c.etiquetas.includes(f));
  const filtros = [
    { id: null, label: "Todos" },
    { id: "esperan", label: `Sin contestar${pendientes ? ` (${pendientes})` : ""}` },
    ...ETIQUETAS.map((e) => ({ id: e.id, label: e.label })),
  ];

  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pb-12 pt-6">
      <AutoRefresh segundos={15} />
      <Encabezado />

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-[#fde2e2] p-4 text-[17px] text-[#9b2424]">
          No pudimos cargar los mensajes. Cierra y vuelve a abrir la app; si sigue, avísale a Jesús.
        </p>
      )}

      <Resumen pendientes={pendientes} />
      <Avisos />
      <Lista lista={lista} filtros={filtros} f={f} base="/crm/mensajes" />

      <form action={signOutAction} className="mt-10 flex justify-center">
        <button type="submit" className="h-12 rounded-full px-6 text-[15px] font-medium text-[#8b8478] underline underline-offset-4">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

