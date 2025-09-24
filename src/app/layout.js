import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx
export const metadata = {
  metadataBase: new URL("https://www.drfelipedejesusramos.com"), // <— PRODUCCIÓN
  title: {
    default: "Dr. Felipe de Jesús Ramos | Odontología Estética e Implantes",
    template: "%s | Dr. Felipe Ramos",
  },
  description:
    "Atención ética y precisa en Durango. Odontología estética, implantes y flujo digital con TRIOS® y exocad.",
  keywords: [
    "dentista durango",
    "odontología estética",
    "implantes dentales",
    "prótesis",
    "dr felipe ramos",
  ],
  authors: [{ name: "RMS Innovation Industries" }],
  openGraph: {
    type: "website",
    url: "https://www.drfelipedejesusramos.com/",
    title: "Tu sonrisa merece lo mejor | Dr. Felipe Ramos",
    description:
      "Más de 30 años transformando sonrisas con tecnología digital: TRIOS®, exocad, fresado e impresión 3D.",
    siteName: "Dr. Felipe de Jesús Ramos",
    locale: "es_MX",
    images: [
      {
        url: "/og/og-home.jpg", // 1200x630 JPG ideal
        width: 1200,
        height: 630,
        alt: "Clínica y equipo del Dr. Felipe Ramos en Durango",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu sonrisa merece lo mejor | Dr. Felipe Ramos",
    description:
      "Odontología estética e implantes en Durango con el dentista autor de El Arte de Hacer Dientes reconocido internacionalmente. Agenda tu valoración.",
    images: ["/og/og-home.jpg"],
  },
  alternates: {
    canonical: "https://www.drfelipedejesusramos.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large",
  },
  icons: {
    icon: "/og/favicon.ico",
    apple: "/fav/apple-touch-icon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
