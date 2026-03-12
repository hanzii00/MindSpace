import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SpacesSection from "@/components/SpacesSection";
import PricingSection from "@/components/PricingSection";
import FacilitiesSection from "@/components/FacilitiesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SpacesSection />
      <PricingSection />
      <FacilitiesSection />
      <Footer />
    </div>
  );
};

export default Index;
