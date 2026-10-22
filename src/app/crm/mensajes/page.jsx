import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "../components/sign-out-button";
import NavCrm from "../components/nav-crm";
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
    <main className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-8 md:py-10">
      <AutoRefresh segundos={15} />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <p className="font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89968]">
            WhatsApp del consultorio
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[clamp(28px,4vw,40px)] font-light leading-[1.1] text-[#f5f1ea]">
            Mensajes.
          </h1>
          <NavCrm activo="mensajes" />
        </div>
        <SignOutButton email={user.email} />
      </header>

      {error && (
        <p role="alert" className="mt-6 border border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.06] p-4 font-[family-name:var(--font-albert)] text-[14px] text-[#ffb1b1]">
          No pudimos cargar los mensajes. Recarga la página; si sigue, avisa a quien administra el sistema.
        </p>
      )}

      <p className="mt-6 font-[family-name:var(--font-albert)] text-[14px] text-white/75">
        {pendientes > 0 ? (
          <span className="text-[#f5f1ea]">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#b89968] align-middle" />
            {pendientes} {pendientes === 1 ? "paciente espera" : "pacientes esperan"} respuesta
          </span>
        ) : (
          "Todo contestado."
        )}
      </p>

      <Avisos />

      <Lista lista={lista} filtros={filtros} f={f} base="/crm/mensajes" />
    </main>
  );
}
