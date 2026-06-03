-- ─────────────────────────────────────────────────────────────
--  Tabla: public.leads
--  Captura los leads del formulario de aplicación de /diseno-sonrisa.
--
--  Política de seguridad:
--    * RLS habilitada.
--    * Solo INSERT permitido para el rol anon (la web pública).
--    * Sin policy de SELECT para anon, así nadie lee los leads con la
--      anon key. Para leerlos desde un dashboard usar la service_role
--      key server side o autenticar con un rol dedicado.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  estado text not null default 'nuevo',
  event_id text, evento text, track text,
  nombre text, whatsapp text,
  dientes text, motivo text, plan text,
  fbp text, fbc text, ua text, referer text
);

alter table public.leads enable row level security;

create policy "anon inserta leads"
  on public.leads for insert to anon
  with check (true);
-- A proposito sin policy de SELECT para anon: nadie lee los leads con la anon key.
