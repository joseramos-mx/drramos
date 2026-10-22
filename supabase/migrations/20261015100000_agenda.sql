-- ─────────────────────────────────────────────────────────────
--  Agenda del consultorio (/agenda)
--
--  La agenda ES la fuente del CRM: la Dra. Gaby sólo agenda y, al
--  terminar cada cita, marca en la misma cita si se presentó, qué se
--  cotizó, qué se hizo y cuánto pagó. Nadie llena "perfiles".
--
--  * pacientes: se crean solos al agendar a alguien nuevo (y después
--    desde WhatsApp). `lead_id` liga al formulario de la landing.
--  * citas: una fila por cita. Dato comercial, NO expediente clínico.
--
--  RLS: sólo personal autenticado (mismos usuarios del /crm). Anon no
--  ve ni escribe nada aquí.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  whatsapp text,
  origen text,
  origen_detalle text,
  lead_id uuid references public.leads (id) on delete set null,
  constraint pacientes_origen_check check (origen is null or origen in (
    'formulario', 'anuncio', 'facebook', 'instagram', 'google',
    'web', 'doctoralia', 'recomendacion', 'ya_paciente', 'otro'
  ))
);

create index if not exists pacientes_nombre_idx on public.pacientes (lower(nombre));
create index if not exists pacientes_whatsapp_idx on public.pacientes (whatsapp);
create unique index if not exists pacientes_lead_id_key on public.pacientes (lead_id) where lead_id is not null;

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paciente_id uuid not null references public.pacientes (id) on delete restrict,
  -- Columna de la agenda. Hoy 'felipe' y 'gaby'; a futuro más dentistas.
  dentista text not null,
  inicio timestamptz not null,
  fin timestamptz not null,
  tipo text not null default 'valoracion',
  estado text not null default 'agendada',
  -- Cierre de la cita
  cotizado text[],
  cotizado_monto numeric(12, 2),
  realizado text[],
  pagado_monto numeric(12, 2),
  notas text,
  -- false = sólo se marcó "vino" con la palomita rápida; falta contestar
  -- cotizado / hecho / pagado (aparece en "Citas sin cerrar")
  cierre_completo boolean not null default false,
  constraint citas_rango_check check (fin > inicio),
  constraint citas_tipo_check check (tipo in (
    'valoracion', 'tratamiento', 'revision', 'cirugia', 'urgencia'
  )),
  constraint citas_estado_check check (estado in (
    'agendada', 'asistio', 'no_asistio', 'cancelada'
  )),
  constraint citas_montos_check check (
    (cotizado_monto is null or cotizado_monto >= 0)
    and (pagado_monto is null or pagado_monto >= 0)
  )
);

create index if not exists citas_inicio_idx on public.citas (inicio);
create index if not exists citas_paciente_idx on public.citas (paciente_id);

-- Pendientes del día (lo que la Dra. Gaby anota al pie de la libreta:
-- "llamar a…", "factura Sr. …"). Texto corto con palomita de hecho.
create table if not exists public.pendientes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fecha date not null,
  texto text not null check (length(texto) between 1 and 300),
  hecho boolean not null default false
);

create index if not exists pendientes_fecha_idx on public.pendientes (fecha);

alter table public.pacientes enable row level security;
alter table public.citas enable row level security;

create policy "staff gestiona pacientes"
  on public.pacientes for all to authenticated
  using (true) with check (true);

create policy "staff gestiona citas"
  on public.citas for all to authenticated
  using (true) with check (true);

alter table public.pendientes enable row level security;

create policy "staff gestiona pendientes"
  on public.pendientes for all to authenticated
  using (true) with check (true);
