import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Ticket, Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Event {
  title: string;
  location: string;
  date: string;
  time: string;
  category: string;
  price: string;
  description: string;
}

const allEvents: Event[] = [
  { title: "Lantern Festival", location: "Kyoto, Japan", date: "Mar 15, 2026", time: "6:00 PM", category: "Cultural", price: "Free", description: "Thousands of lanterns illuminate the streets of Kyoto in this magical annual celebration." },
  { title: "Beach Music Fest", location: "Bali, Indonesia", date: "Mar 22, 2026", time: "4:00 PM", category: "Music", price: "$45", description: "Three days of live music, DJs, and beach parties on Bali's famous shores." },
  { title: "Wine Tasting Tour", location: "Santorini, Greece", date: "Apr 3, 2026", time: "2:00 PM", category: "Food & Drink", price: "$65", description: "Sample the finest wines from volcanic vineyards with stunning caldera views." },
  { title: "Inca Trail Marathon", location: "Cusco, Peru", date: "Apr 10, 2026", time: "7:00 AM", category: "Sports", price: "$30", description: "Run through ancient Incan paths with breathtaking mountain scenery." },
  { title: "Cherry Blossom Viewing", location: "Tokyo, Japan", date: "Apr 1, 2026", time: "10:00 AM", category: "Cultural", price: "Free", description: "Join thousands under blooming cherry trees in Ueno Park." },
  { title: "Holi Color Festival", location: "Jaipur, India", date: "Mar 14, 2026", time: "9:00 AM", category: "Cultural", price: "Free", description: "The most vibrant festival of colors celebrating spring and love." },
  { title: "Full Moon Party", location: "Koh Phangan, Thailand", date: "Mar 25, 2026", time: "9:00 PM", category: "Music", price: "$15", description: "World-famous beach party under the full moon with fire shows and DJs." },
  { title: "Street Food Festival", location: "Bangkok, Thailand", date: "Mar 28, 2026", time: "5:00 PM", category: "Food & Drink", price: "$10", description: "Over 200 street food vendors showcasing the best of Thai cuisine." },
  { title: "Desert Safari Adventure", location: "Dubai, UAE", date: "Apr 5, 2026", time: "3:00 PM", category: "Adventure", price: "$80", description: "Dune bashing, camel rides, and BBQ dinner under the stars." },
  { title: "Yoga Retreat", location: "Rishikesh, India", date: "Apr 15, 2026", time: "6:00 AM", category: "Wellness", price: "$120", description: "A 3-day immersive yoga and meditation retreat by the Ganges." },
  { title: "Tango Night", location: "Buenos Aires, Argentina", date: "Apr 20, 2026", time: "8:00 PM", category: "Music", price: "$25", description: "Live tango performances and dance lessons in the heart of Buenos Aires." },
  { title: "Northern Lights Tour", location: "Tromsø, Norway", date: "Mar 10, 2026", time: "10:00 PM", category: "Adventure", price: "$150", description: "Chase the aurora borealis with expert guides in Arctic Norway." },
];

const categoryColors: Record<string, string> = {
  Cultural: "bg-secondary/15 text-secondary",
  Music: "bg-primary/15 text-primary",
  "Food & Drink": "bg-accent/15 text-accent",
  Sports: "bg-destructive/15 text-destructive",
  Adventure: "bg-primary/15 text-primary",
  Wellness: "bg-accent/15 text-accent",
};

const eventCategories = ["All", "Cultural", "Music", "Food & Drink", "Sports", "Adventure", "Wellness"];

const EventsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const { data: savedEvents = [] } = useQuery({
    queryKey: ["saved_events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("saved_events").select("*").eq("user_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const saveEvent = useMutation({
    mutationFn: async (event: Event) => {
      if (!user) throw new Error("Login required");
      const existing = savedEvents.find((e) => e.event_title === event.title);
      if (existing) {
        await supabase.from("saved_events").delete().eq("id", existing.id);
      } else {
        await supabase.from("saved_events").insert({
          user_id: user.id,
          event_title: event.title,
          event_location: event.location,
          event_date: event.date,
          event_time: event.time,
          event_category: event.category,
          event_price: event.price,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_events"] }),
    onError: () => toast.error("Sign in to save events"),
  });

  const isSaved = (title: string) => savedEvents.some((e) => e.event_title === title);

  const filtered = allEvents.filter((e) => {
    const matchCat = activeCategory === "All" || e.category === activeCategory;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Events</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Nearby Events</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Discover local festivals, concerts, and cultural happenings worldwide</p>
          </motion.div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 text-base rounded-xl" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {eventCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filtered.map((event, i) => (
              <motion.div key={event.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-2xl border border-border/50 shadow-travel hover:shadow-travel-hover transition-all p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[event.category] || "bg-muted text-muted-foreground"}`}>
                    {event.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold text-primary">{event.price}</span>
                    <button onClick={() => saveEvent.mutate(event)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                      <Heart className={`h-5 w-5 ${isSaved(event.title) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-card-foreground mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.date}</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {event.time}</span>
                  </div>
                </div>
                <Button variant="hero" size="sm" className="mt-4 w-full">
                  <Ticket className="h-4 w-4 mr-2" /> Get Tickets
                </Button>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground">No events found.</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;
