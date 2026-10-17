import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PERIODOS, calcularResultados, rangoPeriodo } from "./stats";
import ResultadosVista from "./resultados-vista";
import { kpisAnuncios, leerAnunciosMeta } from "./meta-ads";
import { gastoPorCanal, mesDe, tablaFuentes } from "./fuentes";
import { embudoWhatsapp, sinContestar, tiemposRespuesta } from "./stats-whatsapp";

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
      "id, inicio, fin, estado, cotizado, cotizado_monto, realizado, pagado_monto, cierre_completo, paciente:pacientes(id, nombre, whatsapp, origen)"
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
  // WhatsApp: quién escribió, en cuánto se le contestó y a quién no
  const hace30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const desdeMensajes = rango.desde && rango.desde < hace30 ? rango.desde : rango.desde ? hace30 : null;
  let qMensajes = supabase
    .from("whatsapp_mensajes")
    .select("telefono, direccion, enviado_en, texto, paciente:pacientes(id, nombre, whatsapp)")
    .order("enviado_en")
    .limit(20000);
  if (desdeMensajes) qMensajes = qMensajes.gte("enviado_en", desdeMensajes);
  const [{ data: contactos }, { data: mensajesWa }] = await Promise.all([
    supabase.from("pacientes").select("id, origen, primer_mensaje_en").not("primer_mensaje_en", "is", null),
    qMensajes,
  ]);
  const wa = {
    embudo: embudoWhatsapp(contactos, citas, rango),
    tiempos: tiemposRespuesta(mensajesWa, rango),
    sinContestar: sinContestar((mensajesWa || []).filter((m) => m.enviado_en >= hace30)),
  };

  const filasFuentes = tablaFuentes(r.porOrigen, gastos_, wa.embudo.porOrigen);

  // Estado de la conexión de WhatsApp (para confirmar que llegan mensajes)
  const { data: ultimoWa, count: totalWa } = await supabase
    .from("whatsapp_mensajes")
    .select("enviado_en", { count: "exact" })
    .order("enviado_en", { ascending: false })
    .limit(1);
  const whatsapp = { total: totalWa || 0, ultimo: ultimoWa?.[0]?.enviado_en || null };

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
      whatsapp={whatsapp}
      wa={wa}
      periodo={periodo}
      email={user.email}
      error={error}
    />
  );
}
