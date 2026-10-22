import Link from "next/link";
import { CalendarBlankIcon, ChatsCircleIcon, GearSixIcon } from "@phosphor-icons/react/dist/ssr";

/** Barra de arriba: sólo el título, grande y limpio. */
export function BarraSuperior({ titulo }) {
  return (
    <header className="px-5 pb-2 pt-6">
      <h1 className="text-[30px] font-bold tracking-tight text-[#1c1a17]">{titulo}</h1>
    </header>
  );
}

/**
 * Menú fijo de abajo con 3 botones (como WhatsApp): Mensajes, Agenda y
 * Ajustes. Siempre en el mismo lugar para que la Dra. Gaby no se pierda.
 */
export function BarraInferior({ activo, base = "/crm/mensajes", agendaHref = "/agenda" }) {
  const items = [
    { key: "mensajes", href: base, label: "Mensajes", Icono: ChatsCircleIcon },
    { key: "agenda", href: agendaHref, label: "Agenda", Icono: CalendarBlankIcon },
    { key: "ajustes", href: `${base}/ajustes`, label: "Ajustes", Icono: GearSixIcon },
  ];
  return (
    <nav
      aria-label="Menú"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-[#1c1a17]/[0.08] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-[720px]">
        {items.map(({ key, href, label, Icono }) => {
          const on = activo === key;
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex h-[68px] flex-col items-center justify-center gap-0.5 text-[13px] font-semibold ${
                  on ? "text-[#1c1a17]" : "text-[#9a9388]"
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${on ? "bg-[#efe3cc]" : ""}`}>
                  <Icono size={26} weight={on ? "fill" : "regular"} className={on ? "text-[#8a6d3f]" : ""} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
