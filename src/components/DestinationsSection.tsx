import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Globe, Flag, Building2, Calendar, Sparkles, Wallet, X } from "lucide-react";
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
  description: string;
  bestTime: string;
  specialty: string;
  budget: string;
  language: string;
  mustSee: string[];
}

const destinations: Destination[] = [
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic", category: "international", description: "White-washed buildings on volcanic cliffs with breathtaking sunsets over the Aegean Sea.", bestTime: "Apr – Oct", specialty: "Sunset at Oia, volcanic beaches, and local wine tasting", budget: "$150–300/day", language: "Greek", mustSee: ["Oia Sunset", "Red Beach", "Akrotiri Ruins"] },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural", category: "international", description: "Ancient temples, zen gardens, and geisha districts amidst cherry blossoms.", bestTime: "Mar – May, Oct – Nov", specialty: "Traditional tea ceremonies, bamboo groves, and 2000+ temples", budget: "$100–200/day", language: "Japanese", mustSee: ["Fushimi Inari", "Arashiyama Bamboo", "Kinkaku-ji"] },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "international", description: "Mysterious Incan citadel high in the Andes — a world wonder.", bestTime: "May – Sep", specialty: "Inca Trail trek, panoramic mountain views, and llama encounters", budget: "$80–150/day", language: "Spanish / Quechua", mustSee: ["Sun Gate", "Huayna Picchu", "Sacred Valley"] },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical", category: "international", description: "Lush rice terraces, sacred temples, vibrant culture, and world-class surfing.", bestTime: "Apr – Oct", specialty: "Rice terrace walks, temple festivals, and surf culture", budget: "$40–100/day", language: "Indonesian / Balinese", mustSee: ["Ubud Terraces", "Uluwatu Temple", "Seminyak Beach"] },
  { name: "Jaipur", country: "Rajasthan", image: destSantorini, rating: 4.6, tag: "Heritage", category: "national", description: "The Pink City — majestic forts, colorful bazaars, and royal Rajasthani culture.", bestTime: "Oct – Mar", specialty: "Hawa Mahal, royal palaces, block printing, and Rajasthani thali", budget: "₹2,000–5,000/day", language: "Hindi / Rajasthani", mustSee: ["Amber Fort", "Hawa Mahal", "Nahargarh Fort"] },
  { name: "Kerala", country: "God's Own Country", image: destBali, rating: 4.8, tag: "Nature", category: "national", description: "Serene backwaters, lush tea plantations, Ayurvedic retreats, and tropical beaches.", bestTime: "Sep – Mar", specialty: "Houseboat cruises, Kathakali dance, and Ayurveda spas", budget: "₹2,000–5,000/day", language: "Malayalam", mustSee: ["Alleppey Backwaters", "Munnar Hills", "Fort Kochi"] },
  { name: "Varanasi", country: "Uttar Pradesh", image: destKyoto, rating: 4.5, tag: "Spiritual", category: "national", description: "One of the world's oldest cities — sacred ghats, evening aarti, and spiritual awakening.", bestTime: "Oct – Mar", specialty: "Ganga Aarti, boat rides at dawn, and ancient silk weaving", budget: "₹1,000–3,000/day", language: "Hindi", mustSee: ["Dashashwamedh Ghat", "Kashi Vishwanath", "Sarnath"] },
  { name: "Ladakh", country: "Jammu & Kashmir", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "national", description: "High-altitude desert with monasteries, pristine lakes, and thrilling mountain passes.", bestTime: "Jun – Sep", specialty: "Pangong Lake, Khardung La pass, and Buddhist monasteries", budget: "₹3,000–7,000/day", language: "Ladakhi / Hindi", mustSee: ["Pangong Lake", "Nubra Valley", "Thiksey Monastery"] },
  { name: "Munnar", country: "Kerala", image: destBali, rating: 4.7, tag: "Hill Station", category: "state", description: "Endless rolling tea gardens, misty mountains, and exotic wildlife sanctuaries.", bestTime: "Sep – May", specialty: "Tea plantation tours, Eravikulam National Park, and trekking", budget: "₹1,500–4,000/day", language: "Malayalam", mustSee: ["Tea Museum", "Eravikulam NP", "Top Station"] },
  { name: "Coorg", country: "Karnataka", image: destKyoto, rating: 4.6, tag: "Coffee Country", category: "state", description: "Lush coffee plantations, waterfalls, and trekking trails in the Western Ghats.", bestTime: "Oct – Mar", specialty: "Coffee estate stays, Abbey Falls, and Kodava cuisine", budget: "₹1,500–4,000/day", language: "Kodava / Kannada", mustSee: ["Abbey Falls", "Raja's Seat", "Dubare Elephant Camp"] },
  { name: "Ooty", country: "Tamil Nadu", image: destMachuPicchu, rating: 4.5, tag: "Scenic", category: "state", description: "The Queen of Hill Stations — botanical gardens, toy train, and eucalyptus forests.", bestTime: "Oct – Jun", specialty: "Nilgiri Mountain Railway, homemade chocolates, and rose gardens", budget: "₹1,200–3,500/day", language: "Tamil", mustSee: ["Botanical Garden", "Toy Train", "Doddabetta Peak"] },
  { name: "Lonavala", country: "Maharashtra", image: destSantorini, rating: 4.4, tag: "Weekend Getaway", category: "state", description: "Misty hills, ancient caves, serene lakes, and the famous chikki sweets.", bestTime: "Jun – Sep", specialty: "Bhushi Dam, Karla Caves, and monsoon trekking", budget: "₹1,000–3,000/day", language: "Marathi", mustSee: ["Tiger's Leap", "Karla Caves", "Bhushi Dam"] },
];

const categoryConfig: Record<Exclude<TripCategory, "all">, { label: string; icon: typeof Globe; color: string }> = {
  state: { label: "State Trips", icon: Building2, color: "bg-accent text-accent-foreground" },
  national: { label: "National Trips", icon: Flag, color: "bg-secondary text-secondary-foreground" },
  international: { label: "International Trips", icon: Globe, color: "bg-primary text-primary-foreground" },
};

const DestinationsSection = () => {
  const [activeCategory, setActiveCategory] = useState<TripCategory>("all");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

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
              onClick={() => setSelectedDest(dest)}
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
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryConfig[dest.category as Exclude<TripCategory, "all">].color}`}>
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

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setSelectedDest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl max-w-lg w-full overflow-hidden shadow-travel-hover max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Header */}
              <div className="relative">
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <button
                  onClick={() => setSelectedDest(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors"
                >
                  <X className="h-4 w-4 text-primary-foreground" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${categoryConfig[selectedDest.category as Exclude<TripCategory, "all">].color}`}>
                    {selectedDest.tag}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-primary-foreground mt-2">{selectedDest.name}</h2>
                  <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {selectedDest.country}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedDest.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <p className="font-bold text-foreground">{selectedDest.rating}/5</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <p className="font-bold text-foreground text-sm">{selectedDest.budget}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Best Time to Visit</p>
                    </div>
                    <p className="font-bold text-foreground text-sm">{selectedDest.bestTime}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <p className="text-xs text-muted-foreground">Language</p>
                    </div>
                    <p className="font-bold text-foreground text-sm">{selectedDest.language}</p>
                  </div>
                </div>

                {/* Specialty */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="font-display font-semibold text-foreground text-sm">Specialty</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedDest.specialty}</p>
                </div>

                {/* Must See */}
                <div>
                  <h4 className="font-display font-semibold text-foreground text-sm mb-2">Must See</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDest.mustSee.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground">
                        <MapPin className="h-3 w-3 text-primary" /> {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action */}
                <div className="flex gap-3 pt-2">
                  <Link to="/destinations" className="flex-1">
                    <Button variant="hero" className="w-full">Explore More</Button>
                  </Link>
                  <Button variant="outline" onClick={() => setSelectedDest(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DestinationsSection;
