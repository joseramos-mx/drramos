-- ─────────────────────────────────────────────────────────────
--  WhatsApp (coexistencia vía 360dialog) — SÓLO LECTURA
--
--  La Dra. Gaby sigue usando su app de WhatsApp Business. Por la API
--  nos llega una copia de cada mensaje:
--    * entrantes del paciente           (direccion 'entrada')
--    * los que ella manda desde la app  (direccion 'salida', via 'app')
--    * el historial de hasta 6 meses al conectar (via 'historial')
--  Con eso se crea el paciente solo, se detecta su fuente ("(ref G1)" o
--  el click del anuncio), y se mide en cuánto tiempo se le contestó.
--
--  Escribe SÓLO el webhook del servidor (/api/whatsapp) con la
--  service_role; el personal autenticado sólo lee. Anon: nada.
--  Son conversaciones de salud: no se mandan a terceros.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.whatsapp_mensajes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  wa_id text not null unique,            -- id del mensaje en WhatsApp (evita duplicados)
  telefono text not null,                -- del paciente, formato 52XXXXXXXXXX
  direccion text not null check (direccion in ('entrada', 'salida')),
  via text not null check (via in ('paciente', 'app', 'api', 'historial')),
  tipo text,                             -- text, image, audio…
  texto text,
  enviado_en timestamptz not null,       -- hora del mensaje según WhatsApp
  paciente_id uuid references public.pacientes (id) on delete set null,
  ctwa_clid text,                        -- click del anuncio (para la API de Conversiones)
  referencia jsonb                       -- datos del anuncio que abrió el chat
);

create index if not exists whatsapp_mensajes_tel_idx on public.whatsapp_mensajes (telefono, enviado_en);
create index if not exists whatsapp_mensajes_paciente_idx on public.whatsapp_mensajes (paciente_id);

-- Para la API de Conversiones y para no perder de qué anuncio vino
alter table public.pacientes
  add column if not exists whatsapp_ctwa_clid text,
  add column if not exists primer_mensaje_en timestamptz;

-- Los teléfonos se guardan normalizados (52 + 10 dígitos, ver
-- src/lib/telefono.js) para encontrar al mismo paciente desde la agenda
-- y desde WhatsApp. Ya existe pacientes_whatsapp_idx (migración agenda).

-- Eventos crudos de los primeros días, para revisar formatos raros.
-- Se puede vaciar cuando todo esté estable.
create table if not exists public.whatsapp_eventos (
  id uuid primary key default gen_random_uuid(),
  recibido_en timestamptz not null default now(),
  campo text,
  payload jsonb not null
);

alter table public.whatsapp_mensajes enable row level security;
alter table public.whatsapp_eventos enable row level security;

create policy "staff lee mensajes de whatsapp"
  on public.whatsapp_mensajes for select to authenticated using (true);
create policy "staff lee eventos de whatsapp"
  on public.whatsapp_eventos for select to authenticated using (true);
