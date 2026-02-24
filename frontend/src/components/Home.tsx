import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Stats from "./sections/Stats";
import Process from "./sections/Process";
import Services from "./sections/Services";
import Cards from "./sections/Cards";
import Team from "./sections/Team";
import Testimonials from "./sections/Testimonials";
import FAQ from "./sections/FAQ";
import WhyChoose from "./sections/WhyChoose";
import CTA from "./sections/CTA";
import SmartDocument from "./sections/SmartDocument";


const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Stats />
      <Process />
      <SmartDocument />
      <Services />
      <Cards />
      <Team />
      <Testimonials />
      <FAQ />
      <WhyChoose />
      <CTA />
      <Footer />
    </>
  );
};

export default Home;

