/**
 * Teléfonos de México en un solo formato: 52 + 10 dígitos.
 * WhatsApp los manda como "5216181234567" o "526181234567"; en la
 * agenda se escriben como "618 123 4567". Todo se guarda igual para
 * que el mismo paciente no quede dos veces.
 */
export function normalizarTelefono(raw) {
  const d = String(raw || "").replace(/\D+/g, "");
  if (d.length < 10) return d || null;
  return "52" + d.slice(-10);
}

/** Últimos 10 dígitos: la llave para buscar al paciente. */
export function diezDigitos(raw) {
  const d = String(raw || "").replace(/\D+/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
}
