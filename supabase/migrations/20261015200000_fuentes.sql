-- ─────────────────────────────────────────────────────────────
--  Fuentes de pacientes (todas, no sólo Meta)
--
--  * fuentes: cada lugar de donde puede llegar un paciente, con su
--    CÓDIGO. El código va al final del mensaje prellenado de WhatsApp
--    ("…(ref G1)"); al conectar WhatsApp, el primer mensaje dice de qué
--    fuente llegó el paciente sin preguntarle a nadie.
--  * fuente_gastos: gasto mensual de las fuentes de paga que no se leen
--    solas (Doctoralia, Google Ads, volantes…). Meta se lee de su API.
--  * pacientes.fuente_id: la fuente exacta (cuando se conoce).
--
--  `canal` usa los mismos valores que pacientes.origen para agrupar.
--  RLS: sólo personal autenticado.
-- ─────────────────────────────────────────────────────────────

-- pacientes.origen acepta también Google Ads y TikTok
alter table public.pacientes drop constraint if exists pacientes_origen_check;
alter table public.pacientes add constraint pacientes_origen_check check (origen is null or origen in (
  'formulario', 'anuncio', 'google_ads', 'tiktok', 'facebook', 'instagram', 'google',
  'web', 'doctoralia', 'recomendacion', 'ya_paciente', 'otro'
));

create table if not exists public.fuentes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  codigo text not null unique,
  nombre text not null,
  canal text not null,
  de_pago boolean not null default false,
  mensaje text not null,
  activa boolean not null default true,
  constraint fuentes_codigo_check check (codigo ~ '^[A-Z0-9]{1,8}$'),
  constraint fuentes_canal_check check (canal in (
    'formulario', 'anuncio', 'google_ads', 'tiktok', 'facebook', 'instagram', 'google',
    'web', 'doctoralia', 'recomendacion', 'ya_paciente', 'otro'
  ))
);

create table if not exists public.fuente_gastos (
  id uuid primary key default gen_random_uuid(),
  fuente_id uuid not null references public.fuentes (id) on delete cascade,
  mes date not null, -- primer día del mes
  monto numeric(12, 2) not null check (monto >= 0),
  unique (fuente_id, mes)
);

alter table public.pacientes
  add column if not exists fuente_id uuid references public.fuentes (id) on delete set null;

alter table public.fuentes enable row level security;
alter table public.fuente_gastos enable row level security;

create policy "staff gestiona fuentes"
  on public.fuentes for all to authenticated using (true) with check (true);
create policy "staff gestiona gastos de fuentes"
  on public.fuente_gastos for all to authenticated using (true) with check (true);

-- Fuentes iniciales (se pueden editar o agregar más desde /crm/resultados)
insert into public.fuentes (codigo, nombre, canal, de_pago, mensaje) values
  ('G1',  'Ficha de Google Maps',     'google',     false, 'Hola, los encontré en Google y quiero agendar una valoración'),
  ('IG1', 'Bio de Instagram',         'instagram',  false, 'Hola, vengo de Instagram y quiero agendar una valoración'),
  ('FB1', 'Página de Facebook',       'facebook',   false, 'Hola, vengo de su página de Facebook y quiero agendar una valoración'),
  ('WEB', 'Página web',               'web',        false, 'Hola, quiero agendar mi valoración con el Dr. Felipe Ramos'),
  ('DOC', 'Doctoralia',               'doctoralia', false, 'Hola, los vi en Doctoralia y quiero agendar una valoración'),
  ('A1',  'Anuncios de Meta',         'anuncio',    true,  'Hola, vi su anuncio y quiero agendar una valoración')
on conflict (codigo) do nothing;
