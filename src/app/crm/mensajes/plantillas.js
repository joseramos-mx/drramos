/**
 * Mensajes aprobados (plantillas) para escribirle a un paciente que no ha
 * escrito o que lleva más de 24 h sin escribir. El `nombre` y el `texto`
 * deben ser IDÉNTICOS a los que se den de alta en WhatsApp Manager
 * (categoría Utilidad, idioma Español (MEX)). Ver estrategia/conexion-whatsapp.md.
 * Nunca precios ni promesas: es publicidad de salud.
 */
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
    campos: ["Nombre del paciente", "Día (ej. jueves 23 de octubre)", "Hora (ej. 10:30)"],
    // Respuestas rápidas, en este orden, idénticas en WhatsApp Manager
    botones: ["Confirmo mi cita", "Cambiar mi cita", "Cancelar mi cita"],
  },
  {
    nombre: "seguimiento_consulta",
    titulo: "Seguimiento",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo para dar seguimiento a su consulta. Responda este mensaje si tiene alguna duda o quiere agendar.",
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
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Por un imprevisto no podremos atenderle el {{2}} a las {{3}}; le ofrecemos una disculpa. Toque un botón para elegir otro horario o hablar con la Dra. Gaby.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con Dra. Gaby"],
  },
  {
    nombre: "cita_cancelada",
    titulo: "Avisar que se canceló su cita (bloqueo)",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Por un imprevisto tuvimos que cancelar su cita del {{2}} a las {{3}}; le ofrecemos una disculpa. Toque un botón para elegir otro horario o hablar con la Dra. Gaby.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con Dra. Gaby"],
  },
  {
    nombre: "cita_agendada",
    titulo: "Confirmación al agendar (la Dra. Gaby en la agenda)",
    texto:
      "Hola {{1}}, su cita en el consultorio del Dr. Felipe de Jesús Ramos Sotelo quedó el {{2}} a las {{3}}. Le esperamos en Prol. Gómez Palacio 501 Pte., Zona Centro. Si necesita cambiarla, toque un botón.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Confirmo mi cita", "Cambiar mi cita", "Cancelar mi cita"],
  },
  {
    nombre: "cita_falto",
    titulo: "Cuando no vino a su cita",
    texto:
      "Hola {{1}}, le escribimos del consultorio del Dr. Felipe de Jesús Ramos Sotelo. Notamos que no pudo venir a su cita del {{2}} a las {{3}}. Si gusta, toque un botón para elegir otro horario o hablar con la Dra. Gaby.",
    campos: ["Nombre del paciente", "Día", "Hora"],
    botones: ["Elegir otro horario", "Hablar con Dra. Gaby"],
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
];

/** Texto final con los {{n}} reemplazados (para guardarlo y mostrarlo en el chat). */
export function rellenar(texto, valores) {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, n) => valores[Number(n) - 1] || `{{${n}}}`);
}
