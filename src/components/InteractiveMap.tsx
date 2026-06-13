import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const GMAPS_BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string;
const GMAPS_CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string;

let gmapsLoaderPromise: Promise<typeof google> | null = null;
function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window !== "undefined" && (window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }
  if (gmapsLoaderPromise) return gmapsLoaderPromise;
  gmapsLoaderPromise = new Promise((resolve, reject) => {
    (window as any).__initGmaps = () => resolve((window as any).google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_BROWSER_KEY}&loading=async&callback=__initGmaps&channel=${GMAPS_CHANNEL}`;
    s.async = true;
    s.defer = true;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gmapsLoaderPromise;
}

const markerColors: Record<string, string> = {
  destination: "hsl(24, 80%, 50%)",
  hotel: "hsl(195, 70%, 42%)",
  event: "hsl(160, 45%, 40%)",
  restaurant: "hsl(0, 84%, 60%)",
};

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "destination" | "hotel" | "event" | "restaurant";
  description?: string;
}

const defaultMarkers: MapMarker[] = [
  { id: "1", name: "Santorini, Greece", lat: 36.39, lng: 25.46, type: "destination", description: "Iconic white-washed buildings & stunning sunsets" },
  { id: "2", name: "Kyoto, Japan", lat: 35.01, lng: 135.77, type: "destination", description: "Ancient temples & traditional culture" },
  { id: "3", name: "Machu Picchu, Peru", lat: -13.16, lng: -72.55, type: "destination", description: "Mystical Inca citadel in the clouds" },
  { id: "4", name: "Bali, Indonesia", lat: -8.34, lng: 115.09, type: "destination", description: "Tropical paradise with rich culture" },
  { id: "5", name: "Jaipur, India", lat: 26.92, lng: 75.78, type: "destination", description: "The Pink City — heritage & royalty" },
  { id: "6", name: "Kerala, India", lat: 10.85, lng: 76.27, type: "destination", description: "God's Own Country — backwaters & spices" },
  { id: "7", name: "Sunset Beach Hotel", lat: 36.41, lng: 25.43, type: "hotel", description: "Luxury beachfront resort" },
  { id: "8", name: "Cherry Blossom Festival", lat: 35.03, lng: 135.78, type: "event", description: "Annual sakura celebration" },
  { id: "9", name: "Warung Bali", lat: -8.35, lng: 115.1, type: "restaurant", description: "Authentic Balinese cuisine" },
];

interface InteractiveMapProps {
  markers?: MapMarker[];
  className?: string;
  height?: string;
  interactive?: boolean;
}

const InteractiveMap = ({
  markers = defaultMarkers,
  className = "",
  height = "h-[500px]",
  interactive = true,
}: InteractiveMapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredMarkers = markers.filter(
    (m) =>
      (activeFilter === "all" || m.type === activeFilter) &&
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    loadGoogleMaps().then((g) => {
      if (cancelled || !containerRef.current) return;
      const map = new g.maps.Map(containerRef.current, {
        center: { lat: 20, lng: 40 },
        zoom: 2,
        disableDefaultUI: !interactive,
        gestureHandling: interactive ? "auto" : "none",
        zoomControl: interactive,
      });
      infoRef.current = new g.maps.InfoWindow();
      mapRef.current = map;
      // trigger marker render
      setSearchQuery((q) => q);
    });
    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, [interactive]);

  // Update markers when filter/search changes
  useEffect(() => {
    const map = mapRef.current;
    const g = (window as any).google;
    if (!map || !g?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    filteredMarkers.forEach((m) => {
      const color = markerColors[m.type] || markerColors.destination;
      const marker = new g.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map,
        title: m.name,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
      marker.addListener("click", () => {
        infoRef.current?.setContent(`
          <div style="min-width:180px">
            <h3 style="font-weight:bold;font-size:14px;margin:0 0 4px">${m.name}</h3>
            ${m.description ? `<p style="font-size:12px;color:#666;margin:0 0 8px">${m.description}</p>` : ""}
            <span style="background:${color};color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;text-transform:uppercase">${m.type}</span>
          </div>
        `);
        infoRef.current?.open({ map, anchor: marker });
      });
      markersRef.current.push(marker);
    });

    if (filteredMarkers.length > 0) {
      const bounds = new g.maps.LatLngBounds();
      filteredMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      map.fitBounds(bounds, 60);
      if (filteredMarkers.length === 1) {
        g.maps.event.addListenerOnce(map, "idle", () => map.setZoom(Math.min(map.getZoom() ?? 6, 6)));
      }
    }
  }, [filteredMarkers]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${height} ${className}`}>
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Search & filter overlay */}
      {interactive && (
        <div className="absolute top-4 left-4 right-16 z-[1000] flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-1 bg-card/90 backdrop-blur-md rounded-xl border border-border p-1">
            {(["all", "destination", "hotel", "event", "restaurant"] as const).map((filter) => (
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

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-md rounded-xl border border-border px-4 py-3">
        <div className="flex flex-wrap gap-3">
          {Object.entries(markerColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
              <span className="text-[10px] font-medium text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
