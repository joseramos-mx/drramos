/**
 * Notas de voz: Chrome (Android) graba en WebM/Opus, pero WhatsApp sólo
 * acepta notas de voz en OGG/Opus. El sonido (Opus) es el mismo; sólo
 * cambia la "caja". Aquí se sacan los pedazos de sonido del WebM y se
 * meten en un OGG, sin volver a comprimir. Corre en el navegador.
 */

// ── WebM (EBML): lo mínimo para sacar CodecPrivate, canales y bloques ──
const MAESTROS = new Set([0x18538067, 0x1654ae6b, 0xae, 0xe1, 0x1f43b675, 0xa0]); // Segment, Tracks, TrackEntry, Audio, Cluster, BlockGroup

function leerVint(b, i, conMarca) {
  const primero = b[i];
  let largo = 1;
  while (largo <= 8 && !(primero & (0x80 >> (largo - 1)))) largo++;
  if (largo > 8) return null;
  let valor = conMarca ? primero : primero & (0xff >> largo);
  let todoUnos = valor === (0xff >> largo);
  for (let k = 1; k < largo; k++) {
    valor = valor * 256 + b[i + k];
    if (b[i + k] !== 0xff) todoUnos = false;
  }
  return { valor, largo, desconocido: !conMarca && todoUnos };
}

function recorrer(b, inicio, fin, alEncontrar) {
  let i = inicio;
  while (i < fin) {
    const id = leerVint(b, i, true);
    if (!id) return;
    const tam = leerVint(b, i + id.largo, false);
    if (!tam) return;
    const datos = i + id.largo + tam.largo;
    const finElem = tam.desconocido ? fin : Math.min(fin, datos + tam.valor);
    if (MAESTROS.has(id.valor)) recorrer(b, datos, finElem, alEncontrar);
    else alEncontrar(id.valor, datos, finElem);
    i = finElem;
  }
}

function webmAOpus(buffer) {
  const b = new Uint8Array(buffer);
  let opusHead = null;
  let canales = 1;
  const paquetes = [];
  recorrer(b, 0, b.length, (id, ini, fin) => {
    if (id === 0x63a2) opusHead = b.slice(ini, fin); // CodecPrivate
    else if (id === 0x9f) canales = b[fin - 1] || 1; // Channels
    else if (id === 0xa3 || id === 0xa1) {
      // SimpleBlock / Block: pista (vint) + tiempo (2) + banderas (1) + sonido
      const pista = leerVint(b, ini, false);
      paquetes.push(b.slice(ini + pista.largo + 3, fin));
    }
  });
  return { opusHead, canales, paquetes };
}

// ── OGG: páginas con su CRC ──
const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let r = i << 24;
    for (let k = 0; k < 8; k++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1;
    t[i] = r >>> 0;
  }
  return t;
})();

function crc(bytes) {
  let c = 0;
  for (const x of bytes) c = ((c << 8) ^ TABLA_CRC[((c >>> 24) ^ x) & 0xff]) >>> 0;
  return c;
}

function pagina(paquete, { granulo, serie, secuencia, tipo }) {
  const lacing = [];
  let resto = paquete.length;
  while (resto >= 255) {
    lacing.push(255);
    resto -= 255;
  }
  lacing.push(resto);
  const p = new Uint8Array(27 + lacing.length + paquete.length);
  const v = new DataView(p.buffer);
  p.set([0x4f, 0x67, 0x67, 0x53], 0); // "OggS"
  p[5] = tipo;
  v.setBigInt64(6, BigInt(granulo), true);
  v.setUint32(14, serie, true);
  v.setUint32(18, secuencia, true);
  p[26] = lacing.length;
  p.set(lacing, 27);
  p.set(paquete, 27 + lacing.length);
  v.setUint32(22, crc(p), true);
  return p;
}

/** Muestras (a 48 kHz) que trae un paquete Opus, según su primer byte (TOC). */
function muestras(paquete) {
  if (!paquete.length) return 0;
  const config = paquete[0] >> 3;
  const ms = config < 12 ? [10, 20, 40, 60][config % 4] : config < 16 ? [10, 20][config % 2] : [2.5, 5, 10, 20][config % 4];
  const c = paquete[0] & 3;
  const cuadros = c === 0 ? 1 : c < 3 ? 2 : paquete[1] & 0x3f;
  return Math.round(cuadros * ms * 48);
}

function cabeceraOpus(canales) {
  const h = new Uint8Array(19);
  const v = new DataView(h.buffer);
  h.set(new TextEncoder().encode("OpusHead"), 0);
  h[8] = 1;
  h[9] = canales;
  v.setUint16(10, 312, true); // pre-skip típico
  v.setUint32(12, 48000, true);
  return h;
}

function etiquetasOpus() {
  const vendedor = new TextEncoder().encode("consultorio");
  const t = new Uint8Array(8 + 4 + vendedor.length + 4);
  const v = new DataView(t.buffer);
  t.set(new TextEncoder().encode("OpusTags"), 0);
  v.setUint32(8, vendedor.length, true);
  t.set(vendedor, 12);
  return t;
}

/** WebM/Opus (lo que graba Chrome) → Blob OGG/Opus (nota de voz de WhatsApp). null si no se pudo. */
export async function webmAOgg(blob) {
  const { opusHead, canales, paquetes } = webmAOpus(await blob.arrayBuffer());
  if (!paquetes.length) return null;
  const serie = (Math.random() * 0xffffffff) >>> 0;
  const partes = [
    pagina(opusHead?.length >= 19 ? opusHead : cabeceraOpus(canales), { granulo: 0, serie, secuencia: 0, tipo: 0x02 }),
    pagina(etiquetasOpus(), { granulo: 0, serie, secuencia: 1, tipo: 0 }),
  ];
  let granulo = 0;
  paquetes.forEach((pq, i) => {
    granulo += muestras(pq);
    partes.push(pagina(pq, { granulo, serie, secuencia: i + 2, tipo: i === paquetes.length - 1 ? 0x04 : 0 }));
  });
  return new Blob(partes, { type: "audio/ogg" });
}
