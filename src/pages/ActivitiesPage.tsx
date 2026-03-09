import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, MapPin, Clock, DollarSign, Heart, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Activity {
  name: string;
  type: string;
  destination: string;
  description: string;
  cost: number;
  duration: string;
  difficulty: string;
  image: string;
}

const allActivities: Activity[] = [
  { name: "Scuba Diving", type: "Water Sports", destination: "Bali, Indonesia", description: "Explore vibrant coral reefs and swim with manta rays in crystal-clear waters.", cost: 6700, duration: "3 hrs", difficulty: "Moderate", image: "🤿" },
  { name: "Paragliding", type: "Air Sports", destination: "Manali, India", description: "Soar over the Himalayas with panoramic views of snow-capped peaks.", cost: 2100, duration: "30 min", difficulty: "Easy", image: "🪂" },
  { name: "Bungee Jumping", type: "Extreme", destination: "Queenstown, NZ", description: "Jump from the legendary Kawarau Bridge — the world's first bungee site.", cost: 12500, duration: "1 hr", difficulty: "Extreme", image: "🎢" },
  { name: "Cooking Class", type: "Cultural", destination: "Bangkok, Thailand", description: "Learn to cook authentic Pad Thai and Tom Yum from local chefs.", cost: 2900, duration: "4 hrs", difficulty: "Easy", image: "👨‍🍳" },
  { name: "Hot Air Balloon", type: "Air Sports", destination: "Cappadocia, Turkey", description: "Float over fairy chimneys and ancient cave dwellings at sunrise.", cost: 16700, duration: "1.5 hrs", difficulty: "Easy", image: "🎈" },
  { name: "White Water Rafting", type: "Water Sports", destination: "Rishikesh, India", description: "Navigate Grade III-IV rapids on the holy Ganges river.", cost: 2500, duration: "3 hrs", difficulty: "Moderate", image: "🚣" },
  { name: "Volcano Hike", type: "Trekking", destination: "Santorini, Greece", description: "Hike the volcanic caldera and soak in natural hot springs.", cost: 1700, duration: "4 hrs", difficulty: "Moderate", image: "🌋" },
  { name: "Camel Safari", type: "Desert", destination: "Jaisalmer, India", description: "Ride through the Thar Desert dunes under a starlit sky.", cost: 1250, duration: "Full Day", difficulty: "Easy", image: "🐪" },
  { name: "Surfing Lessons", type: "Water Sports", destination: "Gold Coast, Australia", description: "Learn to surf on world-class waves with certified instructors.", cost: 5000, duration: "2 hrs", difficulty: "Moderate", image: "🏄" },
  { name: "Northern Lights Chase", type: "Nature", destination: "Tromsø, Norway", description: "Chase the aurora borealis through Arctic wilderness with expert guides.", cost: 12500, duration: "6 hrs", difficulty: "Easy", image: "🌌" },
  { name: "Tea Ceremony", type: "Cultural", destination: "Kyoto, Japan", description: "Experience the ancient art of Japanese tea preparation in a zen garden.", cost: 2500, duration: "1 hr", difficulty: "Easy", image: "🍵" },
  { name: "Zip Line Adventure", type: "Extreme", destination: "Costa Rica", description: "Glide through rainforest canopy on high-speed zip lines.", cost: 4600, duration: "2 hrs", difficulty: "Moderate", image: "🏗️" },
];

const activityTypes = ["All", "Water Sports", "Air Sports", "Extreme", "Cultural", "Trekking", "Desert", "Nature"];

const difficultyColors: Record<string, string> = {
  Easy: "bg-accent/15 text-accent",
  Moderate: "bg-primary/15 text-primary",
  Extreme: "bg-destructive/15 text-destructive",
};

const ActivitiesPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");

  const { data: saved = [] } = useQuery({
    queryKey: ["saved_activities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("saved_activities").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (activity: Activity) => {
      if (!user) throw new Error("Login required");
      const existing = saved.find((s) => s.activity_name === activity.name);
      if (existing) {
        await supabase.from("saved_activities").delete().eq("id", existing.id);
      } else {
        await supabase.from("saved_activities").insert({
          user_id: user.id,
          activity_name: activity.name,
          activity_type: activity.type,
          destination: activity.destination,
          description: activity.description,
          estimated_cost: activity.cost,
          duration: activity.duration,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_activities"] }),
    onError: () => toast.error("Sign in to save activities"),
  });

  const isSaved = (name: string) => saved.some((s) => s.activity_name === name);

  const filtered = allActivities.filter((a) => {
    const matchType = activeType === "All" || a.type === activeType;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.destination.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-2"><Flame className="h-4 w-4" /> Adventures</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Activities & Adventures</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Discover thrilling activities — save your favorites and plan your adventure</p>
          </motion.div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 text-base rounded-xl" />
            </div>
          </div>

          {/* Type Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {activityTypes.map((t) => (
              <button key={t} onClick={() => setActiveType(t)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeType === t ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((activity, i) => (
              <motion.div key={activity.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border/50 shadow-travel hover:shadow-travel-hover transition-all p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{activity.image}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[activity.difficulty] || "bg-muted text-muted-foreground"}`}>{activity.difficulty}</span>
                    <button onClick={() => toggleSave.mutate(activity)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                      <Heart className={`h-5 w-5 ${isSaved(activity.name) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-card-foreground mb-1">{activity.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> {activity.destination}</p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{activity.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-primary font-bold"><DollarSign className="h-4 w-4" />{activity.cost}</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> {activity.duration}</span>
                </div>
                <Button variant="hero" size="sm" className="mt-4 w-full gap-2">
                  <MessageCircle className="h-4 w-4" /> Chat with Local Dealer
                </Button>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No activities found.</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivitiesPage;
