/**
 * Menú de opciones del asistente: el paciente toca "Ver opciones" y elige
 * (agendar, costo, ubicación, horario, pagos, tratamientos…) sin escribir.
 *
 * - Las opciones de información se contestan con el texto APROBADO de
 *   "Mis respuestas" (sin consultar a Claude): rápido y sin inventar.
 * - "Agendar valoración" y "Hablar con la asistente" llegan como texto
 *   normal al asistente (él agenda con la agenda real o pasa el chat).
 * - Sólo contesta solo en "Contesta solo" y si la Dra. Gaby no lleva el
 *   chat; si no, el toque se trata como un mensaje cualquiera.
 */
import { enviarBotones, enviarLista } from "@/lib/whatsapp";
import { textosEfectivos } from "@/lib/asistente/respuestas";

const fila = (id, titulo, descripcion) => ({ id: `menu|${id}`, titulo, ...(descripcion ? { descripcion } : {}) });

export const FILAS_MENU = [
  fila("agendar", "Agendar valoración", "30 min con el Dr. Felipe"),
  fila("costo", "Costo de la valoración"),
  fila("valoracion", "Qué incluye la consulta"),
  fila("ubicacion", "Ubicación", "Estacionamiento gratis"),
  fila("horario", "Horario"),
  fila("pagos", "Formas de pago", "6 meses sin intereses"),
  fila("tratamientos", "Tratamientos"),
  fila("hablar", "Hablar con la asistente"),
];

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
  fila("opciones", "Regresar al menú"),
];

/** Opción del menú → respuesta aprobada que se manda. */
const RESPUESTA_DE = {
  costo: "precio_valoracion",
  valoracion: "valoracion_que_es",
  ubicacion: "ubicacion",
  horario: "horario",
  pagos: "pagos",
  t_carillas: "info_carillas",
  t_blanqueamiento: "info_blanqueamiento",
  t_diseno_sonrisa: "info_diseno_sonrisa",
  t_implantes: "info_implantes",
  t_coronas: "info_coronas",
  t_protesis: "info_protesis",
  t_rehabilitacion: "info_rehabilitacion",
  t_limpieza: "info_limpieza",
  t_otro: "otros_tratamientos",
};

/** "menu|costo" → "costo". Null si no es del menú. */
export function leerMenu(respuesta) {
  const t = String(respuesta || "");
  return t.startsWith("menu|") ? t.slice(5) : null;
}

/** ¿Esta opción la contesta el sistema sin el asistente? (agendar y hablar van al asistente) */
export const seContestaSola = (opcion) => opcion === "opciones" || opcion === "tratamientos" || opcion in RESPUESTA_DE;

const MARCA_MENU = "\n[Botones: Ver opciones]";

/** Manda `texto` con el botón "Ver opciones" (lista del menú). Devuelve { envio, guardado }. */
export async function enviarConMenu(telefono, texto) {
  const envio = await enviarLista(telefono, texto, "Ver opciones", FILAS_MENU, "¿En qué le ayudo?");
  return { envio, guardado: `${texto}${MARCA_MENU}` };
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

  if (opcion === "opciones") {
    const { envio, guardado } = await enviarConMenu(telefono, "¿Qué le gustaría saber?");
    await guardar(admin, telefono, pacienteId, envio, guardado);
    return !envio.error;
  }

  if (opcion === "tratamientos") {
    const texto = "¿Sobre qué tratamiento le gustaría saber?";
    const envio = await enviarLista(telefono, texto, "Ver tratamientos", FILAS_TRATAMIENTOS, "Tratamientos");
    await guardar(admin, telefono, pacienteId, envio, `${texto}\n[Botones: Ver tratamientos]`);
    return !envio.error;
  }

  const { data: editadas } = await admin.from("asistente_respuestas").select("*");
  const textos = textosEfectivos(editadas || []);
  const texto = textos[RESPUESTA_DE[opcion]];
  if (!texto) return false;
  const envio = await enviarBotones(telefono, texto, [
    { id: "menu|agendar", titulo: "Agendar valoración" },
    { id: "menu|opciones", titulo: "Más opciones" },
  ]);
  await guardar(admin, telefono, pacienteId, envio, `${texto}\n[Botones: Agendar valoración · Más opciones]`);
  await admin.from("asistente_registro").insert({ telefono, accion: "menu", detalle: { opcion } });
  return !envio.error;
}
