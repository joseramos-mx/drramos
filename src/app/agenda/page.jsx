import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AgendaDia from "./components/agenda-dia";
import {
  CITA_SELECT,
  esFechaValida,
  formatFechaLarga,
  hoyDurango,
  rangoDelDia,
  sumarDias,
} from "./lib";

export const dynamic = "force-dynamic";

export default async function AgendaPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const hoy = hoyDurango();
  const fecha = esFechaValida(sp.fecha) ? sp.fecha : hoy;

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/agenda");

  const { desde, hasta } = rangoDelDia(fecha);
  const { data: citas, error } = await supabase
    .from("citas")
    .select(CITA_SELECT)
    .gte("inicio", desde)
    .lt("inicio", hasta)
    .order("inicio");

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-8 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <p className="font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89968]">
            Agenda
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[clamp(26px,4vw,40px)] font-light leading-[1.1] first-letter:uppercase text-[#f5f1ea]">
            {formatFechaLarga(fecha)}
            {fecha === hoy && <span className="normal-case text-white/45"> · hoy</span>}
          </h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavBtn href={`/agenda?fecha=${sumarDias(fecha, -1)}`} label="← Ayer" />
          {fecha !== hoy && <NavBtn href="/agenda" label="Hoy" />}
          <NavBtn href={`/agenda?fecha=${sumarDias(fecha, 1)}`} label="Mañana →" />
          <NavBtn href={`/agenda/pantalla`} label="Pantalla" />
        </nav>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-6 border border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.06] p-4 font-[family-name:var(--font-albert)] text-[13px] font-light text-[#ffb1b1]"
        >
          No pudimos cargar la agenda. Recarga la página; si sigue, avisa a
          quien administra el sistema.
        </div>
      )}

      <AgendaDia fecha={fecha} citas={citas || []} />
    </main>
  );
}

function NavBtn({ href, label }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center border border-white/[0.12] px-4 py-2 font-[family-name:var(--font-albert)] text-[13px] font-normal tracking-[0.02em] text-white/85 transition-colors duration-200 hover:border-white/30 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
    >
      {label}
    </Link>
  );
}
