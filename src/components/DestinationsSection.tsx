import { motion } from "framer-motion";
import { Star, MapPin, Globe, Flag, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import InteractiveMap from "@/components/InteractiveMap";
import destSantorini from "@/assets/dest-santorini.jpg";
import destKyoto from "@/assets/dest-kyoto.jpg";
import destMachuPicchu from "@/assets/dest-machupicchu.jpg";
import destBali from "@/assets/dest-bali.jpg";

type TripCategory = "all" | "state" | "national" | "international";

interface Destination {
  name: string;
  country: string;
  image: string;
  rating: number;
  tag: string;
  category: TripCategory;
}

const destinations: Destination[] = [
  // International
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic", category: "international" },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural", category: "international" },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "international" },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical", category: "international" },
  // National
  { name: "Jaipur", country: "Rajasthan", image: destSantorini, rating: 4.6, tag: "Heritage", category: "national" },
  { name: "Kerala", country: "God's Own Country", image: destBali, rating: 4.8, tag: "Nature", category: "national" },
  { name: "Varanasi", country: "Uttar Pradesh", image: destKyoto, rating: 4.5, tag: "Spiritual", category: "national" },
  { name: "Ladakh", country: "Jammu & Kashmir", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "national" },
  // State
  { name: "Munnar", country: "Kerala", image: destBali, rating: 4.7, tag: "Hill Station", category: "state" },
  { name: "Coorg", country: "Karnataka", image: destKyoto, rating: 4.6, tag: "Coffee Country", category: "state" },
  { name: "Ooty", country: "Tamil Nadu", image: destMachuPicchu, rating: 4.5, tag: "Scenic", category: "state" },
  { name: "Lonavala", country: "Maharashtra", image: destSantorini, rating: 4.4, tag: "Weekend Getaway", category: "state" },
];

const categoryConfig: Record<Exclude<TripCategory, "all">, { label: string; icon: typeof Globe; color: string }> = {
  state: { label: "State Trips", icon: Building2, color: "bg-accent text-accent-foreground" },
  national: { label: "National Trips", icon: Flag, color: "bg-secondary text-secondary-foreground" },
  international: { label: "International Trips", icon: Globe, color: "bg-primary text-primary-foreground" },
};

const DestinationsSection = () => {
  const [activeCategory, setActiveCategory] = useState<TripCategory>("all");

  const filtered = activeCategory === "all"
    ? destinations
    : destinations.filter((d) => d.category === activeCategory);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Discover</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Trending Destinations
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Handpicked destinations loved by travelers around the world
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeCategory === "all"
                ? "bg-foreground text-background shadow-lg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All Trips
          </button>
          {(Object.entries(categoryConfig) as [Exclude<TripCategory, "all">, typeof categoryConfig["state"]][]).map(
            ([key, { label, icon: Icon, color }]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === key
                    ? `${color} shadow-lg`
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          )}
        </div>

        {/* Category badge for filtered view */}
        {activeCategory !== "all" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            {(() => {
              const { icon: Icon, label } = categoryConfig[activeCategory];
              return (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  Showing {label.toLowerCase()}
                </span>
              );
            })()}
          </motion.div>
        )}

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.name}
              layout
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-travel transition-shadow duration-300 group-hover:shadow-travel-hover">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryConfig[dest.category].color}`}>
                    {dest.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-card/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {dest.tag}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-xl font-bold text-primary-foreground">{dest.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                      <MapPin className="h-3.5 w-3.5" /> {dest.country}
                    </span>
                    <span className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {dest.rating}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini map preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <InteractiveMap height="h-[350px]" interactive={false} />
          <div className="text-center mt-6">
            <Link to="/explore">
              <Button variant="hero">Open Full Map</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DestinationsSection;
