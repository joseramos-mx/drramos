"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

/** Barra de búsqueda como la de WhatsApp: busca mientras escribes (?q=). */
export default function Buscador({ inicial = "" }) {
  const [q, setQ] = useState(inicial);
  const router = useRouter();
  const ruta = usePathname();
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    const t = setTimeout(() => {
      router.replace(q.trim() ? `${ruta}?q=${encodeURIComponent(q.trim())}` : ruta, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [q, ruta, router]);

  return (
    <div className="px-5 pb-3">
      <label className="flex h-12 items-center gap-3 rounded-full bg-[#f2efe9] px-4 focus-within:outline-2 focus-within:outline-[#b89968]">
        <MagnifyingGlassIcon size={22} className="shrink-0 text-[#7a7368]" />
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nombre o palabra"
          className="h-full w-full bg-transparent text-[17px] text-[#1c1a17] placeholder:text-[#9a9388] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Borrar búsqueda" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c1a17]/10">
            <XIcon size={16} weight="bold" />
          </button>
        )}
      </label>
    </div>
  );
}
