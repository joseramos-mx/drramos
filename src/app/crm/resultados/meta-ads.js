/**
 * Lee gasto y conversaciones de los anuncios de Meta (Marketing API)
 * para la sección "Anuncios" de /crm/resultados.
 *
 * Requiere en el servidor (Vercel), NUNCA con prefijo NEXT_PUBLIC_:
 *   META_ADS_ACCESS_TOKEN  token de usuario del sistema con permiso ads_read
 *   META_AD_ACCOUNT_ID     id numérico de la cuenta (sin "act_")
 * Opcional: META_GRAPH_VERSION (default v23.0).
 *
 * Sólo se importa desde server components (el token nunca llega al
 * navegador). Sin token devuelve { conectado: false } y la página lo explica.
 * Los números se cachean 15 min para no pegarle a Meta en cada visita.
 */

const CONVERSACION = "onsite_conversion.messaging_conversation_started_7d";

export function fechaDurango(iso) {
  return new Date(new Date(iso).getTime() - 6 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function leerAnunciosMeta({ desde, hasta }) {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  const cuenta = process.env.META_AD_ACCOUNT_ID;
  if (!token || !cuenta) return { conectado: false };

  const version = process.env.META_GRAPH_VERSION || "v23.0";
  const params = new URLSearchParams({
    level: "campaign",
    fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,actions",
    limit: "100",
    access_token: token,
  });
  if (desde) {
    const hastaDia = hasta ? fechaDurango(new Date(new Date(hasta).getTime() - 1000).toISOString()) : fechaDurango(new Date().toISOString());
    params.set("time_range", JSON.stringify({ since: fechaDurango(desde), until: hastaDia }));
  } else {
    params.set("date_preset", "maximum");
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/act_${cuenta}/insights?${params}`,
      { next: { revalidate: 900 } }
    );
    const json = await res.json();
    if (!res.ok || json.error) {
      console.error("[resultados] Meta insights", json.error?.message || res.status);
      return { conectado: true, error: "Meta no respondió. Revisa que el token siga vigente." };
    }
    return { conectado: true, ...resumirInsights(json.data || []) };
  } catch (e) {
    console.error("[resultados] Meta insights", e);
    return { conectado: true, error: "No se pudo contactar a Meta." };
  }
}

/** Convierte la respuesta de Meta en totales y filas por campaña. */
export function resumirInsights(data) {
  const campanas = data.map((r) => {
    const conversaciones = Number(
      (r.actions || []).find((a) => a.action_type === CONVERSACION)?.value || 0
    );
    return {
      id: r.campaign_id,
      nombre: r.campaign_name,
      gasto: Number(r.spend || 0),
      impresiones: Number(r.impressions || 0),
      alcance: Number(r.reach || 0),
      clics: Number(r.clicks || 0),
      conversaciones,
    };
  });
  campanas.sort((a, b) => b.gasto - a.gasto);
  const total = (k) => campanas.reduce((s, c) => s + c[k], 0);
  return {
    campanas,
    gasto: total("gasto"),
    impresiones: total("impresiones"),
    conversaciones: total("conversaciones"),
  };
}

/**
 * KPIs que cruzan Meta con la agenda. `deAnuncio` es la fila del origen
 * "anuncio" de calcularResultados (pacientes, vinieron, pagaron, cobrado).
 */
export function kpisAnuncios(meta, deAnuncio) {
  const a = deAnuncio || { pacientes: 0, vinieron: 0, pagaron: 0, cobrado: 0 };
  const div = (x, y) => (y > 0 ? x / y : null);
  return {
    gasto: meta.gasto,
    conversaciones: meta.conversaciones,
    costoConversacion: div(meta.gasto, meta.conversaciones),
    pacientes: a.pacientes,
    vinieron: a.vinieron,
    pagaron: a.pagaron,
    cobrado: a.cobrado,
    costoPaciente: div(meta.gasto, a.pacientes),
    costoPacientePago: div(meta.gasto, a.pagaron),
    retorno: div(a.cobrado, meta.gasto),
    conversacionAPaciente: div(a.pacientes, meta.conversaciones),
  };
}

/**
 * Gasto y conversaciones POR ANUNCIO (level=ad), para cruzarlo con los pacientes
 * que guardaron el id del anuncio que tocaron. Devuelve [] si no hay token o falla.
 */
export async function leerPorAnuncioMeta({ desde, hasta }) {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  const cuenta = process.env.META_AD_ACCOUNT_ID;
  if (!token || !cuenta) return [];
  const version = process.env.META_GRAPH_VERSION || "v23.0";
  const params = new URLSearchParams({
    level: "ad",
    fields: "ad_id,ad_name,campaign_name,spend,actions",
    limit: "200",
    access_token: token,
  });
  if (desde) {
    const hastaDia = hasta ? fechaDurango(new Date(new Date(hasta).getTime() - 1000).toISOString()) : fechaDurango(new Date().toISOString());
    params.set("time_range", JSON.stringify({ since: fechaDurango(desde), until: hastaDia }));
  } else {
    params.set("date_preset", "maximum");
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/act_${cuenta}/insights?${params}`, { next: { revalidate: 900 } });
    const json = await res.json();
    if (!res.ok || json.error) return [];
    return (json.data || []).map((r) => ({
      id: String(r.ad_id),
      nombre: r.ad_name,
      campana: r.campaign_name,
      gasto: Number(r.spend || 0),
      conversaciones: Number((r.actions || []).find((a) => a.action_type === CONVERSACION)?.value || 0),
    }));
  } catch {
    return [];
  }
}

/**
 * Una fila por anuncio: lo de Meta (gasto, conversaciones) + lo de la agenda
 * (pacientes, vinieron, pagaron, cobrado). `deAnuncios` = porOrigen calculado
 * agrupando por anuncio_id; `titulos` = { anuncio_id: título guardado }.
 */
export function tablaPorAnuncio(meta, deAnuncios, titulos = {}) {
  const filas = new Map();
  for (const a of meta) filas.set(a.id, { ...a, pacientes: 0, vinieron: 0, pagaron: 0, cobrado: 0 });
  for (const o of deAnuncios) {
    const f = filas.get(o.origen) || { id: o.origen, nombre: titulos[o.origen] || `Anuncio ${o.origen}`, campana: "", gasto: 0, conversaciones: 0 };
    filas.set(o.origen, { ...f, pacientes: o.pacientes, vinieron: o.vinieron, pagaron: o.pagaron, cobrado: o.cobrado });
  }
  return [...filas.values()]
    .filter((f) => f.gasto > 0 || f.pacientes > 0)
    .map((f) => ({ ...f, costoPago: f.pagaron && f.gasto ? f.gasto / f.pagaron : null, retorno: f.gasto ? f.cobrado / f.gasto : null }))
    .sort((a, b) => b.cobrado - a.cobrado || b.gasto - a.gasto);
}
