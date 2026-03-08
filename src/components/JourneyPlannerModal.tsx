import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, Calendar, Wallet, MapPin, Star, Search, Sparkles,
  Route, Utensils, Music, Bus, Hotel, Loader2, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import destSantorini from "@/assets/dest-santorini.jpg";
import destKyoto from "@/assets/dest-kyoto.jpg";
import destMachuPicchu from "@/assets/dest-machupicchu.jpg";
import destBali from "@/assets/dest-bali.jpg";

/* ── Data ── */

interface JourneyPlace {
  name: string;
  country: string;
  image: string;
  rating: number;
  tag: string;
  category: "state" | "national" | "international";
  budgetPerPerson: number;
  minDays: number;
  maxDays: number;
  bestForGroup: string[];
}

const allPlaces: JourneyPlace[] = [
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic", category: "international", budgetPerPerson: 150, minDays: 4, maxDays: 10, bestForGroup: ["couple", "solo", "friends"] },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural", category: "international", budgetPerPerson: 120, minDays: 3, maxDays: 14, bestForGroup: ["couple", "solo", "friends", "family"] },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "international", budgetPerPerson: 100, minDays: 3, maxDays: 7, bestForGroup: ["friends", "solo", "couple"] },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical", category: "international", budgetPerPerson: 60, minDays: 5, maxDays: 21, bestForGroup: ["couple", "solo", "friends", "family"] },
  { name: "Jaipur", country: "Rajasthan", image: destSantorini, rating: 4.6, tag: "Heritage", category: "national", budgetPerPerson: 30, minDays: 2, maxDays: 5, bestForGroup: ["family", "couple", "friends"] },
  { name: "Kerala", country: "God's Own Country", image: destBali, rating: 4.8, tag: "Nature", category: "national", budgetPerPerson: 35, minDays: 3, maxDays: 10, bestForGroup: ["couple", "family", "friends"] },
  { name: "Varanasi", country: "Uttar Pradesh", image: destKyoto, rating: 4.5, tag: "Spiritual", category: "national", budgetPerPerson: 20, minDays: 2, maxDays: 5, bestForGroup: ["solo", "family", "friends"] },
  { name: "Ladakh", country: "Jammu & Kashmir", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "national", budgetPerPerson: 50, minDays: 5, maxDays: 14, bestForGroup: ["friends", "solo", "couple"] },
  { name: "Munnar", country: "Kerala", image: destBali, rating: 4.7, tag: "Hill Station", category: "state", budgetPerPerson: 25, minDays: 2, maxDays: 5, bestForGroup: ["couple", "family", "friends"] },
  { name: "Coorg", country: "Karnataka", image: destKyoto, rating: 4.6, tag: "Coffee Country", category: "state", budgetPerPerson: 20, minDays: 2, maxDays: 4, bestForGroup: ["couple", "friends", "family"] },
  { name: "Ooty", country: "Tamil Nadu", image: destMachuPicchu, rating: 4.5, tag: "Scenic", category: "state", budgetPerPerson: 18, minDays: 2, maxDays: 5, bestForGroup: ["family", "couple", "friends"] },
  { name: "Lonavala", country: "Maharashtra", image: destSantorini, rating: 4.4, tag: "Weekend Getaway", category: "state", budgetPerPerson: 15, minDays: 1, maxDays: 3, bestForGroup: ["couple", "friends", "family", "solo"] },
  { name: "Goa", country: "India", image: destBali, rating: 4.8, tag: "Beach & Nightlife", category: "national", budgetPerPerson: 40, minDays: 3, maxDays: 10, bestForGroup: ["friends", "couple", "solo"] },
  { name: "Manali", country: "Himachal Pradesh", image: destMachuPicchu, rating: 4.7, tag: "Snow & Adventure", category: "national", budgetPerPerson: 35, minDays: 3, maxDays: 7, bestForGroup: ["friends", "couple", "solo", "family"] },
  { name: "Paris", country: "France", image: destSantorini, rating: 4.9, tag: "Romance & Art", category: "international", budgetPerPerson: 180, minDays: 4, maxDays: 10, bestForGroup: ["couple", "solo", "friends"] },
  { name: "Dubai", country: "UAE", image: destKyoto, rating: 4.7, tag: "Luxury & Shopping", category: "international", budgetPerPerson: 200, minDays: 3, maxDays: 7, bestForGroup: ["family", "couple", "friends"] },
];

const categoryBadgeColors: Record<string, string> = {
  state: "bg-accent text-accent-foreground",
  national: "bg-secondary text-secondary-foreground",
  international: "bg-primary text-primary-foreground",
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

/* ── Component ── */

interface JourneyPlannerModalProps {
  open: boolean;
  onClose: () => void;
}

const JourneyPlannerModal = ({ open, onClose }: JourneyPlannerModalProps) => {
  // Mode 1 – budget search
  const [budget, setBudget] = useState("");
  const [people, setPeople] = useState("");
  const [days, setDays] = useState("");
  const [groupType, setGroupType] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<JourneyPlace[]>([]);

  // Mode 2 – auto plan
  const [autoDest, setAutoDest] = useState("");
  const [autoDays, setAutoDays] = useState("");
  const [autoPeople, setAutoPeople] = useState("");
  const [autoBudget, setAutoBudget] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState("");
  const [planError, setPlanError] = useState("");

  const handleSearch = () => {
    const totalBudget = parseFloat(budget) || Infinity;
    const numPeople = parseInt(people) || 1;
    const numDays = parseInt(days) || 1;
    const perPersonPerDay = totalBudget / numPeople / numDays;
    const matched = allPlaces
      .filter((place) => {
        const budgetOk = perPersonPerDay >= place.budgetPerPerson * 0.5;
        const daysOk = numDays >= place.minDays && numDays <= place.maxDays;
        const groupOk = !groupType || place.bestForGroup.includes(groupType);
        return budgetOk && daysOk && groupOk;
      })
      .sort((a, b) => b.rating - a.rating);
    setResults(matched);
    setSearched(true);
  };

  const handleReset = () => {
    setBudget(""); setPeople(""); setDays(""); setGroupType("");
    setSearched(false); setResults([]);
  };

  const handleAutoPlan = async () => {
    if (!autoDest.trim()) return;
    setPlanLoading(true);
    setPlan("");
    setPlanError("");

    const prompt = `Plan a complete trip to ${autoDest.trim()}${autoDays ? ` for ${autoDays} days` : ""}${autoPeople ? ` for ${autoPeople} people` : ""}${autoBudget ? ` with a budget of $${autoBudget}` : ""}.

Provide a structured plan covering:
1. **🗺️ Route** – How to get there, arrival tips
2. **🏨 Stay** – Recommended areas and accommodation types
3. **🍽️ Food** – Must-try local dishes and restaurant recommendations
4. **🎉 Events & Activities** – Top things to do, local events
5. **🚌 Transport** – Getting around, local transport tips

Keep it concise but actionable with specific recommendations.`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setPlanError(data.error || "Failed to generate plan. Try again.");
        setPlanLoading(false);
        return;
      }

      if (!resp.body) { setPlanError("No response"); setPlanLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { full += content; setPlan(full); }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setPlanError("Connection error. Please try again.");
    }
    setPlanLoading(false);
  };

  const handleResetPlan = () => {
    setAutoDest(""); setAutoDays(""); setAutoPeople(""); setAutoBudget("");
    setPlan(""); setPlanError("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Plan Your Journey</h2>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ═══ MODE 1: Budget-based search ═══ */}
              <div className="px-6 pt-5 pb-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  Find destinations by preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> Budget ($)
                    </label>
                    <Input type="number" placeholder="e.g. 2000" value={budget} onChange={(e) => setBudget(e.target.value)} min={0} max={1000000} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> People
                    </label>
                    <Input type="number" placeholder="e.g. 4" value={people} onChange={(e) => setPeople(e.target.value)} min={1} max={50} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Days
                    </label>
                    <Input type="number" placeholder="e.g. 5" value={days} onChange={(e) => setDays(e.target.value)} min={1} max={60} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Group Type
                    </label>
                    <Select value={groupType} onValueChange={setGroupType}>
                      <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <Button onClick={handleSearch} variant="hero" size="sm" className="gap-2">
                    <Search className="h-4 w-4" /> Find Destinations
                  </Button>
                  {searched && <Button onClick={handleReset} variant="outline" size="sm">Reset</Button>}
                </div>

                {/* Results */}
                {searched && (
                  <div className="mt-4">
                    {results.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No matching destinations. Try adjusting your criteria.</p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground mb-3">
                          Found <span className="font-semibold text-foreground">{results.length}</span> destinations
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {results.map((place, i) => (
                            <motion.div
                              key={place.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-travel transition-shadow"
                            >
                              <div className="relative h-32 overflow-hidden">
                                <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                                <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${categoryBadgeColors[place.category]}`}>{place.category}</span>
                                <span className="absolute top-2 right-2 bg-card/20 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{place.tag}</span>
                                <div className="absolute bottom-2 left-3">
                                  <h3 className="font-display text-base font-bold text-primary-foreground">{place.name}</h3>
                                  <span className="text-primary-foreground/80 text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> {place.country}</span>
                                </div>
                              </div>
                              <div className="p-2.5 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-primary text-primary" /> {place.rating}</span>
                                <span>~${place.budgetPerPerson}/person/day</span>
                                <span>{place.minDays}–{place.maxDays} days</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ═══ OR Divider ═══ */}
              <div className="flex items-center gap-4 px-6 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* ═══ MODE 2: Auto-plan by destination ═══ */}
              <div className="px-6 pt-3 pb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-secondary" />
                  Auto-plan by destination
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Pick a destination and we'll plan your route, stay, food, events & transport automatically
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Destination
                    </label>
                    <Input placeholder="e.g. Bali, Paris" value={autoDest} onChange={(e) => setAutoDest(e.target.value)} maxLength={100} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Days
                    </label>
                    <Input type="number" placeholder="e.g. 5" value={autoDays} onChange={(e) => setAutoDays(e.target.value)} min={1} max={60} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> People
                    </label>
                    <Input type="number" placeholder="e.g. 2" value={autoPeople} onChange={(e) => setAutoPeople(e.target.value)} min={1} max={50} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> Budget ($)
                    </label>
                    <Input type="number" placeholder="Optional" value={autoBudget} onChange={(e) => setAutoBudget(e.target.value)} min={0} max={1000000} />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <Button onClick={handleAutoPlan} variant="ocean" size="sm" className="gap-2" disabled={planLoading || !autoDest.trim()}>
                    {planLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {planLoading ? "Planning..." : "Auto Plan My Trip"}
                  </Button>
                  {(plan || planError) && <Button onClick={handleResetPlan} variant="outline" size="sm">Reset</Button>}
                </div>

                {/* Plan categories preview */}
                {!plan && !planError && !planLoading && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      { icon: Route, label: "Route" },
                      { icon: Hotel, label: "Stay" },
                      { icon: Utensils, label: "Food" },
                      { icon: Music, label: "Events" },
                      { icon: Bus, label: "Transport" },
                    ].map((item) => (
                      <span key={item.label} className="inline-flex items-center gap-1.5 text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full">
                        <item.icon className="h-3 w-3" /> {item.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Error */}
                {planError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                    ⚠️ {planError}
                  </div>
                )}

                {/* Streamed plan */}
                {plan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-5 bg-muted/50 border border-border rounded-xl"
                  >
                    <div className="prose prose-sm max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_p]:text-foreground/80 [&_li]:text-foreground/80">
                      <ReactMarkdown>{plan}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JourneyPlannerModal;
