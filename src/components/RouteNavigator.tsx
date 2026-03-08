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

type TravelMode = "driving" | "cycling" | "walking";

async function geocode(place: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { "User-Agent": "TravelApp/1.0" } }
    );
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name.split(",").slice(0, 2).join(",") };
  } catch {
    return null;
  }
}

const modeProfiles: Record<TravelMode, string> = {
  driving: "car",
  cycling: "bike",
  walking: "foot",
};

async function fetchRoute(
  originLat: number, originLng: number,
  destLat: number, destLng: number,
  mode: TravelMode
): Promise<{ coords: [number, number][]; distance: number; duration: number; steps: RouteStep[] } | null> {
  try {
    const profile = modeProfiles[mode];
    const url = `https://router.project-osrm.org/route/v1/${profile}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number]
    );

    const steps: RouteStep[] = route.legs[0].steps.map((step: any) => {
      const dist = step.distance >= 1000
        ? `${(step.distance / 1000).toFixed(1)} km`
        : `${Math.round(step.distance)} m`;
      const dur = step.duration >= 3600
        ? `${Math.floor(step.duration / 3600)} hr ${Math.round((step.duration % 3600) / 60)} min`
        : `${Math.max(1, Math.round(step.duration / 60))} min`;
      const name = step.name || "";
      const maneuver = step.maneuver?.type || "";
      const modifier = step.maneuver?.modifier || "";

      let instruction = "";
      if (maneuver === "depart") instruction = `Depart${name ? ` on ${name}` : ""}`;
      else if (maneuver === "arrive") instruction = `Arrive at destination`;
      else if (maneuver === "turn") instruction = `Turn ${modifier}${name ? ` onto ${name}` : ""}`;
      else if (maneuver === "new name") instruction = `Continue onto ${name}`;
      else if (maneuver === "merge") instruction = `Merge${name ? ` onto ${name}` : ""}`;
      else if (maneuver === "roundabout" || maneuver === "rotary") instruction = `Take the roundabout${name ? ` to ${name}` : ""}`;
      else if (maneuver === "fork") instruction = `Take the ${modifier} fork${name ? ` onto ${name}` : ""}`;
      else if (maneuver === "end of road") instruction = `Turn ${modifier}${name ? ` onto ${name}` : ""}`;
      else instruction = `Continue${name ? ` on ${name}` : ""}${modifier ? ` (${modifier})` : ""}`;

      return { instruction, distance: dist, duration: dur };
    }).filter((s: RouteStep) => s.instruction);

    return {
      coords,
      distance: route.distance,
      duration: route.duration,
      steps,
    };
  } catch {
    return null;
  }
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))} min`;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

const RouteNavigator = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<TravelMode>("driving");
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
    setTimeout(() => map.invalidateSize(), 200);
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
      weight: 5,
      opacity: 0.85,
    }).addTo(routeLayerRef.current);

    const bounds = L.latLngBounds(route.routeCoords);
    mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [route]);

  const handlePlanRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Please enter both origin and destination");
      return;
    }
    setLoading(true);
    setError("");
    setRoute(null);

    try {
      const [originGeo, destGeo] = await Promise.all([geocode(origin), geocode(destination)]);

      if (!originGeo) {
        setError(`Could not find "${origin}". Try a more specific location.`);
        setLoading(false);
        return;
      }
      if (!destGeo) {
        setError(`Could not find "${destination}". Try a more specific location.`);
        setLoading(false);
        return;
      }

      const routeData = await fetchRoute(originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng, mode);

      if (!routeData) {
        setError("No route found between these locations. They may be on different continents — try driving-accessible locations.");
        setLoading(false);
        return;
      }

      setRoute({
        origin: originGeo.display,
        destination: destGeo.display,
        totalDistance: formatDistance(routeData.distance),
        totalDuration: formatDuration(routeData.duration),
        steps: routeData.steps,
        originCoords: [originGeo.lat, originGeo.lng],
        destCoords: [destGeo.lat, destGeo.lng],
        routeCoords: routeData.coords,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const modeOptions: { key: TravelMode; icon: typeof Car; label: string }[] = [
    { key: "driving", icon: Car, label: "Drive" },
    { key: "cycling", icon: Bike, label: "Bike" },
    { key: "walking", icon: Footprints, label: "Walk" },
  ];

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

        {/* Travel mode selector */}
        <div className="flex gap-2 mb-4">
          {modeOptions.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input
              placeholder="From (e.g. Delhi, Mumbai, London)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handlePlanRoute()}
            />
          </div>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
            <Input
              placeholder="To (e.g. Goa, Jaipur, Paris)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handlePlanRoute()}
            />
          </div>
        </div>
        <Button variant="hero" onClick={handlePlanRoute} disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
          {loading ? "Finding Route..." : "Get Route"}
        </Button>
        {error && <p className="text-destructive text-sm mt-3">{error}</p>}
      </motion.div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border h-[450px]" ref={mapContainerRef} />

      {/* Route Details */}
      <AnimatePresence mode="wait">
        {route && (
          <motion.div key="route-details"
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
                <p className="text-muted-foreground text-sm mt-1">
                  {mode === "driving" ? "Driving" : mode === "cycling" ? "Cycling" : "Walking"} route via roads
                </p>
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

            {/* Turn-by-turn steps */}
            <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2">
              {route.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? "bg-primary" : i === route.steps.length - 1 ? "bg-secondary" : "bg-border"}`} />
                    {i < route.steps.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-medium text-foreground">{step.instruction}</p>
                    {step.distance !== "0 m" && (
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
