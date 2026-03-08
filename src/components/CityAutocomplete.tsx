import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeoSuggestion {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: GeoSuggestion) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

async function fetchSuggestions(query: string): Promise<GeoSuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en`
    );
    const data = await res.json();
    if (data.results?.length) {
      return data.results.map((r: any) => ({
        name: r.name,
        country: r.country ?? "",
        admin1: r.admin1 ?? "",
        latitude: r.latitude,
        longitude: r.longitude,
      }));
    }
  } catch {}
  return [];
}

const CityAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search city...",
  icon,
  className,
  inputClassName,
  onKeyDown,
}: CityAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const results = await fetchSuggestions(q);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
    setHighlightIndex(-1);
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (suggestion: GeoSuggestion) => {
    const display = suggestion.admin1
      ? `${suggestion.name}, ${suggestion.admin1}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    onChange(display);
    setShowDropdown(false);
    setSuggestions([]);
    onSelect?.(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(suggestions[highlightIndex]);
        return;
      }
    }
    onKeyDown?.(e);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          {icon}
        </div>
      )}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        className={cn(icon ? "pl-10" : "", inputClassName)}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={`${s.latitude}-${s.longitude}-${i}`}
              type="button"
              onClick={() => handleSelect(s)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors",
                i === highlightIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">
                <span className="font-medium">{s.name}</span>
                {s.admin1 && <span className="text-muted-foreground">, {s.admin1}</span>}
                <span className="text-muted-foreground">, {s.country}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
