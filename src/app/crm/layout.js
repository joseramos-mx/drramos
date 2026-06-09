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
  weight: ["200", "300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: { absolute: "CRM | Dr. Felipe Ramos" },
  description: "Gestión interna de leads.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function CrmLayout({ children }) {
  return (
    <div
      className={`${cormorant.variable} ${albert.variable} min-h-screen bg-[#000000] text-[#f5f1ea] antialiased font-[family-name:var(--font-albert)]`}
    >
      {children}
    </div>
  );
}
