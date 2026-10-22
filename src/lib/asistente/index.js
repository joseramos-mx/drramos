/**
 * Asistente virtual de WhatsApp (Claude). SÓLO SERVIDOR.
 *
 * Lo llama el webhook (/api/whatsapp) unos segundos después de que el
 * paciente escribe. Lee la conversación, contesta con el manual del
 * consultorio (conocimiento.js), puede ver horarios libres y agendar
 * VALORACIONES, y pasa a la Dra. Gaby lo que no le toca.
 *
 * Variables de entorno: ANTHROPIC_API_KEY, más las de WhatsApp/Supabase.
 * Modo (tabla asistente_config): automatico | borrador | apagado.
 */

import Anthropic from "@anthropic-ai/sdk";
import { INSTRUCCIONES } from "./conocimiento";
import { enviarTexto, whatsappConfigurado } from "@/lib/whatsapp";
import { avisar } from "@/lib/mensajes-servidor";
import {
  SLOT_MIN,
  esFechaValida,
  formatFechaLarga,
  formatHora,
  horarioDelDia,
  hoyDurango,
  isoDesde,
  minutosDelDia,
  rangoDelDia,
} from "@/app/agenda/lib";

const MODELO = "claude-opus-5-5";
const ESPERA_MS = 6000; // por si el paciente manda varios mensajes seguidos
const HUMANO_HORAS = 8; // tras su último mensaje, la Dra. Gaby "tiene" el chat
const MAX_VUELTAS = 6;

const ORIGENES = ["facebook", "instagram", "google", "recomendacion", "ya_paciente", "otro"];

const HERRAMIENTAS = [
  {
    name: "consultar_disponibilidad",
    description:
      "Horarios libres para una valoración de 30 minutos en una fecha (formato AAAA-MM-DD). Úsala siempre antes de ofrecer horarios. Devuelve la lista de horas libres o el motivo si ese día no se puede.",
    input_schema: {
      type: "object",
      properties: { fecha: { type: "string", description: "Fecha AAAA-MM-DD" } },
      required: ["fecha"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "agendar_valoracion",
    description:
      "Agenda una valoración de 30 min cuando la persona ya aceptó día y hora y dio su nombre completo. Revisa otra vez que el horario esté libre.",
    input_schema: {
      type: "object",
      properties: {
        fecha: { type: "string", description: "AAAA-MM-DD" },
        hora: { type: "string", description: "HH:MM en 24 h, por ejemplo 16:30" },
        nombre_completo: { type: "string" },
        motivo: { type: "string", description: "Qué le gustaría mejorar, en sus palabras" },
        como_nos_conocio: { type: "string", enum: [...ORIGENES, "no_dijo"] },
      },
      required: ["fecha", "hora", "nombre_completo", "motivo", "como_nos_conocio"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "pasar_a_dra_gaby",
    description:
      "Pasa la conversación a la Dra. Gaby (le suena el celular) cuando el tema no te toca: urgencias, quejas, preguntas médicas, pacientes en tratamiento, cambios o cancelaciones de cita, quiere hablar con una persona, o no sabes la respuesta con certeza. Después de usarla, despídete con el mensaje para pasar el caso.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Resumen corto para la Dra. Gaby (máx. 1 renglón)" },
        urgente: { type: "boolean", description: "true si hay dolor fuerte, inflamación, sangrado, golpe o diente roto" },
      },
      required: ["motivo", "urgente"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const nombreValido = (n) => n && !/^WhatsApp /.test(n);

async function registrar(admin, telefono, accion, detalle) {
  await admin.from("asistente_registro").insert({ telefono, accion, detalle }).then(
    () => {},
    () => {}
  );
}

/** Lo que dice cada mensaje, en texto, para que el asistente lo lea. */
function textoParaAsistente(m) {
  const pie = m.texto ? `: ${m.texto}` : "";
  switch (m.tipo) {
    case "image":
      return `[Mandó una foto${pie}]`;
    case "audio":
      return "[Mandó una nota de voz que no puedes escuchar]";
    case "video":
      return `[Mandó un video${pie}]`;
    case "document":
      return `[Mandó un documento${pie}]`;
    case "sticker":
      return "[Mandó un sticker]";
    default:
      return m.texto || `[Mensaje de tipo ${m.tipo || "desconocido"}]`;
  }
}

/** Historial de WhatsApp → mensajes para Claude (paciente = user; consultorio = assistant). */
export function historial(filas) {
  const msgs = [];
  for (const m of filas) {
    const role = m.direccion === "entrada" ? "user" : "assistant";
    let texto = textoParaAsistente(m);
    if (role === "assistant" && m.via !== "asistente") texto = `(Escribió la Dra. Gaby) ${texto}`;
    const ultimo = msgs[msgs.length - 1];
    if (ultimo?.role === role) ultimo.content += `\n${texto}`;
    else msgs.push({ role, content: texto });
  }
  if (msgs[0]?.role === "assistant") msgs.unshift({ role: "user", content: "(La conversación la inició el consultorio)" });
  return msgs;
}

// ── Herramientas ──

export async function disponibilidad(admin, fecha) {
  if (!esFechaValida(fecha)) return { error: "Fecha inválida, usa AAAA-MM-DD." };
  const hoy = hoyDurango();
  if (fecha < hoy) return { error: "Esa fecha ya pasó." };
  const horario = horarioDelDia(fecha);
  if (!horario) return { error: "Ese día (domingo) el consultorio está cerrado." };

  const { desde, hasta } = rangoDelDia(fecha);
  const { data: citas } = await admin
    .from("citas")
    .select("inicio, fin")
    .gte("inicio", desde)
    .lt("inicio", hasta)
    .neq("estado", "cancelada");
  const ocupado = (citas || []).map((c) => [minutosDelDia(c.inicio), minutosDelDia(c.fin)]);
  // Hoy: sólo horarios con al menos 1 h de anticipación
  const ahora = fecha === hoy ? minutosDelDia(new Date().toISOString()) + 60 : 0;

  const libres = [];
  for (let m = horario.abre; m + SLOT_MIN <= horario.cierra; m += SLOT_MIN) {
    if (m < ahora) continue;
    if (ocupado.some(([a, b]) => m < b && m + SLOT_MIN > a)) continue;
    libres.push(formatHora(m));
  }
  return { fecha, dia: formatFechaLarga(fecha), horarios_libres: libres.length ? libres : "Sin horarios libres ese día" };
}

async function agendar(admin, paciente, a) {
  const fecha = a.fecha;
  const [h, mm] = String(a.hora).split(":").map(Number);
  const inicioMin = h * 60 + (mm || 0);
  const libres = await disponibilidad(admin, fecha);
  if (libres.error) return libres;
  if (!Array.isArray(libres.horarios_libres) || !libres.horarios_libres.includes(formatHora(inicioMin))) {
    return { error: "Ese horario ya no está libre.", horarios_libres: libres.horarios_libres };
  }

  const cambios = {};
  if (!nombreValido(paciente.nombre) && a.nombre_completo?.trim()) cambios.nombre = a.nombre_completo.trim().slice(0, 120);
  if (!paciente.origen && ORIGENES.includes(a.como_nos_conocio)) cambios.origen = a.como_nos_conocio;
  const etiquetas = new Set(paciente.etiquetas || []);
  etiquetas.add("valoracion");
  cambios.etiquetas = [...etiquetas];
  await admin.from("pacientes").update(cambios).eq("id", paciente.id);

  const { error } = await admin.from("citas").insert({
    paciente_id: paciente.id,
    dentista: "felipe",
    inicio: isoDesde(fecha, inicioMin),
    fin: isoDesde(fecha, inicioMin + SLOT_MIN),
    tipo: "valoracion",
    estado: "agendada",
    notas: `Agendada por el asistente por WhatsApp. Quiere mejorar: ${String(a.motivo).slice(0, 300)}`,
  });
  if (error) return { error: "No se pudo guardar la cita. Pasa el caso a la Dra. Gaby." };
  return { ok: true, cita: `${formatFechaLarga(fecha)} a las ${formatHora(inicioMin)}`, duracion: "30 minutos" };
}

async function pasarAHumano(admin, paciente, telefono, a) {
  const etiquetas = new Set(paciente.etiquetas || []);
  if (a.urgente) etiquetas.add("urgencia");
  await admin
    .from("pacientes")
    .update({ atiende: "humano", atiende_desde: new Date().toISOString(), etiquetas: [...etiquetas] })
    .eq("id", paciente.id);
  // El aviso no lleva el motivo (puede ser de salud y se ve con el celular bloqueado)
  await avisar(admin, {
    titulo: `${a.urgente ? "🚨 URGENCIA · " : "🙋 "}${nombreValido(paciente.nombre) ? paciente.nombre : "Paciente"}`,
    cuerpo: a.urgente ? "Necesita atención urgente" : "El asistente te pasó este chat",
    telefono,
  });
  return { ok: true, nota: "La Dra. Gaby ya recibió el aviso. Despídete con el mensaje para pasar el caso." };
}

// ── Principal ──

/**
 * Contesta el último mensaje del paciente. `waId` = mensaje que disparó
 * la llamada: si para cuando toca contestar ya llegó otro, se deja que
 * esa otra llamada conteste (así no hay respuestas dobles).
 */
export async function atenderConAsistente(admin, telefono, waId) {
  if (!process.env.ANTHROPIC_API_KEY || !whatsappConfigurado()) return;

  const { data: config } = await admin.from("asistente_config").select("modo").eq("id", 1).maybeSingle();
  const modo = config?.modo || "apagado";
  if (modo === "apagado") return;

  await espera(ESPERA_MS);
  const ultimoDelPaciente = async () =>
    (
      await admin
        .from("whatsapp_mensajes")
        .select("wa_id")
        .eq("telefono", telefono)
        .eq("direccion", "entrada")
        .order("enviado_en", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data?.wa_id;
  if ((await ultimoDelPaciente()) !== waId) return;

  const { data: paciente } = await admin
    .from("pacientes")
    .select("id, nombre, origen, etiquetas, atiende, atiende_desde")
    .eq("whatsapp", telefono)
    .limit(1)
    .maybeSingle();
  if (!paciente) return;
  const humanoReciente =
    paciente.atiende === "humano" &&
    paciente.atiende_desde &&
    Date.now() - new Date(paciente.atiende_desde).getTime() < HUMANO_HORAS * 3600 * 1000;
  if (humanoReciente) return registrar(admin, telefono, "omitido", { motivo: "lo atiende la Dra. Gaby" });

  const { data: filas } = await admin
    .from("whatsapp_mensajes")
    .select("direccion, via, tipo, texto, enviado_en")
    .eq("telefono", telefono)
    .order("enviado_en", { ascending: false })
    .limit(40);
  const messages = historial((filas || []).reverse());
  if (messages[messages.length - 1]?.role !== "user") return;

  const { data: proximas } = await admin
    .from("citas")
    .select("inicio, tipo, estado")
    .eq("paciente_id", paciente.id)
    .gte("inicio", new Date().toISOString())
    .neq("estado", "cancelada")
    .order("inicio")
    .limit(3);

  const ahora = new Date();
  const contexto = [
    `Fecha y hora actual en Durango: ${formatFechaLarga(hoyDurango(ahora))}, ${formatHora(minutosDelDia(ahora.toISOString()))}.`,
    `Nombre registrado del paciente: ${nombreValido(paciente.nombre) ? paciente.nombre : "todavía no lo sabemos"}.`,
    proximas?.length
      ? `Citas próximas de este paciente: ${proximas.map((c) => `${formatFechaLarga(hoyDurango(new Date(c.inicio)))} ${formatHora(minutosDelDia(c.inicio))} (${c.tipo})`).join("; ")}.`
      : "No tiene citas próximas.",
    modo === "borrador"
      ? "MODO BORRADOR: tu respuesta la revisa la Dra. Gaby antes de mandarse. No puedes agendar tú: propón día y hora y ella confirma."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const tools = modo === "borrador" ? HERRAMIENTAS.filter((t) => t.name !== "agendar_valoracion") : HERRAMIENTAS;
  const client = new Anthropic();
  const acciones = [];
  let final = null;

  try {
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const res = await client.beta.messages.create({
        model: MODELO,
        max_tokens: 4096,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system: [
          { type: "text", text: INSTRUCCIONES, cache_control: { type: "ephemeral" } },
          { type: "text", text: contexto },
        ],
        tools,
        messages,
      });

      if (res.stop_reason === "refusal") {
        acciones.push({ herramienta: "rechazo", categoria: res.stop_details?.category || null });
        await pasarAHumano(admin, paciente, telefono, { motivo: "El asistente no pudo contestar", urgente: false });
        final = "Con gusto, le comunico con la Dra. Gaby para que le atienda personalmente. En un momento le escribe 😊";
        break;
      }

      const usos = res.content.filter((b) => b.type === "tool_use");
      if (res.stop_reason !== "tool_use" || !usos.length) {
        final = res.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        break;
      }

      messages.push({ role: "assistant", content: res.content });
      const resultados = [];
      for (const uso of usos) {
        let r;
        if (uso.name === "consultar_disponibilidad") r = await disponibilidad(admin, uso.input.fecha);
        else if (uso.name === "agendar_valoracion") r = await agendar(admin, paciente, uso.input);
        else if (uso.name === "pasar_a_dra_gaby") r = await pasarAHumano(admin, paciente, telefono, uso.input);
        else r = { error: "Herramienta desconocida" };
        acciones.push({ herramienta: uso.name, entrada: uso.input, resultado: r });
        resultados.push({ type: "tool_result", tool_use_id: uso.id, content: JSON.stringify(r), is_error: Boolean(r.error) });
      }
      messages.push({ role: "user", content: resultados });
    }
  } catch (e) {
    await registrar(admin, telefono, "error", { mensaje: String(e?.message || e).slice(0, 500) });
    await pasarAHumano(admin, paciente, telefono, { motivo: "Error del asistente", urgente: false });
    return;
  }

  if (!final) return registrar(admin, telefono, "omitido", { acciones });
  // Si mientras pensaba llegó otro mensaje, contesta la siguiente llamada
  if ((await ultimoDelPaciente()) !== waId) return registrar(admin, telefono, "omitido", { motivo: "llegó otro mensaje", acciones });

  if (modo === "borrador") {
    await admin.from("asistente_borradores").update({ estado: "descartado" }).eq("telefono", telefono).eq("estado", "pendiente");
    await admin.from("asistente_borradores").insert({ telefono, texto: final });
    await avisar(admin, {
      titulo: `📝 ${nombreValido(paciente.nombre) ? paciente.nombre : "Paciente"}`,
      cuerpo: "El asistente preparó una respuesta para que la revises",
      telefono,
    });
    return registrar(admin, telefono, "borrador", { texto: final, acciones });
  }

  const envio = await enviarTexto(telefono, final);
  if (envio.error) {
    await registrar(admin, telefono, "error", { envio: envio.error, acciones });
    return;
  }
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `asistente-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "asistente",
      tipo: "text",
      texto: final,
      enviado_en: new Date().toISOString(),
      paciente_id: paciente.id,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  await registrar(admin, telefono, acciones.some((a) => a.herramienta === "agendar_valoracion" && a.resultado?.ok) ? "agendo" : "respondio", {
    texto: final,
    acciones,
  });
}
