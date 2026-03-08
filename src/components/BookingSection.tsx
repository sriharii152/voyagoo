import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Train, Bus, ArrowRight, CalendarDays, MapPin, Users, ArrowLeftRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type BookingType = "flight" | "train" | "bus";

interface BookingProvider {
  name: string;
  url: string;
  logo: string;
  description: string;
}

const providers: Record<BookingType, BookingProvider[]> = {
  flight: [
    { name: "MakeMyTrip", url: "https://www.makemytrip.com/flights/", logo: "✈️", description: "India's leading travel company" },
    { name: "Skyscanner", url: "https://www.skyscanner.co.in/flights", logo: "🔍", description: "Compare prices across airlines" },
    { name: "Google Flights", url: "https://www.google.com/travel/flights", logo: "🌐", description: "Search & compare globally" },
    { name: "Goibibo", url: "https://www.goibibo.com/flights/", logo: "🎫", description: "Best deals on domestic flights" },
  ],
  train: [
    { name: "IRCTC", url: "https://www.irctc.co.in/", logo: "🚆", description: "Official Indian Railways booking" },
    { name: "Trainman", url: "https://www.trainman.in/", logo: "📋", description: "PNR status & availability" },
    { name: "ConfirmTkt", url: "https://www.confirmtkt.com/", logo: "✅", description: "Smart train booking" },
    { name: "RailYatri", url: "https://www.railyatri.in/", logo: "🗺️", description: "Live train tracking & booking" },
  ],
  bus: [
    { name: "RedBus", url: "https://www.redbus.in/", logo: "🚌", description: "India's largest bus booking platform" },
    { name: "AbhiBus", url: "https://www.abhibus.com/", logo: "🎟️", description: "Bus tickets at lowest prices" },
    { name: "MakeMyTrip Bus", url: "https://www.makemytrip.com/bus-tickets/", logo: "🚍", description: "Trusted bus booking" },
    { name: "Paytm Bus", url: "https://paytm.com/bus-tickets", logo: "💳", description: "Book & pay seamlessly" },
  ],
};

const tabConfig: { type: BookingType; label: string; icon: typeof Plane }[] = [
  { type: "flight", label: "Flights", icon: Plane },
  { type: "train", label: "Trains", icon: Train },
  { type: "bus", label: "Buses", icon: Bus },
];

const BookingPage = () => {
  const [activeTab, setActiveTab] = useState<BookingType>("flight");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };

  const buildSearchUrl = (provider: BookingProvider) => {
    // Build a search-friendly URL with query params where possible
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    // Most providers don't support deep-linking with params, so we open their main page
    return provider.url;
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Book Now</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Travel Bookings
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Search and book flights, trains, and buses through trusted travel partners
          </p>
        </motion.div>

        {/* Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-card rounded-3xl border border-border shadow-travel-hover overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-border">
            {tabConfig.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-semibold transition-all relative ${
                  activeTab === type
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
                {activeTab === type && (
                  <motion.div
                    layoutId="booking-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end mb-6">
              {/* From */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Departure city"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Swap button */}
              <button
                onClick={swapCities}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors self-end mb-1"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              {/* To */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Arrival city"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Travel Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Passenger" : "Passengers"}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Providers */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Book via trusted partners
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providers[activeTab].map((provider) => (
                    <a
                      key={provider.name}
                      href={buildSearchUrl(provider)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-background hover:border-primary/50 hover:shadow-travel transition-all"
                    >
                      <span className="text-2xl">{provider.logo}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {provider.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{provider.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingPage;
