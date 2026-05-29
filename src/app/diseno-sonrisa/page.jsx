import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Marquee from "./components/marquee";
import Problema from "./components/problema";
import AntesDespues from "./components/antes-despues";
import Proceso from "./components/proceso";
import Tecnologia from "./components/tecnologia";
import Autoridad from "./components/autoridad";
import Financiacion from "./components/financiacion";
import Testimonios from "./components/testimonios";
import FAQ from "./components/faq";
import CTAFinal from "./components/cta-final";
import Footer from "./components/footer";
import AplicacionTrigger from "./components/aplicacion-trigger";
import AplicacionModal from "./components/aplicacion-modal";
import ScrollToTop from "./components/scroll-to-top";

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
        <Tecnologia />
        <Autoridad />
        <Financiacion />
        <Testimonios />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
      <AplicacionTrigger />
      <AplicacionModal />
      <ScrollToTop />
    </>
  );
}
