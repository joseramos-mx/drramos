-- ─────────────────────────────────────────────────────────────
--  ¿A qué mensaje contesta? y mensajes al instante (2026-11-19)
--  Cuando el paciente contesta "citando" un mensaje (o toca un botón de
--  uno), WhatsApp manda el id de ese mensaje. Se guarda para mostrar en
--  el chat a cuál se refiere.
--  * whatsapp_mensajes.responde_a: wa_id del mensaje citado
--  * Realtime en whatsapp_mensajes: la app se entera al instante de cada
--    mensaje nuevo (antes refrescaba cada 10-15 s). Respeta RLS (sólo
--    usuarios con sesión pueden leer).
--  Correr DESPUÉS de 20261119000000_estado_mensajes.sql. No borra nada.
--  Antes de correrla, los mensajes se siguen guardando (sin este dato).
-- ─────────────────────────────────────────────────────────────

alter table public.whatsapp_mensajes
  add column if not exists responde_a text;

-- Realtime (si ya estaba agregada, no hace nada)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'whatsapp_mensajes'
  ) then
    alter publication supabase_realtime add table public.whatsapp_mensajes;
  end if;
end $$;
