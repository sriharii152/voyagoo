import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, MapPin, Trash2, WifiOff, Check, Loader2, X, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import L from "leaflet";

const CACHE_NAME = "offline-map-tiles-v1";
const TILE_URL_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SUBDOMAINS = ["a", "b", "c"];

interface SavedRegion {
  id: string;
  name: string;
  bounds: { north: number; south: number; east: number; west: number };
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  downloadedAt: string;
  sizeMB: number;
}

function lng2tile(lng: number, zoom: number) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

function countTiles(
  bounds: { north: number; south: number; east: number; west: number },
  minZoom: number,
  maxZoom: number
): number {
  let count = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lng2tile(bounds.west, z);
    const xMax = lng2tile(bounds.east, z);
    const yMin = lat2tile(bounds.north, z);
    const yMax = lat2tile(bounds.south, z);
    count += (xMax - xMin + 1) * (yMax - yMin + 1);
  }
  return count;
}

function getTileUrls(
  bounds: { north: number; south: number; east: number; west: number },
  minZoom: number,
  maxZoom: number
): string[] {
  const urls: string[] = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const xMin = lng2tile(bounds.west, z);
    const xMax = lng2tile(bounds.east, z);
    const yMin = lat2tile(bounds.north, z);
    const yMax = lat2tile(bounds.south, z);
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const subdomain = SUBDOMAINS[(x + y) % SUBDOMAINS.length];
        urls.push(TILE_URL_TEMPLATE.replace("{s}", subdomain).replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(y)));
      }
    }
  }
  return urls;
}

function getSavedRegions(): SavedRegion[] {
  try {
    return JSON.parse(localStorage.getItem("offline-map-regions") || "[]");
  } catch {
    return [];
  }
}

function saveRegions(regions: SavedRegion[]) {
  localStorage.setItem("offline-map-regions", JSON.stringify(regions));
}

interface OfflineMapDownloaderProps {
  map: L.Map | null;
}

const OfflineMapDownloader = ({ map }: OfflineMapDownloaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedBounds, setSelectedBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [regionName, setRegionName] = useState("");
  const [maxZoom, setMaxZoom] = useState("13");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  const [savedRegions, setSavedRegions] = useState<SavedRegion[]>(getSavedRegions());
  const rectangleRef = useRef<L.Rectangle | null>(null);
  const selectStartRef = useRef<L.LatLng | null>(null);
  const abortRef = useRef(false);

  const minZoom = 5;

  const tileCount = selectedBounds ? countTiles(selectedBounds, minZoom, parseInt(maxZoom)) : 0;
  const estimatedSizeMB = Math.round(tileCount * 0.015 * 10) / 10; // ~15KB average per tile

  const startSelection = useCallback(() => {
    if (!map) return;
    setIsSelecting(true);
    setSelectedBounds(null);
    if (rectangleRef.current) {
      map.removeLayer(rectangleRef.current);
      rectangleRef.current = null;
    }
    map.getContainer().style.cursor = "crosshair";

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      selectStartRef.current = e.latlng;
      if (rectangleRef.current) {
        map.removeLayer(rectangleRef.current);
      }
      rectangleRef.current = L.rectangle(L.latLngBounds(e.latlng, e.latlng), {
        color: "hsl(24, 80%, 50%)",
        weight: 2,
        fillOpacity: 0.15,
        dashArray: "6 4",
      }).addTo(map);
    };

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!selectStartRef.current || !rectangleRef.current) return;
      rectangleRef.current.setBounds(L.latLngBounds(selectStartRef.current, e.latlng));
    };

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (!selectStartRef.current) return;
      const bounds = L.latLngBounds(selectStartRef.current, e.latlng);
      setSelectedBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
      map.getContainer().style.cursor = "";
      setIsSelecting(false);

      // Auto-fill name from center coords
      const center = bounds.getCenter();
      setRegionName(`Region ${center.lat.toFixed(1)}°, ${center.lng.toFixed(1)}°`);

      // Cleanup listeners
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);

      // Re-enable dragging
      map.dragging.enable();
    };

    // Disable dragging during selection
    map.dragging.disable();
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);
  }, [map]);

  const cancelSelection = useCallback(() => {
    if (!map) return;
    setIsSelecting(false);
    setSelectedBounds(null);
    map.getContainer().style.cursor = "";
    map.dragging.enable();
    if (rectangleRef.current) {
      map.removeLayer(rectangleRef.current);
      rectangleRef.current = null;
    }
  }, [map]);

  const handleDownload = async () => {
    if (!selectedBounds) return;
    const mz = parseInt(maxZoom);

    if (tileCount > 5000) {
      toast.error("Region too large. Select a smaller area or lower zoom level.");
      return;
    }

    setDownloading(true);
    setProgress(0);
    setDownloadedCount(0);
    abortRef.current = false;

    const urls = getTileUrls(selectedBounds, minZoom, mz);
    setTotalTiles(urls.length);

    try {
      const cache = await caches.open(CACHE_NAME);
      let downloaded = 0;
      const batchSize = 6;

      for (let i = 0; i < urls.length; i += batchSize) {
        if (abortRef.current) break;
        const batch = urls.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async (url) => {
            try {
              const existing = await cache.match(url);
              if (!existing) {
                const response = await fetch(url);
                if (response.ok) {
                  await cache.put(url, response);
                }
              }
            } catch {
              // Skip failed tiles
            }
            downloaded++;
            setDownloadedCount(downloaded);
            setProgress((downloaded / urls.length) * 100);
          })
        );
      }

      if (!abortRef.current) {
        const region: SavedRegion = {
          id: Date.now().toString(),
          name: regionName || "Unnamed Region",
          bounds: selectedBounds,
          minZoom,
          maxZoom: mz,
          tileCount: urls.length,
          downloadedAt: new Date().toISOString(),
          sizeMB: estimatedSizeMB,
        };
        const updated = [...savedRegions, region];
        saveRegions(updated);
        setSavedRegions(updated);
        toast.success(`Downloaded ${urls.length} tiles for offline use!`);
        setSelectedBounds(null);
        if (rectangleRef.current && map) {
          map.removeLayer(rectangleRef.current);
          rectangleRef.current = null;
        }
      }
    } catch (err) {
      toast.error("Download failed. Please try again.");
    }

    setDownloading(false);
  };

  const deleteRegion = async (regionId: string) => {
    const region = savedRegions.find((r) => r.id === regionId);
    if (!region) return;

    try {
      const cache = await caches.open(CACHE_NAME);
      const urls = getTileUrls(region.bounds, region.minZoom, region.maxZoom);
      await Promise.allSettled(urls.map((url) => cache.delete(url)));
    } catch {
      // Cache might not exist
    }

    const updated = savedRegions.filter((r) => r.id !== regionId);
    saveRegions(updated);
    setSavedRegions(updated);
    toast.success("Offline region removed");
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Offline Maps</span>
        {savedRegions.length > 0 && (
          <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {savedRegions.length}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-card rounded-2xl border border-border shadow-travel p-5 z-[1000]"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold text-foreground flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-primary" />
                Offline Maps
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Select Region */}
            {!downloading && (
              <div className="space-y-3">
                {!selectedBounds && !isSelecting && (
                  <Button variant="hero" className="w-full" onClick={startSelection} size="sm">
                    <Square className="h-4 w-4 mr-2" />
                    Select Region on Map
                  </Button>
                )}

                {isSelecting && (
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Click and drag on the map to select a region
                    </p>
                    <Button variant="outline" size="sm" onClick={cancelSelection}>
                      Cancel
                    </Button>
                  </div>
                )}

                {selectedBounds && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <input
                      value={regionName}
                      onChange={(e) => setRegionName(e.target.value)}
                      placeholder="Region name..."
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Max Zoom:</label>
                      <Select value={maxZoom} onValueChange={setMaxZoom}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 (City overview)</SelectItem>
                          <SelectItem value="12">12 (Neighborhoods)</SelectItem>
                          <SelectItem value="13">13 (Streets)</SelectItem>
                          <SelectItem value="15">15 (High detail)</SelectItem>
                          <SelectItem value="16">16 (Max detail)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                      <span>{tileCount.toLocaleString()} tiles</span>
                      <span>~{estimatedSizeMB} MB</span>
                    </div>

                    {tileCount > 5000 && (
                      <p className="text-destructive text-xs">Too many tiles. Select a smaller area or lower zoom.</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="hero"
                        className="flex-1"
                        size="sm"
                        onClick={handleDownload}
                        disabled={tileCount > 5000 || tileCount === 0}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelSelection}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Download Progress */}
            {downloading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Downloading tiles...
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{downloadedCount} / {totalTiles}</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { abortRef.current = true; }}>
                  Cancel Download
                </Button>
              </div>
            )}

            {/* Saved Regions */}
            {savedRegions.length > 0 && !downloading && (
              <div className="mt-4 border-t border-border pt-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Saved Regions
                </h5>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {savedRegions.map((region) => (
                    <div key={region.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{region.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {region.tileCount} tiles · ~{region.sizeMB} MB · {new Date(region.downloadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteRegion(region.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-3">
              Maps are cached in your browser for offline use. © OpenStreetMap contributors.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfflineMapDownloader;
