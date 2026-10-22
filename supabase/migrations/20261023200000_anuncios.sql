-- Qué anuncio de Meta trajo a cada paciente. Cuando alguien toca un anuncio de
-- "Enviar mensaje por WhatsApp", su primer mensaje trae el id del anuncio
-- (referral.source_id) y su título. Se guarda el PRIMERO (el que lo trajo).
-- Correr después de 20261023100000_seguimientos.sql.
alter table public.pacientes add column if not exists anuncio_id text;
alter table public.pacientes add column if not exists anuncio_titulo text;
create index if not exists pacientes_anuncio_idx on public.pacientes (anuncio_id) where anuncio_id is not null;
