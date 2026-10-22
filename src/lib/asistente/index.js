/**
 * Asistente virtual de WhatsApp (Claude). SÓLO SERVIDOR.
 *
 * Lo llama el webhook (/api/whatsapp) unos segundos después de que el
 * paciente escribe. Contesta en tres escalones, del más seguro al menos:
 *   1. Respuestas APROBADAS (respuestas.js): el modelo sólo elige cuáles;
 *      el texto sale tal cual. Es la gran mayoría.
 *   2. Respuesta propia: sólo si ninguna aprobada sirve. Pasa por un
 *      filtro (precios, promesas, medicamentos…) y por un modelo
 *      verificador contra el manual; si algo no cuadra, va a la Dra. Gaby.
 *      Según Ajustes, se manda sola o espera su aprobación.
 *   3. Pasar a la Dra. Gaby: urgencias, quejas, preguntas médicas…
 * Además consulta horarios libres y agenda VALORACIONES en la agenda.
 *
 * Variables: ANTHROPIC_API_KEY; opcionales ASISTENTE_MODELO y
 * ASISTENTE_VERIFICADOR (por omisión claude-sonnet-5-5 ambos).
 * Modo (tabla asistente_config): automatico | borrador | apagado.
 */

import Anthropic from "@anthropic-ai/sdk";
import { INSTRUCCIONES } from "./conocimiento";
import { armar, catalogo, RESPUESTAS } from "./respuestas";
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

const MODELO = process.env.ASISTENTE_MODELO || "claude-sonnet-5-5";
const VERIFICADOR = process.env.ASISTENTE_VERIFICADOR || "claude-sonnet-5-5";
const ESPERA_MS = 6000; // por si el paciente manda varios mensajes seguidos
const HUMANO_HORAS = 8; // tras su último mensaje, la Dra. Gaby "tiene" el chat
const MAX_VUELTAS = 6;
const PRESENTACION = "Hola, soy el asistente virtual del consultorio del Dr. Felipe Ramos 😊";

const ORIGENES = ["facebook", "instagram", "google", "recomendacion", "ya_paciente", "otro"];
const TERMINALES = new Set(["enviar_respuestas_aprobadas", "responder_libre", "pasar_a_dra_gaby"]);

// Instrucciones + catálogo: fijos, van en caché
const SISTEMA = `${INSTRUCCIONES}

# Respuestas aprobadas (id: texto que se manda)
${catalogo()}`;

const HERRAMIENTAS = [
  {
    name: "consultar_disponibilidad",
    description:
      "Horarios libres para una valoración de 30 minutos en una fecha (AAAA-MM-DD). Úsala siempre antes de ofrecer horarios.",
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
      "Agenda una valoración de 30 min cuando la persona ya aceptó día y hora y dio su nombre completo. Después confirma con la respuesta aprobada confirmar_cita.",
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
    name: "enviar_respuestas_aprobadas",
    description:
      "PRIMERA OPCIÓN para contestar: manda una o varias (máx. 3) respuestas aprobadas, tal cual, en ese orden. Llena sólo los datos que piden ({dia}, {horarios}); los que no apliquen van vacíos.",
    input_schema: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string", enum: Object.keys(RESPUESTAS) } },
        dia: { type: "string", description: 'Para ofrecer_horarios / sin_horarios, p. ej. "lunes 26 de octubre"; si no, ""' },
        horarios: { type: "string", description: 'Para ofrecer_horarios: 2 o 3 horas libres, p. ej. "10:00, 12:30 o 17:00"; si no, ""' },
      },
      required: ["ids", "dia", "horarios"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "responder_libre",
    description:
      "SÓLO si ninguna respuesta aprobada contesta lo que preguntaron. Texto corto (1 a 3 renglones) basado únicamente en el manual. Lo revisa un verificador antes de mandarse.",
    input_schema: {
      type: "object",
      properties: {
        texto: { type: "string" },
        por_que_no_sirve_una_aprobada: { type: "string" },
      },
      required: ["texto", "por_que_no_sirve_una_aprobada"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "pasar_a_dra_gaby",
    description:
      "Pasa la conversación a la Dra. Gaby (le suena el celular): urgencias, quejas, preguntas médicas, pacientes en tratamiento, cambios o cancelaciones de cita, quiere hablar con una persona, o no puedes contestar con certeza. El sistema manda solo la despedida aprobada.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Resumen corto para la Dra. Gaby (1 renglón)" },
        urgente: { type: "boolean", description: "true si hay dolor fuerte, inflamación, sangrado, golpe o diente roto" },
      },
      required: ["motivo", "urgente"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const VEREDICTO = {
  name: "veredicto",
  description: "Tu decisión sobre el mensaje propuesto.",
  input_schema: {
    type: "object",
    properties: {
      aprobado: { type: "boolean" },
      motivo: { type: "string", description: "Si no se aprueba, qué está mal (1 renglón)" },
    },
    required: ["aprobado", "motivo"],
    additionalProperties: false,
  },
  strict: true,
};

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const nombreValido = (n) => n && !/^WhatsApp /.test(n);

/** Llamada al modelo; con respaldo automático de Anthropic si el modelo lo admite (Haiku no). */
function llamar(client, model, params) {
  const conRespaldo = !model.startsWith("claude-haiku");
  return client.beta.messages.create({
    model,
    ...(conRespaldo ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {}),
    ...params,
  });
}

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

// ── Carriles para respuestas propias ──

/**
 * Filtro fijo, antes del verificador: cualquier cantidad de dinero (salvo
 * los $600 de la valoración), medicamentos, promesas o "especialista"
 * manda el caso a la Dra. Gaby. Devuelve el problema o null.
 */
export function filtroDuro(texto) {
  const t = String(texto || "");
  const sin600 = t.replace(/\$\s?600(\.00)?/g, "");
  const reglas = [
    [/\$\s?\d|\d[\d,.]*\s?(pesos|mxn|mil\b|dólares|usd)/i, "menciona dinero"],
    [/\b(desde|aproximadamente|alrededor de|entre)\s+\$?\d/i, "da un rango o cantidad"],
    [/(ibuprofeno|paracetamol|naproxeno|ketorolaco|amoxicilina|antibi[oó]tico|analg[eé]sico|antiinflamatorio|medicamento|pastilla|dosis|mg\b)/i, "habla de medicamentos"],
    [/(garantiz|100\s?%|sin dolor|de por vida|perfect[oa]s?\b|número\s?1|el mejor|la mejor|48\s?h)/i, "promete resultados"],
    [/especialista/i, "dice especialista"],
    [/(le recomiendo|usted necesita|lo que tiene es|probablemente tiene|diagn[oó]stic)/i, "parece diagnóstico"],
  ];
  for (const [re, motivo] of reglas) if (re.test(sin600)) return motivo;
  if (t.length > 600) return "demasiado largo";
  return null;
}

/** Segundo modelo: ¿el mensaje se apoya SÓLO en el manual y respeta las reglas? */
async function verificar(client, texto, conversacion) {
  const res = await llamar(client, VERIFICADOR, {
    max_tokens: 2048,
    output_config: { effort: "medium" },
    system: [
      {
        type: "text",
        text: `Eres el verificador de calidad de un consultorio dental. Revisas un mensaje que un asistente virtual quiere mandar por WhatsApp a un paciente.

Apruébalo SÓLO si cumple TODO:
- Cada dato que afirma está en el MANUAL de abajo (no basta con que "suene razonable"; si algo no está en el manual, se rechaza).
- No da precios ni cantidades de dinero (salvo $600 de la valoración), no diagnostica, no receta ni menciona medicamentos, no da indicaciones médicas, no promete resultados, no dice "especialista", no habla mal de otros.
- Contesta lo que preguntó el paciente, es corto, respetuoso y de "usted".
Si dudas, recházalo: el paciente lo atenderá una persona.
Contesta con la herramienta veredicto.

MANUAL:
${SISTEMA}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [VEREDICTO],
    messages: [
      {
        role: "user",
        content: `Últimos mensajes de la conversación:\n${conversacion}\n\nMensaje propuesto:\n"""${texto}"""\n\nUsa la herramienta veredicto.`,
      },
    ],
  });
  const v = res.content.find((b) => b.type === "tool_use" && b.name === "veredicto");
  if (res.stop_reason === "refusal" || !v) return { aprobado: false, motivo: "el verificador no dio veredicto" };
  return { aprobado: Boolean(v.input.aprobado), motivo: String(v.input.motivo || "") };
}

// ── Herramientas de agenda ──

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
  cambios.etiquetas = [...new Set([...(paciente.etiquetas || []), "valoracion"])];
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
  return { ok: true, dia: formatFechaLarga(fecha), hora: formatHora(inicioMin), nombre: a.nombre_completo };
}

async function pasarAHumano(admin, paciente, telefono, { motivo, urgente }) {
  const etiquetas = new Set(paciente.etiquetas || []);
  if (urgente) etiquetas.add("urgencia");
  await admin
    .from("pacientes")
    .update({ atiende: "humano", atiende_desde: new Date().toISOString(), etiquetas: [...etiquetas] })
    .eq("id", paciente.id);
  // El aviso no lleva el motivo (puede ser de salud y se ve con el celular bloqueado)
  await avisar(admin, {
    titulo: `${urgente ? "🚨 URGENCIA · " : "🙋 "}${nombreValido(paciente.nombre) ? paciente.nombre : "Paciente"}`,
    cuerpo: urgente ? "Necesita atención urgente" : "El asistente te pasó este chat",
    telefono,
  });
  return { motivo };
}

// ── Principal ──

/**
 * Decide la respuesta con el modelo (aprobadas → propia → Dra. Gaby).
 * Devuelve { tipo: "aprobada" | "libre" | "humano", texto, ids?, urgente?, motivo?, acciones }.
 */
async function decidir(client, admin, { paciente, messages, contexto, puedeAgendar }) {
  const tools = puedeAgendar ? HERRAMIENTAS : HERRAMIENTAS.filter((t) => t.name !== "agendar_valoracion");
  const acciones = [];
  const consultados = new Map(); // "lunes 26 de octubre" → horas libres que el modelo sí vio
  let agendada = null;

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const res = await llamar(client, MODELO, {
      max_tokens: 4096,
      output_config: { effort: "medium" },
      system: [
        { type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } },
        { type: "text", text: contexto },
      ],
      tools,
      messages,
    });

    if (res.stop_reason === "refusal") return { tipo: "humano", motivo: "el modelo no quiso contestar", acciones };
    const usos = res.content.filter((b) => b.type === "tool_use");
    if (!usos.length) {
      // Contestó con texto suelto: se trata como respuesta propia (pasa por los carriles)
      const texto = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return texto ? { tipo: "libre", texto, acciones } : { tipo: "nada", acciones };
    }

    // Si pidió pasar a la Dra. Gaby, eso manda
    const humano = usos.find((u) => u.name === "pasar_a_dra_gaby");
    if (humano) return { tipo: "humano", motivo: humano.input.motivo, urgente: Boolean(humano.input.urgente), acciones };

    const hayAgenda = usos.some((u) => !TERMINALES.has(u.name));
    const resultados = [];
    let decision = null;
    for (const uso of usos) {
      let r;
      if (uso.name === "consultar_disponibilidad") {
        r = await disponibilidad(admin, uso.input.fecha);
        if (r.dia) consultados.set(r.dia, new Set(Array.isArray(r.horarios_libres) ? r.horarios_libres : []));
      } else if (uso.name === "agendar_valoracion") {
        r = await agendar(admin, paciente, uso.input);
        if (r.ok) agendada = r;
      } else if (hayAgenda) {
        r = { error: "Primero recibe el resultado de la agenda y después elige la respuesta." };
      } else if (uso.name === "enviar_respuestas_aprobadas") {
        const ids = uso.input.ids || [];
        const horas = (String(uso.input.horarios || "").match(/\d{1,2}:\d{2}/g) || []).map((h) => h.replace(/^0/, ""));
        // El día sale de la consulta real (no de lo que escriba el modelo)
        const diaConsultado = [...consultados].find(([, libres]) => horas.length && horas.every((h) => libres.has(h)))?.[0];
        const diaSinLugar = [...consultados].find(([, libres]) => libres.size === 0)?.[0];
        if (ids.includes("ofrecer_horarios") && !diaConsultado) {
          r = { error: "Sólo puedes ofrecer horas que salieron libres en consultar_disponibilidad. Consulta primero." };
        } else if (ids.includes("confirmar_cita") && !agendada) {
          r = { error: "Para confirmar primero agenda con agendar_valoracion." };
        } else {
          const armado = armar(ids.slice(0, 3), {
            dia: agendada?.dia || diaConsultado || (ids.includes("sin_horarios") ? diaSinLugar : null) || uso.input.dia,
            hora: agendada?.hora,
            horarios: uso.input.horarios,
            nombre: agendada?.nombre,
          });
          if (armado.error) r = { error: armado.error };
          else decision = { tipo: "aprobada", texto: armado.texto, ids };
        }
      } else if (uso.name === "responder_libre") {
        decision = { tipo: "libre", texto: String(uso.input.texto || "").trim(), porque: uso.input.por_que_no_sirve_una_aprobada };
      } else {
        r = { error: "Herramienta desconocida." };
      }
      if (decision) return { ...decision, acciones };
      acciones.push({ herramienta: uso.name, entrada: uso.input, resultado: r });
      resultados.push({ type: "tool_result", tool_use_id: uso.id, content: JSON.stringify(r), is_error: Boolean(r?.error) });
    }
    messages.push({ role: "assistant", content: res.content });
    messages.push({ role: "user", content: resultados });
  }
  return { tipo: "humano", motivo: "el asistente no logró resolver la conversación", acciones };
}

/**
 * Contesta el último mensaje del paciente. `waId` = mensaje que disparó
 * la llamada: si para cuando toca contestar ya llegó otro, se deja que
 * esa otra llamada conteste (así no hay respuestas dobles).
 */
export async function atenderConAsistente(admin, telefono, waId) {
  if (!process.env.ANTHROPIC_API_KEY || !whatsappConfigurado()) return;

  const { data: config } = await admin.from("asistente_config").select("modo, libres").eq("id", 1).maybeSingle();
  const modo = config?.modo || "apagado";
  if (modo === "apagado") return;
  const libresSolas = modo === "automatico" && config?.libres === "auto";

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
  const orden = (filas || []).reverse();
  const messages = historial(orden);
  if (messages[messages.length - 1]?.role !== "user") return;
  const primerContacto = !orden.some((m) => m.direccion === "salida");

  const { data: proximas } = await admin
    .from("citas")
    .select("inicio, tipo")
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
      ? `Citas próximas de este paciente: ${proximas.map((c) => `${formatFechaLarga(hoyDurango(new Date(c.inicio)))} ${formatHora(minutosDelDia(c.inicio))} (${c.tipo})`).join("; ")}. Si pregunta por ellas o quiere cambiarlas, pásalo a la Dra. Gaby.`
      : "No tiene citas próximas.",
    modo === "borrador" ? "MODO BORRADOR: la Dra. Gaby revisa todo antes de mandarlo. No agendas tú: ofrece horarios y ella confirma." : "",
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic();
  let d;
  try {
    d = await decidir(client, admin, { paciente, messages: [...messages], contexto, puedeAgendar: modo === "automatico" });
  } catch (e) {
    await registrar(admin, telefono, "error", { mensaje: String(e?.message || e).slice(0, 500) });
    d = { tipo: "humano", motivo: "error del asistente", acciones: [] };
  }

  // Carriles de la respuesta propia: filtro fijo + verificador
  if (d.tipo === "libre") {
    const problema = filtroDuro(d.texto);
    const ultimos = orden.slice(-6).map((m) => `${m.direccion === "entrada" ? "Paciente" : "Consultorio"}: ${textoParaAsistente(m)}`).join("\n");
    const veredicto = problema ? { aprobado: false, motivo: problema } : await verificar(client, d.texto, ultimos).catch(() => ({ aprobado: false, motivo: "falló el verificador" }));
    d.veredicto = veredicto;
    if (!veredicto.aprobado) {
      // Se le pasa el caso, con el borrador por si le sirve
      await admin.from("asistente_borradores").insert({ telefono, texto: d.texto });
      d = { ...d, tipo: "humano", motivo: `respuesta propia rechazada: ${veredicto.motivo}`, borradorRechazado: true };
    }
  }

  if (d.tipo === "nada") return registrar(admin, telefono, "omitido", { acciones: d.acciones });
  if ((await ultimoDelPaciente()) !== waId) return registrar(admin, telefono, "omitido", { motivo: "llegó otro mensaje", decision: d });

  let texto;
  if (d.tipo === "humano") {
    await pasarAHumano(admin, paciente, telefono, d);
    texto = RESPUESTAS[d.urgente ? "pasar_urgencia" : "pasar_dra_gaby"];
  } else {
    texto = d.texto;
  }
  if (primerContacto) texto = `${PRESENTACION}\n\n${texto}`;

  // ¿Necesita su aprobación? Modo borrador, o respuesta propia sin permiso de ir sola
  const aprobar = modo === "borrador" || (d.tipo === "libre" && !libresSolas);
  if (aprobar && d.tipo !== "humano") {
    await admin.from("asistente_borradores").update({ estado: "descartado" }).eq("telefono", telefono).eq("estado", "pendiente");
    await admin.from("asistente_borradores").insert({ telefono, texto });
    await avisar(admin, {
      titulo: `📝 ${nombreValido(paciente.nombre) ? paciente.nombre : "Paciente"}`,
      cuerpo: "El asistente preparó una respuesta para que la revises",
      telefono,
    });
    return registrar(admin, telefono, "borrador", { decision: d });
  }

  const envio = await enviarTexto(telefono, texto);
  if (envio.error) return registrar(admin, telefono, "error", { envio: envio.error, decision: d });
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `asistente-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "asistente",
      tipo: "text",
      texto,
      enviado_en: new Date().toISOString(),
      paciente_id: paciente.id,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  const accion = d.tipo === "humano" ? "paso_a_humano" : d.acciones?.some((a) => a.herramienta === "agendar_valoracion" && a.resultado?.ok) ? "agendo" : `respondio_${d.tipo}`;
  return registrar(admin, telefono, accion, { decision: d });
}
