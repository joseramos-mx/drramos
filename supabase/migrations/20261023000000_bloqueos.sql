-- Días u horas sin consulta (vacaciones, congresos, días festivos) y
-- EVENTOS de la Dra. Gaby (junta, laboratorio, proveedor…: `evento` = true,
-- con nombre en `motivo`, siempre con horas). Se ponen desde la agenda
-- (tocar una hora vacía, o Calendario → Bloquear). El
-- asistente y los botones de "Mi cita" no ofrecen esos horarios; ella sí
-- puede agendar encima a mano. Correr después de 20261022100000_recordatorios.sql.

create table if not exists public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  desde_fecha date not null,
  hasta_fecha date not null,
  -- null y null = todo el día; si no, minutos del día (sólo para un solo día)
  desde_min int check (desde_min between 0 and 1440),
  hasta_min int check (hasta_min between 0 and 1440),
  motivo text not null default 'Sin consulta' check (length(motivo) between 1 and 80),
  evento boolean not null default false,
  -- Nota libre de la Dra. Gaby, con sus palabras ("Congreso en Monterrey, regreso el jueves")
  nota text check (nota is null or length(nota) <= 200),
  check (not evento or desde_min is not null),
  check (hasta_fecha >= desde_fecha),
  check (
    (desde_min is null and hasta_min is null)
    or (desde_min is not null and hasta_min is not null and desde_min < hasta_min and desde_fecha = hasta_fecha)
  )
);

create index if not exists bloqueos_fechas_idx on public.bloqueos (desde_fecha, hasta_fecha);

alter table public.bloqueos enable row level security;

create policy "staff gestiona bloqueos"
  on public.bloqueos for all to authenticated
  using (true) with check (true);

-- Citas a las que el consultorio les avisó por un bloqueo (reagendar o cancelada).
-- Se limpia sola si el paciente responde (elige horario, cancela, pide hablar) o si
-- la Dra. Gaby la mueve/cierra. Si a la mañana siguiente sigue igual, se le deja un
-- pendiente en su libreta para llamarle (aviso_recordado_en = ya se le recordó).
alter table public.citas add column if not exists aviso_bloqueo_en timestamptz;
alter table public.citas add column if not exists aviso_recordado_en timestamptz;
create index if not exists citas_aviso_bloqueo_idx on public.citas (aviso_bloqueo_en) where aviso_bloqueo_en is not null;
