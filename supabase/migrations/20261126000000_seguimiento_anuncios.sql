-- Seguimiento a quien llegó de un anuncio de Meta y no agendó (correr después de 20261121000000_reportes.sql):
--  * ~22 h después de su mensaje (dentro de las 24 h): texto con los botones de inicio, una vez
--  * día 3: plantilla seguimiento_anuncio (con la foto de su anuncio), una vez (requiere PLANTILLAS_V2=1)
-- Lo manda /api/seguimiento-anuncios (Vercel Cron, cada hora).

alter table public.pacientes add column if not exists seguimiento_anuncio_22h_en timestamptz;
alter table public.pacientes add column if not exists seguimiento_anuncio_d3_en timestamptz;

-- Interruptor en Ajustes → Mensajes automáticos. APAGADO por omisión: se prende a mano.
alter table public.asistente_config add column if not exists seguimiento_anuncios boolean not null default false;
