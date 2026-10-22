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

/** Texto final con los {{n}} reemplazados (para guardarlo y mostrarlo en el chat). */
export function rellenar(texto, valores) {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, n) => valores[Number(n) - 1] || `{{${n}}}`);
}
