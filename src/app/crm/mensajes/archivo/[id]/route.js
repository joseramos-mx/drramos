import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { bajarMedia } from "@/lib/whatsapp";
import { BUCKET, guardarMedia, supabaseServicio } from "@/lib/mensajes-servidor";

export const dynamic = "force-dynamic";

/**
 * Abre la foto/audio/documento de un mensaje (sólo con sesión). Si
 * todavía no se había bajado de Meta, lo baja y lo guarda primero.
 * Responde con un link firmado de 10 minutos al bucket privado.
 */
export async function GET(_request, { params }) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autorizado", { status: 401 });

  const { data: m } = await supabase
    .from("whatsapp_mensajes")
    .select("id, wa_id, telefono, media_id, media_ruta")
    .eq("id", id)
    .maybeSingle();
  if (!m) return new Response("No encontrado", { status: 404 });

  let ruta = m.media_ruta;
  if (!ruta && m.media_id) {
    const admin = supabaseServicio();
    const archivo = await bajarMedia(m.media_id);
    ruta = archivo && (await guardarMedia(admin, m.telefono, m.wa_id, archivo.buffer, archivo.mime));
    if (ruta) await admin.from("whatsapp_mensajes").update({ media_ruta: ruta }).eq("id", m.id);
  }
  if (!ruta) return new Response("El archivo ya no está disponible en WhatsApp.", { status: 404 });

  const { data: firmado } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 600);
  if (!firmado?.signedUrl) return new Response("No se pudo abrir el archivo.", { status: 500 });
  return Response.redirect(firmado.signedUrl, 302);
}
