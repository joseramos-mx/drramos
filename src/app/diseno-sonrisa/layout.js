import Script from "next/script";
import { Cormorant_Garamond, Albert_Sans } from "next/font/google";
import LenisProvider from "./components/lenis-provider";
import { AplicacionProvider } from "./components/aplicacion-context";

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

// Meta Pixel — ID público, igual al que usa la Conversions API server-side.
// Si cambia, también actualiza META_PIXEL_ID en el .env.
const META_PIXEL_ID = "27631678653096946";

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
      className={`${cormorant.variable} ${albert.variable} min-h-screen bg-[#000000] text-[#f5f1ea] antialiased`}
    >
      {/* Meta Pixel · client-side. Los eventos LeadDisenoSonrisa /
          LeadReconstruccion se disparan tras guardar el lead en
          /api/lead, usando trackCustom con eventID compartido con CAPI
          para deduplicar. */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <LenisProvider>
        <AplicacionProvider>{children}</AplicacionProvider>
      </LenisProvider>
    </div>
  );
}
