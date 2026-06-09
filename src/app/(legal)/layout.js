import Link from "next/link";
import { Cormorant_Garamond, Albert_Sans } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const albert = Albert_Sans({
  variable: "--font-albert",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
});

export default function LegalLayout({ children }) {
  return (
    <div
      className={`${cormorant.variable} ${albert.variable} min-h-screen bg-[#000000] text-[#f5f1ea] antialiased font-[family-name:var(--font-albert)]`}
    >
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-8 py-6 md:px-12">
          <Link
            href="/diseno-sonrisa"
            className="font-[family-name:var(--font-cormorant)] text-[18px] font-light italic tracking-[0.01em] text-[#f5f1ea] transition-colors duration-300 hover:text-[#b89968] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
          >
            Dr. Felipe de Jesús Ramos
          </Link>
          <Link
            href="/diseno-sonrisa"
            className="font-[family-name:var(--font-albert)] text-[12px] font-light uppercase tracking-[0.22em] text-white/55 transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89968]"
          >
            Volver a la landing
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/[0.08] py-10">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-y-3 gap-x-8 px-8 font-[family-name:var(--font-albert)] text-[11px] font-light uppercase tracking-[0.16em] text-white/45 md:px-12">
          <p>
            {new Date().getFullYear()} · Dr. Felipe de Jesús Ramos · Durango, México
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/privacidad"
              className="transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
            >
              Aviso de privacidad
            </Link>
            <Link
              href="/aviso-legal"
              className="transition-colors duration-300 hover:text-[#f5f1ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b89968]"
            >
              Aviso legal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
