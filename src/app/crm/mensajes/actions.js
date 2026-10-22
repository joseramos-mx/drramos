"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as clienteSesion } from "@/utils/supabase/server";
import { enviarImagen, enviarTexto, ventanaAbierta } from "@/lib/whatsapp";
import { normalizarTelefono } from "@/lib/telefono";
import { guardarMedia, supabaseServicio } from "@/lib/mensajes-servidor";
import { ETIQUETAS } from "./lib";

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
