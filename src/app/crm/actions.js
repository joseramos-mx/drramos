"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Server actions del CRM. Todas usan el cliente SSR con anon key
 * + sesión del usuario. RLS de Supabase decide qué puede leer y
 * actualizar.
 */

// ─────────────────────────────────────────────────────────────
//  Auth
// ─────────────────────────────────────────────────────────────
export async function loginAction(_prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/crm");
}

export async function signOutAction() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect("/crm/login");
}

// ─────────────────────────────────────────────────────────────
//  Leads · update
// ─────────────────────────────────────────────────────────────
const ESTADOS_VALIDOS = new Set([
  "nuevo",
  "contactado",
  "cita",
  "cerrado",
  "perdido",
]);

export async function updateEstadoAction(formData) {
  const id = String(formData.get("id") || "");
  const estado = String(formData.get("estado") || "");

  if (!id || !ESTADOS_VALIDOS.has(estado)) {
    return { error: "Datos inválidos." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("leads")
    .update({ estado })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/crm");
  return { ok: true };
}

export async function updateNotasAction(_prevState, formData) {
  const id = String(formData.get("id") || "");
  const notas = String(formData.get("notas") ?? "").trim();

  if (!id) {
    return { error: "Lead inválido." };
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase
    .from("leads")
    .update({ notas: notas || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/crm");
  return { ok: true, savedAt: Date.now() };
}
