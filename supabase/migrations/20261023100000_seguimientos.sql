-- Mensajes automáticos sobre citas (correr después de 20261023000000_bloqueos.sql):
--  * confirmación al agendar desde la agenda (plantilla cita_agendada)
--  * mensaje a quien no vino (cita_falto), una vez por cita
--  * seguimiento de presupuestos no aceptados a los 3 días y al mes (seguimiento_presupuesto)

alter table public.citas add column if not exists falto_avisado_en timestamptz;
alter table public.citas add column if not exists seguimiento_enviados int not null default 0;
alter table public.citas add column if not exists seguimiento_ultimo timestamptz;
-- true = ya no se le da seguimiento (contestó, agendó o dijo que no)
alter table public.citas add column if not exists seguimiento_cerrado boolean not null default false;

-- Interruptores en Ajustes (prendidos por omisión)
alter table public.asistente_config add column if not exists aviso_falto boolean not null default true;
alter table public.asistente_config add column if not exists seguimientos boolean not null default true;
