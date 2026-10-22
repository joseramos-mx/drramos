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
 *   cancelar  → "¿Seguro?" → cancelar_si → cita cancelada (se queda en la agenda
 *               marcada como cancelada para que cuente en Resultados; el horario se libera)
 *   hablar    → pasa el chat a la Dra. Gaby
 *
 * Sólo las VALORACIONES se mueven solas (30 min, como las que agenda el
 * asistente). Las de tratamiento duran distinto y las acomoda la Dra. Gaby.
 * Cada cita se puede mover sola hasta MAX_CAMBIOS veces; después, la Dra. Gaby.
 */

import { enviarBotones, enviarLista, enviarTexto } from "@/lib/whatsapp";
import { avisar } from "@/lib/mensajes-servidor";
import { disponibilidad, pasarAHumano } from "@/lib/asistente";
import { textosEfectivos } from "@/lib/asistente/respuestas";
import { SLOT_MIN, esFechaValida, formatFechaLarga, formatHora, hoyDurango, isoDesde, minutosDelDia, sumarDias } from "@/app/agenda/lib";

const MAX_CAMBIOS = 2;
const DIAS_A_OFRECER = 14;
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Botones del recordatorio (en el mismo orden que en WhatsApp Manager). */
export const BOTONES_RECORDATORIO = ["confirmar", "cambiar", "cancelar"];
const TITULOS = { confirmar: "Confirmo mi cita", cambiar: "Cambiar mi cita", cancelar: "Cancelar mi cita" };

export const idBoton = (accion, citaId, dato = "") => `cita|${accion}|${citaId || ""}|${dato}`;

const fechaDe = (iso) => hoyDurango(new Date(iso));
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
  const accion = Object.keys(TITULOS).find((k) => TITULOS[k].toLowerCase() === t.trim().toLowerCase());
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

async function pasar(admin, telefono, paciente, motivo, texto) {
  await pasarAHumano(admin, paciente, telefono, { motivo, urgente: false });
  const { data: editadas } = await admin.from("asistente_respuestas").select("id, texto");
  await decir(admin, telefono, paciente.id, texto || textosEfectivos(editadas || []).pasar_dra_gaby);
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
    await pasar(admin, telefono, paciente, "Pidió hablar con usted (desde los botones de su cita)");
    return true;
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
      if (cita.tipo !== "valoracion") {
        await pasar(admin, telefono, paciente, "Quiere cambiar su cita de tratamiento", "Con gusto. Como es una cita de tratamiento, la Dra. Gaby le escribe en un momento para acomodarla 🙏");
        return true;
      }
      if ((cita.cambios_paciente || 0) >= MAX_CAMBIOS) {
        await pasar(admin, telefono, paciente, `Quiere mover otra vez su cita (ya la movió ${MAX_CAMBIOS} veces)`);
        return true;
      }
      const filas = [];
      for (let i = 0; i < DIAS_A_OFRECER && filas.length < 9; i++) {
        const fecha = sumarDias(hoyDurango(), i);
        const r = await disponibilidad(admin, fecha);
        const n = Array.isArray(r.horarios_libres) ? r.horarios_libres.length : 0;
        if (n) filas.push({ id: idBoton("dia", cita.id, fecha), titulo: diaCorto(fecha), descripcion: `${n} horario${n === 1 ? "" : "s"} libre${n === 1 ? "" : "s"}` });
      }
      if (!filas.length) {
        await pasar(admin, telefono, paciente, "Quiere cambiar su cita y no hay lugar en 2 semanas");
        return true;
      }
      filas.push({ id: idBoton("hablar", cita.id), titulo: "Hablar con Dra. Gaby", descripcion: "Si ningún día le acomoda" });
      const texto = `Su cita es el ${cuando(cita.inicio)}. ¿Para qué día la cambiamos?`;
      const envio = await enviarLista(telefono, texto, "Ver días", filas, "Días con lugar");
      await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Lista de días]`);
      return true;
    }

    case "dia": {
      if (!esFechaValida(b.dato) || cita.tipo !== "valoracion") return true;
      const r = await disponibilidad(admin, b.dato);
      const libres = Array.isArray(r.horarios_libres) ? r.horarios_libres : [];
      if (!libres.length) {
        await decir(admin, telefono, paciente.id, "Ese día ya se llenó 🙏");
        return atenderBotonCita(admin, telefono, idBoton("cambiar", cita.id));
      }
      // Máximo 10 filas: si hay más horas, se reparten a lo largo del día
      const horas = libres.length <= 10 ? libres : Array.from({ length: 10 }, (_, i) => libres[Math.round((i * (libres.length - 1)) / 9)]);
      const texto = `Horarios libres el ${formatFechaLarga(b.dato)}. Toque el que le acomode:`;
      const envio = await enviarLista(
        telefono,
        texto,
        "Ver horarios",
        horas.map((h) => ({ id: idBoton("hora", cita.id, `${b.dato}T${h}`), titulo: h, descripcion: diaCorto(b.dato) })),
        "Horarios"
      );
      await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Lista de horarios]`);
      return true;
    }

    case "hora": {
      const [fecha, hora] = b.dato.split("T");
      const [h, m] = String(hora || "").split(":").map(Number);
      if (!esFechaValida(fecha) || !Number.isFinite(h) || cita.tipo !== "valoracion") return true;
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
      const r = await disponibilidad(admin, fecha);
      if (!Array.isArray(r.horarios_libres) || !r.horarios_libres.includes(formatHora(inicioMin))) {
        await decir(admin, telefono, paciente.id, "Ese horario se acaba de ocupar 🙏 Le muestro los que siguen libres:");
        return atenderBotonCita(admin, telefono, idBoton("dia", cita.id, fecha));
      }
      const antes = cuando(cita.inicio);
      const { error } = await admin
        .from("citas")
        .update({
          inicio: nuevoInicio,
          fin: isoDesde(fecha, inicioMin + SLOT_MIN),
          cambios_paciente: (cita.cambios_paciente || 0) + 1,
          recordatorio_enviado_en: null,
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
        ...(cita.tipo === "valoracion" ? [{ id: idBoton("cambiar", cita.id), titulo: "Mejor cambiarla" }] : []),
        { id: idBoton("conservar", cita.id), titulo: "No, la conservo" },
      ]);
      await guardarSalida(admin, telefono, paciente.id, envio, `${texto}\n[Botones: Sí, cancelar · No, la conservo]`);
      return true;
    }

    case "cancelar_si": {
      await admin.from("citas").update({ estado: "cancelada", notas: anotar(cita.notas, "El paciente la canceló por WhatsApp") }).eq("id", cita.id);
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
