import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import FeaturesSection from "@/components/FeaturesSection";
import TripPlannerSection from "@/components/TripPlannerSection";
import BudgetSection from "@/components/BudgetSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DestinationsSection />
      <FeaturesSection />
      <TripPlannerSection />
      <BudgetSection />
      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
