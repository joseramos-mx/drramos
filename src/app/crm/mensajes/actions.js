"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as clienteSesion } from "@/utils/supabase/server";
import { enviarArchivo, enviarImagen, enviarPlantilla, enviarTexto, ventanaAbierta } from "@/lib/whatsapp";
import { normalizarTelefono } from "@/lib/telefono";
import { BUCKET, guardarMedia, supabaseServicio } from "@/lib/mensajes-servidor";
import { ETIQUETAS } from "./lib";
import { PLANTILLAS, rellenar } from "./plantillas";
import { ARCHIVOS } from "./archivos";
import { ETIQUETAS_DATO, ORIGINALES, VARIABLES, deCorchetes } from "@/lib/asistente/respuestas";
import { filtroDuro } from "@/lib/asistente";
import { redirect } from "next/navigation";

const FOTO_MAX = 4 * 1024 * 1024;
const FOTO_TIPOS = ["image/jpeg", "image/png"];

async function sesion() {
  const supabase = clienteSesion(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Regla de Meta: sólo se contesta libre dentro de 24 h del último mensaje del paciente. */
async function ventanaDe(supabase, telefono) {
  const { data: ultimo } = await supabase
    .from("whatsapp_mensajes")
    .select("enviado_en")
    .eq("telefono", telefono)
    .eq("direccion", "entrada")
    .order("enviado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ventanaAbierta(ultimo?.enviado_en);
}

const FUERA_DE_VENTANA = {
  error: "Pasaron más de 24 h desde su último mensaje: sólo se puede mandar una plantilla aprobada.",
};

/** Guarda lo que mandó el consultorio (service_role: el personal sólo tiene lectura). */
async function guardarSalida(admin, fila) {
  const { data: paciente } = await admin.from("pacientes").select("id").eq("whatsapp", fila.telefono).limit(1).maybeSingle();
  // Si ella contesta, el chat es suyo: el asistente no se mete (8 h desde su último mensaje)
  if (paciente) {
    await admin.from("pacientes").update({ atiende: "humano", atiende_desde: new Date().toISOString() }).eq("id", paciente.id);
    // Si tenía un aviso por bloqueo sin resolver, ella ya lo está atendiendo
    await admin.from("citas").update({ aviso_bloqueo_en: null }).eq("paciente_id", paciente.id).not("aviso_bloqueo_en", "is", null);
  }
  await admin.from("whatsapp_mensajes").upsert(
    { ...fila, direccion: "salida", via: "api", enviado_en: new Date().toISOString(), paciente_id: paciente?.id || null },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  revalidatePath(`/crm/mensajes/${fila.telefono}`);
  revalidatePath("/crm/mensajes");
}

/**
 * Contestar a un paciente desde la bandeja. Sólo personal con sesión.
 * El mensaje se manda por la Cloud API y se guarda como 'salida' / 'api'.
 */
export async function enviarMensajeAction(_prev, formData) {
  const telefono = normalizarTelefono(formData.get("telefono"));
  const texto = String(formData.get("texto") || "").trim();
  if (!telefono || !texto) return { error: "Escribe un mensaje." };

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  if (!(await ventanaDe(supabase, telefono))) return FUERA_DE_VENTANA;

  const res = await enviarTexto(telefono, texto);
  if (res.error) return res;

  await guardarSalida(supabaseServicio(), { wa_id: res.wa_id || `local-${Date.now()}`, telefono, tipo: "text", texto });
  return { ok: true, savedAt: Date.now() };
}

/** Manda una foto (ya reducida en el navegador) con texto opcional. */
export async function enviarFotoAction(_prev, formData) {
  const telefono = normalizarTelefono(formData.get("telefono"));
  const foto = formData.get("foto");
  const pie = String(formData.get("pie") || "").trim();
  if (!telefono || !foto || typeof foto === "string" || !foto.size) return { error: "Elige una foto." };
  if (!FOTO_TIPOS.includes(foto.type)) return { error: "Sólo se pueden mandar fotos JPG o PNG." };
  if (foto.size > FOTO_MAX) return { error: "La foto pesa demasiado (máximo 4 MB)." };

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  if (!(await ventanaDe(supabase, telefono))) return FUERA_DE_VENTANA;

  const buffer = Buffer.from(await foto.arrayBuffer());
  const res = await enviarImagen(telefono, buffer, foto.type, pie);
  if (res.error) return res;

  const admin = supabaseServicio();
  const waId = res.wa_id || `local-${Date.now()}`;
  const ruta = await guardarMedia(admin, telefono, waId, buffer, foto.type);
  await guardarSalida(admin, {
    wa_id: waId,
    telefono,
    tipo: "image",
    texto: pie || null,
    media_id: res.media_id,
    media_mime: foto.type,
    media_ruta: ruta,
  });
  return { ok: true, savedAt: Date.now() };
}

/** Pone o quita una etiqueta del paciente (un toque). */
export async function alternarEtiquetaAction(pacienteId, etiqueta) {
  if (!ETIQUETAS.some((e) => e.id === etiqueta)) return { error: "Etiqueta desconocida." };
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const { data: p, error } = await supabase.from("pacientes").select("etiquetas, whatsapp").eq("id", pacienteId).maybeSingle();
  if (error || !p) return { error: "No encontramos al paciente." };
  const actuales = p.etiquetas || [];
  const etiquetas = actuales.includes(etiqueta) ? actuales.filter((e) => e !== etiqueta) : [...actuales, etiqueta];
  const { error: e2 } = await supabase.from("pacientes").update({ etiquetas }).eq("id", pacienteId);
  if (e2) return { error: "No se pudo guardar la etiqueta." };

  if (p.whatsapp) revalidatePath(`/crm/mensajes/${p.whatsapp}`);
  revalidatePath("/crm/mensajes");
  return { ok: true, etiquetas };
}

/** Guarda este aparato para recibir avisos de mensajes nuevos. */
export async function guardarAvisoAction(suscripcion, aparato) {
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const endpoint = suscripcion?.endpoint;
  const { p256dh, auth } = suscripcion?.keys || {};
  if (!endpoint || !p256dh || !auth) return { error: "El navegador no dio los datos para avisos." };

  const { error } = await supabase
    .from("push_suscripciones")
    .upsert({ user_id: user.id, endpoint, p256dh, auth, aparato: String(aparato || "").slice(0, 80) }, { onConflict: "endpoint" });
  if (error) return { error: "No se pudo activar. Intenta de nuevo." };
  return { ok: true };
}

/** Apaga los avisos de este aparato. */
export async function borrarAvisoAction(endpoint) {
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  await supabase.from("push_suscripciones").delete().eq("endpoint", String(endpoint || ""));
  return { ok: true };
}

/** Busca pacientes (de la agenda o que ya escribieron) por nombre o teléfono, para "Nuevo chat". */
export async function buscarPacientesAction(q) {
  const { supabase, user } = await sesion();
  const texto = String(q || "").trim();
  if (!user || texto.length < 2) return [];
  const digitos = texto.replace(/\D/g, "");
  const filtro = digitos.length >= 3 ? `whatsapp.ilike.%${digitos}%` : `nombre.ilike.%${texto.replace(/[%,()]/g, "")}%`;
  const { data } = await supabase.from("pacientes").select("id, nombre, whatsapp").or(filtro).not("whatsapp", "is", null).limit(8);
  return data || [];
}

/**
 * "Nuevo chat" con alguien que no está en la lista: se guarda su nombre y
 * WhatsApp (si ya existía ese número, se usa el que hay) y se abre su chat.
 */
export async function crearContactoAction(_prev, formData) {
  const nombre = String(formData.get("nombre") || "").trim().slice(0, 120);
  const telefono = normalizarTelefono(formData.get("telefono"));
  if (!nombre) return { error: "Escribe el nombre." };
  if (!telefono || telefono.length !== 12) return { error: "Revisa el número: deben ser 10 dígitos." };

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { data: existe } = await supabase.from("pacientes").select("id").eq("whatsapp", telefono).limit(1).maybeSingle();
  if (!existe) {
    const { error } = await supabase.from("pacientes").insert({ nombre, whatsapp: telefono });
    if (error) return { error: "No se pudo guardar. Intenta de nuevo." };
  }
  redirect(`/crm/mensajes/${telefono}`);
}

/** Manda un mensaje aprobado (plantilla) y lo deja en el chat. */
export async function enviarPlantillaAction(_prev, formData) {
  const telefono = normalizarTelefono(formData.get("telefono"));
  const plantilla = PLANTILLAS.find((p) => p.nombre === formData.get("plantilla"));
  if (!telefono || !plantilla) return { error: "Elige un mensaje." };
  const valores = plantilla.campos.map((_, i) => String(formData.get(`v${i}`) || "").trim());
  if (valores.some((v) => !v)) return { error: "Llena todos los datos del mensaje." };

  const { user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const res = await enviarPlantilla(telefono, plantilla.nombre, valores);
  if (res.error) return res;
  await guardarSalida(supabaseServicio(), {
    wa_id: res.wa_id || `local-${Date.now()}`,
    telefono,
    tipo: "template",
    texto: rellenar(plantilla.texto, valores),
  });
  return { ok: true, savedAt: Date.now() };
}


/**
 * Paso 1 de video/documento: revisa todo y da un permiso de subida
 * directo del celular al almacén privado (sin pasar por Vercel).
 */
export async function prepararArchivoAction(telefonoRaw, tipo, mime, tamano, nombre) {
  const telefono = normalizarTelefono(telefonoRaw);
  const regla = ARCHIVOS[tipo];
  if (!telefono || !regla) return { error: "Archivo no permitido." };
  if (!regla.tipos.includes(mime)) {
    return {
      error: { video: "El video debe ser MP4 (el normal del celular).", audio: "No se pudo preparar la nota de voz." }[tipo] || "El documento debe ser PDF, Word o Excel.",
    };
  }
  if (tamano > regla.max) {
    return {
      error: { video: "El video pesa más de 16 MB. Manda uno más corto (≈1 minuto).", audio: "La nota de voz es demasiado larga." }[tipo] || "El documento pesa más de 25 MB.",
    };
  }

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  if (!(await ventanaDe(supabase, telefono))) return FUERA_DE_VENTANA;

  const ext =
    String(nombre || "").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) ||
    { video: "mp4", audio: "ogg", document: "pdf" }[tipo];
  const ruta = `${telefono}/salida-${Date.now()}.${ext}`;
  const { data, error } = await supabaseServicio().storage.from(BUCKET).createSignedUploadUrl(ruta);
  if (error || !data?.token) return { error: "No se pudo preparar el envío. Intenta de nuevo." };
  return { ok: true, ruta, token: data.token };
}

/** Paso 2: ya subido; WhatsApp lo baja con un link temporal y se guarda en el chat. */
export async function enviarArchivoAction(telefonoRaw, tipo, ruta, mime, nombre, pie) {
  const telefono = normalizarTelefono(telefonoRaw);
  if (!telefono || !ARCHIVOS[tipo] || !String(ruta).startsWith(`${telefono}/salida-`)) return { error: "Archivo no válido." };

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  if (!(await ventanaDe(supabase, telefono))) return FUERA_DE_VENTANA;

  const admin = supabaseServicio();
  const { data: firmado } = await admin.storage.from(BUCKET).createSignedUrl(ruta, 60 * 60);
  if (!firmado?.signedUrl) return { error: "No encontramos el archivo subido. Intenta de nuevo." };

  const res = await enviarArchivo(telefono, tipo, firmado.signedUrl, { pie, nombre, voz: tipo === "audio" && mime === "audio/ogg" });
  if (res.error) return res;
  await guardarSalida(admin, {
    wa_id: res.wa_id || `local-${Date.now()}`,
    telefono,
    tipo,
    texto: tipo === "audio" ? null : pie?.trim() || (tipo === "document" ? nombre : null),
    media_mime: mime,
    media_ruta: ruta,
  });
  return { ok: true, savedAt: Date.now() };
}

/** "Tomar el chat" (lo atiende ella) o "Devolver al asistente". */
export async function cambiarQuienAtiendeAction(pacienteId, quien) {
  if (!["asistente", "humano"].includes(quien)) return { error: "Opción no válida." };
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { data: p, error } = await supabase
    .from("pacientes")
    .update({ atiende: quien, atiende_desde: quien === "humano" ? new Date().toISOString() : null })
    .eq("id", pacienteId)
    .select("whatsapp")
    .maybeSingle();
  if (error) return { error: "No se pudo cambiar. Intenta de nuevo." };
  if (p?.whatsapp) revalidatePath(`/crm/mensajes/${p.whatsapp}`);
  return { ok: true };
}

/** Modo borrador: mandar tal cual, o descartar, la respuesta que preparó el asistente. */
export async function resolverBorradorAction(borradorId, accion) {
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { data: b } = await supabase.from("asistente_borradores").select("id, telefono, texto, estado").eq("id", borradorId).maybeSingle();
  if (!b || b.estado !== "pendiente") return { error: "Ese borrador ya no está pendiente." };

  if (accion === "descartar" || accion === "editar") {
    await supabase.from("asistente_borradores").update({ estado: "descartado" }).eq("id", b.id);
    revalidatePath(`/crm/mensajes/${b.telefono}`);
    return { ok: true };
  }
  if (!(await ventanaDe(supabase, b.telefono))) return FUERA_DE_VENTANA;
  const res = await enviarTexto(b.telefono, b.texto);
  if (res.error) return res;
  const admin = supabaseServicio();
  await admin.from("asistente_borradores").update({ estado: "enviado" }).eq("id", b.id);
  const { data: paciente } = await admin.from("pacientes").select("id").eq("whatsapp", b.telefono).limit(1).maybeSingle();
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: res.wa_id || `local-${Date.now()}`,
      telefono: b.telefono,
      direccion: "salida",
      via: "asistente",
      tipo: "text",
      texto: b.texto,
      enviado_en: new Date().toISOString(),
      paciente_id: paciente?.id || null,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );
  revalidatePath(`/crm/mensajes/${b.telefono}`);
  revalidatePath("/crm/mensajes");
  return { ok: true };
}

/** Prender, poner en borrador o apagar el asistente (para todos los chats). */
export async function cambiarModoAsistenteAction(modo) {
  if (!["automatico", "borrador", "apagado"].includes(modo)) return { error: "Opción no válida." };
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { error } = await supabase.from("asistente_config").upsert({ id: 1, modo, updated_at: new Date().toISOString() });
  if (error) return { error: "No se pudo cambiar. Intenta de nuevo." };
  revalidatePath("/crm/mensajes/ajustes");
  return { ok: true };
}

/** Respuestas propias del asistente: que ella las apruebe, o que vayan solas si el verificador las aprueba. */
export async function cambiarLibresAction(libres) {
  if (!["aprobar", "auto"].includes(libres)) return { error: "Opción no válida." };
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { error } = await supabase.from("asistente_config").update({ libres, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) return { error: "No se pudo cambiar. Intenta de nuevo." };
  revalidatePath("/crm/mensajes/ajustes");
  return { ok: true };
}

/** Ajustes: prender o apagar un mensaje automático (recordatorio, aviso a quien faltó, seguimiento de presupuestos). */
export async function cambiarAutomaticoAction(campo, prendido) {
  if (!["recordatorios", "aviso_falto", "seguimientos", "resenas"].includes(campo)) return { error: "Opción no válida." };
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { error } = await supabase
    .from("asistente_config")
    .update({ [campo]: Boolean(prendido), updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: "No se pudo cambiar. Intenta de nuevo." };
  revalidatePath("/crm/mensajes/ajustes");
  return { ok: true };
}

/**
 * "Mis respuestas": la Dra. Gaby cambia el texto de una respuesta
 * aprobada. Se frena sólo si da precios (regla de oro); otros riesgos
 * se guardan con aviso. Los datos que llena el sistema llegan como [DÍA].
 */
export async function guardarRespuestaAction(id, textoConCorchetes) {
  if (!(id in ORIGINALES)) return { error: "Esa respuesta no existe." };
  const texto = deCorchetes(String(textoConCorchetes || "")).trim();
  if (!texto) return { error: "Escribe la respuesta." };
  if (texto.length > 1000) return { error: "Es demasiado larga (máximo 1000 letras)." };
  const faltan = (VARIABLES[id] || []).filter((v) => !texto.includes(`{${v}}`));
  if (faltan.length) {
    return { error: `Falta ${faltan.map((v) => `[${ETIQUETAS_DATO[v]}]`).join(" y ")}: ahí el sistema pone el dato real. Escríbelo tal cual.` };
  }
  const riesgo = filtroDuro(texto);
  if (riesgo === "menciona dinero" || riesgo === "da un rango o cantidad") {
    return { error: "El asistente no da precios (sólo los $600 de la valoración). Quita la cantidad, por favor." };
  }

  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const original = ORIGINALES[id];
  const { error } =
    texto === original
      ? await supabase.from("asistente_respuestas").delete().eq("id", id)
      : await supabase.from("asistente_respuestas").upsert({ id, texto, updated_at: new Date().toISOString(), updated_by: user.id });
  if (error) return { error: "No se pudo guardar. Intenta de nuevo." };
  revalidatePath("/crm/mensajes/respuestas");
  return { ok: true, aviso: riesgo ? `Se guardó, pero ojo: ${riesgo}. Revísalo con Jesús.` : null };
}

/** Regresa una respuesta a su texto original. */
export async function restaurarRespuestaAction(id) {
  const { supabase, user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const { error } = await supabase.from("asistente_respuestas").delete().eq("id", id);
  if (error) return { error: "No se pudo regresar al original. Intenta de nuevo." };
  revalidatePath("/crm/mensajes/respuestas");
  return { ok: true };
}
