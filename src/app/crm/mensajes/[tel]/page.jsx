import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { normalizarTelefono } from "@/lib/telefono";
import { ventanaAbierta, whatsappConfigurado } from "@/lib/whatsapp";
import AutoRefresh from "../../../agenda/components/auto-refresh";
import { labelCanal } from "../../resultados/fuentes";
import { horaCorta } from "../lib";
import Responder from "./responder";

export const dynamic = "force-dynamic";

export default async function ConversacionPage({ params }) {
  const { tel } = await params;
  const telefono = normalizarTelefono(tel);

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/crm/login?from=/crm/mensajes/${telefono}`);

  const [{ data: mensajes }, { data: paciente }] = await Promise.all([
    supabase
      .from("whatsapp_mensajes")
      .select("id, direccion, via, enviado_en, texto, tipo")
      .eq("telefono", telefono)
      .order("enviado_en")
      .limit(500),
    supabase.from("pacientes").select("id, nombre, origen").eq("whatsapp", telefono).limit(1).maybeSingle(),
  ]);

  const ultimaEntrada = [...(mensajes || [])].reverse().find((m) => m.direccion === "entrada")?.enviado_en;
  const abierta = ventanaAbierta(ultimaEntrada);
  const nombre = paciente?.nombre || `WhatsApp ${telefono.slice(-10)}`;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[900px] flex-col px-4 py-4 sm:px-8">
      <AutoRefresh segundos={10} />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="min-w-0">
          <Link href="/crm/mensajes" className="font-[family-name:var(--font-albert)] text-[12px] font-medium uppercase tracking-[0.18em] text-white/65 hover:text-[#f5f1ea]">
            ← Mensajes
          </Link>
          <h1 className="mt-2 truncate font-[family-name:var(--font-cormorant)] text-[clamp(24px,3.5vw,34px)] font-normal leading-tight text-[#f5f1ea]">
            {nombre}
          </h1>
          <p className="font-[family-name:var(--font-albert)] text-[13px] text-white/65">
            {telefono.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")}
            {paciente?.origen && ` · llegó por ${labelCanal(paciente.origen)}`}
          </p>
        </div>
        {paciente && (
          <Link
            href={`/agenda?paciente=${paciente.id}`}
            className="inline-flex min-h-[48px] items-center bg-[#f5f1ea] px-5 font-[family-name:var(--font-albert)] text-[14px] font-medium text-[#000000] hover:bg-white"
          >
            Agendar
          </Link>
        )}
      </header>

      <ol className="flex-1 space-y-2 py-4">
        {(mensajes || []).map((m) => {
          const mio = m.direccion === "salida";
          return (
            <li key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] border px-3.5 py-2 ${
                  mio ? "border-[#b89968]/40 bg-[#b89968]/[0.14]" : "border-white/[0.1] bg-white/[0.04]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words font-[family-name:var(--font-albert)] text-[15px] leading-snug text-[#f5f1ea]">
                  {m.texto || <span className="italic text-white/55">📎 {m.tipo || "archivo"}</span>}
                </p>
                <p className="mt-1 text-right font-[family-name:var(--font-albert)] text-[11px] tabular-nums text-white/50">
                  {horaCorta(m.enviado_en)}
                  {m.via === "app" && " · desde el celular"}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 border-t border-white/[0.08] bg-[#000000] pb-3 pt-3">
        <Responder telefono={telefono} abierta={abierta} conectado={whatsappConfigurado()} />
      </div>
    </main>
  );
}
