"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as clienteSesion } from "@/utils/supabase/server";
import { esAdmin, supabaseServicio } from "@/lib/mensajes-servidor";
import { normalizarTelefono } from "@/lib/telefono";

async function sesion() {
  const supabase = clienteSesion(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Guarda el reporte con su contexto, para entender qué pasó sin pedirle más detalles:
 * modo del asistente, quién tenía el chat y los últimos 15 mensajes (con quién los mandó).
 */
export async function reportarProblemaAction({ telefono, texto, pagina }) {
  const { user } = await sesion();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const limpio = String(texto || "").trim().slice(0, 2000);
  if (!limpio) return { error: "Escribe qué pasó." };
  const tel = telefono ? normalizarTelefono(telefono) : null;

  const admin = supabaseServicio();
  const contexto = { pagina: pagina ? String(pagina).slice(0, 200) : null, reportado: new Date().toISOString() };
  try {
    const { data: config } = await admin.from("asistente_config").select("modo, libres").eq("id", 1).maybeSingle();
    contexto.modo_asistente = config?.modo || null;
    contexto.respuestas_propias = config?.libres || null;
    if (tel) {
      const { data: fichas } = await admin.from("pacientes").select("id, nombre, atiende, atiende_desde, etiquetas").eq("whatsapp", tel).order("created_at");
      contexto.fichas = fichas || [];
      const { data: mensajes } = await admin
        .from("whatsapp_mensajes")
        .select("enviado_en, direccion, via, tipo, texto, estado, estado_error")
        .eq("telefono", tel)
        .order("enviado_en", { ascending: false })
        .limit(15);
      contexto.ultimos_mensajes = (mensajes || []).reverse().map((m) => ({ ...m, texto: m.texto ? String(m.texto).slice(0, 400) : null }));
      const { data: registro } = await admin
        .from("asistente_registro")
        .select("created_at, accion, detalle")
        .eq("telefono", tel)
        .order("created_at", { ascending: false })
        .limit(8);
      contexto.asistente_registro = registro || [];
    }
  } catch (e) {
    contexto.error_contexto = String(e?.message || e).slice(0, 200);
  }

  const { error } = await admin.from("reportes").insert({ autor: user.email, telefono: tel, texto: limpio, contexto });
  if (error) return { error: "No se pudo guardar. Intenta de nuevo o mándaselo a Jesús por WhatsApp." };
  revalidatePath("/crm/mensajes/reportes");
  return { ok: true };
}

/** Marcar un reporte como resuelto (o volverlo a abrir). Sólo administradores. */
export async function marcarReporteAction(id, estado) {
  const { supabase, user } = await sesion();
  if (!user || !esAdmin(user.email)) return { error: "Sin permiso." };
  if (!["nuevo", "resuelto"].includes(estado)) return { error: "Opción no válida." };
  const { error } = await supabase.from("reportes").update({ estado }).eq("id", id);
  if (error) return { error: "No se pudo cambiar." };
  revalidatePath("/crm/mensajes/reportes");
  return { ok: true };
}
