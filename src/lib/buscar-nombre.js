/**
 * Buscar por nombre "como lo escribiría una persona": sin que importen acentos,
 * mayúsculas ni un error de dedo ("Jesus" encuentra "Jesús", "Ramso" encuentra
 * "Ramos"). Cada palabra que se escribe tiene que parecerse a alguna palabra
 * del nombre; se ordenan de la más parecida a la menos.
 */

export const normalizar = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .trim();

/** Distancia de edición (cambiar, quitar, poner o voltear dos letras = 1 error cada una). */
function distancia(a, b) {
  if (a === b) return 0;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Errores de dedo permitidos según lo largo de la palabra. */
const tolerancia = (n) => (n >= 7 ? 2 : n >= 4 ? 1 : 0);

/** Qué tanto se parece una palabra buscada a una palabra del nombre (0 = igual; null = nada). */
function parecido(buscada, palabra) {
  if (palabra.startsWith(buscada)) return 0;
  if (palabra.includes(buscada)) return 0.5;
  // Error de dedo: contra la palabra completa o contra su inicio del mismo largo (si va a medias)
  const d = Math.min(distancia(buscada, palabra), distancia(buscada, palabra.slice(0, buscada.length)));
  return d <= tolerancia(buscada.length) ? 1 + d : null;
}

/** Puntaje del nombre para lo que se buscó (menor = mejor), o null si no se parece. */
export function puntaje(q, nombre) {
  const buscadas = normalizar(q).split(/\s+/).filter(Boolean);
  const palabras = normalizar(nombre).split(/\s+/).filter(Boolean);
  if (!buscadas.length || !palabras.length) return null;
  let total = 0;
  for (const b of buscadas) {
    let mejor = null;
    for (const p of palabras) {
      const s = parecido(b, p);
      if (s != null && (mejor == null || s < mejor)) mejor = s;
    }
    if (mejor == null) return null;
    total += mejor;
  }
  return total;
}

/** Filtra y ordena `filas` ({ nombre, … }) por lo buscado. */
export function buscarPorNombre(filas, q, max = 6) {
  return (filas || [])
    .map((f) => ({ f, s: puntaje(q, f.nombre) }))
    .filter((x) => x.s != null)
    .sort((a, b) => a.s - b.s || String(a.f.nombre).length - String(b.f.nombre).length)
    .slice(0, max)
    .map((x) => x.f);
}
