import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { esAdmin } from "@/lib/mensajes-servidor";
import { BarraInferior, BarraSuperior } from "../encabezado";
import MarcarReporte from "./marcar";

export const dynamic = "force-dynamic";

const fecha = (d) =>
  new Date(d).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" });
const QUIEN = { paciente: "Paciente", app: "Ella (celular)", api: "Ella", asistente: "Asistente virtual", recordatorio: "Automático", historial: "Historial" };

/** Reportes de problemas que manda la Dra. Gaby, con el contexto del chat. Sólo administradores. */
export default async function ReportesPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/mensajes/reportes");
  if (!esAdmin(user.email)) redirect("/crm/mensajes/ajustes");

  const { data: reportes, error } = await supabase.from("reportes").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <main className="mx-auto w-full max-w-[720px] pb-28">
      <BarraSuperior titulo="Reportes de problemas" />
      {error && <p className="mx-5 mt-4 rounded-2xl bg-[#fbe9e7] px-4 py-3 text-[16px] text-[#8a2a1c]">Falta correr la migración de reportes en Supabase.</p>}
      {!error && !reportes?.length && <p className="px-5 pt-6 text-[17px] text-[#7a7368]">Todavía no hay reportes.</p>}
      <ul className="flex flex-col gap-4 px-4 pt-4">
        {(reportes || []).map((r) => {
          const c = r.contexto || {};
          const toma = (c.fichas || []).find((f) => f.atiende === "humano");
          return (
            <li key={r.id} className={`rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgba(28,26,23,0.08)] ${r.estado === "resuelto" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] text-[#7a7368]">
                    {fecha(r.created_at)} · {r.autor}
                    {r.telefono && (
                      <>
                        {" · "}
                        <Link href={`/crm/mensajes/${r.telefono}`} className="font-semibold text-[#8a6d3f] underline">
                          {c.fichas?.[0]?.nombre || r.telefono}
                        </Link>
                      </>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[17px] leading-snug text-[#1c1a17]">{r.texto}</p>
                </div>
                <MarcarReporte id={r.id} estado={r.estado} />
              </div>
              <p className="mt-2 text-[14px] text-[#5b544a]">
                Asistente: <b>{c.modo_asistente || "?"}</b>
                {r.telefono && <> · Chat: <b>{toma ? `lo tenía ella desde ${fecha(toma.atiende_desde)}` : "lo tenía el asistente"}</b></>}
                {c.pagina && <> · Pantalla: {c.pagina}</>}
              </p>
              {c.ultimos_mensajes?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[15px] font-semibold text-[#8a6d3f]">Últimos mensajes del chat ({c.ultimos_mensajes.length})</summary>
                  <ol className="mt-2 flex flex-col gap-1.5">
                    {c.ultimos_mensajes.map((m, i) => (
                      <li key={i} className="rounded-xl bg-[#f5f1ea] px-3 py-2 text-[14px] leading-snug">
                        <span className="font-semibold">{fecha(m.enviado_en)} · {QUIEN[m.via] || m.via}</span>
                        {m.estado === "failed" && <span className="text-[#c0392b]"> · no le llegó</span>}
                        <span className="block whitespace-pre-wrap text-[#1c1a17]">{m.texto || `[${m.tipo}]`}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
              {c.asistente_registro?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[15px] font-semibold text-[#8a6d3f]">Qué hizo el asistente</summary>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f5f1ea] p-3 text-[12px]">{JSON.stringify(c.asistente_registro, null, 1)}</pre>
                </details>
              )}
            </li>
          );
        })}
      </ul>
      <BarraInferior activo="ajustes" />
    </main>
  );
}
