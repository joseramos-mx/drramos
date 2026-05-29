import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Marquee from "./components/marquee";
import Problema from "./components/problema";
import AntesDespues from "./components/antes-despues";
import Proceso from "./components/proceso";
import Autoridad from "./components/autoridad";
import Financiacion from "./components/financiacion";
import FAQ from "./components/faq";
import Footer from "./components/footer";

export default function DisenoSonrisaPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Problema />
        <AntesDespues />
        <Proceso />
        <Autoridad />
        <Financiacion />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
