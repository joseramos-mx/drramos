"use client";

import { useEffect, useState } from "react";
import { WhatsappLogo, ArrowUp } from "@phosphor-icons/react";

export default function FloatingActions({
  showBadge = true,          // muestra el badge rojo con "1"
  whatsappText = "Hola, quiero agendar una valoración"
}) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const waHref = `https://wa.me/526182066760?text=${encodeURIComponent(
    whatsappText
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3">
      {/* WhatsApp */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Agendar por WhatsApp"
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <WhatsappLogo size={28} weight="fill" />
        {/* Badge rojo */}
        {showBadge && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow"
          >
            1
          </span>
        )}
      </a>

      {/* Back to top */}
      <button
        type="button"
        onClick={toTop}
        aria-label="Volver arriba"
        className={`inline-flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg ring-1 ring-white/10 transition hover:bg-zinc-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 ${
          showTop ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp size={26} />
      </button>
    </div>
  );
}
