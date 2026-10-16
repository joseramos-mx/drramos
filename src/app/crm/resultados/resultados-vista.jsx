import Link from "next/link";
import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import SignOutButton from "../components/sign-out-button";
import NavCrm from "../components/nav-crm";
import { buildWhatsappLink } from "../lib";
import { ORIGENES, TRATAMIENTOS, formatMoney, labelDe } from "../../agenda/lib";
import { PERIODOS, porcentaje } from "./stats";

const ORIGEN_LABELS = [
  ...ORIGENES,
  { value: "formulario", label: "Formulario landing" },
  { value: "sin_dato", label: "Sin dato" },
];

/** Lo que se dibuja en /crm/resultados (sin consultas a la base). */
export default function ResultadosVista({ r, periodo, email, error }) {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 md:py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <p className="font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.24em] text-[#b89968]">
            Gestión interna
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-[clamp(28px,4vw,40px)] font-light leading-[1.1] text-[#f5f1ea]">
            Resultados del consultorio.
          </h1>
          <NavCrm activo="resultados" />
        </div>
        <SignOutButton email={email} />
      </header>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Periodo">
        {PERIODOS.map((p) => (
          <Link
            key={p.value}
            href={`/crm/resultados?periodo=${p.value}`}
            className={`inline-flex min-h-[40px] items-center border px-4 py-1.5 font-[family-name:var(--font-albert)] text-[13px] tracking-[0.02em] transition-colors ${
              periodo === p.value
                ? "border-[#b89968] bg-[#b89968] font-medium text-[#000000]"
                : "border-white/[0.22] text-white/85 hover:border-white/45"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {error && (
        <div role="alert" className="mt-8 border border-[#ff7a7a]/30 bg-[#ff7a7a]/[0.06] p-4 font-[family-name:var(--font-albert)] text-[14px] text-[#ffb1b1]">
          No pudimos cargar las citas. Recarga la página; si sigue, avisa a quien administra el sistema.
        </div>
      )}

      {/* Dinero */}
      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Cobrado" value={formatMoney(r.cobrado)} highlight />
        <Stat label="Presupuestado" value={formatMoney(r.presupuestado)} />
        <Stat label="Pago promedio por paciente" value={formatMoney(r.ticketPromedio)} />
      </section>

      {/* Embudo */}
      <Seccion titulo="Embudo de pacientes">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Paso label="Agendaron" valor={r.embudo.agendaron} />
          <Paso label="Vinieron" valor={r.embudo.vinieron} tasa={porcentaje(r.embudo.vinieron, r.embudo.agendaron)} />
          <Paso label="Con presupuesto" valor={r.embudo.conPresupuesto} tasa={porcentaje(r.embudo.conPresupuesto, r.embudo.vinieron)} />
          <Paso label="Pagaron" valor={r.embudo.pagaron} tasa={porcentaje(r.embudo.pagaron, r.embudo.conPresupuesto)} />
        </div>
        <p className="mt-3 font-[family-name:var(--font-albert)] text-[13px] text-white/70">
          {r.citasTotal} citas en el periodo · {r.noVino} no vinieron · {r.cancelo} cancelaron
        </p>
      </Seccion>

      {/* Por origen */}
      <Seccion titulo="¿De dónde llegan los que pagan?">
        <Tabla
          vacio="Todavía no hay citas en este periodo."
          columnas={["Origen", "Pacientes", "Vinieron", "Pagaron", "Cobrado", "Presupuestado"]}
          filas={r.porOrigen.map((o) => [
            labelDe(ORIGEN_LABELS, o.origen),
            o.pacientes,
            o.vinieron,
            o.pagaron,
            formatMoney(o.cobrado),
            formatMoney(o.presupuestado),
          ])}
        />
      </Seccion>

      {/* Por tratamiento */}
      <Seccion titulo="Tratamientos">
        <Tabla
          vacio="Todavía no hay presupuestos en este periodo."
          columnas={["Tratamiento", "Cotizados", "Presupuestado", "Realizados"]}
          filas={r.porTratamiento.map((t) => [
            labelDe(TRATAMIENTOS, t.tratamiento),
            t.cotizados,
            formatMoney(t.presupuestado),
            t.realizados,
          ])}
        />
      </Seccion>

      {/* Acción */}
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Seccion titulo={`Presupuestos sin pagar (${r.porPensar.length})`} sub="Pacientes a los que vale la pena dar seguimiento." sinMargen>
          <ListaPacientes
            vacio="Nadie pendiente."
            items={r.porPensar.slice(0, 30).map((v) => ({
              key: `${v.paciente?.id}-${v.tratamiento}`,
              paciente: v.paciente,
              detalle: `${labelDe(TRATAMIENTOS, v.tratamiento)} · ${formatMoney(v.monto)}`,
              fecha: v.fecha,
            }))}
          />
        </Seccion>

        <Seccion titulo={`Citas sin cerrar (${r.sinCerrar.length})`} sub="Ya pasaron y nadie marcó cómo le fue al paciente." sinMargen>
          <ListaPacientes
            vacio="Todas las citas están cerradas."
            items={r.sinCerrar.slice(0, 30).map((c) => ({
              key: c.id,
              paciente: c.paciente,
              detalle: "Abrir en la agenda",
              fecha: c.inicio,
              href: `/agenda?fecha=${fechaDurango(c.inicio)}`,
            }))}
          />
        </Seccion>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
//  Piezas (mismo estilo que /crm)
// ─────────────────────────────────────────────────────────────
function Seccion({ titulo, sub, children, sinMargen }) {
  return (
    <section className={sinMargen ? "" : "mt-12"}>
      <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(22px,2.6vw,28px)] font-normal text-[#f5f1ea]">
        {titulo}
      </h2>
      {sub && <p className="mt-1 font-[family-name:var(--font-albert)] text-[13px] text-white/65">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`border p-5 ${highlight ? "border-[#b89968]/60 bg-[#b89968]/[0.08]" : "border-white/[0.1] bg-white/[0.02]"}`}>
      <p className="break-all font-[family-name:var(--font-cormorant)] text-[clamp(30px,3.4vw,42px)] font-light leading-none text-[#f5f1ea]">
        {value}
      </p>
      <p className="mt-2 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
    </div>
  );
}

function Paso({ label, valor, tasa }) {
  return (
    <div className="border border-white/[0.1] bg-white/[0.02] p-4">
      <p className="font-[family-name:var(--font-cormorant)] text-[40px] font-light leading-none text-[#f5f1ea]">{valor}</p>
      <p className="mt-2 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        {label}
      </p>
      {tasa && (
        <p className="mt-1 font-[family-name:var(--font-albert)] text-[13px] text-[#b89968]">{tasa} del paso anterior</p>
      )}
    </div>
  );
}

function Tabla({ columnas, filas, vacio }) {
  if (filas.length === 0) {
    return <p className="border border-white/[0.08] p-6 font-[family-name:var(--font-albert)] text-[14px] text-white/65">{vacio}</p>;
  }
  return (
    <div className="overflow-x-auto border border-white/[0.1]">
      <table className="w-full min-w-[560px] font-[family-name:var(--font-albert)] text-[14px]">
        <thead>
          <tr className="border-b border-white/[0.1] text-left">
            {columnas.map((c, i) => (
              <th key={c} className={`px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-white/65 ${i ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, n) => (
            <tr key={n} className="border-b border-white/[0.05] last:border-0">
              {f.map((v, i) => (
                <td key={i} className={`px-4 py-3 tabular-nums ${i ? "text-right text-white/85" : "text-[#f5f1ea]"}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListaPacientes({ items, vacio }) {
  if (items.length === 0) {
    return <p className="border border-white/[0.08] p-6 font-[family-name:var(--font-albert)] text-[14px] text-white/65">{vacio}</p>;
  }
  return (
    <ul className="border border-white/[0.1]">
      {items.map((it) => {
        const wa = it.paciente?.whatsapp ? buildWhatsappLink(it.paciente) : null;
        return (
          <li key={it.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3 last:border-0">
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-albert)] text-[15px] font-medium text-[#f5f1ea]">
                {it.paciente?.nombre || "Sin nombre"}
              </p>
              <p className="font-[family-name:var(--font-albert)] text-[13px] text-white/70">
                {it.href ? (
                  <Link href={it.href} className="text-[#b89968] underline-offset-4 hover:underline">{it.detalle}</Link>
                ) : (
                  it.detalle
                )}{" "}
                · {fechaCorta(it.fecha)}
              </p>
            </div>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener"
                aria-label={`WhatsApp a ${it.paciente.nombre}`}
                className="inline-flex min-h-[40px] items-center gap-2 border border-white/[0.22] px-3 font-[family-name:var(--font-albert)] text-[13px] text-white/85 hover:border-[#b89968] hover:text-[#f5f1ea]"
              >
                <WhatsappLogoIcon size={16} weight="regular" /> WhatsApp
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function fechaDurango(iso) {
  return new Date(new Date(iso).getTime() - 6 * 3600 * 1000).toISOString().slice(0, 10);
}

function fechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "America/Mexico_City" });
}
