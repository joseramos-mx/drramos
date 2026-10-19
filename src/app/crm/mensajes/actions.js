"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as clienteSesion } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { enviarTexto, ventanaAbierta } from "@/lib/whatsapp";
import { normalizarTelefono } from "@/lib/telefono";

/**
 * Contestar a un paciente desde la bandeja. Sólo personal con sesión.
 * El mensaje se manda por la Cloud API y se guarda como 'salida' / 'api'
 * (el guardado usa service_role porque el personal sólo tiene lectura).
 */
export async function enviarMensajeAction(_prev, formData) {
  const telefono = normalizarTelefono(formData.get("telefono"));
  const texto = String(formData.get("texto") || "").trim();
  if (!telefono || !texto) return { error: "Escribe un mensaje." };

  const supabase = clienteSesion(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const { data: ultimo } = await supabase
    .from("whatsapp_mensajes")
    .select("enviado_en")
    .eq("telefono", telefono)
    .eq("direccion", "entrada")
    .order("enviado_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!ventanaAbierta(ultimo?.enviado_en)) {
    return { error: "Pasaron más de 24 h desde su último mensaje: sólo se puede mandar una plantilla aprobada." };
  }

  const res = await enviarTexto(telefono, texto);
  if (res.error) return res;

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: paciente } = await admin.from("pacientes").select("id").eq("whatsapp", telefono).limit(1).maybeSingle();
  await admin.from("whatsapp_mensajes").upsert(
    {
      wa_id: res.wa_id || `local-${Date.now()}`,
      telefono,
      direccion: "salida",
      via: "api",
      tipo: "text",
      texto,
      enviado_en: new Date().toISOString(),
      paciente_id: paciente?.id || null,
    },
    { onConflict: "wa_id", ignoreDuplicates: true }
  );

  revalidatePath(`/crm/mensajes/${telefono}`);
  revalidatePath("/crm/mensajes");
  return { ok: true, savedAt: Date.now() };
}
