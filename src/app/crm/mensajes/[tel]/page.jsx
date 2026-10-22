import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { normalizarTelefono } from "@/lib/telefono";
import { ventanaAbierta, whatsappConfigurado } from "@/lib/whatsapp";
import AutoRefresh from "../../../agenda/components/auto-refresh";
import Cabecera from "./cabecera";
import Chat from "./chat";
import Responder from "./responder";
import QuienAtiende from "./quien-atiende";

export const dynamic = "force-dynamic";

export default async function ConversacionPage({ params }) {
  const { tel } = await params;
  const telefono = normalizarTelefono(tel);

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/crm/login?from=/crm/mensajes/${telefono}`);

  const [{ data: mensajes }, { data: paciente }, { data: config }, { data: borrador }] = await Promise.all([
    supabase
      .from("whatsapp_mensajes")
      .select("id, direccion, via, enviado_en, texto, tipo, media_id, media_ruta")
      .eq("telefono", telefono)
      .order("enviado_en")
      .limit(500),
    supabase.from("pacientes").select("id, nombre, origen, etiquetas, atiende, atiende_desde").eq("whatsapp", telefono).limit(1).maybeSingle(),
    supabase.from("asistente_config").select("modo").eq("id", 1).maybeSingle(),
    supabase
      .from("asistente_borradores")
      .select("id, texto")
      .eq("telefono", telefono)
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const ultimaEntrada = [...(mensajes || [])].reverse().find((m) => m.direccion === "entrada")?.enviado_en;
  const abierta = ventanaAbierta(ultimaEntrada);
  const nombre = paciente?.nombre || `WhatsApp ${telefono.slice(-10)}`;
  const modo = config?.modo || "apagado";
  // Lo lleva ella si lo tomó (o le pasaron el caso) hace menos de 8 h
  const atiende =
    paciente?.atiende === "humano" && paciente.atiende_desde && Date.now() - new Date(paciente.atiende_desde).getTime() < 8 * 3600 * 1000
      ? "humano"
      : "asistente";

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[720px] flex-col bg-[#f5f1ea]">
      <AutoRefresh segundos={10} />
      <Cabecera
        nombre={nombre}
        telefono={telefono}
        origen={paciente?.origen}
        etiquetas={paciente?.etiquetas || []}
        pacienteId={paciente?.id}
        volver="/crm/mensajes"
        agendarHref={paciente ? `/agenda?paciente=${paciente.id}` : null}
      />
      {paciente && modo !== "apagado" && <QuienAtiende key={atiende} pacienteId={paciente.id} atiende={atiende} />}
      <div className="flex flex-1 flex-col px-3">
        <Chat mensajes={mensajes || []} />
      </div>
      <div className="sticky bottom-0 border-t border-[#1c1a17]/[0.08] bg-white px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5">
        <Responder
          telefono={telefono}
          abierta={abierta}
          conectado={whatsappConfigurado()}
          nombre={nombre}
          sinMensajes={!mensajes?.length}
          borrador={borrador}
        />
      </div>
    </main>
  );
}
