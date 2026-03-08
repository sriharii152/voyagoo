import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TripItem {
  id: string;
  activity: string;
  location: string;
  time: string;
}

const defaultItems: TripItem[] = [
  { id: "1", activity: "Breakfast at local café", location: "Old Town", time: "08:00" },
  { id: "2", activity: "Visit ancient temple", location: "Temple District", time: "10:00" },
  { id: "3", activity: "Lunch by the beach", location: "Coastal Road", time: "13:00" },
  { id: "4", activity: "Sunset viewpoint hike", location: "Cliff Trail", time: "17:30" },
];

const TripPlannerSection = () => {
  const [items, setItems] = useState<TripItem[]>(defaultItems);
  const [newActivity, setNewActivity] = useState("");

  const addItem = () => {
    if (!newActivity.trim()) return;
    setItems([...items, { id: Date.now().toString(), activity: newActivity, location: "TBD", time: "12:00" }]);
    setNewActivity("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Plan</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Trip Planner
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Organize your perfect day with our interactive itinerary builder
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border/50 shadow-travel overflow-hidden">
            <div className="bg-gradient-sunset p-6">
              <h3 className="font-display text-2xl font-bold text-primary-foreground">Day 1 — Exploring the Coast</h3>
              <p className="text-primary-foreground/80 text-sm mt-1">4 activities planned</p>
            </div>

            <div className="p-6 space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl group hover:bg-muted transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[60px]">
                    <Clock className="h-3.5 w-3.5" />
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground text-sm">{item.activity}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {item.location}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}

              <div className="flex gap-2 pt-3">
                <Input
                  placeholder="Add an activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  className="flex-1"
                />
                <Button variant="hero" size="default" onClick={addItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripPlannerSection;
