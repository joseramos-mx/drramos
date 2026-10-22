-- ─────────────────────────────────────────────────────────────
--  Asistente virtual de WhatsApp (Claude)
--
--  El asistente lee cada mensaje nuevo, contesta dudas comunes con el
--  manual del consultorio, agenda VALORACIONES de 30 min y pasa a la
--  Dra. Gaby lo que no debe contestar (urgencias, quejas, preguntas
--  médicas, casos en tratamiento…).
--
--  * asistente_config: modo general (automático / borrador / apagado).
--  * pacientes.atiende: quién lleva cada chat. Si la Dra. Gaby contesta
--    o el asistente le pasa el caso, queda en 'humano' y el asistente
--    no se mete hasta que ella lo devuelva (o pasen 8 h sin que escriba).
--  * asistente_borradores: en modo borrador, la respuesta espera a que
--    ella la apruebe.
--  * asistente_registro: bitácora de lo que hizo (para revisar y medir).
--
--  Correr DESPUÉS de 20261021000000_mensajes_app.sql.
-- ─────────────────────────────────────────────────────────────

-- Los mensajes que manda el asistente se guardan con via 'asistente'
alter table public.whatsapp_mensajes drop constraint if exists whatsapp_mensajes_via_check;
alter table public.whatsapp_mensajes
  add constraint whatsapp_mensajes_via_check
  check (via in ('paciente', 'app', 'api', 'historial', 'asistente'));

alter table public.pacientes
  add column if not exists atiende text not null default 'asistente',
  add column if not exists atiende_desde timestamptz;
alter table public.pacientes drop constraint if exists pacientes_atiende_check;
alter table public.pacientes
  add constraint pacientes_atiende_check check (atiende in ('asistente', 'humano'));

create table if not exists public.asistente_config (
  id int primary key default 1 check (id = 1),
  modo text not null default 'automatico' check (modo in ('automatico', 'borrador', 'apagado')),
  updated_at timestamptz not null default now()
);
insert into public.asistente_config (id) values (1) on conflict (id) do nothing;

create table if not exists public.asistente_borradores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  telefono text not null,
  texto text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'enviado', 'descartado'))
);
create index if not exists asistente_borradores_tel_idx on public.asistente_borradores (telefono, estado);

create table if not exists public.asistente_registro (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  telefono text not null,
  accion text not null,          -- respondio | borrador | agendo | paso_a_humano | error | omitido
  detalle jsonb
);
create index if not exists asistente_registro_tel_idx on public.asistente_registro (telefono, created_at);

alter table public.asistente_config enable row level security;
alter table public.asistente_borradores enable row level security;
alter table public.asistente_registro enable row level security;

create policy "staff lee y cambia el modo del asistente"
  on public.asistente_config for all to authenticated using (true) with check (true);
create policy "staff gestiona borradores"
  on public.asistente_borradores for all to authenticated using (true) with check (true);
create policy "staff lee la bitácora del asistente"
  on public.asistente_registro for select to authenticated using (true);
