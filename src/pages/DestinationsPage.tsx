import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Globe, Flag, Building2, Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  category: Exclude<TripCategory, "all">;
  description: string;
  budget: string;
  bestTime: string;
}

const allDestinations: Destination[] = [
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic", category: "international", description: "White-washed buildings perched on volcanic cliffs with stunning sunset views over the Aegean Sea.", budget: "₹12,500-25,000/day", bestTime: "Apr-Oct" },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural", category: "international", description: "Ancient temples, zen gardens, and traditional geisha districts amidst cherry blossoms.", budget: "₹8,500-17,000/day", bestTime: "Mar-May, Oct-Nov" },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "international", description: "Mysterious Incan citadel set high in the Andes Mountains, a wonder of the world.", budget: "₹6,500-12,500/day", bestTime: "May-Sep" },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical", category: "international", description: "Lush rice terraces, sacred temples, vibrant culture, and world-class surfing.", budget: "₹3,500-8,500/day", bestTime: "Apr-Oct" },
  { name: "Paris", country: "France", image: destSantorini, rating: 4.8, tag: "Romantic", category: "international", description: "The City of Light — iconic landmarks, world-class cuisine, and unmatched art.", budget: "₹12,500-29,000/day", bestTime: "Apr-Jun, Sep-Oct" },
  { name: "Dubai", country: "UAE", image: destKyoto, rating: 4.6, tag: "Luxury", category: "international", description: "Futuristic skyline, luxury shopping, desert safaris, and golden beaches.", budget: "₹12,500-33,000/day", bestTime: "Nov-Mar" },
  { name: "Jaipur", country: "Rajasthan", image: destSantorini, rating: 4.6, tag: "Heritage", category: "national", description: "The Pink City — majestic forts, colorful bazaars, and royal Rajasthani culture.", budget: "₹2,500-6,500/day", bestTime: "Oct-Mar" },
  { name: "Kerala", country: "God's Own Country", image: destBali, rating: 4.8, tag: "Nature", category: "national", description: "Serene backwaters, lush tea plantations, Ayurvedic retreats, and tropical beaches.", budget: "₹2,000-6,000/day", bestTime: "Sep-Mar" },
  { name: "Varanasi", country: "Uttar Pradesh", image: destKyoto, rating: 4.5, tag: "Spiritual", category: "national", description: "One of the world's oldest cities — sacred ghats, evening aarti, and spiritual awakening.", budget: "₹1,200-3,500/day", bestTime: "Oct-Mar" },
  { name: "Ladakh", country: "Jammu & Kashmir", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "national", description: "High-altitude desert with stunning monasteries, pristine lakes, and thrilling passes.", budget: "₹3,500-8,500/day", bestTime: "Jun-Sep" },
  { name: "Goa", country: "India", image: destBali, rating: 4.5, tag: "Beach", category: "national", description: "Sun-kissed beaches, vibrant nightlife, Portuguese architecture, and seafood paradise.", budget: "₹1,700-5,000/day", bestTime: "Nov-Feb" },
  { name: "Manali", country: "Himachal Pradesh", image: destMachuPicchu, rating: 4.6, tag: "Mountains", category: "national", description: "Snow-capped peaks, river rafting, paragliding, and cozy mountain cafés.", budget: "₹1,700-4,000/day", bestTime: "Oct-Jun" },
  { name: "Munnar", country: "Kerala", image: destBali, rating: 4.7, tag: "Hill Station", category: "state", description: "Endless rolling tea gardens, misty mountains, and exotic wildlife sanctuaries.", budget: "₹1,700-4,000/day", bestTime: "Sep-May" },
  { name: "Coorg", country: "Karnataka", image: destKyoto, rating: 4.6, tag: "Coffee Country", category: "state", description: "Lush coffee plantations, waterfalls, and trekking trails in the Western Ghats.", budget: "₹2,000-5,000/day", bestTime: "Oct-Mar" },
  { name: "Ooty", country: "Tamil Nadu", image: destMachuPicchu, rating: 4.5, tag: "Scenic", category: "state", description: "The Queen of Hill Stations — botanical gardens, toy train, and eucalyptus forests.", budget: "₹1,700-4,000/day", bestTime: "Oct-Jun" },
  { name: "Lonavala", country: "Maharashtra", image: destSantorini, rating: 4.4, tag: "Weekend Getaway", category: "state", description: "Misty hills, ancient caves, serene lakes, and the famous chikki sweets.", budget: "₹1,200-3,500/day", bestTime: "Jun-Sep" },
];

const categoryConfig = {
  state: { label: "State Trips", icon: Building2, color: "bg-accent text-accent-foreground" },
  national: { label: "National Trips", icon: Flag, color: "bg-secondary text-secondary-foreground" },
  international: { label: "International Trips", icon: Globe, color: "bg-primary text-primary-foreground" },
};

const DestinationsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<TripCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("favorite_destinations").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (dest: Destination) => {
      if (!user) throw new Error("Login required");
      const existing = favorites.find((f) => f.destination_name === dest.name);
      if (existing) {
        await supabase.from("favorite_destinations").delete().eq("id", existing.id);
      } else {
        await supabase.from("favorite_destinations").insert({
          user_id: user.id,
          destination_name: dest.name,
          destination_country: dest.country,
          destination_category: dest.category,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => toast.error("Please sign in to save favorites"),
  });

  const filtered = allDestinations.filter((d) => {
    const matchCategory = activeCategory === "all" || d.category === activeCategory;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const isFavorite = (name: string) => favorites.some((f) => f.destination_name === name);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Discover</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Destination Explorer</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Browse curated destinations, save favorites, and plan your next adventure</p>
          </motion.div>

          {/* Search & Filters */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 text-base rounded-xl" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button onClick={() => setActiveCategory("all")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeCategory === "all" ? "bg-foreground text-background shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>All Trips</button>
            {(Object.entries(categoryConfig) as [Exclude<TripCategory, "all">, typeof categoryConfig["state"]][]).map(([key, { label, icon: Icon, color }]) => (
              <button key={key} onClick={() => setActiveCategory(key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeCategory === key ? `${color} shadow-lg` : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group cursor-pointer" onClick={() => setSelectedDest(dest)}>
                <div className="relative overflow-hidden rounded-2xl shadow-travel hover:shadow-travel-hover transition-all">
                  <img src={dest.image} alt={dest.name} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite.mutate(dest); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite(dest.name) ? "fill-destructive text-destructive" : "text-primary-foreground"}`} />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryConfig[dest.category].color}`}>{dest.category}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display text-lg font-bold text-primary-foreground">{dest.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center gap-1 text-primary-foreground/80 text-xs"><MapPin className="h-3 w-3" /> {dest.country}</span>
                      <span className="flex items-center gap-1 text-primary-foreground/80 text-xs"><Star className="h-3 w-3 fill-primary text-primary" /> {dest.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No destinations found. Try a different search.</div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={() => setSelectedDest(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card rounded-3xl max-w-lg w-full overflow-hidden shadow-travel-hover" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${categoryConfig[selectedDest.category].color}`}>{selectedDest.tag}</span>
                  <h2 className="font-display text-2xl font-bold text-primary-foreground mt-2">{selectedDest.name}</h2>
                  <p className="text-primary-foreground/80 text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selectedDest.country}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedDest.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-bold text-foreground flex items-center justify-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /> {selectedDest.rating}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-bold text-foreground text-sm">{selectedDest.budget}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Best Time</p>
                    <p className="font-bold text-foreground text-sm">{selectedDest.bestTime}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="hero" className="flex-1" onClick={() => { toggleFavorite.mutate(selectedDest); }}>
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite(selectedDest.name) ? "fill-current" : ""}`} />
                    {isFavorite(selectedDest.name) ? "Saved" : "Save to Favorites"}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedDest(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default DestinationsPage;
