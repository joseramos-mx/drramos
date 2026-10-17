/**
 * Métricas de WhatsApp para /crm/resultados. Funciones puras.
 *
 *  - Embudo desde el primer mensaje: escribieron → agendaron → vinieron → pagaron,
 *    por fuente. Es lo que dice si una fuente trae curiosos o pacientes.
 *  - Tiempo de respuesta: desde que el paciente escribe (y nadie le ha
 *    contestado) hasta la primera respuesta de la Dra. Gaby.
 *  - Sin contestar: conversaciones cuyo último mensaje es del paciente.
 */

const MIN = 60 * 1000;

// "Gracias", "ok", un emoji…: cierres que no necesitan respuesta
const CIERRE = /^\s*(gracias|muchas gracias|ok|okay|oki|va|vale|sale|perfecto|listo|de acuerdo|excelente|bendiciones|👍|🙏|👌|😊|❤️|✅)[\s!.,😊🙏👍]*$/i;

function enRango(iso, { desde, hasta }) {
  if (!iso) return false;
  if (desde && iso < desde) return false;
  if (hasta && iso >= hasta) return false;
  return true;
}

/**
 * @param pacientes [{ id, origen, primer_mensaje_en }]
 * @param citas     [{ paciente: { id }, estado, pagado_monto }]
 * @returns { total, agendaron, vinieron, pagaron, porOrigen: { [origen]: {escribieron, agendaron, vinieron, pagaron} } }
 */
export function embudoWhatsapp(pacientes, citas, rango) {
  const conCita = new Set();
  const vino = new Set();
  const pago = new Set();
  for (const c of citas || []) {
    const id = c.paciente?.id;
    if (!id) continue;
    conCita.add(id);
    if (c.estado === "asistio") vino.add(id);
    if (c.estado === "asistio" && Number(c.pagado_monto) > 0) pago.add(id);
  }

  const out = { total: 0, agendaron: 0, vinieron: 0, pagaron: 0, porOrigen: {} };
  for (const p of pacientes || []) {
    if (!enRango(p.primer_mensaje_en, rango)) continue;
    const f = (out.porOrigen[p.origen || "sin_dato"] ??= { escribieron: 0, agendaron: 0, vinieron: 0, pagaron: 0 });
    out.total++;
    f.escribieron++;
    if (conCita.has(p.id)) { out.agendaron++; f.agendaron++; }
    if (vino.has(p.id)) { out.vinieron++; f.vinieron++; }
    if (pago.has(p.id)) { out.pagaron++; f.pagaron++; }
  }
  return out;
}

/** Mensajes agrupados por teléfono y ordenados por hora. */
function porConversacion(mensajes) {
  const g = new Map();
  for (const m of mensajes || []) {
    if (!g.has(m.telefono)) g.set(m.telefono, []);
    g.get(m.telefono).push(m);
  }
  for (const lista of g.values()) lista.sort((a, b) => (a.enviado_en < b.enviado_en ? -1 : 1));
  return g;
}

/**
 * Tiempo de respuesta: cada vez que el paciente escribe después de que se
 * le contestó (o por primera vez), se mide hasta la siguiente respuesta.
 * Cuenta las esperas que EMPIEZAN dentro del rango.
 */
export function tiemposRespuesta(mensajes, rango) {
  const esperas = [];
  for (const lista of porConversacion(mensajes).values()) {
    let esperandoDesde = null;
    for (const m of lista) {
      if (m.direccion === "entrada") {
        if (!esperandoDesde) esperandoDesde = m.enviado_en;
      } else if (esperandoDesde) {
        if (enRango(esperandoDesde, rango)) {
          esperas.push((new Date(m.enviado_en) - new Date(esperandoDesde)) / MIN);
        }
        esperandoDesde = null;
      }
    }
  }
  esperas.sort((a, b) => a - b);
  const n = esperas.length;
  return {
    contestadas: n,
    medianaMin: n ? esperas[Math.floor((n - 1) / 2)] : null,
    enUnaHora: n ? esperas.filter((x) => x <= 60).length / n : null,
  };
}

/**
 * Conversaciones cuyo último mensaje es del paciente, con más de
 * `minutos` de espera. Ignora los cierres tipo "gracias 👍".
 */
export function sinContestar(mensajes, ahora = new Date().toISOString(), minutos = 15) {
  const limite = new Date(new Date(ahora).getTime() - minutos * MIN).toISOString();
  const out = [];
  for (const [telefono, lista] of porConversacion(mensajes)) {
    const ultimo = lista[lista.length - 1];
    if (ultimo.direccion !== "entrada" || ultimo.enviado_en > limite) continue;
    if (CIERRE.test(ultimo.texto || "")) continue;
    // Desde cuándo espera: primer mensaje del paciente después de la última respuesta
    let desde = ultimo.enviado_en;
    for (let i = lista.length - 1; i >= 0 && lista[i].direccion === "entrada"; i--) desde = lista[i].enviado_en;
    out.push({ telefono, paciente: ultimo.paciente || null, desde, texto: ultimo.texto });
  }
  return out.sort((a, b) => (a.desde < b.desde ? -1 : 1));
}
