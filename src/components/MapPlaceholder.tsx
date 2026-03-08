import { MapPin, Navigation, Search, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "destination" | "hotel" | "event" | "restaurant";
}

const defaultMarkers: MapMarker[] = [
  { id: "1", name: "Santorini, Greece", lat: 36.39, lng: 25.46, type: "destination" },
  { id: "2", name: "Kyoto, Japan", lat: 35.01, lng: 135.77, type: "destination" },
  { id: "3", name: "Machu Picchu, Peru", lat: -13.16, lng: -72.55, type: "destination" },
  { id: "4", name: "Bali, Indonesia", lat: -8.34, lng: 115.09, type: "destination" },
  { id: "5", name: "Sunset Beach Hotel", lat: 36.41, lng: 25.43, type: "hotel" },
  { id: "6", name: "Cherry Blossom Festival", lat: 35.03, lng: 135.78, type: "event" },
];

const typeColors: Record<MapMarker["type"], string> = {
  destination: "bg-primary text-primary-foreground",
  hotel: "bg-secondary text-secondary-foreground",
  event: "bg-accent text-accent-foreground",
  restaurant: "bg-destructive text-destructive-foreground",
};

const typeIcons: Record<MapMarker["type"], string> = {
  destination: "📍",
  hotel: "🏨",
  event: "🎉",
  restaurant: "🍽️",
};

interface MapPlaceholderProps {
  markers?: MapMarker[];
  className?: string;
  height?: string;
  interactive?: boolean;
}

const MapPlaceholder = ({
  markers = defaultMarkers,
  className = "",
  height = "h-[500px]",
  interactive = true,
}: MapPlaceholderProps) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MapMarker["type"] | "all">("all");

  const filteredMarkers = markers.filter(
    (m) =>
      (activeFilter === "all" || m.type === activeFilter) &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${height} ${className}`}>
      {/* Stylized map background */}
      <div className="absolute inset-0 bg-muted">
        <svg className="w-full h-full opacity-20" viewBox="0 0 800 500" fill="none">
          {/* Grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 25} x2="800" y2={i * 25} stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 32 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 25} y1="0" x2={i * 25} y2="500" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
          ))}
          {/* Decorative landmasses */}
          <ellipse cx="200" cy="200" rx="120" ry="80" fill="hsl(var(--accent) / 0.15)" />
          <ellipse cx="500" cy="150" rx="80" ry="100" fill="hsl(var(--accent) / 0.12)" />
          <ellipse cx="650" cy="300" rx="100" ry="60" fill="hsl(var(--accent) / 0.1)" />
          <ellipse cx="350" cy="350" rx="90" ry="70" fill="hsl(var(--accent) / 0.13)" />
        </svg>

        {/* Animated markers on the map */}
        {filteredMarkers.map((marker, i) => {
          const x = ((marker.lng + 180) / 360) * 100;
          const y = ((90 - marker.lat) / 180) * 100;
          return (
            <motion.button
              key={marker.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className={`absolute z-10 flex items-center justify-center w-8 h-8 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-125 ${typeColors[marker.type]}`}
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              onClick={() => setSelectedMarker(marker)}
            >
              <span className="text-sm">{typeIcons[marker.type]}</span>
            </motion.button>
          );
        })}

        {/* "Google Maps coming soon" badge */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md rounded-xl px-4 py-2 border border-border flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium">
            Google Maps integration coming soon — add your API key to activate
          </span>
        </div>
      </div>

      {/* Search bar */}
      {interactive && (
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destinations, hotels, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-1 bg-card/90 backdrop-blur-md rounded-xl border border-border p-1">
            {(["all", "destination", "hotel", "event"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1) + "s"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zoom controls */}
      {interactive && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-card/90 backdrop-blur-md">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-card/90 backdrop-blur-md">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-card/90 backdrop-blur-md">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-card/90 backdrop-blur-md">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected marker popup */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-2xl p-5 shadow-lg min-w-[250px]"
        >
          <button
            onClick={() => setSelectedMarker(null)}
            className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-lg"
          >
            ×
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{typeIcons[selectedMarker.type]}</span>
            <h3 className="font-display font-bold text-foreground">{selectedMarker.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {selectedMarker.lat.toFixed(2)}°, {selectedMarker.lng.toFixed(2)}°
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="hero" className="text-xs">
              Get Directions
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Save Place
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export { type MapMarker };
export default MapPlaceholder;
