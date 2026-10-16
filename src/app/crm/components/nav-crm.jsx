import Link from "next/link";

/** Pestañas del área interna: Leads, Resultados y Agenda. */
export default function NavCrm({ activo }) {
  const items = [
    { href: "/crm", key: "leads", label: "Leads" },
    { href: "/crm/resultados", key: "resultados", label: "Resultados" },
    { href: "/agenda", key: "agenda", label: "Agenda" },
  ];
  return (
    <nav className="mt-4 flex flex-wrap gap-5" aria-label="Secciones">
      {items.map((i) => (
        <Link
          key={i.key}
          href={i.href}
          className={`font-[family-name:var(--font-albert)] text-[12px] font-medium uppercase tracking-[0.18em] underline-offset-8 transition-colors ${
            activo === i.key ? "text-[#f5f1ea] underline decoration-[#b89968]" : "text-white/60 hover:text-[#f5f1ea]"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
