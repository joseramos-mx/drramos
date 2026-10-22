import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AgendaDia from "./components/agenda-dia";
import Reloj from "./components/reloj";
import { BarraInferior } from "../crm/mensajes/encabezado";
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

  // Viene de "Agendar" en Mensajes: el paciente ya va elegido
  const { data: preseleccion } = sp.paciente
    ? await supabase.from("pacientes").select("id, nombre, whatsapp").eq("id", String(sp.paciente)).maybeSingle()
    : { data: null };

  const { data: pendientes } = await supabase
    .from("pendientes")
    .select("id, texto, hecho")
    .eq("fecha", fecha)
    .order("created_at");

  const extra = preseleccion ? `&paciente=${preseleccion.id}` : "";

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pb-2">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#1c1a17]">Agenda</h1>
          <p className="text-[18px] font-semibold text-[#5b544a] first-letter:uppercase">
            {formatFechaLarga(fecha)}
            {fecha === hoy && <span className="text-[#8a6d3f]"> · hoy</span>}
          </p>
        </div>
        <Reloj />
      </header>

      <nav className="mt-2 flex gap-2" aria-label="Cambiar de día">
        <NavBtn href={`/agenda?fecha=${sumarDias(fecha, -1)}${extra}`} label="‹ Ayer" />
        <NavBtn href={`/agenda?fecha=${hoy}${extra}`} label="Hoy" activo={fecha === hoy} />
        <NavBtn href={`/agenda?fecha=${sumarDias(fecha, 1)}${extra}`} label="Mañana ›" />
      </nav>

      {error && (
        <div
          role="alert"
          className="mt-6 border border-[#c0392b]/30 bg-[#c0392b]/[0.06] p-4 text-[13px] font-normal text-[#9b2424]"
        >
          No pudimos cargar la agenda. Recarga la página; si sigue, avisa a
          quien administra el sistema.
        </div>
      )}

      {preseleccion && (
        <p className="mt-4 rounded-2xl bg-[#fbf3e3] px-5 py-4 text-[17px] text-[#1c1a17]">
          Toca un hueco para agendar a <strong className="font-bold">{preseleccion.nombre}</strong>.
          <Link href={`/agenda?fecha=${fecha}`} className="ml-3 text-[15px] font-semibold text-[#8a6d3f] underline underline-offset-4">
            Cancelar
          </Link>
        </p>
      )}

      <AgendaDia
        fecha={fecha}
        citas={citas || []}
        pendientes={pendientes || []}
        preseleccion={preseleccion}
        ajustarAlto="auto"
      />
      <BarraInferior activo="agenda" />
    </main>
  );
}

function NavBtn({ href, label, activo = false }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`inline-flex h-12 flex-1 items-center justify-center rounded-full text-[16px] font-semibold sm:flex-none sm:px-6 ${
        activo ? "bg-[#1c1a17] text-white" : "border-2 border-[#1c1a17]/10 bg-white text-[#3d372f]"
      }`}
    >
      {label}
    </Link>
  );
}
