import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SafetyAlertsSection from "@/components/SafetyAlertsSection";
import { motion } from "framer-motion";

const SafetyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Safety</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Safety & Travel Alerts</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Weather updates, traffic alerts, emergency numbers, and safe route suggestions</p>
          </motion.div>
        </div>
        <SafetyAlertsSection />
      </main>
      <Footer />
    </div>
  );
};

export default SafetyPage;
