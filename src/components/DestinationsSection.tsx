import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapPlaceholder from "@/components/MapPlaceholder";
import destSantorini from "@/assets/dest-santorini.jpg";
import destKyoto from "@/assets/dest-kyoto.jpg";
import destMachuPicchu from "@/assets/dest-machupicchu.jpg";
import destBali from "@/assets/dest-bali.jpg";

const destinations = [
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic" },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural" },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure" },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical" },
];

const DestinationsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Discover</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Trending Destinations
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Handpicked destinations loved by travelers around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-travel transition-shadow duration-300 group-hover:shadow-travel-hover">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
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
        </div>

        {/* Mini map preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <MapPlaceholder height="h-[350px]" interactive={false} />
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
