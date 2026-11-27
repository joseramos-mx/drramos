import { normalizarTelefono } from "@/lib/telefono";

/**
 * Teléfonos de prueba (variable ASISTENTE_TELEFONOS_PRUEBA, separados por coma,
 * p. ej. "6181234567,6187654321"): a esos números el asistente les contesta como en
 * "Contesta solo" aunque en Ajustes esté apagado. A todos los demás, lo que diga Ajustes.
 * Sirve para probar el robot con WhatsApp real sin tocar a los pacientes.
 */
const PRUEBA = new Set(
  String(process.env.ASISTENTE_TELEFONOS_PRUEBA || "")
    .split(",")
    .map((t) => normalizarTelefono(t.trim()))
    .filter((t) => t && t.length === 12)
);

export const esTelefonoDePrueba = (telefono) => PRUEBA.has(normalizarTelefono(telefono));

/** Modo para este teléfono: "automatico" si es de prueba; si no, el de Ajustes. */
export const modoPara = (modoGeneral, telefono) => (esTelefonoDePrueba(telefono) ? "automatico" : modoGeneral || "apagado");
