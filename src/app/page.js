import Image from "next/image";
import HeroDoctor from "./components/hero";
import AboutDoctor from "./components/about";
import ServicesSection from "./components/services";
import FacilitiesSection from "./components/facilities";
import TechnologySection from "./components/tech";
import CTASection from "./components/cta";
import WhatsAppFloat from "./components/whatsappfloat";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div>
      <HeroDoctor/>
      <AboutDoctor/>
      <ServicesSection/>
      <TechnologySection/>
      <FacilitiesSection/>
      <CTASection/>
      <WhatsAppFloat/>
      <Footer/>
      
    </div>
  );
}
