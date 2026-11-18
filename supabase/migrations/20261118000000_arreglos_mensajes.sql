-- ─────────────────────────────────────────────────────────────
--  Arreglos de Mensajes (2026-11-18)
--  * pacientes.chat_listo_en: la Dra. Gaby tocó "Ya quedó" en el chat
--    (sale de Pendientes sin mandar nada; si el paciente vuelve a
--    escribir, regresa solo).
--  * asistente_respuestas.cuando: respuestas que ella AGREGA en "Mis
--    respuestas" (id "propia_…"): cuándo debe usarlas el asistente.
--  Correr DESPUÉS de 20261023200000_anuncios.sql. No borra nada.
-- ─────────────────────────────────────────────────────────────

alter table public.pacientes
  add column if not exists chat_listo_en timestamptz;

alter table public.asistente_respuestas
  add column if not exists cuando text
    check (cuando is null or length(cuando) between 3 and 200);
