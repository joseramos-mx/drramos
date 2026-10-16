/**
 * Helpers compartidos de la agenda. Sin dependencias del servidor:
 * lo usan tanto server components como componentes del cliente.
 */

// Durango no tiene horario de verano desde 2022: siempre UTC-6.
export const TZ_OFFSET = "-06:00";
const TZ_OFFSET_MIN = -6 * 60;

export const CITA_SELECT =
  "id, dentista, inicio, fin, tipo, estado, cotizado, cotizado_monto, realizado, pagado_monto, notas, paciente:pacientes(id, nombre, whatsapp, origen)";

// Columnas de la agenda. Para sumar un dentista, agregarlo aquí.
export const DENTISTAS = [
  { value: "felipe", label: "Dr. Felipe" },
  { value: "gaby", label: "Dra. Gaby" },
];

export const TIPOS = [
  { value: "valoracion",  label: "Valoración" },
  { value: "tratamiento", label: "Tratamiento" },
  { value: "revision",    label: "Revisión" },
  { value: "urgencia",    label: "Urgencia" },
];

export const DURACIONES = [
  { value: "30",  label: "30 min" },
  { value: "60",  label: "1 h" },
  { value: "90",  label: "1 h 30" },
  { value: "120", label: "2 h" },
  { value: "180", label: "3 h" },
];

export const ESTADOS_CITA = [
  { value: "asistio",    label: "Se presentó" },
  { value: "no_asistio", label: "No vino" },
  { value: "cancelada",  label: "Canceló" },
];

export const TRATAMIENTOS = [
  { value: "carillas",       label: "Carillas" },
  { value: "diseno_sonrisa", label: "Diseño de sonrisa" },
  { value: "implantes",      label: "Implantes" },
  { value: "coronas",        label: "Coronas" },
  { value: "protesis",       label: "Prótesis" },
  { value: "rehabilitacion", label: "Rehabilitación" },
  { value: "blanqueamiento", label: "Blanqueamiento" },
  { value: "limpieza",       label: "Limpieza" },
  { value: "resina",         label: "Resina" },
  { value: "urgencia",       label: "Urgencia" },
  { value: "otro",           label: "Otro" },
];

// Deben coincidir con el CHECK de pacientes.origen
export const ORIGENES = [
  { value: "anuncio",       label: "Anuncio" },
  { value: "recomendacion", label: "Recomendación" },
  { value: "facebook",      label: "Facebook" },
  { value: "instagram",     label: "Instagram" },
  { value: "google",        label: "Google" },
  { value: "ya_paciente",   label: "Ya era paciente" },
  { value: "doctoralia",    label: "Doctoralia" },
  { value: "web",           label: "Página web" },
  { value: "otro",          label: "Otro" },
];

// Colores de las citas: una sola fuente para las fichas y la leyenda.
// Fondos sólidos + barra a la izquierda. Paleta de /diseno-sonrisa.
export const TONOS = {
  agendada: { label: "Agendada",          bg: "#1d1913", barra: "#b89968" },
  asistio:  { label: "Vino",              bg: "#0f1d17", barra: "#34d399" },
  urgencia: { label: "Urgencia",          bg: "#241212", barra: "#ff7a7a" },
  apagada:  { label: "No vino / canceló", bg: "#111111", barra: "rgba(255,255,255,0.18)" },
};

export function tonoDeCita(cita) {
  if (cita.estado === "cancelada" || cita.estado === "no_asistio") return "apagada";
  if (cita.estado === "asistio") return "asistio";
  if (cita.tipo === "urgencia") return "urgencia";
  return "agendada";
}

// Horario de atención (de la landing): L-V 9-19, sáb 9-14, dom cerrado.
export function horarioDelDia(fecha) {
  const dow = diaSemana(fecha);
  if (dow === 0) return null;
  if (dow === 6) return { abre: 9 * 60, cierra: 14 * 60 };
  return { abre: 9 * 60, cierra: 19 * 60 };
}

export const SLOT_MIN = 30;

export function labelDe(lista, value) {
  return lista.find((x) => x.value === value)?.label || value;
}

/** "YYYY-MM-DD" de hoy en Durango. */
export function hoyDurango(now = new Date()) {
  const local = new Date(now.getTime() + TZ_OFFSET_MIN * 60000);
  return local.toISOString().slice(0, 10);
}

export function esFechaValida(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

export function sumarDias(fecha, n) {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function diaSemana(fecha) {
  return new Date(`${fecha}T00:00:00Z`).getUTCDay();
}

/** Rango [inicio, fin) del día en Durango, como ISO para consultar. */
export function rangoDelDia(fecha) {
  return {
    desde: new Date(`${fecha}T00:00:00${TZ_OFFSET}`).toISOString(),
    hasta: new Date(`${sumarDias(fecha, 1)}T00:00:00${TZ_OFFSET}`).toISOString(),
  };
}

/** Minutos desde medianoche (Durango) de un instante ISO. */
export function minutosDelDia(iso) {
  const d = new Date(iso);
  const local = new Date(d.getTime() + TZ_OFFSET_MIN * 60000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

/** ISO de una fecha + minutos desde medianoche en Durango. */
export function isoDesde(fecha, minutos) {
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  return new Date(`${fecha}T${hh}:${mm}:00${TZ_OFFSET}`).toISOString();
}

export function formatHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatFechaLarga(fecha) {
  return new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function formatMoney(n) {
  if (n === null || n === undefined || n === "") return "";
  return Number(n).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

/**
 * Acomodo tipo Google Calendar para las citas de UNA columna: las que
 * se enciman se reparten el ancho en carriles. Un grupo es una cadena
 * de citas que se tocan entre sí; dentro del grupo cada cita toma el
 * primer carril libre. Devuelve { [id]: { carril, carriles } }.
 */
export function carrilesColumna(citas) {
  const orden = [...citas].sort(
    (a, b) => new Date(a.inicio) - new Date(b.inicio) || new Date(b.fin) - new Date(a.fin)
  );
  const out = {};
  let grupo = [];
  let finGrupo = -Infinity;
  let finesCarril = [];

  const cerrarGrupo = () => {
    for (const id of grupo) out[id].carriles = finesCarril.length;
    grupo = [];
    finesCarril = [];
  };

  for (const c of orden) {
    const ini = new Date(c.inicio).getTime();
    const fin = new Date(c.fin).getTime();
    if (ini >= finGrupo) cerrarGrupo();

    let carril = finesCarril.findIndex((f) => f <= ini);
    if (carril === -1) {
      carril = finesCarril.length;
      finesCarril.push(fin);
    } else {
      finesCarril[carril] = fin;
    }
    out[c.id] = { carril, carriles: 1 };
    grupo.push(c.id);
    finGrupo = Math.max(finGrupo, fin);
  }
  cerrarGrupo();
  return out;
}

/** Citas que se enciman con otra del mismo dentista (se pintan en rojo). */
export function idsEncimados(citas) {
  const out = new Set();
  const activas = citas.filter((c) => c.estado !== "cancelada");
  for (let i = 0; i < activas.length; i++) {
    for (let j = i + 1; j < activas.length; j++) {
      const a = activas[i];
      const b = activas[j];
      if (a.dentista !== b.dentista) continue;
      if (new Date(a.inicio) < new Date(b.fin) && new Date(b.inicio) < new Date(a.fin)) {
        out.add(a.id);
        out.add(b.id);
      }
    }
  }
  return out;
}
