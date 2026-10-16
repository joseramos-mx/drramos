"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  DENTISTAS,
  TIPOS,
  DURACIONES,
  ESTADOS_CITA,
  TRATAMIENTOS,
  ORIGENES,
  esFechaValida,
  isoDesde,
} from "./lib";

/**
 * Server actions de la agenda. Cliente SSR con anon key + sesión:
 * RLS (sólo `authenticated`) decide qué se puede leer y escribir.
 */

const set = (lista) => new Set(lista.map((x) => x.value));
const DENTISTAS_OK = set(DENTISTAS);
const TIPOS_OK = set(TIPOS);
const DURACIONES_OK = set(DURACIONES);
const ESTADOS_OK = set(ESTADOS_CITA);
const TRATAMIENTOS_OK = set(TRATAMIENTOS);
const ORIGENES_OK = set(ORIGENES);

function monto(raw) {
  const s = String(raw ?? "").replace(/[^\d.]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function lista(formData, key) {
  return formData.getAll(key).map(String).filter((v) => TRATAMIENTOS_OK.has(v));
}

// ─────────────────────────────────────────────────────────────
//  Buscar paciente al agendar (pacientes y leads del formulario)
// ─────────────────────────────────────────────────────────────
export async function buscarPacientesAction(q) {
  const term = String(q || "").trim();
  if (term.length < 2) return [];

  const supabase = createClient(await cookies());
  const digits = term.replace(/\D+/g, "");
  const like = `%${term.replace(/[%_,()]/g, "")}%`;

  let pq = supabase.from("pacientes").select("id, nombre, whatsapp, lead_id").limit(6);
  pq = digits.length >= 4
    ? pq.ilike("whatsapp", `%${digits}%`)
    : pq.ilike("nombre", like);

  let lq = supabase
    .from("leads")
    .select("id, nombre, whatsapp")
    .order("created_at", { ascending: false })
    .limit(4);
  lq = digits.length >= 4
    ? lq.ilike("whatsapp", `%${digits}%`)
    : lq.ilike("nombre", like);

  const [{ data: pacientes }, { data: leads }] = await Promise.all([pq, lq]);

  const ligados = new Set((pacientes || []).map((p) => p.lead_id).filter(Boolean));
  return [
    ...(pacientes || []).map((p) => ({ tipo: "paciente", id: p.id, nombre: p.nombre, whatsapp: p.whatsapp })),
    ...(leads || [])
      .filter((l) => !ligados.has(l.id))
      .map((l) => ({ tipo: "lead", id: l.id, nombre: l.nombre, whatsapp: l.whatsapp })),
  ];
}

// ─────────────────────────────────────────────────────────────
//  Crear / editar cita
// ─────────────────────────────────────────────────────────────
export async function guardarCitaAction(_prev, formData) {
  const id = String(formData.get("id") || "");
  const fecha = String(formData.get("fecha") || "");
  const minutos = Number(formData.get("minutos"));
  const duracion = String(formData.get("duracion") || "");
  const dentista = String(formData.get("dentista") || "");
  const tipo = String(formData.get("tipo") || "");
  const notas = String(formData.get("notas") ?? "").trim();

  if (!esFechaValida(fecha) || !Number.isInteger(minutos) || minutos < 0 || minutos >= 24 * 60) {
    return { error: "Fecha u hora inválida." };
  }
  if (!DURACIONES_OK.has(duracion)) return { error: "Elige la duración." };
  if (!DENTISTAS_OK.has(dentista)) return { error: "Elige el dentista." };
  if (!TIPOS_OK.has(tipo)) return { error: "Elige el tipo de cita." };

  const supabase = createClient(await cookies());

  const inicio = isoDesde(fecha, minutos);
  const fin = isoDesde(fecha, minutos + Number(duracion));
  const base = { dentista, tipo, inicio, fin, notas: notas || null, updated_at: new Date().toISOString() };

  if (id) {
    const { error } = await supabase.from("citas").update(base).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/agenda");
    return { ok: true };
  }

  const pacienteId = await resolverPaciente(supabase, formData);
  if (pacienteId?.error) return pacienteId;

  const { error } = await supabase.from("citas").insert({ ...base, paciente_id: pacienteId });
  if (error) return { error: error.message };

  revalidatePath("/agenda");
  return { ok: true };
}

/**
 * Devuelve el id del paciente de la cita: uno existente, uno creado a
 * partir de un lead del formulario, o uno nuevo con nombre y WhatsApp.
 */
async function resolverPaciente(supabase, formData) {
  const pacienteId = String(formData.get("paciente_id") || "");
  if (pacienteId) return pacienteId;

  const leadId = String(formData.get("lead_id") || "");
  if (leadId) {
    const { data: existente } = await supabase
      .from("pacientes").select("id").eq("lead_id", leadId).maybeSingle();
    if (existente) return existente.id;

    const { data: lead, error: e1 } = await supabase
      .from("leads").select("id, nombre, whatsapp").eq("id", leadId).single();
    if (e1 || !lead) return { error: "No encontramos ese contacto." };

    const { data: nuevo, error: e2 } = await supabase
      .from("pacientes")
      .insert({ nombre: lead.nombre || "Sin nombre", whatsapp: lead.whatsapp, origen: "formulario", lead_id: lead.id })
      .select("id").single();
    if (e2) return { error: e2.message };

    await supabase.from("leads").update({ estado: "cita" }).eq("id", lead.id);
    return nuevo.id;
  }

  const nombre = String(formData.get("nombre") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const origen = String(formData.get("origen") || "");
  const origenDetalle = String(formData.get("origen_detalle") || "").trim();

  if (!nombre) return { error: "Escribe el nombre del paciente." };
  if (origen && !ORIGENES_OK.has(origen)) return { error: "Origen inválido." };

  const { data: nuevo, error } = await supabase
    .from("pacientes")
    .insert({
      nombre,
      whatsapp: whatsapp || null,
      origen: origen || null,
      origen_detalle: origenDetalle || null,
    })
    .select("id").single();
  if (error) return { error: error.message };
  return nuevo.id;
}

// ─────────────────────────────────────────────────────────────
//  Cierre de la cita: ¿se presentó?, cotizado, realizado, pagado
// ─────────────────────────────────────────────────────────────
export async function cerrarCitaAction(_prev, formData) {
  const id = String(formData.get("id") || "");
  const estado = String(formData.get("estado") || "");
  const cotizadoMonto = monto(formData.get("cotizado_monto"));
  const pagadoMonto = monto(formData.get("pagado_monto"));

  if (!id) return { error: "Cita inválida." };
  if (!ESTADOS_OK.has(estado)) return { error: "Marca si se presentó." };
  if (Number.isNaN(cotizadoMonto) || Number.isNaN(pagadoMonto)) {
    return { error: "Revisa los montos." };
  }

  const asistio = estado === "asistio";
  const cotizado = asistio ? lista(formData, "cotizado") : [];
  const realizado = asistio ? lista(formData, "realizado") : [];

  const supabase = createClient(await cookies());
  const { data: cita, error } = await supabase
    .from("citas")
    .update({
      estado,
      cotizado: cotizado.length ? cotizado : null,
      cotizado_monto: asistio ? cotizadoMonto : null,
      realizado: realizado.length ? realizado : null,
      pagado_monto: asistio ? pagadoMonto : null,
      cierre_completo: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("paciente_id")
    .single();
  if (error) return { error: error.message };

  // Si el paciente vino del formulario, su lead avanza en el embudo del CRM.
  if (asistio && pagadoMonto > 0) {
    const { data: p } = await supabase
      .from("pacientes").select("lead_id").eq("id", cita.paciente_id).single();
    if (p?.lead_id) {
      await supabase.from("leads").update({ estado: "cerrado" }).eq("id", p.lead_id);
    }
  }

  revalidatePath("/agenda");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
//  Palomita rápida: "vino", y el resto se contesta después
// ─────────────────────────────────────────────────────────────
export async function marcarVinoAction(id) {
  if (!id) return { error: "Cita inválida." };
  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("citas")
    .update({ estado: "asistio", updated_at: new Date().toISOString() })
    .eq("id", String(id));
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
//  Pendientes del día (las notas al pie de la libreta)
// ─────────────────────────────────────────────────────────────
export async function agregarPendienteAction(_prev, formData) {
  const fecha = String(formData.get("fecha") || "");
  const texto = String(formData.get("texto") || "").trim().slice(0, 300);
  if (!esFechaValida(fecha)) return { error: "Fecha inválida." };
  if (!texto) return { error: "Escribe el pendiente." };

  const supabase = createClient(await cookies());
  const { error } = await supabase.from("pendientes").insert({ fecha, texto });
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return { ok: true, savedAt: Date.now() };
}

export async function cambiarPendienteAction(id, hecho) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("pendientes").update({ hecho: !!hecho }).eq("id", String(id));
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return { ok: true };
}

export async function borrarPendienteAction(id) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("pendientes").delete().eq("id", String(id));
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return { ok: true };
}
