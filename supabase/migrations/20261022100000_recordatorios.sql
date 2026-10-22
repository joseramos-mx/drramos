-- Recordatorio automático por WhatsApp un día antes de cada cita
-- (plantilla aprobada `recordatorio_cita`). Lo manda /api/recordatorios
-- una vez al día (Vercel Cron). Correr después de 20261022000000_asistente.sql.

-- Para no mandar dos veces el mismo recordatorio
alter table public.citas add column if not exists recordatorio_enviado_en timestamptz;
alter table public.citas add column if not exists recordatorio_error text;

-- Interruptor en Ajustes (prendido por omisión)
alter table public.asistente_config add column if not exists recordatorios boolean not null default true;

-- Los recordatorios se guardan en el chat con via 'recordatorio'
alter table public.whatsapp_mensajes drop constraint if exists whatsapp_mensajes_via_check;
alter table public.whatsapp_mensajes
  add constraint whatsapp_mensajes_via_check
  check (via in ('paciente', 'app', 'api', 'historial', 'asistente', 'recordatorio'));
