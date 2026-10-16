import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PERIODOS, calcularResultados, rangoPeriodo } from "./stats";
import ResultadosVista from "./resultados-vista";
import { kpisAnuncios, leerAnunciosMeta } from "./meta-ads";
import { gastoPorCanal, mesDe, tablaFuentes } from "./fuentes";

export const dynamic = "force-dynamic";

/**
 * Resultados del consultorio a partir de la agenda: embudo, dinero,
 * origen de los pacientes, tratamientos y listas de acción. La Dra.
 * Gaby no captura nada aquí; todo sale del cierre de cada cita.
 */
export default async function ResultadosPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const periodo = PERIODOS.some((p) => p.value === sp.periodo) ? sp.periodo : "mes";

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/crm/login?from=/crm/resultados");

  // Volumen de un consultorio: se leen todas las citas y se calcula aquí.
  const { data: citas, error } = await supabase
    .from("citas")
    .select(
      "id, inicio, fin, estado, cotizado, cotizado_monto, realizado, pagado_monto, paciente:pacientes(id, nombre, whatsapp, origen)"
    )
    .order("inicio", { ascending: false });

  const rango = rangoPeriodo(periodo);
  const r = calcularResultados(citas || [], rango);

  // Anuncios de Meta cruzados con los pacientes que llegaron por anuncio
  const meta = await leerAnunciosMeta(rango);
  const anuncios =
    meta.conectado && !meta.error
      ? { ...meta, kpis: kpisAnuncios(meta, r.porOrigen.find((o) => o.origen === "anuncio")) }
      : meta;

  // Todas las fuentes: gasto (Meta automático + manual del resto) contra pacientes
  const [{ data: fuentes }, { data: gastos }] = await Promise.all([
    supabase.from("fuentes").select("id, codigo, nombre, canal, de_pago, mensaje").eq("activa", true).order("created_at"),
    supabase.from("fuente_gastos").select("fuente_id, mes, monto"),
  ]);
  const gastos_ = gastoPorCanal({
    fuentes,
    gastos,
    rango,
    gastoMeta: meta.conectado && !meta.error ? meta.gasto : null,
  });
  const filasFuentes = tablaFuentes(r.porOrigen, gastos_);

  const mes = mesDe(new Date().toISOString());
  const gastoMes = Object.fromEntries((gastos || []).filter((g) => g.mes === mes).map((g) => [g.fuente_id, Number(g.monto)]));

  return (
    <ResultadosVista
      r={r}
      anuncios={anuncios}
      filasFuentes={filasFuentes}
      fuentes={fuentes || []}
      gastoMes={gastoMes}
      mes={mes}
      periodo={periodo}
      email={user.email}
      error={error}
    />
  );
}
