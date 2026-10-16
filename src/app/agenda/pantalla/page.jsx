import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AgendaDia from "../components/agenda-dia";
import AutoRefresh from "../components/auto-refresh";
import Reloj from "../components/reloj";
import { CITA_SELECT, formatFechaLarga, hoyDurango, rangoDelDia } from "../lib";

export const dynamic = "force-dynamic";

/**
 * Vista para el monitor del consultorio: la agenda de hoy, sólo
 * lectura, se actualiza sola cada minuto. Pensada para dejarse abierta
 * en una ventana mientras no hay paciente.
 */
export default async function PantallaPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/agenda/pantalla");

  const fecha = hoyDurango();
  const { desde, hasta } = rangoDelDia(fecha);
  const { data: citas } = await supabase
    .from("citas")
    .select(CITA_SELECT)
    .gte("inicio", desde)
    .lt("inicio", hasta)
    .neq("estado", "cancelada")
    .order("inicio");

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-6">
      <AutoRefresh segundos={60} />
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <h1 className="font-[family-name:var(--font-cormorant)] text-[clamp(32px,3.5vw,52px)] font-light leading-[1.05] first-letter:uppercase text-[#f5f1ea]">
          {formatFechaLarga(fecha)}
        </h1>
        <Reloj grande />
      </header>
      <AgendaDia fecha={fecha} citas={citas || []} soloLectura ajustarAlto />
    </main>
  );
}
