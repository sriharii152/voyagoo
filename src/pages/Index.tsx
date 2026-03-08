import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DestinationsSection from "@/components/DestinationsSection";
import FeaturesSection from "@/components/FeaturesSection";
import BookingSection from "@/components/BookingSection";
import TripPlannerSection from "@/components/TripPlannerSection";
import BudgetSection from "@/components/BudgetSection";
import EventsSection from "@/components/EventsSection";
import SafetyAlertsSection from "@/components/SafetyAlertsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DestinationsSection />
      <FeaturesSection />
      <BookingSection />
      <TripPlannerSection />
      <BudgetSection />
      <SafetyAlertsSection />
      <EventsSection />
      <Footer />
    </div>
  );
};

export default Index;
