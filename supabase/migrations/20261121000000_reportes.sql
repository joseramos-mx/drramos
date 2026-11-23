-- ─────────────────────────────────────────────────────────────
--  Reportes de problemas (2026-11-21)
--  La Dra. Gaby toca "Reportar un problema" (en el ⋮ de un chat o en
--  Ajustes), escribe qué pasó y se guarda junto con el contexto: en qué
--  chat, modo del asistente, quién tenía el chat y los últimos mensajes.
--  Los administradores los leen en Ajustes → Reportes de problemas.
--  Correr DESPUÉS de 20261119100000_responde_a_tiempo_real.sql. No borra nada.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  autor text,
  telefono text,
  texto text not null check (length(texto) between 1 and 2000),
  contexto jsonb,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'resuelto'))
);

create index if not exists reportes_fecha_idx on public.reportes (created_at desc);

alter table public.reportes enable row level security;

create policy "staff gestiona reportes"
  on public.reportes for all to authenticated
  using (true) with check (true);
