import { Cormorant_Garamond, Albert_Sans } from "next/font/google";
import LenisProvider from "./components/lenis-provider";

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

export const metadata = {
  title: "Diseño Digital de Sonrisa | Dr. Felipe Ramos · Durango",
  description:
    "Tres décadas perfeccionando el diseño digital de sonrisa. Resultados naturales, sin cirugías invasivas, en pocas citas. Pago a meses sin intereses. Durango.",
  alternates: {
    canonical: "https://www.drfelipedejesusramos.com/diseno-sonrisa",
  },
  openGraph: {
    title: "Diseño Digital de Sonrisa | Dr. Felipe Ramos",
    description:
      "Diseño digital de sonrisa con 30 años de trayectoria. Tecnología TRIOS 5. Pago a meses sin intereses.",
    url: "https://www.drfelipedejesusramos.com/diseno-sonrisa",
    locale: "es_MX",
    type: "website",
  },
};

export default function DisenoSonrisaLayout({ children }) {
  return (
    <div
      className={`${cormorant.variable} ${albert.variable} min-h-screen bg-[#0a0a0a] text-[#f5f1ea] antialiased`}
    >
      {/* Meta Pixel placeholder — pegar el snippet aquí cuando esté listo */}
      <LenisProvider>{children}</LenisProvider>
    </div>
  );
}
