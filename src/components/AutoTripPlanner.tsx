import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Route, Hotel, UtensilsCrossed, CalendarHeart, Bus, DollarSign, Users, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TripPlan {
  destination: string;
  route: { from: string; to: string; mode: string; duration: string; cost: number }[];
  stay: { type: string; name: string; costPerNight: number; rating: number }[];
  food: { meal: string; suggestion: string; costPerMeal: number }[];
  events: { name: string; type: string; cost: number; duration: string }[];
  transport: { mode: string; description: string; costPerDay: number }[];
  totalPerPersonPerDay: number;
}

const destinationPlans: Record<string, TripPlan> = {
  bali: {
    destination: "Bali, Indonesia",
    route: [
      { from: "Airport", to: "Ubud", mode: "Private Car", duration: "1.5 hrs", cost: 25 },
      { from: "Ubud", to: "Seminyak", mode: "Scooter", duration: "1 hr", cost: 8 },
      { from: "Seminyak", to: "Uluwatu", mode: "Taxi", duration: "45 min", cost: 15 },
    ],
    stay: [
      { type: "Budget", name: "Cozy Guesthouse", costPerNight: 20, rating: 4.2 },
      { type: "Mid-Range", name: "Boutique Villa", costPerNight: 60, rating: 4.6 },
      { type: "Luxury", name: "Beachfront Resort", costPerNight: 150, rating: 4.9 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Smoothie Bowl Café", costPerMeal: 5 },
      { meal: "Lunch", suggestion: "Local Warung", costPerMeal: 3 },
      { meal: "Dinner", suggestion: "Beachside Grill", costPerMeal: 12 },
    ],
    events: [
      { name: "Uluwatu Temple Sunset", type: "Cultural", cost: 5, duration: "2 hrs" },
      { name: "Rice Terrace Trek", type: "Adventure", cost: 15, duration: "3 hrs" },
      { name: "Cooking Class", type: "Experience", cost: 25, duration: "4 hrs" },
    ],
    transport: [
      { mode: "Scooter Rental", description: "Most popular for exploring", costPerDay: 8 },
      { mode: "Private Driver", description: "Comfortable full-day tours", costPerDay: 40 },
      { mode: "Grab/Gojek", description: "On-demand rides", costPerDay: 15 },
    ],
    totalPerPersonPerDay: 60,
  },
  santorini: {
    destination: "Santorini, Greece",
    route: [
      { from: "Airport", to: "Fira", mode: "Bus", duration: "30 min", cost: 5 },
      { from: "Fira", to: "Oia", mode: "Bus", duration: "25 min", cost: 3 },
      { from: "Oia", to: "Red Beach", mode: "Taxi", duration: "20 min", cost: 20 },
    ],
    stay: [
      { type: "Budget", name: "Hostel in Fira", costPerNight: 40, rating: 4.0 },
      { type: "Mid-Range", name: "Cave Hotel", costPerNight: 120, rating: 4.7 },
      { type: "Luxury", name: "Caldera View Suite", costPerNight: 300, rating: 4.9 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Greek Bakery", costPerMeal: 8 },
      { meal: "Lunch", suggestion: "Seaside Taverna", costPerMeal: 15 },
      { meal: "Dinner", suggestion: "Fine Dining Sunset", costPerMeal: 40 },
    ],
    events: [
      { name: "Sunset Catamaran Cruise", type: "Romantic", cost: 80, duration: "5 hrs" },
      { name: "Wine Tasting Tour", type: "Experience", cost: 35, duration: "3 hrs" },
      { name: "Volcano Hike", type: "Adventure", cost: 20, duration: "4 hrs" },
    ],
    transport: [
      { mode: "ATV Rental", description: "Fun island exploration", costPerDay: 30 },
      { mode: "Public Bus", description: "Budget-friendly routes", costPerDay: 10 },
      { mode: "Private Transfer", description: "Door-to-door comfort", costPerDay: 60 },
    ],
    totalPerPersonPerDay: 150,
  },
  kyoto: {
    destination: "Kyoto, Japan",
    route: [
      { from: "Osaka Airport", to: "Kyoto Station", mode: "Haruka Express", duration: "75 min", cost: 30 },
      { from: "Kyoto Station", to: "Arashiyama", mode: "JR Train", duration: "20 min", cost: 3 },
      { from: "Arashiyama", to: "Fushimi Inari", mode: "Bus", duration: "40 min", cost: 3 },
    ],
    stay: [
      { type: "Budget", name: "Capsule Hotel", costPerNight: 30, rating: 4.1 },
      { type: "Mid-Range", name: "Traditional Ryokan", costPerNight: 100, rating: 4.7 },
      { type: "Luxury", name: "5-Star Onsen Resort", costPerNight: 250, rating: 4.9 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Konbini & Matcha", costPerMeal: 5 },
      { meal: "Lunch", suggestion: "Ramen Street Shop", costPerMeal: 10 },
      { meal: "Dinner", suggestion: "Kaiseki Restaurant", costPerMeal: 35 },
    ],
    events: [
      { name: "Bamboo Grove Walk", type: "Nature", cost: 0, duration: "1.5 hrs" },
      { name: "Tea Ceremony", type: "Cultural", cost: 30, duration: "1 hr" },
      { name: "Geisha District Tour", type: "Experience", cost: 20, duration: "2 hrs" },
    ],
    transport: [
      { mode: "Day Bus Pass", description: "Unlimited city buses", costPerDay: 7 },
      { mode: "Bicycle Rental", description: "Best for temple hopping", costPerDay: 10 },
      { mode: "JR Rail Pass", description: "Trains & bullet trains", costPerDay: 25 },
    ],
    totalPerPersonPerDay: 120,
  },
  paris: {
    destination: "Paris, France",
    route: [
      { from: "CDG Airport", to: "City Center", mode: "RER B Train", duration: "50 min", cost: 12 },
      { from: "Eiffel Tower", to: "Louvre", mode: "Metro", duration: "20 min", cost: 2 },
      { from: "Louvre", to: "Montmartre", mode: "Metro", duration: "15 min", cost: 2 },
    ],
    stay: [
      { type: "Budget", name: "Hostel in Marais", costPerNight: 35, rating: 4.0 },
      { type: "Mid-Range", name: "Boutique Hotel", costPerNight: 130, rating: 4.5 },
      { type: "Luxury", name: "5-Star Champs-Élysées", costPerNight: 350, rating: 4.9 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Croissant & Café", costPerMeal: 8 },
      { meal: "Lunch", suggestion: "Bistro du Quartier", costPerMeal: 18 },
      { meal: "Dinner", suggestion: "Seine-side Restaurant", costPerMeal: 45 },
    ],
    events: [
      { name: "Eiffel Tower Visit", type: "Landmark", cost: 25, duration: "2 hrs" },
      { name: "Louvre Museum", type: "Cultural", cost: 17, duration: "4 hrs" },
      { name: "Seine River Cruise", type: "Romantic", cost: 15, duration: "1 hr" },
    ],
    transport: [
      { mode: "Metro Day Pass", description: "Unlimited metro & bus", costPerDay: 15 },
      { mode: "Walking Tours", description: "Best for neighborhoods", costPerDay: 0 },
      { mode: "Uber/Bolt", description: "Convenient rides", costPerDay: 30 },
    ],
    totalPerPersonPerDay: 180,
  },
  goa: {
    destination: "Goa, India",
    route: [
      { from: "Dabolim Airport", to: "North Goa", mode: "Taxi", duration: "1 hr", cost: 10 },
      { from: "Baga Beach", to: "Old Goa", mode: "Scooter", duration: "30 min", cost: 3 },
      { from: "Old Goa", to: "South Goa", mode: "Taxi", duration: "45 min", cost: 12 },
    ],
    stay: [
      { type: "Budget", name: "Beach Hostel", costPerNight: 8, rating: 4.0 },
      { type: "Mid-Range", name: "Beach Shack Resort", costPerNight: 35, rating: 4.4 },
      { type: "Luxury", name: "5-Star Beach Resort", costPerNight: 120, rating: 4.8 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Café by the Beach", costPerMeal: 3 },
      { meal: "Lunch", suggestion: "Fish Thali Spot", costPerMeal: 4 },
      { meal: "Dinner", suggestion: "Beachside Shack", costPerMeal: 8 },
    ],
    events: [
      { name: "Water Sports Pack", type: "Adventure", cost: 20, duration: "3 hrs" },
      { name: "Spice Plantation Tour", type: "Experience", cost: 10, duration: "2 hrs" },
      { name: "Night Market Visit", type: "Shopping", cost: 0, duration: "2 hrs" },
    ],
    transport: [
      { mode: "Scooter Rental", description: "Best way to explore Goa", costPerDay: 5 },
      { mode: "Auto Rickshaw", description: "Short trips", costPerDay: 8 },
      { mode: "Rented Car", description: "Family comfort", costPerDay: 25 },
    ],
    totalPerPersonPerDay: 40,
  },
  dubai: {
    destination: "Dubai, UAE",
    route: [
      { from: "DXB Airport", to: "Downtown", mode: "Metro", duration: "30 min", cost: 3 },
      { from: "Downtown", to: "Marina", mode: "Tram", duration: "20 min", cost: 2 },
      { from: "Marina", to: "Desert Safari", mode: "Tour Pickup", duration: "1 hr", cost: 0 },
    ],
    stay: [
      { type: "Budget", name: "City Hotel Deira", costPerNight: 50, rating: 3.9 },
      { type: "Mid-Range", name: "Marina View Hotel", costPerNight: 120, rating: 4.5 },
      { type: "Luxury", name: "Burj Al Arab Suite", costPerNight: 500, rating: 5.0 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Hotel Buffet", costPerMeal: 15 },
      { meal: "Lunch", suggestion: "Mall Food Court", costPerMeal: 12 },
      { meal: "Dinner", suggestion: "Arabian Fine Dining", costPerMeal: 50 },
    ],
    events: [
      { name: "Desert Safari", type: "Adventure", cost: 60, duration: "6 hrs" },
      { name: "Burj Khalifa Entry", type: "Landmark", cost: 40, duration: "2 hrs" },
      { name: "Dubai Mall Aquarium", type: "Family", cost: 30, duration: "2 hrs" },
    ],
    transport: [
      { mode: "Metro + Tram", description: "Clean and efficient", costPerDay: 8 },
      { mode: "Taxi/Uber", description: "Affordable city rides", costPerDay: 25 },
      { mode: "Hop-on Bus", description: "Tourist sightseeing", costPerDay: 50 },
    ],
    totalPerPersonPerDay: 200,
  },
  manali: {
    destination: "Manali, India",
    route: [
      { from: "Chandigarh", to: "Manali", mode: "Volvo Bus", duration: "10 hrs", cost: 15 },
      { from: "Manali", to: "Solang Valley", mode: "Local Taxi", duration: "30 min", cost: 5 },
      { from: "Manali", to: "Rohtang Pass", mode: "Shared Jeep", duration: "2 hrs", cost: 10 },
    ],
    stay: [
      { type: "Budget", name: "Backpacker Hostel", costPerNight: 6, rating: 4.1 },
      { type: "Mid-Range", name: "Riverside Cottage", costPerNight: 25, rating: 4.5 },
      { type: "Luxury", name: "Mountain Resort", costPerNight: 80, rating: 4.7 },
    ],
    food: [
      { meal: "Breakfast", suggestion: "Paratha & Chai Stall", costPerMeal: 2 },
      { meal: "Lunch", suggestion: "Tibetan Momos Shop", costPerMeal: 3 },
      { meal: "Dinner", suggestion: "Bonfire BBQ Restaurant", costPerMeal: 6 },
    ],
    events: [
      { name: "Paragliding at Solang", type: "Adventure", cost: 20, duration: "30 min" },
      { name: "Rohtang Pass Trip", type: "Scenic", cost: 15, duration: "Full Day" },
      { name: "Old Manali Walk", type: "Leisure", cost: 0, duration: "2 hrs" },
    ],
    transport: [
      { mode: "Local Bus", description: "Cheapest option", costPerDay: 3 },
      { mode: "Rented Bike", description: "Thrilling mountain roads", costPerDay: 10 },
      { mode: "Private Taxi", description: "Comfortable sightseeing", costPerDay: 30 },
    ],
    totalPerPersonPerDay: 35,
  },
};

const availableDestinations = [
  "Bali", "Santorini", "Kyoto", "Paris", "Goa", "Dubai", "Manali",
];

const iconMap = {
  route: Route,
  stay: Hotel,
  food: UtensilsCrossed,
  events: CalendarHeart,
  transport: Bus,
};

const sectionConfig = [
  { key: "route" as const, label: "Route Plan", icon: "route" as const },
  { key: "stay" as const, label: "Where to Stay", icon: "stay" as const },
  { key: "food" as const, label: "Food Guide", icon: "food" as const },
  { key: "events" as const, label: "Events & Activities", icon: "events" as const },
  { key: "transport" as const, label: "Local Transport", icon: "transport" as const },
];

const AutoTripPlanner = () => {
  const [destination, setDestination] = useState("");
  const [people, setPeople] = useState("1");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("route");

  const handlePlan = () => {
    const key = destination.toLowerCase().trim();
    if (!destinationPlans[key]) return;
    setLoading(true);
    setTimeout(() => {
      setPlan(destinationPlans[key]);
      setLoading(false);
      setActiveTab("route");
    }, 800);
  };

  const numPeople = parseInt(people) || 1;

  return (
    <div className="px-6 py-5 border-t border-border">
      {/* OR Divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-bold text-foreground">Auto-Plan by Destination</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Destination
          </label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a destination" />
            </SelectTrigger>
            <SelectContent>
              {availableDestinations.map((d) => (
                <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> People
          </label>
          <Input
            type="number"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            min={1}
            max={20}
            placeholder="1"
          />
        </div>
      </div>

      <Button onClick={handlePlan} variant="hero" className="gap-2" disabled={!destination || loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Planning..." : "Auto-Plan My Trip"}
      </Button>

      {/* Results */}
      <AnimatePresence mode="wait">
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-foreground">{plan.destination}</h4>
              <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold">
                <DollarSign className="h-3.5 w-3.5" />
                ~${plan.totalPerPersonPerDay * numPeople}/day for {numPeople} {numPeople === 1 ? "person" : "people"}
              </div>
            </div>

            {/* Budget breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[1, 2, 4, 6].map((n) => (
                <div key={n} className={`rounded-lg p-2 text-center text-xs border transition-colors ${n === numPeople ? "bg-primary/10 border-primary text-primary font-bold" : "bg-muted/50 border-border text-muted-foreground"}`}>
                  <span className="block font-semibold text-sm">${plan.totalPerPersonPerDay * n}</span>
                  /day for {n} {n === 1 ? "person" : "people"}
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {sectionConfig.map(({ key, label, icon }) => {
                const Icon = iconMap[icon];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeTab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {activeTab === "route" && plan.route.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.from} → {r.to}</p>
                      <p className="text-xs text-muted-foreground">{r.mode} · {r.duration}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">${r.cost * numPeople}</span>
                  </div>
                ))}

                {activeTab === "stay" && plan.stay.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Hotel className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.type} · ⭐ {s.rating}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">${s.costPerNight * numPeople}/night</span>
                  </div>
                ))}

                {activeTab === "food" && plan.food.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{f.suggestion}</p>
                      <p className="text-xs text-muted-foreground">{f.meal}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">${f.costPerMeal * numPeople}</span>
                  </div>
                ))}

                {activeTab === "events" && plan.events.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <CalendarHeart className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{e.name}</p>
                      <p className="text-xs text-muted-foreground">{e.type} · {e.duration}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">${e.cost * numPeople}</span>
                  </div>
                ))}

                {activeTab === "transport" && plan.transport.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Bus className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.mode}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">${t.costPerDay * numPeople}/day</span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoTripPlanner;
