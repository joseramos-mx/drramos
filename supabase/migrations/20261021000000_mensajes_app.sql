-- ─────────────────────────────────────────────────────────────
--  "Mensajes" como app del consultorio (tipo call center)
--
--  * Fotos y archivos: los que manda el paciente se bajan de Meta y se
--    guardan en el bucket privado `whatsapp-media` (Meta los borra a
--    los 30 días). Los que manda la Dra. Gaby también se guardan ahí.
--  * Etiquetas por paciente (Valoración, Presupuesto…), un toque.
--  * Avisos (web push) en el celular y el iPad cuando llega un mensaje.
--
--  Correr DESPUÉS de 20261017000000_whatsapp.sql.
-- ─────────────────────────────────────────────────────────────

alter table public.whatsapp_mensajes
  add column if not exists media_id text,     -- id del archivo en Meta
  add column if not exists media_mime text,   -- image/jpeg, audio/ogg…
  add column if not exists media_ruta text;   -- ruta en el bucket whatsapp-media

alter table public.pacientes
  add column if not exists etiquetas text[] not null default '{}';

-- Un renglón por aparato con avisos activados (celular, iPad…)
create table if not exists public.push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  aparato text                                -- "Android · Chrome", para reconocerlo
);

alter table public.push_suscripciones enable row level security;

-- Cada quien ve y borra sólo sus aparatos; el envío lo hace el servidor
create policy "cada quien gestiona sus avisos"
  on public.push_suscripciones for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Bucket privado: sólo personal con sesión puede ver (con link firmado);
-- sólo el servidor (service_role) sube archivos.
insert into storage.buckets (id, name, public)
values ('whatsapp-media', 'whatsapp-media', false)
on conflict (id) do nothing;

create policy "staff ve archivos de whatsapp"
  on storage.objects for select to authenticated
  using (bucket_id = 'whatsapp-media');
