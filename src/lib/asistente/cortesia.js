/**
 * Mensajes que sólo agradecen o se despiden ("Muy bien, gracias, bonito día",
 * "Sale, nos vemos el lunes", "Gracias 🙏"). No necesitan a la Dra. Gaby ni a
 * Claude: se contestan con la respuesta aprobada "gracias" (una sola vez) o con nada.
 */
const PALABRAS = new Set(
  (
    "gracias muchas mil muchisimas grax thx muy bien ok okay oki okey va sale vale perfecto perfecta excelente " +
    "genial super padre listo lista entendido enterado enterada de acuerdo claro si simon " +
    "bonito bonita buen buena buenas buenos lindo linda feliz dia dias tarde tardes noche noches fin semana " +
    "igualmente igual usted ustedes tambien hasta luego pronto manana ahi alla estare estaremos nos vemos " +
    "que le les te tenga tengan este esten esta vaya vayan pase pasen a y e mucho gusto amable amables " +
    "saludos bendiciones dios bendiga bendito cuidese cuidense adios bye nada por favor al rato " +
    "dra doctor doc el la los lunes martes miercoles jueves viernes sabado"
  ).split(/\s+/)
);

// Debe agradecer o despedirse: un "sí", "ok" o "va" solo puede ser la respuesta a una pregunta
const CIERRE = new RegExp(
  "\\b(gracias|grax|thx|muchisimas|igualmente|bonito dia|buen dia|lindo dia|feliz dia|buenas tardes|buenas noches|" +
    "bonita tarde|bonita noche|buen fin|nos vemos|hasta luego|hasta pronto|hasta manana|saludos|bendiciones|" +
    "dios le bendiga|cuidese|cuidense|adios|bye|muy amable|que este bien|que le vaya bien)\\b"
);

function normalizar(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1") // "graciaaas" -> "gracias"
    .trim();
}

/** true si el texto es sólo cortesía (máx. 14 palabras conocidas, con un agradecimiento o despedida). */
export function esSoloCortesia(texto) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  if (!palabras.length || palabras.length > 14) return false;
  if (!palabras.every((p) => PALABRAS.has(p))) return false;
  return CIERRE.test(palabras.join(" "));
}
