"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { normalizarTelefono } from "@/lib/telefono";
import { enviarPlantilla } from "@/lib/whatsapp";
import { supabaseServicio } from "@/lib/mensajes-servidor";
import { idBoton } from "@/lib/mi-cita";
import { PLANTILLAS_SISTEMA, rellenar } from "../crm/mensajes/plantillas";
import {
  DENTISTAS,
  TIPOS,
  DURACIONES,
  ESTADOS_CITA,
  TRATAMIENTOS,
  ORIGENES,
  esFechaValida,
  isoDesde,
  festivosOficiales,
  formatFechaLarga,
  formatHora,
  minutosDelDia,
  textoLlamar,
  hoyDurango,
  rangoDelDia,
  sumarDias,
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
  // Si la mueve ella, ya no hay que llamarle por un bloqueo
  const base = { dentista, tipo, inicio, fin, notas: notas || null, aviso_bloqueo_en: null, updated_at: new Date().toISOString() };

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
      .insert({ nombre: lead.nombre || "Sin nombre", whatsapp: normalizarTelefono(lead.whatsapp), origen: "formulario", lead_id: lead.id })
      .select("id").single();
    if (e2) return { error: e2.message };

    await supabase.from("leads").update({ estado: "cita" }).eq("id", lead.id);
    return nuevo.id;
  }

  const nombre = String(formData.get("nombre") || "").trim();
  const whatsapp = normalizarTelefono(formData.get("whatsapp"));
  const origen = String(formData.get("origen") || "");
  const origenDetalle = String(formData.get("origen_detalle") || "").trim();

  if (!nombre) return { error: "Escribe el nombre del paciente." };
  if (origen && !ORIGENES_OK.has(origen)) return { error: "Origen inválido." };

  // Si ya existe (p. ej. lo creó WhatsApp al escribir), se reutiliza
  if (whatsapp) {
    const { data: existente } = await supabase
      .from("pacientes").select("id").eq("whatsapp", whatsapp).limit(1).maybeSingle();
    if (existente) return existente.id;
  }

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
      aviso_bloqueo_en: null,
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
    .update({ estado: "asistio", aviso_bloqueo_en: null, updated_at: new Date().toISOString() })
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

// ─────────────────────────────────────────────────────────────
//  Bloqueos: días u horas sin consulta (el asistente no los ofrece)
// ─────────────────────────────────────────────────────────────
const MOTIVOS_OK = ["Vacaciones", "Congreso o curso", "Día festivo", "Sin consulta"];
const hhmm = (v) => {
  const m = String(v || "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

/** Citas futuras (no canceladas) que caen en lo que se quiere bloquear. */
async function citasEn(supabase, desdeFecha, hastaFecha, desdeMin, hastaMin) {
  const { data } = await supabase
    .from("citas")
    .select("id, inicio, fin, estado, notas, paciente:pacientes(id, nombre, whatsapp)")
    .gte("inicio", rangoDelDia(desdeFecha).desde)
    .lt("inicio", rangoDelDia(hastaFecha).hasta)
    .neq("estado", "cancelada")
    .order("inicio");
  const ahora = new Date();
  return (data || []).filter(
    (c) =>
      new Date(c.inicio) > ahora &&
      c.estado !== "asistio" &&
      (desdeMin == null || (new Date(c.inicio) < new Date(isoDesde(desdeFecha, hastaMin)) && new Date(c.fin) > new Date(isoDesde(desdeFecha, desdeMin))))
  );
}

const resumenCita = (c) => ({
  id: c.id,
  nombre: c.paciente?.nombre || "Sin nombre",
  cuando: `${formatFechaLarga(hoyDurango(new Date(c.inicio)))}, ${formatHora(minutosDelDia(c.inicio))}`,
  whatsapp: Boolean(normalizarTelefono(c.paciente?.whatsapp)),
});

/** Revisa los datos de un bloqueo y devuelve { error } o { ok, valores } (sin guardar). */
function validarBloqueo(datos) {
  const evento = Boolean(datos?.evento);
  const tipo = evento ? "horas" : datos?.tipo;
  const desde = String(datos?.desde || "");
  const hasta = tipo === "varios" ? String(datos?.hasta || "") : desde;
  const motivo = evento
    ? String(datos?.motivo || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 80)
    : MOTIVOS_OK.includes(datos?.motivo) ? datos.motivo : "Sin consulta";
  if (evento && !motivo) return { error: "Escribe qué es el evento." };
  if (!["dia", "varios", "horas"].includes(tipo)) return { error: "Elige qué quieres bloquear." };
  if (!esFechaValida(desde) || !esFechaValida(hasta)) return { error: "Elige la fecha." };
  if (hasta < desde) return { error: "La fecha final va después de la inicial." };
  if (desde < hoyDurango()) return { error: "Esa fecha ya pasó." };
  if (sumarDias(desde, 120) < hasta) return { error: "Máximo 4 meses seguidos." };
  let desdeMin = null;
  let hastaMin = null;
  if (tipo === "horas") {
    desdeMin = hhmm(datos?.horaDesde);
    hastaMin = hhmm(datos?.horaHasta);
    if (!Number.isFinite(desdeMin) || !Number.isFinite(hastaMin) || desdeMin >= hastaMin) return { error: "Elige de qué hora a qué hora." };
  }
  const nota = String(datos?.nota || "").replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").trim().slice(0, 200) || null;
  return { ok: true, valores: { desde_fecha: desde, hasta_fecha: hasta, desde_min: desdeMin, hasta_min: hastaMin, motivo, evento, nota } };
}

/** Antes de bloquear: ¿qué citas caen ahí? → { citas: [{ id, nombre, cuando, whatsapp }] } */
export async function revisarBloqueoAction(datos) {
  const v = validarBloqueo(datos);
  if (v.error) return v;
  const { desde_fecha, hasta_fecha, desde_min, hasta_min } = v.valores;
  const supabase = createClient(await cookies());
  const citas = await citasEn(supabase, desde_fecha, hasta_fecha, desde_min, hasta_min);
  return { citas: citas.map(resumenCita) };
}

/** Avisa a un paciente por WhatsApp (plantilla del sistema) y lo deja en su chat. */
async function avisarPaciente(admin, cita, plantilla, botones) {
  const tel = normalizarTelefono(cita.paciente?.whatsapp);
  if (!tel) return { sinWhatsapp: true };
  const p = PLANTILLAS_SISTEMA.find((x) => x.nombre === plantilla);
  const nombre = cita.paciente?.nombre && !/^WhatsApp /.test(cita.paciente.nombre) ? cita.paciente.nombre.trim().split(/\s+/)[0] : "estimado paciente";
  const valores = [nombre, formatFechaLarga(hoyDurango(new Date(cita.inicio))), formatHora(minutosDelDia(cita.inicio))];
  const envio = await enviarPlantilla(tel, p.nombre, valores, "es_MX", { botones });
  if (envio.error) return { error: envio.error };
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `bloqueo-${cita.id}-${Date.now()}`,
      telefono: tel,
      direccion: "salida",
      via: "api",
      tipo: "template",
      texto: `${rellenar(p.texto, valores)}\n[Botones: ${p.botones.join(" · ")}]`,
      enviado_en: new Date().toISOString(),
      paciente_id: cita.paciente.id,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  return { ok: true };
}

/**
 * { tipo: "dia" | "varios" | "horas", desde, hasta, horaDesde, horaHasta, motivo, evento?, citas? }
 * `evento`: algo de la Dra. Gaby que ocupa tiempo (junta, laboratorio…); el nombre va en `motivo`
 * y siempre es por horas. Se ve como bloque en la agenda; el asistente tampoco agenda encima.
 * `citas` (si caen citas ahí; antes se pregunta con revisarBloqueoAction):
 *   "avisar"   → siguen en la agenda y a cada paciente le llega WhatsApp para elegir otro horario
 *   "cancelar" → se cancelan y se les avisa con disculpa (botón para hablar con la Dra. Gaby)
 *   "dejar"    → no se tocan (ella las acomoda)
 */
export async function crearBloqueoAction(datos) {
  const v = validarBloqueo(datos);
  if (v.error) return v;
  const que = ["avisar", "cancelar", "dejar"].includes(datos?.citas) ? datos.citas : "dejar";

  const supabase = createClient(await cookies());
  const { error } = await supabase.from("bloqueos").insert(v.valores);
  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };
  const { desde_fecha, hasta_fecha, desde_min, hasta_min, motivo } = v.valores;
  const citas = await citasEn(supabase, desde_fecha, hasta_fecha, desde_min, hasta_min);

  const resultado = { ok: true, citas: citas.length, avisados: 0, sinWhatsapp: [], errores: [] };
  if (citas.length && que !== "dejar") {
    const admin = supabaseServicio();
    for (const c of citas) {
      const nota = que === "cancelar" ? `Cancelada por el consultorio (${motivo})` : `El consultorio le pidió cambiarla (${motivo})`;
      await supabase
        .from("citas")
        .update({
          ...(que === "cancelar" ? { estado: "cancelada" } : { cambios_paciente: 0 }),
          notas: [c.notas, nota].filter(Boolean).join(" · ").slice(0, 1000),
        })
        .eq("id", c.id);
      const r =
        que === "avisar"
          ? await avisarPaciente(admin, c, "cita_reagendar", [idBoton("cambiar", c.id), idBoton("hablar", c.id)])
          : await avisarPaciente(admin, c, "cita_cancelada", [idBoton("hablar", c.id)]);
      if (r.sinWhatsapp || r.error) {
        // No se le pudo avisar: a la libreta de hoy para llamarle
        await supabase.from("pendientes").insert({
          fecha: hoyDurango(),
          texto: textoLlamar({ nombre: c.paciente?.nombre, whatsapp: c.paciente?.whatsapp, inicio: c.inicio, cancelada: que === "cancelar", sinWhatsapp: true }),
        });
        if (r.sinWhatsapp) resultado.sinWhatsapp.push(resumenCita(c).nombre);
        else resultado.errores.push(`${resumenCita(c).nombre}: ${r.error}`);
      } else {
        await supabase.from("citas").update({ aviso_bloqueo_en: new Date().toISOString(), aviso_recordado_en: null }).eq("id", c.id);
        resultado.avisados++;
      }
    }
  }
  revalidatePath("/agenda");
  return resultado;
}

export async function quitarBloqueoAction(id) {
  const supabase = createClient(await cookies());
  const { error } = await supabase.from("bloqueos").delete().eq("id", String(id));
  if (error) return { error: "No se pudo quitar. Intenta de nuevo." };
  revalidatePath("/agenda");
  return { ok: true };
}

/** Agrega los días festivos oficiales de los próximos 12 meses que todavía no estén bloqueados. */
export async function agregarFestivosAction() {
  const hoy = hoyDurango();
  const limite = sumarDias(hoy, 366);
  const anio = Number(hoy.slice(0, 4));
  const festivos = [...festivosOficiales(anio), ...festivosOficiales(anio + 1)].filter((f) => f.fecha >= hoy && f.fecha <= limite);
  const supabase = createClient(await cookies());
  const { data: ya } = await supabase.from("bloqueos").select("desde_fecha, hasta_fecha").is("desde_min", null).lte("desde_fecha", limite).gte("hasta_fecha", hoy);
  const cubierto = (f) => (ya || []).some((b) => b.desde_fecha <= f && b.hasta_fecha >= f);
  const nuevos = festivos.filter((f) => !cubierto(f.fecha)).map((f) => ({ desde_fecha: f.fecha, hasta_fecha: f.fecha, motivo: "Día festivo" }));
  if (nuevos.length) {
    const { error } = await supabase.from("bloqueos").insert(nuevos);
    if (error) return { error: "No se pudieron agregar. Intenta de nuevo." };
  }
  revalidatePath("/agenda");
  return { ok: true, agregados: nuevos.length };
}
