-- ─────────────────────────────────────────────────────────────
--  Extensiones para el CRM interno (/crm)
--
--  1. Agrega columna `notas` para que el personal escriba seguimiento.
--  2. Habilita SELECT y UPDATE para usuarios autenticados con RLS.
--     La policy de INSERT para anon (creada en 20260526000000) NO se
--     toca. Anon sigue sin poder leer ni actualizar.
-- ─────────────────────────────────────────────────────────────

alter table public.leads
  add column if not exists notas text;

-- RLS: staff autenticado lee y actualiza
create policy "staff lee leads"
  on public.leads
  for select
  to authenticated
  using (true);

create policy "staff actualiza leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);
