import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveMap from "@/components/InteractiveMap";
import { motion } from "framer-motion";
import { MapPin, Compass, Navigation } from "lucide-react";

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Explore</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
              Interactive Map
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Discover destinations, hotels, and events on a real interactive map
            </p>
          </motion.div>

          <InteractiveMap height="h-[600px]" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: MapPin, title: "Pin Destinations", desc: "Mark and save your favorite spots on the map" },
              { icon: Compass, title: "Discover Nearby", desc: "Find restaurants, attractions, and hotels around you" },
              { icon: Navigation, title: "Get Directions", desc: "Navigate between destinations with turn-by-turn guidance" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border"
              >
                <div className="p-3 rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExplorePage;
