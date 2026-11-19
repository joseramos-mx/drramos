-- ─────────────────────────────────────────────────────────────
--  ¿Le llegó el mensaje? (2026-11-19)
--  Meta avisa por el webhook si cada mensaje que mandamos se entregó,
--  se leyó o falló (y por qué). Antes se ignoraba: la app decía
--  "enviado" aunque al paciente nunca le llegara.
--  * whatsapp_mensajes.estado: sent | delivered | read | failed
--  * whatsapp_mensajes.estado_error: motivo en palabras sencillas
--  * whatsapp_mensajes.estado_en: cuándo avisó Meta
--  Correr DESPUÉS de 20261118000000_arreglos_mensajes.sql. No borra nada.
-- ─────────────────────────────────────────────────────────────

alter table public.whatsapp_mensajes
  add column if not exists estado text
    check (estado is null or estado in ('sent', 'delivered', 'read', 'failed')),
  add column if not exists estado_error text
    check (estado_error is null or length(estado_error) <= 300),
  add column if not exists estado_en timestamptz;
