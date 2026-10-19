import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "../components/sign-out-button";
import NavCrm from "../components/nav-crm";
import AutoRefresh from "../../agenda/components/auto-refresh";
import { conversaciones, horaCorta } from "./lib";

export const dynamic = "force-dynamic";

/**
 * Bandeja de WhatsApp del consultorio: una fila por paciente, primero
 * las que esperan respuesta. Se actualiza sola cada 15 s.
 */
export default async function MensajesPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes");

  const desde = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
  const { data: mensajes, error } = await supabase
    .from("whatsapp_mensajes")
    .select("telefono, direccion, enviado_en, texto, tipo, paciente:pacientes(id, nombre)")
    .gte("enviado_en", desde)
    .order("enviado_en")
    .limit(10000);

  const lista = conversaciones(mensajes || []);
  const pendientes = lista.filter((c) => c.esperando).length;

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

      <ul className="mt-4 border border-white/[0.1]">
        {lista.length === 0 && (
          <li className="p-6 font-[family-name:var(--font-albert)] text-[14px] text-white/65">
            Todavía no hay conversaciones. Cuando un paciente escriba al WhatsApp del consultorio, aparecerá aquí.
          </li>
        )}
        {lista.map((c) => (
          <li key={c.telefono}>
            <Link
              href={`/crm/mensajes/${c.telefono}`}
              className={`flex min-h-[68px] items-center gap-4 border-b border-white/[0.06] px-4 py-3 last:border-0 hover:bg-white/[0.03] ${
                c.esperando ? "bg-[#b89968]/[0.06]" : ""
              }`}
            >
              <span
                aria-hidden
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${c.esperando ? "bg-[#b89968]" : "bg-transparent"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-albert)] text-[16px] font-medium text-[#f5f1ea]">
                  {c.nombre}
                </p>
                <p className="truncate font-[family-name:var(--font-albert)] text-[14px] text-white/70">
                  {c.ultimo.direccion === "salida" && <span className="text-white/45">Tú: </span>}
                  {c.ultimo.texto || "📎 Archivo o mensaje sin texto"}
                </p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-albert)] text-[12px] tabular-nums text-white/60">
                {horaCorta(c.ultimo.enviado_en)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
