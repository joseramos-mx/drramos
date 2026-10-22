/**
 * "Mi cita" por WhatsApp: el paciente confirma, cambia o cancela su cita
 * tocando botones y listas, sin que nadie escriba. SÓLO SERVIDOR.
 *
 * Cada botón lleva un id "cita|<acción>|<idCita>|<dato>". El id llega del
 * celular del paciente, así que TODO se vuelve a revisar aquí: que la cita
 * sea de ese teléfono, que sea futura y no cancelada, que el horario siga libre.
 *
 *   confirmar → anota que confirmó
 *   menu      → botones Cambiar / Cancelar / Hablar con la Dra. Gaby
 *   cambiar   → lista de días con lugar → dia → lista de horas → hora → cita movida
 *   proponer  → (cuando el paciente ESCRIBE día y hora) "¿La cambio al …?" con botón → hora
 *   cancelar  → "¿Seguro?" → cancelar_si → cita cancelada (se queda en la agenda
 *               marcada como cancelada para que cuente en Resultados; el horario se libera)
 *   hablar    → pasa el chat a la Dra. Gaby
 *   reagendar → (de una cita pasada/cancelada: faltó o la canceló el consultorio) rdia → rhora → cita NUEVA
 *   presupuesto_si / _duda / _no → respuestas al seguimiento de un presupuesto
 *
 * Duración: cada cita conserva el espacio que la Dra. Gaby le apartó en la
 * agenda (fin − inicio): una cirugía de 3 h sólo ve huecos donde caben 3 h.
 * Los tratamientos sólo se mueven a la misma fecha o después (el trabajo de
 * laboratorio puede no estar listo antes); para adelantarlos, la Dra. Gaby.
 * Cada cita se puede mover sola hasta MAX_CAMBIOS veces; después, la Dra. Gaby.
 * Lo que el paciente escribe ("¿me la pasa al lunes a las 5?") lo traduce el
 * asistente a estas mismas acciones (botonDeAccion).
 */

import { enviarBotones, enviarLista, enviarTexto } from "@/lib/whatsapp";
import { avisar } from "@/lib/mensajes-servidor";
import { diasCerrados, disponibilidad, pasarAHumano, textoAlPasar } from "@/lib/asistente";
import { textosEfectivos } from "@/lib/asistente/respuestas";
import { SLOT_MIN, esFechaValida, formatFechaLarga, formatHora, hoyDurango, isoDesde, minutosDelDia, sumarDias } from "@/app/agenda/lib";

const MAX_CAMBIOS = 2;
const DIAS_A_OFRECER = 14;
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Botones del recordatorio (en el mismo orden que en WhatsApp Manager). */
/** Botones de las plantillas del sistema, en el mismo orden que en WhatsApp Manager. */
export const BOTONES_PLANTILLA = {
  recordatorio_cita: ["confirmar", "cambiar", "cancelar"],
  cita_agendada: ["confirmar", "cambiar", "cancelar"],
  cita_reagendar: ["cambiar", "hablar"],
  cita_cancelada: ["reagendar", "hablar"],
  cita_falto: ["reagendar", "hablar"],
  seguimiento_presupuesto: ["presupuesto_si", "presupuesto_duda", "presupuesto_no"],
};
const TITULOS = {
  confirmar: ["Confirmo mi cita"],
  cambiar: ["Cambiar mi cita", "Elegir otro horario"],
  cancelar: ["Cancelar mi cita"],
  hablar: ["Hablar con Dra. Gaby"],
  presupuesto_si: ["Quiero agendar"],
  presupuesto_duda: ["Tengo una duda"],
  presupuesto_no: ["Ya no, gracias"],
};

export const idBoton = (accion, citaId, dato = "") => `cita|${accion}|${citaId || ""}|${dato}`;

/** Lo que decidió el asistente con lo que escribió el paciente → el mismo id que un botón. */
export function botonDeAccion({ accion, fecha = "", hora = "" }, citaId) {
  const h = String(hora).replace(/^0(\d):/, "$1:");
  switch (accion) {
    case "confirmar":
    case "cambiar":
    case "cancelar":
    case "menu":
      return idBoton(accion, citaId);
    case "ver_horarios_del_dia":
      return idBoton("dia", citaId, fecha);
    case "proponer_horario":
      return fecha && h ? idBoton("proponer", citaId, `${fecha}T${h}`) : idBoton("dia", citaId, fecha);
    default:
      return idBoton("menu", citaId);
  }
}

const fechaDe = (iso) => hoyDurango(new Date(iso));
/** Minutos que la Dra. Gaby le apartó a la cita en la agenda. */
const duracionDe = (cita) => Math.max(SLOT_MIN, Math.round((new Date(cita.fin) - new Date(cita.inicio)) / 60000) || SLOT_MIN);
/** Primer día al que se puede mover: tratamientos, no antes de su fecha original. */
const desdeCuando = (cita) => (cita.tipo === "valoracion" ? hoyDurango() : [hoyDurango(), fechaDe(cita.inicio)].sort().at(-1));
const libresPara = (admin, cita, fecha) => disponibilidad(admin, fecha, { duracion: duracionDe(cita), ignorar: cita.id });
/** "10:00" o "10:00 a 13:00" si la cita es larga. */
const rango = (hora, duracion) => {
  if (duracion <= SLOT_MIN) return hora;
  const [h, m] = hora.split(":").map(Number);
  return `${hora} a ${formatHora(h * 60 + m + duracion)}`;
};
const cuando = (iso) => `${formatFechaLarga(fechaDe(iso))} a las ${formatHora(minutosDelDia(iso))}`;
/** "2026-10-28" → "Miércoles 28 oct" (cabe en una fila de lista). */
function diaCorto(fecha) {
  const d = new Date(`${fecha}T12:00:00Z`);
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`;
}

/** Lee "cita|accion|id|dato". Los botones de plantilla sin payload traen el título: se reconoce también. */
export function leerBoton(texto) {
  const t = String(texto || "");
  if (t.startsWith("cita|")) {
    const [, accion, citaId, dato] = t.split("|");
    return { accion, citaId: citaId || null, dato: dato || "" };
  }
  const accion = Object.keys(TITULOS).find((k) => TITULOS[k].some((x) => x.toLowerCase() === t.trim().toLowerCase()));
  return accion ? { accion, citaId: null, dato: "" } : null;
}

async function guardarSalida(admin, telefono, pacienteId, envio, texto) {
  if (envio?.error) return;
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: envio.wa_id || `micita-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "asistente",
      tipo: "text",
      texto,
      enviado_en: new Date().toISOString(),
      paciente_id: pacienteId,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
}

async function decir(admin, telefono, pacienteId, texto) {
  await guardarSalida(admin, telefono, pacienteId, await enviarTexto(telefono, texto), texto);
}

/** La cita a la que se refiere el botón, si es de este paciente, futura y no cancelada. Sin id: su próxima cita. */
async function citaDel(admin, pacienteId, citaId) {
  let q = admin
    .from("citas")
    .select("id, inicio, fin, tipo, estado, notas, cambios_paciente")
    .eq("paciente_id", pacienteId)
    .gte("inicio", new Date().toISOString())
    .neq("estado", "cancelada")
    .order("inicio")
    .limit(1);
  if (citaId) q = q.eq("id", citaId);
  const { data } = await q.maybeSingle();
  return data || null;
}

const anotar = (notas, texto) => [notas, texto].filter(Boolean).join(" · ").slice(0, 1000);

/**
 * El aviso por bloqueo quedó resuelto (tocó un botón, se movió/canceló la cita, el chat
 * pasó a la Dra. Gaby o ella ya le escribió): ya no hay que llamarle. Un mensaje
 * cualquiera ("ok", un sticker) NO lo resuelve.
 */
export const yaRespondio = (admin, pacienteId) =>
  admin.from("citas").update({ aviso_bloqueo_en: null }).eq("paciente_id", pacienteId).not("aviso_bloqueo_en", "is", null);

/** Botones para una cita (los manda también el asistente cuando el paciente pregunta por su cita). */
export async function enviarMenuCita(admin, telefono, paciente, cita) {
  const texto = `Su cita es el ${cuando(cita.inicio)}. ¿Qué desea hacer?`;
  const envio = await enviarBotones(telefono, texto, [
    { id: idBoton("cambiar", cita.id), titulo: "Cambiar mi cita" },
    { id: idBoton("cancelar", cita.id), titulo: "Cancelar mi cita" },
    { id: idBoton("hablar", cita.id), titulo: "Hablar con Dra. Gaby" },
  ]);
  await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Botones: Cambiar mi cita · Cancelar mi cita · Hablar con Dra. Gaby]`);
  return envio;
}

/** Lista de días con lugar para la duración de `cita`. `accionDia`: "dia" (mover) o "rdia" (cita nueva). */
async function enviarDias(admin, telefono, paciente, cita, accionDia, texto, desde = desdeCuando(cita)) {
  const filas = [];
  for (let i = 0; i < DIAS_A_OFRECER && filas.length < 9; i++) {
    const fecha = sumarDias(desde, i);
    const r = await libresPara(admin, cita, fecha);
    const n = Array.isArray(r.horarios_libres) ? r.horarios_libres.length : 0;
    if (n) filas.push({ id: idBoton(accionDia, cita.id, fecha), titulo: diaCorto(fecha), descripcion: `${n} horario${n === 1 ? "" : "s"} libre${n === 1 ? "" : "s"}` });
  }
  if (!filas.length) return false;
  filas.push({ id: idBoton("hablar", cita.id), titulo: "Hablar con Dra. Gaby", descripcion: "Si ningún día le acomoda" });
  const envio = await enviarLista(telefono, texto, "Ver días", filas, "Días con lugar");
  await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Lista de días]`);
  return true;
}

/** Lista de horas libres de un día (máx. 10, repartidas). `accionHora`: "hora" (mover) o "rhora" (cita nueva). */
async function enviarHoras(admin, telefono, paciente, cita, fecha, accionHora) {
  const r = await libresPara(admin, cita, fecha);
  const libres = Array.isArray(r.horarios_libres) ? r.horarios_libres : [];
  if (!libres.length) return false;
  const horas = libres.length <= 10 ? libres : Array.from({ length: 10 }, (_, i) => libres[Math.round((i * (libres.length - 1)) / 9)]);
  const texto = `Horarios libres el ${formatFechaLarga(fecha)}. Toque el que le acomode:`;
  const envio = await enviarLista(
    telefono,
    texto,
    "Ver horarios",
    horas.map((h) => ({ id: idBoton(accionHora, cita.id, `${fecha}T${h}`), titulo: rango(h, duracionDe(cita)), descripcion: diaCorto(fecha) })),
    "Horarios"
  );
  await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Lista de horarios]`);
  return true;
}

/**
 * Botones que salen de una cita PASADA o CANCELADA: faltó ("No vino"), el
 * consultorio la canceló por un bloqueo, o el seguimiento de un presupuesto.
 *   reagendar → rdia → rhora: se crea una cita NUEVA (mismo tipo y duración)
 *   presupuesto_si / presupuesto_duda → a la Dra. Gaby · presupuesto_no → ya no se le escribe de eso
 */
async function atenderCitaAnterior(admin, telefono, paciente, nombre, b) {
  const { data: previa } = await admin
    .from("citas")
    .select("id, inicio, fin, tipo, dentista, estado, notas")
    .eq("id", b.citaId || "")
    .eq("paciente_id", paciente.id)
    .maybeSingle();
  if (!previa) {
    await decir(admin, telefono, paciente.id, "No encontré esa cita. Si quiere agendar, con gusto le ayudo por aquí 😊");
    return true;
  }

  if (b.accion.startsWith("presupuesto_")) {
    await admin.from("citas").update({ seguimiento_cerrado: true }).eq("id", previa.id);
    if (b.accion === "presupuesto_si") {
      await pasar(admin, telefono, paciente, "Quiere agendar su tratamiento (seguimiento de presupuesto)", "¡Con gusto! La Dra. Gaby le escribe para agendar su tratamiento 😊");
    } else if (b.accion === "presupuesto_duda") {
      await pasar(admin, telefono, paciente, "Tiene una duda sobre su plan de tratamiento (seguimiento de presupuesto)");
    } else {
      await decir(admin, telefono, paciente.id, "Entendido, gracias por avisarnos. Aquí estamos cuando guste 😊");
    }
    return true;
  }

  // Reagendar: sólo si ya no tiene otra cita próxima
  const proxima = await citaDel(admin, paciente.id, null);
  if (proxima) {
    await decir(admin, telefono, paciente.id, `Ya tiene cita el ${cuando(proxima.inicio)} 😊`);
    await enviarMenuCita(admin, telefono, paciente, proxima);
    return true;
  }
  if (!["no_asistio", "cancelada"].includes(previa.estado)) {
    await pasar(admin, telefono, paciente, "Quiere reagendar su cita");
    return true;
  }
  const desde = hoyDurango();

  if (b.accion === "reagendar") {
    const ok = await enviarDias(admin, telefono, paciente, previa, "rdia", "¿Para qué día le agendamos su nueva cita?", desde);
    if (!ok) await pasar(admin, telefono, paciente, "Quiere reagendar y no hay lugar en 2 semanas");
    return true;
  }
  if (b.accion === "rdia") {
    if (!esFechaValida(b.dato) || b.dato < desde) return atenderBotonCita(admin, telefono, idBoton("reagendar", previa.id));
    if (!(await enviarHoras(admin, telefono, paciente, previa, b.dato, "rhora"))) {
      await decir(admin, telefono, paciente.id, "Ese día ya se llenó 🙏");
      return atenderBotonCita(admin, telefono, idBoton("reagendar", previa.id));
    }
    return true;
  }
  // rhora: crear la cita nueva
  const [fecha, hora] = b.dato.split("T");
  const [h, m] = String(hora || "").split(":").map(Number);
  if (!esFechaValida(fecha) || !Number.isFinite(h) || fecha < desde) return atenderBotonCita(admin, telefono, idBoton("reagendar", previa.id));
  const inicioMin = h * 60 + (m || 0);
  const r = await libresPara(admin, previa, fecha);
  if (!Array.isArray(r.horarios_libres) || !r.horarios_libres.includes(formatHora(inicioMin))) {
    await decir(admin, telefono, paciente.id, "Ese horario se acaba de ocupar 🙏 Le muestro los que siguen libres:");
    return atenderBotonCita(admin, telefono, idBoton("rdia", previa.id, fecha));
  }
  const nuevoInicio = isoDesde(fecha, inicioMin);
  const { error } = await admin.from("citas").insert({
    paciente_id: paciente.id,
    dentista: previa.dentista,
    tipo: previa.tipo,
    inicio: nuevoInicio,
    fin: isoDesde(fecha, inicioMin + duracionDe(previa)),
    estado: "agendada",
    notas: `Reagendada por el paciente por WhatsApp (la anterior era el ${cuando(previa.inicio)})`,
    // Si es para mañana, esta confirmación ya hace de recordatorio
    recordatorio_enviado_en: fecha <= sumarDias(hoyDurango(), 1) ? new Date().toISOString() : null,
  });
  if (error) {
    await pasar(admin, telefono, paciente, "Quiso reagendar su cita y no se pudo guardar");
    return true;
  }
  await yaRespondio(admin, paciente.id);
  await decir(admin, telefono, paciente.id, `¡Listo! ✅ Su nueva cita quedó el ${cuando(nuevoInicio)}. Le esperamos en Prol. Gómez Palacio 501 Pte., Zona Centro.`);
  await avisar(admin, { titulo: `📅 ${nombre} reagendó su cita`, cuerpo: `${diaCorto(fecha)}, ${formatHora(inicioMin)}`, url: `/agenda?fecha=${fecha}` });
  return true;
}

async function pasar(admin, telefono, paciente, motivo, texto) {
  await yaRespondio(admin, paciente.id);
  await pasarAHumano(admin, paciente, telefono, { motivo, urgente: false });
  const { data: editadas } = await admin.from("asistente_respuestas").select("id, texto");
  await decir(admin, telefono, paciente.id, texto || textoAlPasar(textosEfectivos(editadas || []), {}, new Date(), await diasCerrados(admin)));
}

/**
 * Atiende el toque de un botón/opción de "Mi cita". Devuelve true si era
 * de "Mi cita" (y ya se contestó); false si no, para que siga el flujo normal.
 */
export async function atenderBotonCita(admin, telefono, respuesta) {
  const b = leerBoton(respuesta);
  if (!b) return false;
  const { data: paciente } = await admin
    .from("pacientes")
    .select("id, nombre, etiquetas")
    .eq("whatsapp", telefono)
    .limit(1)
    .maybeSingle();
  if (!paciente) return false;
  const nombre = paciente.nombre && !/^WhatsApp /.test(paciente.nombre) ? paciente.nombre : "Paciente";

  if (b.accion === "hablar") {
    await yaRespondio(admin, paciente.id);
    await pasar(admin, telefono, paciente, "Pidió hablar con usted (desde los botones de su cita)");
    return true;
  }

  if (["reagendar", "rdia", "rhora", "presupuesto_si", "presupuesto_duda", "presupuesto_no"].includes(b.accion)) {
    return atenderCitaAnterior(admin, telefono, paciente, nombre, b);
  }

  const cita = await citaDel(admin, paciente.id, b.citaId);
  if (!cita) {
    await decir(admin, telefono, paciente.id, "No encontré una cita próxima a su nombre. Si quiere agendar una valoración, con gusto le ayudo por aquí 😊");
    return true;
  }

  switch (b.accion) {
    case "confirmar": {
      await admin.from("citas").update({ notas: anotar(cita.notas, "Confirmó por WhatsApp") }).eq("id", cita.id);
      await decir(admin, telefono, paciente.id, `¡Gracias por confirmar! Le esperamos el ${cuando(cita.inicio)} 😊`);
      return true;
    }

    case "menu":
      await enviarMenuCita(admin, telefono, paciente, cita);
      return true;

    case "cambiar": {
      if ((cita.cambios_paciente || 0) >= MAX_CAMBIOS) {
        await pasar(admin, telefono, paciente, `Quiere mover otra vez su cita (ya la movió ${MAX_CAMBIOS} veces)`);
        return true;
      }
      const dur = duracionDe(cita);
      const texto = `Su cita es el ${cuando(cita.inicio)}${dur > SLOT_MIN ? ` (dura ${dur >= 60 ? `${dur / 60} h` : `${dur} min`})` : ""}. ¿Para qué día la cambiamos?`;
      if (!(await enviarDias(admin, telefono, paciente, cita, "dia", texto))) {
        await pasar(admin, telefono, paciente, "Quiere cambiar su cita y no hay lugar en 2 semanas");
      }
      return true;
    }

    case "dia": {
      if (!esFechaValida(b.dato)) return atenderBotonCita(admin, telefono, idBoton("cambiar", cita.id));
      if (b.dato < desdeCuando(cita)) {
        await pasar(admin, telefono, paciente, `Quiere adelantar su cita de tratamiento al ${formatFechaLarga(b.dato)}`, "Para adelantar una cita de tratamiento, la Dra. Gaby revisa que su trabajo esté listo y le escribe en un momento 🙏");
        return true;
      }
      if (!(await enviarHoras(admin, telefono, paciente, cita, b.dato, "hora"))) {
        await decir(admin, telefono, paciente.id, "Ese día ya se llenó 🙏");
        return atenderBotonCita(admin, telefono, idBoton("cambiar", cita.id));
      }
      return true;
    }

    case "proponer": {
      const [fecha, hora] = b.dato.split("T");
      if (!esFechaValida(fecha) || !/^\d{1,2}:\d{2}$/.test(hora || "")) return atenderBotonCita(admin, telefono, idBoton("cambiar", cita.id));
      if (fecha < desdeCuando(cita)) return atenderBotonCita(admin, telefono, idBoton("dia", cita.id, fecha));
      const r = await libresPara(admin, cita, fecha);
      if (!Array.isArray(r.horarios_libres) || !r.horarios_libres.includes(hora)) {
        await decir(admin, telefono, paciente.id, `El ${formatFechaLarga(fecha)} a las ${hora} no tengo lugar${duracionDe(cita) > SLOT_MIN ? " para todo el tiempo de su cita" : ""} 🙏`);
        return atenderBotonCita(admin, telefono, Array.isArray(r.horarios_libres) ? idBoton("dia", cita.id, fecha) : idBoton("cambiar", cita.id));
      }
      const texto = `¿Le cambio su cita al ${formatFechaLarga(fecha)}, ${rango(hora, duracionDe(cita))}?`;
      const envio = await enviarBotones(telefono, texto, [
        { id: idBoton("hora", cita.id, b.dato), titulo: "Sí, cambiarla" },
        { id: idBoton("dia", cita.id, fecha), titulo: "Otra hora ese día" },
        { id: idBoton("cambiar", cita.id), titulo: "Otro día" },
      ]);
      await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Botones: Sí, cambiarla · Otra hora ese día · Otro día]`);
      return true;
    }

    case "hora": {
      const [fecha, hora] = b.dato.split("T");
      const [h, m] = String(hora || "").split(":").map(Number);
      if (!esFechaValida(fecha) || !Number.isFinite(h)) return true;
      if (fecha < desdeCuando(cita)) return atenderBotonCita(admin, telefono, idBoton("dia", cita.id, fecha));
      const inicioMin = h * 60 + (m || 0);
      const nuevoInicio = isoDesde(fecha, inicioMin);
      if (new Date(nuevoInicio).getTime() === new Date(cita.inicio).getTime()) {
        await decir(admin, telefono, paciente.id, `Su cita ya está el ${cuando(cita.inicio)} ✅`);
        return true;
      }
      if ((cita.cambios_paciente || 0) >= MAX_CAMBIOS) {
        await pasar(admin, telefono, paciente, `Quiere mover otra vez su cita (ya la movió ${MAX_CAMBIOS} veces)`);
        return true;
      }
      const r = await libresPara(admin, cita, fecha);
      if (!Array.isArray(r.horarios_libres) || !r.horarios_libres.includes(formatHora(inicioMin))) {
        await decir(admin, telefono, paciente.id, "Ese horario se acaba de ocupar 🙏 Le muestro los que siguen libres:");
        return atenderBotonCita(admin, telefono, idBoton("dia", cita.id, fecha));
      }
      const antes = cuando(cita.inicio);
      const { error } = await admin
        .from("citas")
        .update({
          inicio: nuevoInicio,
          fin: isoDesde(fecha, inicioMin + duracionDe(cita)),
          cambios_paciente: (cita.cambios_paciente || 0) + 1,
          recordatorio_enviado_en: null,
          aviso_bloqueo_en: null,
          notas: anotar(cita.notas, `El paciente la cambió por WhatsApp (antes: ${antes})`),
        })
        .eq("id", cita.id);
      if (error) {
        await pasar(admin, telefono, paciente, "Quiso cambiar su cita y no se pudo guardar");
        return true;
      }
      await decir(admin, telefono, paciente.id, `¡Listo! ✅ Su cita quedó el ${cuando(nuevoInicio)}. Le esperamos en Prol. Gómez Palacio 501 Pte., Zona Centro.`);
      await avisar(admin, { titulo: `📅 ${nombre} cambió su cita`, cuerpo: `Ahora: ${diaCorto(fecha)}, ${formatHora(inicioMin)}`, url: `/agenda?fecha=${fecha}` });
      return true;
    }

    case "cancelar": {
      const texto = `¿Seguro que quiere cancelar su cita del ${cuando(cita.inicio)}?`;
      const envio = await enviarBotones(telefono, texto, [
        { id: idBoton("cancelar_si", cita.id), titulo: "Sí, cancelar" },
        { id: idBoton("cambiar", cita.id), titulo: "Mejor cambiarla" },
        { id: idBoton("conservar", cita.id), titulo: "No, la conservo" },
      ]);
      await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Botones: Sí, cancelar · No, la conservo]`);
      return true;
    }

    case "cancelar_si": {
      await admin.from("citas").update({ estado: "cancelada", aviso_bloqueo_en: null, notas: anotar(cita.notas, "El paciente la canceló por WhatsApp") }).eq("id", cita.id);
      await decir(admin, telefono, paciente.id, "Su cita quedó cancelada. Cuando guste agendar de nuevo, aquí estamos 😊");
      await avisar(admin, { titulo: `❌ ${nombre} canceló su cita`, cuerpo: `Era el ${diaCorto(fechaDe(cita.inicio))}, ${formatHora(minutosDelDia(cita.inicio))}`, url: `/agenda?fecha=${fechaDe(cita.inicio)}` });
      return true;
    }

    case "conservar":
      await decir(admin, telefono, paciente.id, `Perfecto, su cita sigue el ${cuando(cita.inicio)} 😊`);
      return true;

    default:
      return false;
  }
}
