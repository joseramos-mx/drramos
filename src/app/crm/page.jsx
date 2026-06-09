import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LeadCard from "./components/lead-card";
import Filters from "./components/filters";
import SignOutButton from "./components/sign-out-button";
import { ESTADOS, TRACKS, computeStats } from "./lib";

export const dynamic = "force-dynamic";

export default async function CrmPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const estado = ESTADOS.find((e) => e.value === sp.estado)?.value;
  const track = TRACKS.find((t) => t.value === sp.track)?.value;

  const supabase = createClient(await cookies());

  // El middleware redirige si no hay sesión, pero verificamos por si
  // se accede al render directamente.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login");

  let query = supabase
    .from("leads")
    .select(
      "id, created_at, estado, event_id, evento, track, nombre, whatsapp, dientes, motivo, plan, notas"
    )
    .order("created_at", { ascending: false });

  if (estado) query = query.eq("estado", estado);
  if (track) query = query.eq("track", track);

  const { data: leads, error } = await query;

  const stats = computeStats(leads || []);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 md:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.28em] text-[#b89968]">
            Gestión interna
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[clamp(28px,4vw,40px)] font-light leading-[1.1] text-[#f5f1ea]">
            Leads del consultorio.
          </h1>
        </div>
        <SignOutButton email={user.email} />
      </header>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Nuevos sin contactar" value={stats.nuevos} highlight />
        <Stat label="Total del mes" value={stats.delMes} />
        <Stat label="Reconstrucción" value={stats.reconstruccion} />
        <Stat label="Total" value={stats.total} />
      </section>

      <section className="mt-10">
        <Filters estado={estado} track={track} />
      </section>

      {error && (
        <div
          role="alert"
          className="mt-8 border border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.06] p-4 font-[family-name:var(--font-albert)] text-[13px] font-light text-[#ffb1b1]"
        >
          No pudimos cargar los leads. Recarga la página, si persiste avisa a
          quien administra el sistema.
        </div>
      )}

      <section className="mt-8 space-y-4">
        {(leads || []).map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}

        {!error && (leads || []).length === 0 && (
          <div className="border border-white/[0.08] bg-white/[0.02] p-8 text-center font-[family-name:var(--font-albert)] text-[13px] font-light text-white/55">
            Sin leads para este filtro.
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div
      className={`border p-4 ${
        highlight
          ? "border-[#b89968]/60 bg-[#b89968]/[0.08]"
          : "border-white/[0.08] bg-white/[0.015]"
      }`}
    >
      <p className="font-[family-name:var(--font-cormorant)] text-[36px] font-light leading-none text-[#f5f1ea] md:text-[44px]">
        {value}
      </p>
      <p className="mt-2 font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.22em] text-white/55">
        {label}
      </p>
    </div>
  );
}
