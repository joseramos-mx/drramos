/**
 * Mensajes aprobados (plantillas) para escribirle a un paciente que no ha
 * escrito o que lleva más de 24 h sin escribir. El `nombre` y el `texto`
 * deben ser IDÉNTICOS a los que se den de alta en WhatsApp Manager
 * (categoría Utilidad, idioma Español (MEX)). Ver estrategia/conexion-whatsapp.md.
 * Nunca precios ni promesas: es publicidad de salud.
 *
 * Versión 2 (textos más cortos, 2026-11-26): `textoV2` / `botonesV2` son los textos
 * editados en WhatsApp Manager. Mientras Meta no los apruebe se sigue mandando lo de
 * siempre; con PLANTILLAS_V2=1 en Vercel se usan los nuevos (y las plantillas nuevas
 * seguimiento_presupuesto_v2, seguimiento_presupuesto_30, seguimiento_consulta_cita y
 * seguimiento_anuncio). Ver estrategia/pr-imagenes-y-ventas.md.
 */

/** ¿Ya están aprobadas en Meta las plantillas nuevas? (variable PLANTILLAS_V2=1, sólo servidor) */
export const plantillasV2 = () => process.env.PLANTILLAS_V2 === "1";

/** La plantilla con el texto y los botones que valen hoy (los nuevos si `v2`). */
export function vigente(p, v2 = plantillasV2()) {
  if (!p || !v2) return p;
  return { ...p, texto: p.textoV2 || p.texto, botones: p.botonesV2 || p.botones };
}

export const PLANTILLAS = [
  {
    nombre: "contacto_consultorio",
    titulo: "Saludo para iniciar",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Quedamos atentos a lo que necesite; puede responder este mensaje para agendar o resolver sus dudas.",
    campos: ["Nombre del paciente"],
  },
  {
    nombre: "recordatorio_cita",
    titulo: "Recordatorio de cita",
    texto:
      "Hola {{1}}, le recordamos su cita en el consultorio del Dr. Felipe de Jesús Ramos Sotelo el {{2}} a las {{3}}. Si necesita cambiarla, toque un botón o responda este mensaje.",
    textoV2:
      "Hola {{1}}, le recordamos su cita en el consultorio del Dr. Felipe de Jesús Ramos Sotelo el *{{2}}* a las *{{3}}*. Si necesita cambiarla, toque un botón o responda este mensaje.",
    campos: ["Nombre del paciente", "Día (ej. jueves 23 de octubre)", "Hora (ej. 10:30)"],
    // Respuestas rápidas, en este orden, idénticas en WhatsApp Manager
    botones: ["Confirmo mi cita", "Cambiar mi cita", "Cancelar mi cita"],
  },
  {
    nombre: "seguimiento_consulta",
    titulo: "Seguimiento",
    texto:
      "Hola {{1}}, ¿cómo se ha sentido después de su consulta con el Dr. Felipe? 😊 Si tiene cualquier duda o molestia, aquí estamos; puede responder este mensaje y con gusto le atendemos.",
    // V2: para quien NO tiene cita próxima. Si la tiene, el sistema manda seguimiento_consulta_cita (con su fecha)
    textoV2:
      "Hola {{1}}, ¿cómo se ha sentido después de su consulta con el Dr. Felipe? 😊 Para continuar con su tratamiento, le apartamos su siguiente cita. Elija un horario aquí abajo 👇",
    botonesV2: ["Agendar mi cita", "Tengo una duda"],
    campos: ["Nombre del paciente"],
  },
];

/**
 * Plantillas que manda SÓLO el sistema (al bloquear un horario con citas).
 * También se dan de alta en WhatsApp Manager, con sus botones de respuesta rápida.
 */
export const PLANTILLAS_SISTEMA = [
  {
    nombre: "cita_reagendar",
    titulo: "Pedir que cambie su cita (bloqueo)",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Por un imprevisto no podremos atenderle el {{2}} a las {{3}}; le ofrecemos una disculpa. Toque un botón para elegir otro horario o hablar con la asistente del Dr. Felipe.",
    textoV2:
      "Hola {{1}}, el Dr. Felipe no podrá atenderle el *{{2}}* a las *{{3}}*. Una disculpa. ¿Le cambiamos su cita? Elija otro horario aquí abajo 👇",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con la asistente del doctor"],
    botonesV2: ["Elegir otro horario", "Hablar con la asistente"],
  },
  {
    nombre: "cita_cancelada",
    titulo: "Avisar que se canceló su cita (bloqueo)",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Por un imprevisto tuvimos que cancelar su cita del {{2}} a las {{3}}; le ofrecemos una disculpa. Toque un botón para elegir otro horario o hablar con la asistente del Dr. Felipe.",
    textoV2:
      "Hola {{1}}, tuvimos que cancelar su cita del *{{2}}* a las *{{3}}*. Una disculpa. Elija un nuevo horario aquí abajo y se lo apartamos de inmediato 👇",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con la asistente del doctor"],
    botonesV2: ["Elegir otro horario", "Hablar con la asistente"],
  },
  {
    nombre: "cita_agendada",
    titulo: "Confirmación al agendar (la Dra. Gaby en la agenda)",
    texto:
      "Hola {{1}}, su cita en el consultorio del Dr. Felipe de Jesús Ramos Sotelo quedó el {{2}} a las {{3}}. Le esperamos en Prol. Gómez Palacio 501 Pte., Zona Centro. Si necesita cambiarla, toque un botón.",
    textoV2:
      "Hola {{1}}, su cita en el consultorio del Dr. Felipe de Jesús Ramos Sotelo quedó el *{{2}}* a las *{{3}}*. Le esperamos en Prol. Gómez Palacio 501 Pte., Zona Centro. Si necesita cambiarla, toque un botón.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Confirmo mi cita", "Cambiar mi cita", "Cancelar mi cita"],
  },
  {
    nombre: "cita_falto",
    titulo: "Cuando no vino a su cita",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Notamos que no pudo venir a su cita del {{2}} a las {{3}}. Si gusta, toque un botón para elegir otro horario o hablar con la asistente del Dr. Felipe.",
    textoV2:
      "Hola {{1}}, le extrañamos en su cita del *{{2}}* a las *{{3}}*. ¿Le apartamos otro horario? Elija uno aquí abajo 👇",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con la asistente del doctor"],
    botonesV2: ["Elegir otro horario", "Hablar con la asistente"],
  },
  {
    nombre: "resena_google",
    titulo: "Pedir opinión en Google (al terminar su tratamiento)",
    texto:
      "Hola {{1}}, gracias por su confianza en el consultorio del Dr. Felipe de Jesús Ramos Sotelo. Si quedó contento con su atención, nos ayudaría mucho que compartiera su opinión en Google: {{2}} ¡Muchas gracias!",
    campos: ["Nombre del paciente", "Link para dejar la opinión"],
    botones: [],
  },
  {
    nombre: "seguimiento_presupuesto",
    titulo: "Seguimiento del plan de tratamiento (3 días y 1 mes después)",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. ¿Pudo revisar el plan de tratamiento que le preparamos en su cita del {{2}}? Si tiene dudas o quiere agendar, con gusto le ayudamos.",
    campos: ["Nombre del paciente", "Día de la valoración"],
    botones: ["Quiero agendar", "Tengo una duda", "Ya no, gracias"],
  },
  // ── Plantillas NUEVAS (sólo con PLANTILLAS_V2=1, cuando Meta las apruebe) ──
  {
    nombre: "seguimiento_presupuesto_v2",
    titulo: "Seguimiento del plan de tratamiento (3 días después)",
    texto:
      "Hola {{1}}, ¿pudo revisar su plan de tratamiento? Con el Dr. Felipe su trabajo se *diseña y se fabrica aquí mismo*, en su laboratorio propio, a su medida y con *6 meses sin intereses*. ¿Le apartamos su cita para empezar?",
    campos: ["Nombre del paciente"],
    botones: ["Quiero empezar", "Tengo una duda", "Ya no, gracias"],
  },
  {
    nombre: "seguimiento_presupuesto_30",
    titulo: "Seguimiento del plan de tratamiento (1 mes después)",
    texto:
      "Hola {{1}}, sabemos que decidirse por un tratamiento no es fácil. Por si le ayuda: • *6 meses sin intereses* y, en muchos casos, el tratamiento se puede hacer *por etapas* • Todo se diseña y se fabrica aquí mismo, en el laboratorio del Dr. Felipe • Más de *30 años de experiencia* cuidando cada detalle. Si tiene alguna duda, con gusto se la resolvemos por aquí. ¿Le apartamos su cita para empezar?",
    campos: ["Nombre del paciente"],
    botones: ["Quiero empezar", "Tengo una duda", "Ya no, gracias"],
  },
  {
    nombre: "seguimiento_consulta_cita",
    titulo: "Seguimiento después de su consulta (tiene cita próxima)",
    texto:
      "Hola {{1}}, ¿cómo se ha sentido después de su consulta con el Dr. Felipe? 😊 Le esperamos en su próxima cita el *{{2}}* a las *{{3}}*. Si tiene alguna duda o molestia, aquí estamos.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Confirmo mi cita", "Cambiar mi cita", "Tengo una duda"],
  },
  {
    nombre: "seguimiento_anuncio",
    titulo: "Seguimiento a quien llegó de un anuncio y no agendó (día 3)",
    // Encabezado: IMAGEN (la de su anuncio A1-A4, la pone el sistema)
    imagen: true,
    texto:
      "Hola {{1}}, gracias por escribirnos. Sabemos que decidir sobre su sonrisa no es fácil. En su valoración, el Dr. Felipe: • Escanea sus dientes en 3D, *sin pastas* • Le explica sus opciones con calma • Le da un presupuesto claro, con *6 meses sin intereses*. Más de 30 años de experiencia y laboratorio propio. ¿Le apartamos un lugar esta semana?",
    campos: ["Nombre del paciente"],
    botones: ["Agendar valoración", "Tengo una duda", "No me interesa"],
  },
];

/** Texto final con los {{n}} reemplazados (para guardarlo y mostrarlo en el chat). */
export function rellenar(texto, valores) {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, n) => valores[Number(n) - 1] || `{{${n}}}`);
}
