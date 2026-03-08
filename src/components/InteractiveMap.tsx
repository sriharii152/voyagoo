import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search } from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createColorIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

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
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
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

    const map = L.map(containerRef.current, {
      center: [20, 40],
      zoom: 2,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  // Update markers when filter/search changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredMarkers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: createColorIcon(markerColors[m.type] || markerColors.destination),
      });

      marker.bindPopup(`
        <div style="min-width:180px">
          <h3 style="font-weight:bold;font-size:14px;margin:0 0 4px">${m.name}</h3>
          ${m.description ? `<p style="font-size:12px;color:#666;margin:0 0 8px">${m.description}</p>` : ""}
          <span style="background:${markerColors[m.type]};color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;text-transform:uppercase">${m.type}</span>
        </div>
      `);

      marker.addTo(markersLayerRef.current!);
    });

    // Fit bounds
    if (filteredMarkers.length > 0) {
      const bounds = L.latLngBounds(filteredMarkers.map((m) => [m.lat, m.lng] as L.LatLngTuple));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
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
