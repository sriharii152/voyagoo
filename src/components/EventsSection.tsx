import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  { title: "Lantern Festival", location: "Kyoto, Japan", date: "Mar 15", time: "6:00 PM", category: "Cultural", price: "Free" },
  { title: "Beach Music Fest", location: "Bali, Indonesia", date: "Mar 22", time: "4:00 PM", category: "Music", price: "$45" },
  { title: "Wine Tasting Tour", location: "Santorini, Greece", date: "Apr 3", time: "2:00 PM", category: "Food & Drink", price: "$65" },
  { title: "Inca Trail Marathon", location: "Cusco, Peru", date: "Apr 10", time: "7:00 AM", category: "Sports", price: "$30" },
];

const categoryColors: Record<string, string> = {
  Cultural: "bg-ocean/15 text-ocean",
  Music: "bg-primary/15 text-primary",
  "Food & Drink": "bg-forest/15 text-forest",
  Sports: "bg-sunset/15 text-sunset",
};

const EventsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Events</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Nearby Events
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Don't miss the best local experiences at your destinations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border/50 shadow-travel hover:shadow-travel-hover transition-all p-6 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[event.category]}`}>
                  {event.category}
                </span>
                <span className="font-display text-lg font-bold text-primary">{event.price}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-card-foreground mb-3">{event.title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {event.location}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.date}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {event.time}</span>
                </div>
              </div>
              <Button variant="ocean" size="sm" className="mt-4 w-full">
                <Ticket className="h-4 w-4 mr-2" /> Get Tickets
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
