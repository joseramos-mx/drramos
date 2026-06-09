import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import {
  buildWhatsappLink,
  formatDateMX,
  labelMotivo,
  labelPlan,
} from "../lib";
import EstadoSelect from "./estado-select";
import NotasForm from "./notas-form";

/**
 * Tarjeta de un lead. Card friendly en mobile y desktop, sin "table"
 * que se desborde en celulares.
 */
export default function LeadCard({ lead }) {
  const wa = buildWhatsappLink(lead);
  const isReconstruccion = lead.track === "full_mouth";

  return (
    <article className="border border-white/[0.08] bg-white/[0.015] p-5 transition-colors hover:border-white/[0.16] md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="min-w-0">
          <h3 className="truncate font-[family-name:var(--font-cormorant)] text-[20px] font-light text-[#f5f1ea] md:text-[22px]">
            {lead.nombre || "Sin nombre"}
          </h3>
          <p className="mt-1 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.16em] text-white/45">
            {formatDateMX(lead.created_at)}
          </p>
        </div>

        <TrackBadge reconstruccion={isReconstruccion} />
      </header>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr] md:gap-6">
        <div className="space-y-3">
          <Row label="WhatsApp">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2 text-[#f5f1ea] underline decoration-[#b89968]/50 underline-offset-4 transition-colors hover:text-[#b89968]"
              >
                <WhatsappLogoIcon size={16} weight="light" />
                <span>{lead.whatsapp || "n/d"}</span>
              </a>
            ) : (
              <span className="text-white/40">n/d</span>
            )}
          </Row>

          <Row label="Motivo">{labelMotivo(lead.motivo)}</Row>
          <Row label="Plan">{labelPlan(lead.plan)}</Row>
        </div>

        <div className="space-y-3 md:border-l md:border-white/[0.06] md:pl-6">
          <div>
            <span className="mb-2 block font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.22em] text-white/45">
              Estado
            </span>
            <EstadoSelect leadId={lead.id} estado={lead.estado} />
          </div>

          <div>
            <span className="mb-2 block font-[family-name:var(--font-albert)] text-[10px] font-light uppercase tracking-[0.22em] text-white/45">
              Notas
            </span>
            <NotasForm leadId={lead.id} notas={lead.notas} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Row({ label, children }) {
  return (
    <div className="font-[family-name:var(--font-albert)] text-[13px] font-light">
      <span className="mr-2 inline-block min-w-[80px] uppercase tracking-[0.18em] text-[10px] text-white/45">
        {label}
      </span>
      <span className="text-white/85">{children}</span>
    </div>
  );
}

function TrackBadge({ reconstruccion }) {
  if (reconstruccion) {
    return (
      <span className="inline-flex shrink-0 items-center border border-[#b89968]/60 bg-[#b89968]/[0.14] px-3 py-1 font-[family-name:var(--font-albert)] text-[11px] font-medium uppercase tracking-[0.18em] text-[#f5f1ea]">
        Reconstrucción $100k
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center border border-white/[0.18] px-3 py-1 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.18em] text-white/70">
      Estética
    </span>
  );
}
