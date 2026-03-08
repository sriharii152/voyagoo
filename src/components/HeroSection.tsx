import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-travel.jpg";
import JourneyPlannerModal from "@/components/JourneyPlannerModal";

const HeroSection = () => {
  const [journeyOpen, setJourneyOpen] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img
        src={heroImage}
        alt="Tropical island aerial view"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-card/30">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary-foreground">Your next adventure awaits</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Explore the World,{" "}
            <span className="text-gradient-sunset">Your Way</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto font-body">
            Plan trips, track budgets, discover events, and navigate the globe — all in one beautiful app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="hero"
              size="lg"
              className="text-base px-8 py-6"
              onClick={() => setJourneyOpen(true)}
            >
              Start Your Journey <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Link to="/explore">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 bg-card/10 backdrop-blur-sm border-card/30 text-primary-foreground hover:bg-card/20 hover:text-primary-foreground">
                Browse Destinations
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full" />
        </div>
      </motion.div>

      <JourneyPlannerModal open={journeyOpen} onClose={() => setJourneyOpen(false)} />
    </section>
  );
};

export default HeroSection;
