/**
 * Menú de un toque para el paciente: cada mensaje del asistente lleva
 * SIEMPRE 3 botones sencillos a la vista (lo máximo que permite WhatsApp).
 *
 *   Inicio:        Agendar valoración · Costo de la consulta · Más opciones
 *   Más opciones:  Ubicación y horario · Tratamientos · Hablar con alguien
 *   Tratamientos:  lista (son 9; no caben en 3 botones)
 *
 * - Las opciones de información se contestan con el texto APROBADO de
 *   "Mis respuestas" (sin consultar a Claude): rápido y sin inventar.
 *   Cada tratamiento (y la ubicación) lleva arriba su foto (public/whatsapp/).
 * - "Agendar valoración" y "Hablar con alguien" llegan como texto normal
 *   al asistente (él agenda con la agenda real o pasa el chat).
 * - Sólo contesta solo en "Contesta solo" y si la Dra. Gaby no lleva el
 *   chat; si no, el toque se trata como un mensaje cualquiera.
 */
import { enviarBotones, enviarLista } from "@/lib/whatsapp";
import { sinPregunta, textoCosto, textosEfectivos } from "@/lib/asistente/respuestas";
import { imagenWhatsapp } from "@/lib/consultorio";

const boton = (id, titulo) => ({ id: `menu|${id}`, titulo });
const AGENDAR = boton("agendar", "Agendar valoración");
const COSTO = boton("costo", "Costo de la consulta");
const UBICACION = boton("ubicacion", "Ubicación y horario");
const MAS = boton("opciones", "Más opciones");

export const BOTONES_INICIO = [AGENDAR, COSTO, MAS];
const BOTONES_MAS = [UBICACION, boton("tratamientos", "Tratamientos"), boton("hablar", "Hablar con alguien")];

const fila = (id, titulo) => ({ id: `menu|${id}`, titulo });
const FILAS_TRATAMIENTOS = [
  fila("t_carillas", "Carillas"),
  fila("t_blanqueamiento", "Blanqueamiento"),
  fila("t_diseno_sonrisa", "Diseño de sonrisa"),
  fila("t_implantes", "Implantes"),
  fila("t_coronas", "Coronas"),
  fila("t_protesis", "Prótesis"),
  fila("t_rehabilitacion", "Rehabilitación oral"),
  fila("t_limpieza", "Limpieza y revisión"),
  fila("t_otro", "Otro tratamiento"),
];

/** Opción → respuestas aprobadas que se juntan, la foto de arriba (opcional) y los 3 botones de abajo. */
const OPCIONES = {
  costo: { ids: ["precio_valoracion", "pagos"], botones: [AGENDAR, UBICACION, MAS] },
  ubicacion: { ids: ["ubicacion", "horario"], imagen: "08-ubicacion.jpg", botones: [AGENDAR, COSTO, MAS] },
  t_carillas: { ids: ["info_carillas"], imagen: "03-carillas.jpg" },
  t_blanqueamiento: { ids: ["info_blanqueamiento"] },
  t_diseno_sonrisa: { ids: ["info_diseno_sonrisa"], imagen: "04-diseno-sonrisa.jpg" },
  t_implantes: { ids: ["info_implantes"], imagen: "01-implante.jpg" },
  t_coronas: { ids: ["info_coronas"], imagen: "02-corona.jpg" },
  t_protesis: { ids: ["info_protesis"], imagen: "05-protesis.jpg" },
  t_rehabilitacion: { ids: ["info_rehabilitacion"], imagen: "06-rehabilitacion.jpg" },
  t_limpieza: { ids: ["info_limpieza"] },
  t_otro: { ids: ["otros_tratamientos"], imagen: "07-laboratorio.jpg" },
};

/** Respuestas donde no van botones (despedidas, avisos, o cuando hay que escribir: nombre, otro día). */
const SIN_BOTONES = ["sin_horarios", "pedir_datos", "confirmar_cita", "gracias", "voy_tarde", "ya_llegue", "no_escribir_mas", "escribir_audio"];

/**
 * Los 3 botones que van debajo de una respuesta del asistente, o null.
 * Los que no son del menú ("hora|10:00", "agenda|…") llegan al asistente
 * como texto (el título), igual que si el paciente lo escribiera.
 */
export function botonesPara(d, primerContacto = false, yaDijoPrecio = false) {
  const lista = botonesSegun(d, primerContacto);
  // Si el mensaje ya dice el costo (prueba de precio o lo preguntó), "Costo de la consulta" sobra
  return yaDijoPrecio && lista ? lista.map((b) => (b.id === COSTO.id ? UBICACION : b)) : lista;
}

function botonesSegun(d, primerContacto) {
  const ids = d?.ids || [];
  if (ids.includes("ofrecer_horarios") && d.horas?.length) {
    const horas = d.horas.slice(0, 3).map((h) => ({ id: `hora|${h}`, titulo: h }));
    return horas.length < 3 ? [...horas, { id: "agenda|otro", titulo: "Otro día u hora" }] : horas;
  }
  if (ids.includes("preguntar_origen")) {
    return [
      { id: "origen|redes", titulo: "Facebook o Instagram" },
      { id: "origen|google", titulo: "Google" },
      { id: "origen|recomendacion", titulo: "Recomendación" },
    ];
  }
  if (ids.includes("invitar_valoracion")) {
    return [{ id: "agenda|semana", titulo: "Entre semana" }, { id: "agenda|sabado", titulo: "Sábado" }, COSTO];
  }
  if (ids.some((id) => SIN_BOTONES.includes(id))) return null;
  if (d?.tipo === "aprobada" || primerContacto) return BOTONES_INICIO;
  return null;
}

/** "menu|costo" → "costo". Null si no es del menú. */
export function leerMenu(respuesta) {
  const t = String(respuesta || "");
  return t.startsWith("menu|") ? t.slice(5) : null;
}

/** ¿Esta opción la contesta el sistema sin el asistente? (agendar y hablar van al asistente) */
export const seContestaSola = (opcion) => opcion === "opciones" || opcion === "tratamientos" || opcion in OPCIONES;

const marca = (botones) => `\n[Botones: ${botones.map((b) => b.titulo).join(" · ")}]`;

/**
 * Manda `texto` con los 3 botones de inicio (y una foto arriba, si `imagen` es un link
 * público). Si WhatsApp no acepta la foto, se manda igual sin ella. Devuelve { envio, guardado }.
 */
export async function enviarConMenu(telefono, texto, botones = BOTONES_INICIO, imagen = null) {
  let envio = await enviarBotones(telefono, texto, botones, { imagen });
  if (envio.error && imagen) envio = await enviarBotones(telefono, texto, botones);
  return { envio, guardado: `${imagen && !envio.error ? "[Foto] " : ""}${texto}${marca(botones)}` };
}

async function guardar(admin, telefono, pacienteId, envio, texto) {
  if (envio?.error) return;
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `menu-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "asistente",
      tipo: "text",
      texto,
      enviado_en: new Date().toISOString(),
      paciente_id: pacienteId,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
}

/** Contesta un toque del menú. Devuelve true si lo contestó. */
export async function atenderMenu(admin, telefono, pacienteId, opcion) {
  if (!seContestaSola(opcion)) return false;
  let envio;
  let guardado;

  if (opcion === "opciones") {
    ({ envio, guardado } = await enviarConMenu(telefono, "¿Qué le gustaría saber?", BOTONES_MAS));
  } else if (opcion === "tratamientos") {
    const texto = "¿Sobre qué tratamiento le gustaría saber?";
    envio = await enviarLista(telefono, texto, "Ver tratamientos", FILAS_TRATAMIENTOS, "Tratamientos");
    guardado = `${texto}\n[Botones: Ver tratamientos]`;
  } else {
    const { data: editadas } = await admin.from("asistente_respuestas").select("*");
    const textos = textosEfectivos(editadas || []);
    const o = OPCIONES[opcion];
    // Al juntar dos respuestas, el "¿Le agendo?" sólo puede ir al final.
    // El costo va siempre con las formas de pago y termina en "¿Le agendo?".
    const partes = o.ids.map((id) => textos[id]).filter(Boolean);
    const texto = opcion === "costo" ? textoCosto(textos) : partes.map((t, i) => (i < partes.length - 1 ? sinPregunta(t) : t)).join("\n\n");
    if (!texto) return false;
    ({ envio, guardado } = await enviarConMenu(telefono, texto, o.botones || [AGENDAR, COSTO, MAS], imagenWhatsapp(o.imagen)));
  }

  await guardar(admin, telefono, pacienteId, envio, guardado);
  await admin.from("asistente_registro").insert({ telefono, accion: "menu", detalle: { opcion, error: envio?.error || null } });
  return !envio?.error;
}
