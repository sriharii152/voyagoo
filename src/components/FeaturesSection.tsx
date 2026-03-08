import { motion } from "framer-motion";
import { Map, CalendarDays, Wallet, Music, Hotel, Navigation, Flame, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Map, title: "Destination Explorer", desc: "Browse curated destinations with stunning visuals and local tips", color: "text-secondary", href: "/destinations" },
  { icon: CalendarDays, title: "Trip Planner", desc: "Build day-by-day itineraries with smart scheduling and reminders", color: "text-primary", href: "/planner" },
  { icon: Wallet, title: "Budget Tracker", desc: "Set budgets, log expenses, and get real-time spending breakdowns", color: "text-accent", href: "/budget" },
  { icon: Music, title: "Nearby Events", desc: "Discover local festivals, concerts, and cultural happenings", color: "text-primary", href: "/events" },
  { icon: Hotel, title: "Hotel Booking", desc: "Compare and book hotels with best price guarantees", color: "text-secondary", href: "/bookings" },
  { icon: Navigation, title: "Smart Navigator", desc: "Offline maps, turn-by-turn directions, and saved routes", color: "text-primary", href: "/explore" },
  { icon: Flame, title: "Activities & Adventures", desc: "Discover adventure, fun & crazy activities — chat with local dealers for info and bookings", color: "text-primary", href: "/activities" },
  { icon: ShieldCheck, title: "Safety & Alerts", desc: "Weather updates, traffic alerts, emergency numbers, and safe route suggestions", color: "text-destructive", href: "/safety" },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Features</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Everything You Need
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            One app to plan, explore, budget, and navigate your adventures
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <Link key={feat.title} to={feat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-8 shadow-travel hover:shadow-travel-hover transition-all duration-300 group cursor-pointer border border-border/50 h-full"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-5 ${feat.color} transition-transform group-hover:scale-110`}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-card-foreground mb-2">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
