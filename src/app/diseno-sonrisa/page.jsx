import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Marquee from "./components/marquee";
import Problema from "./components/problema";
import AntesDespues from "./components/antes-despues";

export default function DisenoSonrisaPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Problema />
        <AntesDespues />

        {/* TODO: sección proceso   — del escaneo TRIOS al resultado final */}
        {/* TODO: sección autoridad-doctor — libro, IAN, trayectoria */}
        {/* TODO: sección financiacion — meses sin intereses */}
        {/* TODO: sección faq */}
        {/* TODO: footer */}
      </main>
    </>
  );
}
