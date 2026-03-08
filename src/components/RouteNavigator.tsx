import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Clock, Route, Loader2, Car, Footprints, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import L from "leaflet";

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface RouteResult {
  origin: string;
  destination: string;
  totalDistance: string;
  totalDuration: string;
  steps: RouteStep[];
  originCoords: [number, number];
  destCoords: [number, number];
  routeCoords: [number, number][];
}

const knownLocations: Record<string, [number, number]> = {
  "new delhi": [28.6139, 77.209],
  "delhi": [28.6139, 77.209],
  "mumbai": [19.076, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "hyderabad": [17.385, 78.4867],
  "pune": [18.5204, 73.8567],
  "jaipur": [26.9124, 75.7873],
  "goa": [15.2993, 74.124],
  "kerala": [10.8505, 76.2711],
  "kochi": [9.9312, 76.2673],
  "varanasi": [25.3176, 82.9739],
  "agra": [27.1767, 78.0081],
  "udaipur": [24.5854, 73.7125],
  "manali": [32.2396, 77.1887],
  "shimla": [31.1048, 77.1734],
  "ladakh": [34.1526, 77.577],
  "leh": [34.1526, 77.577],
  "rishikesh": [30.0869, 78.2676],
  "darjeeling": [27.0360, 88.2627],
  "mysore": [12.2958, 76.6394],
  "mysuru": [12.2958, 76.6394],
  "ooty": [11.4102, 76.6950],
  "munnar": [10.0889, 77.0595],
  "coorg": [12.3375, 75.8069],
  "lonavala": [18.7546, 73.4062],
  "amritsar": [31.6340, 74.8723],
  "lucknow": [26.8467, 80.9462],
  "ahmedabad": [23.0225, 72.5714],
  "surat": [21.1702, 72.8311],
  "chandigarh": [30.7333, 76.7794],
  "bhopal": [23.2599, 77.4126],
  "indore": [22.7196, 75.8577],
  "nagpur": [21.1458, 79.0882],
  "patna": [25.6093, 85.1376],
  "ranchi": [23.3441, 85.3096],
  "bhubaneswar": [20.2961, 85.8245],
  "thiruvananthapuram": [8.5241, 76.9366],
  "coimbatore": [11.0168, 76.9558],
  "madurai": [9.9252, 78.1198],
  "visakhapatnam": [17.6868, 83.2185],
  // International
  "santorini": [36.3932, 25.4615],
  "kyoto": [35.0116, 135.7681],
  "tokyo": [35.6762, 139.6503],
  "paris": [48.8566, 2.3522],
  "london": [51.5074, -0.1278],
  "new york": [40.7128, -74.006],
  "dubai": [25.2048, 55.2708],
  "singapore": [1.3521, 103.8198],
  "bangkok": [13.7563, 100.5018],
  "bali": [-8.3405, 115.092],
  "rome": [41.9028, 12.4964],
  "barcelona": [41.3874, 2.1686],
  "amsterdam": [52.3676, 4.9041],
  "machu picchu": [-13.1631, -72.545],
  "cairo": [30.0444, 31.2357],
  "istanbul": [41.0082, 28.9784],
  "sydney": [-33.8688, 151.2093],
  "los angeles": [34.0522, -118.2437],
  "san francisco": [37.7749, -122.4194],
  "maldives": [3.2028, 73.2207],
  "switzerland": [46.8182, 8.2275],
  "zurich": [47.3769, 8.5417],
};

function getCoords(place: string): [number, number] | null {
  const key = place.trim().toLowerCase();
  return knownLocations[key] || null;
}

function haversineDistance(c1: [number, number], c2: [number, number]): number {
  const R = 6371;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLng = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((c1[0] * Math.PI) / 180) * Math.cos((c2[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateRoute(origin: string, destination: string): RouteResult | null {
  const originCoords = getCoords(origin);
  const destCoords = getCoords(destination);
  if (!originCoords || !destCoords) return null;

  const dist = haversineDistance(originCoords, destCoords);
  const drivingDist = dist * 1.3;
  const hours = drivingDist / 65;

  const midLat = (originCoords[0] + destCoords[0]) / 2 + (Math.random() - 0.5) * 2;
  const midLng = (originCoords[1] + destCoords[1]) / 2 + (Math.random() - 0.5) * 2;

  const routeCoords: [number, number][] = [
    originCoords,
    [(originCoords[0] * 2 + midLat) / 3, (originCoords[1] * 2 + midLng) / 3],
    [midLat, midLng],
    [(destCoords[0] * 2 + midLat) / 3, (destCoords[1] * 2 + midLng) / 3],
    destCoords,
  ];

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const steps: RouteStep[] = [
    { instruction: `Depart from ${capitalize(origin)}`, distance: "0 km", duration: "0 min" },
    { instruction: `Head towards the highway/expressway`, distance: `${(drivingDist * 0.15).toFixed(0)} km`, duration: `${(hours * 0.15 * 60).toFixed(0)} min` },
    { instruction: `Continue on the main route`, distance: `${(drivingDist * 0.5).toFixed(0)} km`, duration: `${(hours * 0.5 * 60).toFixed(0)} min` },
    { instruction: `Take the exit towards ${capitalize(destination)}`, distance: `${(drivingDist * 0.2).toFixed(0)} km`, duration: `${(hours * 0.2 * 60).toFixed(0)} min` },
    { instruction: `Follow local roads to ${capitalize(destination)}`, distance: `${(drivingDist * 0.15).toFixed(0)} km`, duration: `${(hours * 0.15 * 60).toFixed(0)} min` },
    { instruction: `Arrive at ${capitalize(destination)}`, distance: "0 km", duration: "0 min" },
  ];

  const formatDuration = (h: number) => {
    if (h < 1) return `${Math.round(h * 60)} min`;
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  };

  return {
    origin: capitalize(origin),
    destination: capitalize(destination),
    totalDistance: `${drivingDist.toFixed(0)} km`,
    totalDuration: formatDuration(hours),
    steps,
    originCoords,
    destCoords,
    routeCoords,
  };
}

const RouteNavigator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [22, 78],
      zoom: 5,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !routeLayerRef.current) return;
    routeLayerRef.current.clearLayers();
    if (!route) return;

    const originIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background:hsl(var(--primary));width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">A</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const destIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background:hsl(24, 80%, 50%);width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:14px;">B</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(route.originCoords, { icon: originIcon })
      .bindPopup(`<b>${route.origin}</b><br/>Start`)
      .addTo(routeLayerRef.current);
    L.marker(route.destCoords, { icon: destIcon })
      .bindPopup(`<b>${route.destination}</b><br/>End`)
      .addTo(routeLayerRef.current);

    L.polyline(route.routeCoords, {
      color: "hsl(24, 80%, 50%)",
      weight: 4,
      opacity: 0.8,
      dashArray: "10, 8",
    }).addTo(routeLayerRef.current);

    const bounds = L.latLngBounds([route.originCoords, route.destCoords]);
    mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 10 });
  }, [route]);

  const handlePlanRoute = () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Please enter both origin and destination");
      return;
    }
    setLoading(true);
    setError("");
    setRoute(null);

    setTimeout(() => {
      const result = generateRoute(origin, destination);
      if (!result) {
        setError("Could not find one or both locations. Try popular cities like Delhi, Mumbai, Paris, Bali, etc.");
      } else {
        setRoute(result);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Route Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-travel"
      >
        <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Plan Your Route
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="From (e.g. Delhi, Mumbai)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handlePlanRoute()}
            />
          </div>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
            <Input
              placeholder="To (e.g. Goa, Bali, Paris)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handlePlanRoute()}
            />
          </div>
        </div>
        <Button variant="hero" onClick={handlePlanRoute} disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
          {loading ? "Planning Route..." : "Get Route"}
        </Button>
        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
      </motion.div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border h-[400px]" ref={mapContainerRef} />

      {/* Route Details */}
      <AnimatePresence>
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-travel"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {route.origin} → {route.destination}
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Estimated driving route</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-bold text-foreground">{route.totalDistance}</p>
                </div>
                <div className="bg-secondary/10 rounded-xl px-4 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {route.totalDuration}
                  </p>
                </div>
              </div>
            </div>

            {/* Travel modes */}
            <div className="flex gap-2 mb-6">
              {[
                { icon: Car, label: "Drive", active: true },
                { icon: Bike, label: "Bike", active: false },
                { icon: Footprints, label: "Walk", active: false },
              ].map((mode) => (
                <span
                  key={mode.label}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    mode.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <mode.icon className="h-3.5 w-3.5" />
                  {mode.label}
                </span>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-0">
              {route.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : i === route.steps.length - 1 ? "bg-secondary" : "bg-border"}`} />
                    {i < route.steps.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-medium text-foreground">{step.instruction}</p>
                    {step.distance !== "0 km" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.distance} · {step.duration}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RouteNavigator;
