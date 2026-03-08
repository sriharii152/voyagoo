import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Clock, MapPin, CalendarDays, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ItineraryItem {
  id: string;
  activity: string;
  location: string;
  time: string;
  day_number: number;
  sort_order: number;
}

const PlannerPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [activeDay, setActiveDay] = useState(1);
  const [newActivity, setNewActivity] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTime, setNewTime] = useState("12:00");
  const [totalDays, setTotalDays] = useState(3);

  const { data: trips = [] } = useQuery({
    queryKey: ["saved_trips", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("saved_trips").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["itinerary", selectedTrip],
    queryFn: async () => {
      if (!selectedTrip || !user) return [];
      const { data } = await supabase.from("trip_itinerary_items").select("*").eq("trip_id", selectedTrip).eq("user_id", user.id).order("sort_order");
      return (data || []) as ItineraryItem[];
    },
    enabled: !!selectedTrip && !!user,
  });

  const addItem = useMutation({
    mutationFn: async () => {
      if (!user || !selectedTrip || !newActivity.trim()) return;
      const dayItems = items.filter((i) => i.day_number === activeDay);
      await supabase.from("trip_itinerary_items").insert({
        user_id: user.id,
        trip_id: selectedTrip,
        activity: newActivity.trim(),
        location: newLocation.trim() || "TBD",
        time: newTime,
        day_number: activeDay,
        sort_order: dayItems.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary"] });
      setNewActivity("");
      setNewLocation("");
      setNewTime("12:00");
      toast.success("Activity added!");
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("trip_itinerary_items").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary"] });
      toast.success("Activity removed");
    },
  });

  const createTrip = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { data } = await supabase.from("saved_trips").insert({
        user_id: user.id,
        title: `Trip ${new Date().toLocaleDateString()}`,
        destination: "Undecided",
        category: "international",
      }).select().single();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["saved_trips"] });
      if (data) setSelectedTrip(data.id);
      toast.success("New trip created!");
    },
  });

  const dayItems = items.filter((i) => i.day_number === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Sign in to use Trip Planner</h2>
          <p className="text-muted-foreground mt-2">Create day-by-day itineraries for your trips</p>
          <Button variant="hero" className="mt-6" onClick={() => window.location.href = "/auth"}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Plan</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">Trip Planner</h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Build day-by-day itineraries with smart scheduling</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {/* Trip Selection */}
            <div className="flex gap-3 mb-6">
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a trip..." />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title} — {t.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="hero" onClick={() => createTrip.mutate()}>
                <Plus className="h-4 w-4 mr-1" /> New Trip
              </Button>
            </div>

            {selectedTrip && (
              <div className="bg-card rounded-2xl border border-border/50 shadow-travel overflow-hidden">
                {/* Day Tabs */}
                <div className="bg-gradient-sunset p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-lg font-bold text-primary-foreground">
                      {trips.find((t) => t.id === selectedTrip)?.title || "My Trip"}
                    </h3>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                      const count = items.filter((it) => it.day_number === day).length;
                      return (
                        <button key={day} onClick={() => setActiveDay(day)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeDay === day ? "bg-card text-foreground shadow" : "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"}`}>
                          Day {day} {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
                        </button>
                      );
                    })}
                    <button onClick={() => setTotalDays((d) => d + 1)} className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-3">
                  <AnimatePresence>
                    {dayItems.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl group hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
                          <Clock className="h-3.5 w-3.5" /> {item.time}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-card-foreground text-sm">{item.activity}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {item.location}</p>
                        </div>
                        <button onClick={() => deleteItem.mutate(item.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {dayItems.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No activities for Day {activeDay}. Add one below!</p>
                  )}

                  {/* Add Form */}
                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-3">
                      <Input placeholder="Activity name..." value={newActivity} onChange={(e) => setNewActivity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem.mutate()} />
                      <Input placeholder="Location..." value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                      <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-32" />
                    </div>
                    <Button variant="hero" className="w-full" onClick={() => addItem.mutate()} disabled={!newActivity.trim()}>
                      <Plus className="h-4 w-4 mr-2" /> Add Activity
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlannerPage;
