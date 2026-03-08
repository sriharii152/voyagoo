import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Calendar, Wallet, MapPin, Star, Search, Sparkles } from "lucide-react";
import AutoTripPlanner from "@/components/AutoTripPlanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import destSantorini from "@/assets/dest-santorini.jpg";
import destKyoto from "@/assets/dest-kyoto.jpg";
import destMachuPicchu from "@/assets/dest-machupicchu.jpg";
import destBali from "@/assets/dest-bali.jpg";

interface JourneyPlace {
  name: string;
  country: string;
  image: string;
  rating: number;
  tag: string;
  category: "state" | "national" | "international";
  budgetPerPerson: number; // per day in USD
  minDays: number;
  maxDays: number;
  bestForGroup: string[];
}

const allPlaces: JourneyPlace[] = [
  // International
  { name: "Santorini", country: "Greece", image: destSantorini, rating: 4.9, tag: "Romantic", category: "international", budgetPerPerson: 150, minDays: 4, maxDays: 10, bestForGroup: ["couple", "solo", "friends"] },
  { name: "Kyoto", country: "Japan", image: destKyoto, rating: 4.8, tag: "Cultural", category: "international", budgetPerPerson: 120, minDays: 3, maxDays: 14, bestForGroup: ["couple", "solo", "friends", "family"] },
  { name: "Machu Picchu", country: "Peru", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "international", budgetPerPerson: 100, minDays: 3, maxDays: 7, bestForGroup: ["friends", "solo", "couple"] },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.7, tag: "Tropical", category: "international", budgetPerPerson: 60, minDays: 5, maxDays: 21, bestForGroup: ["couple", "solo", "friends", "family"] },
  // National
  { name: "Jaipur", country: "Rajasthan", image: destSantorini, rating: 4.6, tag: "Heritage", category: "national", budgetPerPerson: 30, minDays: 2, maxDays: 5, bestForGroup: ["family", "couple", "friends"] },
  { name: "Kerala", country: "God's Own Country", image: destBali, rating: 4.8, tag: "Nature", category: "national", budgetPerPerson: 35, minDays: 3, maxDays: 10, bestForGroup: ["couple", "family", "friends"] },
  { name: "Varanasi", country: "Uttar Pradesh", image: destKyoto, rating: 4.5, tag: "Spiritual", category: "national", budgetPerPerson: 20, minDays: 2, maxDays: 5, bestForGroup: ["solo", "family", "friends"] },
  { name: "Ladakh", country: "Jammu & Kashmir", image: destMachuPicchu, rating: 4.9, tag: "Adventure", category: "national", budgetPerPerson: 50, minDays: 5, maxDays: 14, bestForGroup: ["friends", "solo", "couple"] },
  // State
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

interface JourneyPlannerModalProps {
  open: boolean;
  onClose: () => void;
}

const JourneyPlannerModal = ({ open, onClose }: JourneyPlannerModalProps) => {
  const [budget, setBudget] = useState("");
  const [people, setPeople] = useState("");
  const [days, setDays] = useState("");
  const [groupType, setGroupType] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<JourneyPlace[]>([]);

  const handleSearch = () => {
    const totalBudget = parseFloat(budget) || Infinity;
    const numPeople = parseInt(people) || 1;
    const numDays = parseInt(days) || 1;
    const perPersonPerDay = totalBudget / numPeople / numDays;

    const matched = allPlaces.filter((place) => {
      const budgetOk = perPersonPerDay >= place.budgetPerPerson * 0.5; // some flexibility
      const daysOk = numDays >= place.minDays && numDays <= place.maxDays;
      const groupOk = !groupType || place.bestForGroup.includes(groupType);
      return budgetOk && daysOk && groupOk;
    });

    // Sort by rating
    matched.sort((a, b) => b.rating - a.rating);
    setResults(matched);
    setSearched(true);
  };

  const handleReset = () => {
    setBudget("");
    setPeople("");
    setDays("");
    setGroupType("");
    setSearched(false);
    setResults([]);
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

            {/* Form */}
            <div className="px-6 py-5 border-b border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> Total Budget ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min={0}
                    max={1000000}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> People
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 4"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    min={1}
                    max={50}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Days
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    min={1}
                    max={60}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> Group Type
                  </label>
                  <Select value={groupType} onValueChange={setGroupType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleSearch} variant="hero" className="gap-2">
                  <Search className="h-4 w-4" /> Find Destinations
                </Button>
                {searched && (
                  <Button onClick={handleReset} variant="outline">
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Results + Auto Planner */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">
              {!searched ? (
                <div className="text-center text-muted-foreground py-12">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Enter your preferences above</p>
                  <p className="text-sm mt-1">We'll find the perfect destinations for you</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No matching destinations found</p>
                  <p className="text-sm mt-1">Try adjusting your budget or number of days</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Found <span className="font-semibold text-foreground">{results.length}</span> destinations matching your criteria
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.map((place, i) => (
                      <motion.div
                        key={place.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-travel transition-shadow"
                      >
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                          <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${categoryBadgeColors[place.category]}`}>
                            {place.category}
                          </span>
                          <span className="absolute top-2 right-2 bg-card/20 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {place.tag}
                          </span>
                          <div className="absolute bottom-2 left-3">
                            <h3 className="font-display text-lg font-bold text-primary-foreground">{place.name}</h3>
                            <span className="text-primary-foreground/80 text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {place.country}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {place.rating}
                          </span>
                          <span>~${place.budgetPerPerson}/person/day</span>
                          <span>{place.minDays}–{place.maxDays} days</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
              </div>

              <AutoTripPlanner />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JourneyPlannerModal;
