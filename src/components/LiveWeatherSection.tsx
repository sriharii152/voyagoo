import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Sunrise,
  Sunset,
  Gauge,
  Plus,
  X,
  CloudRain,
  Cloud,
  Sun,
  CloudSnow,
  CloudFog,
  CloudLightning,
  Loader2,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/* ──────── Types ──────── */

interface LiveWeather {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  severity: "low" | "medium" | "high";
  advisory: string;
  lastUpdated: Date;
}

interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

/* ──────── Defaults ──────── */

const DEFAULT_CITIES: { name: string; country: string; lat: number; lon: number }[] = [
  { name: "Bali", country: "Indonesia", lat: -8.4095, lon: 115.1889 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Kyoto", country: "Japan", lat: 35.0116, lon: 135.7681 },
  { name: "Santorini", country: "Greece", lat: 36.3932, lon: 25.4615 },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.006 },
];

/* ──────── Helpers ──────── */

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 48: "Depositing Rime Fog",
  51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
  61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
  66: "Light Freezing Rain", 67: "Heavy Freezing Rain",
  71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow", 77: "Snow Grains",
  80: "Slight Showers", 81: "Moderate Showers", 82: "Violent Showers",
  85: "Slight Snow Showers", 86: "Heavy Snow Showers",
  95: "Thunderstorm", 96: "Thunderstorm with Slight Hail", 99: "Thunderstorm with Heavy Hail",
};

function getWeatherIcon(code: number, isDay: boolean) {
  if (code === 0 || code === 1) return isDay ? Sun : CloudSun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return CloudSun;
}

function getSeverity(code: number, temp: number, wind: number): "low" | "medium" | "high" {
  if (code >= 95 || temp >= 42 || temp <= -10 || wind >= 60) return "high";
  if (code >= 61 || code >= 71 || temp >= 38 || temp <= 0 || wind >= 40) return "medium";
  return "low";
}

function getAdvisory(code: number, temp: number, wind: number, uv: number): string {
  if (code >= 95) return "⚡ Thunderstorm active. Stay indoors and avoid open areas.";
  if (code >= 65) return "🌧️ Heavy rain. Flooding possible in low-lying areas.";
  if (code >= 75) return "❄️ Heavy snowfall. Roads may be hazardous.";
  if (temp >= 42) return "🔥 Extreme heat. Stay hydrated, avoid midday sun exposure.";
  if (temp >= 38) return "☀️ Very hot. Limit outdoor activities, wear sun protection.";
  if (temp <= -10) return "🥶 Extreme cold. Risk of frostbite on exposed skin.";
  if (temp <= 0) return "🧊 Freezing temperatures. Dress in warm layers.";
  if (wind >= 60) return "💨 Dangerous winds. Avoid coastal areas and bridges.";
  if (wind >= 40) return "🌬️ Strong winds. Secure loose belongings outdoors.";
  if (uv >= 8) return "☀️ Very high UV index. Apply SPF 50+ sunscreen.";
  if (code >= 45 && code <= 48) return "🌫️ Low visibility due to fog. Drive carefully.";
  if (code >= 61) return "🌧️ Rain expected. Carry an umbrella.";
  return "✅ Good conditions for travel and sightseeing.";
}

const severityColors: Record<string, string> = {
  low: "bg-accent/15 text-accent border-accent/30",
  medium: "bg-primary/15 text-primary border-primary/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function windDirectionLabel(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/* ──────── API ──────── */

async function geocodeCity(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`
    );
    const data = await res.json();
    if (data.results?.length) {
      const r = data.results[0];
      return { name: r.name, country: r.country ?? "", latitude: r.latitude, longitude: r.longitude };
    }
  } catch {}
  return null;
}

async function fetchWeather(
  city: string,
  country: string,
  lat: number,
  lon: number
): Promise<LiveWeather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,is_day,uv_index&daily=sunrise,sunset&timezone=auto&forecast_days=1`
  );
  const data = await res.json();
  const c = data.current;
  const d = data.daily;

  const temp = Math.round(c.temperature_2m);
  const wind = Math.round(c.wind_speed_10m);
  const code = c.weather_code;
  const uv = c.uv_index ?? 0;

  return {
    city,
    country,
    temp,
    feelsLike: Math.round(c.apparent_temperature),
    humidity: c.relative_humidity_2m,
    windSpeed: wind,
    windDirection: c.wind_direction_10m,
    pressure: Math.round(c.pressure_msl),
    visibility: 10,
    uvIndex: uv,
    weatherCode: code,
    isDay: c.is_day === 1,
    precipitation: c.precipitation,
    cloudCover: c.cloud_cover,
    sunrise: d.sunrise?.[0] ?? "",
    sunset: d.sunset?.[0] ?? "",
    severity: getSeverity(code, temp, wind),
    advisory: getAdvisory(code, temp, wind, uv),
    lastUpdated: new Date(),
  };
}

/* ──────── Component ──────── */

const LiveWeatherSection = () => {
  const [weatherData, setWeatherData] = useState<LiveWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadDefaultWeather = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        DEFAULT_CITIES.map((c) => fetchWeather(c.name, c.country, c.lat, c.lon))
      );
      setWeatherData(results);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDefaultWeather();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadDefaultWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadDefaultWeather]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDefaultWeather();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const geo = await geocodeCity(searchQuery);
      if (geo) {
        const existing = weatherData.find(
          (w) => w.city.toLowerCase() === geo.name.toLowerCase()
        );
        if (!existing) {
          const weather = await fetchWeather(geo.name, geo.country, geo.latitude, geo.longitude);
          setWeatherData((prev) => [weather, ...prev]);
        }
      }
    } catch {}
    setSearching(false);
    setSearchQuery("");
  };

  const removeCity = (city: string) => {
    setWeatherData((prev) => prev.filter((w) => w.city !== city));
  };

  return (
    <div>
      {/* Search & Refresh bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search any city for live weather..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching} size="sm" className="shrink-0">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-1.5 hidden sm:inline">Search</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-1.5">Refresh</span>
          </Button>
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Live Weather · Auto-refreshes every 5 min
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 animate-pulse">
              <div className="h-5 w-24 bg-muted rounded mb-3" />
              <div className="h-10 w-16 bg-muted rounded mb-3" />
              <div className="h-4 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {weatherData.map((w, i) => {
            const Icon = getWeatherIcon(w.weatherCode, w.isDay);
            return (
              <motion.div
                key={w.city}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`rounded-2xl border p-5 ${severityColors[w.severity]} transition-shadow hover:shadow-md relative group`}
              >
                {/* Remove button */}
                {!DEFAULT_CITIES.some((c) => c.name === w.city) && (
                  <button
                    onClick={() => removeCity(w.city)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-background/50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold">{w.city}</h3>
                    <p className="text-xs opacity-75">{w.country}</p>
                    <p className="text-xs opacity-75 mt-0.5">
                      {WMO_DESCRIPTIONS[w.weatherCode] ?? "Unknown"}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <Icon className="h-8 w-8 mb-1 opacity-80" />
                    <span className="text-2xl font-bold">{w.temp}°C</span>
                    <span className="text-xs opacity-60">Feels {w.feelsLike}°C</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3 opacity-80">
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {w.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {w.windSpeed} km/h {windDirectionLabel(w.windDirection)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    {w.pressure} hPa
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3" />
                    {w.precipitation} mm
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    UV {w.uvIndex}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cloud className="h-3 w-3" />
                    {w.cloudCover}%
                  </span>
                </div>

                {/* Sunrise / Sunset */}
                <div className="flex gap-4 text-xs mb-3 opacity-70">
                  <span className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3" />
                    {w.sunrise ? formatTime(w.sunrise) : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sunset className="h-3 w-3" />
                    {w.sunset ? formatTime(w.sunset) : "—"}
                  </span>
                </div>

                {/* Advisory */}
                <div className="flex items-start gap-2 text-xs bg-background/50 rounded-lg p-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{w.advisory}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveWeatherSection;
