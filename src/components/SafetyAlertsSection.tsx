import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CloudSun,
  TrafficCone,
  Phone,
  Route,
  AlertTriangle,
  ChevronDown,
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  Siren,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ──────────── Data ──────────── */

interface WeatherAlert {
  city: string;
  temp: string;
  condition: string;
  icon: typeof CloudSun;
  humidity: string;
  wind: string;
  advisory: string;
  severity: "low" | "medium" | "high";
}

const weatherAlerts: WeatherAlert[] = [
  { city: "Bali", temp: "31°C", condition: "Tropical Storm Warning", icon: Droplets, humidity: "89%", wind: "45 km/h", advisory: "Heavy rainfall expected. Avoid outdoor activities near coastline.", severity: "high" },
  { city: "Paris", temp: "8°C", condition: "Cold Wave", icon: Thermometer, humidity: "72%", wind: "20 km/h", advisory: "Temperatures dropping below freezing tonight. Dress warmly.", severity: "medium" },
  { city: "Dubai", temp: "42°C", condition: "Extreme Heat", icon: Thermometer, humidity: "35%", wind: "15 km/h", advisory: "Heat stroke risk — stay hydrated and avoid midday sun.", severity: "high" },
  { city: "Kyoto", temp: "18°C", condition: "Clear Skies", icon: CloudSun, humidity: "55%", wind: "10 km/h", advisory: "Great weather for sightseeing. UV index moderate.", severity: "low" },
  { city: "Santorini", temp: "24°C", condition: "Windy", icon: Wind, humidity: "60%", wind: "35 km/h", advisory: "Strong winds on coastal cliffs. Secure belongings.", severity: "medium" },
];

interface TrafficAlert {
  location: string;
  type: string;
  status: "active" | "clearing" | "resolved";
  detail: string;
}

const trafficAlerts: TrafficAlert[] = [
  { location: "Bali – Kuta to Ubud", type: "Road Closure", status: "active", detail: "Landslide debris on main road. Detour via Gianyar bypass." },
  { location: "Paris – CDG Airport", type: "Heavy Traffic", status: "active", detail: "Strike-related delays. Allow extra 90 min for airport transfers." },
  { location: "Jaipur – NH48", type: "Construction", status: "clearing", detail: "Lane reduction near Ajmer toll. Expect 30 min delays." },
  { location: "Goa – Calangute", type: "Festival Closure", status: "active", detail: "Beach road closed for carnival. Use parallel inland route." },
  { location: "Ladakh – Rohtang Pass", type: "Snow Closure", status: "resolved", detail: "Pass reopened after clearance. Chains recommended." },
];

interface EmergencyNumber {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  tourist: string;
}

const emergencyNumbers: EmergencyNumber[] = [
  { country: "India", police: "100", ambulance: "108", fire: "101", tourist: "1363" },
  { country: "Japan", police: "110", ambulance: "119", fire: "119", tourist: "+81-3-3503-8484" },
  { country: "Greece", police: "100", ambulance: "166", fire: "199", tourist: "171" },
  { country: "Indonesia", police: "110", ambulance: "118", fire: "113", tourist: "+62-21-526-0200" },
  { country: "France", police: "17", ambulance: "15", fire: "18", tourist: "3246" },
  { country: "Peru", police: "105", ambulance: "116", fire: "116", tourist: "01-574-8000" },
  { country: "UAE", police: "999", ambulance: "998", fire: "997", tourist: "901" },
  { country: "USA", police: "911", ambulance: "911", fire: "911", tourist: "1-888-407-4747" },
];

interface SafeRoute {
  from: string;
  to: string;
  recommendation: string;
  safetyScore: number;
  tips: string[];
}

const safeRoutes: SafeRoute[] = [
  { from: "Airport", to: "Ubud, Bali", recommendation: "Use registered Grab/Gojek. Avoid unlicensed taxis at night.", safetyScore: 8, tips: ["Book transport in advance", "Share ride details with someone", "Use well-lit routes"] },
  { from: "CDG Airport", to: "Central Paris", recommendation: "Take RER B or licensed taxi. Avoid offers from unofficial drivers.", safetyScore: 9, tips: ["Keep valuables hidden on metro", "Use official taxi stands", "Download offline metro map"] },
  { from: "Jaipur Station", to: "Amber Fort", recommendation: "Pre-book auto or use Uber. Negotiate price before boarding.", safetyScore: 7, tips: ["Travel in groups after dark", "Keep copies of documents", "Stay on main roads"] },
  { from: "Cusco", to: "Machu Picchu", recommendation: "Use Peru Rail or Inca Rail. Book tickets well in advance.", safetyScore: 8, tips: ["Acclimatize before the trek", "Carry altitude sickness pills", "Register with local authorities"] },
];

/* ──────────── Helpers ──────────── */

const severityColors: Record<string, string> = {
  low: "bg-accent/15 text-accent border-accent/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusColors: Record<string, string> = {
  active: "bg-destructive/15 text-destructive",
  clearing: "bg-primary/15 text-primary",
  resolved: "bg-accent/15 text-accent",
};

type Tab = "weather" | "traffic" | "emergency" | "routes";

const tabs: { id: Tab; label: string; icon: typeof CloudSun }[] = [
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "traffic", label: "Traffic", icon: TrafficCone },
  { id: "emergency", label: "Emergency", icon: Phone },
  { id: "routes", label: "Safe Routes", icon: Route },
];

/* ──────────── Component ──────────── */

const SafetyAlertsSection = () => {
  const [activeTab, setActiveTab] = useState<Tab>("weather");
  const [emergencySearch, setEmergencySearch] = useState("");

  const filteredEmergency = emergencyNumbers.filter((e) =>
    e.country.toLowerCase().includes(emergencySearch.toLowerCase())
  );

  return (
    <section id="safety" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-destructive font-semibold text-sm uppercase tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Safety First
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
            Travel Alerts & Safety
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Real-time weather, traffic alerts, emergency contacts, and safe route suggestions for your destinations
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-foreground text-background shadow-lg"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Weather */}
          {activeTab === "weather" && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {weatherAlerts.map((w, i) => (
                <motion.div
                  key={w.city}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-2xl border p-5 ${severityColors[w.severity]} transition-shadow hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-lg font-bold">{w.city}</h3>
                      <p className="text-xs opacity-75">{w.condition}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{w.temp}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mb-3 opacity-80">
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{w.humidity}</span>
                    <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{w.wind}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs bg-background/50 rounded-lg p-2.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{w.advisory}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Traffic */}
          {activeTab === "traffic" && (
            <motion.div
              key="traffic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 max-w-3xl mx-auto"
            >
              {trafficAlerts.map((t, i) => (
                <motion.div
                  key={t.location}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <h3 className="font-display font-semibold text-foreground">{t.location}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{t.detail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                        {t.type}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Emergency Numbers */}
          {activeTab === "emergency" && (
            <motion.div
              key="emergency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-6">
                <Input
                  placeholder="Search by country..."
                  value={emergencySearch}
                  onChange={(e) => setEmergencySearch(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEmergency.map((e, i) => (
                  <motion.div
                    key={e.country}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Siren className="h-4 w-4 text-destructive" />
                      {e.country}
                    </h3>
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                      <div className="bg-muted rounded-lg p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Police</span>
                        <p className="font-bold text-foreground">{e.police}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ambulance</span>
                        <p className="font-bold text-foreground">{e.ambulance}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fire</span>
                        <p className="font-bold text-foreground">{e.fire}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tourist Help</span>
                        <p className="font-bold text-foreground text-xs">{e.tourist}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Safe Routes */}
          {activeTab === "routes" && (
            <motion.div
              key="routes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 max-w-3xl mx-auto"
            >
              {safeRoutes.map((r, i) => (
                <motion.div
                  key={r.from + r.to}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span className="font-display font-semibold text-foreground">{r.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-display font-semibold text-foreground">{r.to}</span>
                    <span className="ml-auto text-xs font-bold bg-accent/15 text-accent px-2.5 py-1 rounded-full">
                      Safety {r.safetyScore}/10
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{r.recommendation}</p>
                  <div className="flex flex-wrap gap-2">
                    {r.tips.map((tip) => (
                      <span key={tip} className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-accent" />
                        {tip}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SafetyAlertsSection;
