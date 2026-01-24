'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, MapPin, Loader2, Search, Settings, Check, AlertCircle } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { FlipCard } from '@/components/ui/FlipCard';

// Popular cities for quick selection
const POPULAR_CITIES = [
  { name: 'New York, US', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles, US', lat: 34.0522, lon: -118.2437 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo, JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris, FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney, AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Miami, US', lat: 25.7617, lon: -80.1918 },
  { name: 'Chicago, US', lat: 41.8781, lon: -87.6298 },
];

function getWeatherIcon(condition: string, size: 'sm' | 'md' = 'sm') {
  const className = size === 'sm' 
    ? "w-4 h-4 text-os-text-secondary-dark" 
    : "w-6 h-6 text-brand-vanilla";
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return <Sun className={className} />;
  } else if (conditionLower.includes('partly') || conditionLower.includes('few')) {
    return <CloudSun className={className} />;
  } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return <Cloud className={className} />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
    return <CloudRain className={className} />;
  } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    return <CloudSnow className={className} />;
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return <CloudLightning className={className} />;
  }
  return <Sun className={className} />;
}

// Front face component - Weather display
function WeatherDisplay({ 
  weather, 
  onFlip,
  loading,
}: { 
  weather: NonNullable<ReturnType<typeof useWeatherData>['weather']>;
  onFlip: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Location header with flip trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium min-w-0">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{weather.location}</span>
          {loading && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-os-text-secondary-dark">H: {weather.high}</span>
          <span className="text-xs text-os-text-secondary-dark">L: {weather.low}</span>
          <button
            onClick={onFlip}
            className="p-1 hover:bg-os-surface-dark rounded transition-colors"
            title="Change location"
          >
            <Settings className="w-3 h-3 text-os-text-secondary-dark hover:text-brand-aperol" />
          </button>
        </div>
      </div>
      
      {/* Current conditions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-start gap-2">
            {getWeatherIcon(weather.condition, 'md')}
            <span className="text-3xl font-mono font-bold text-brand-vanilla">{weather.temp}</span>
          </div>
          <span className="text-sm text-os-text-secondary-dark mt-1 capitalize">
            {weather.condition}
          </span>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {weather.forecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-os-text-secondary-dark uppercase">
              {day.day}
            </span>
            {getWeatherIcon(day.icon)}
            <div className="flex flex-col items-center text-[10px] text-os-text-secondary-dark">
              <span className="text-brand-vanilla">{day.high}</span>
              <span>{day.low}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Back face component - Location editor
function LocationEditor({
  currentLocation,
  onLocationSelect,
  onUseCurrentLocation,
  onDone,
}: {
  currentLocation: string;
  onLocationSelect: (city: { name: string; lat: number; lon: number }) => void;
  onUseCurrentLocation: () => void;
  onDone: () => void;
}) {
  const [locationInput, setLocationInput] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Search for locations as user types using Open-Meteo Geocoding (free, no API key)
  useEffect(() => {
    if (!locationInput.trim() || locationInput.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        // Use Open-Meteo Geocoding API (free, no key required)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationInput)}&count=5&language=en&format=json`;
        const response = await fetch(geoUrl);
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
          setSearchResults(data.results.map((item: { name: string; admin1?: string; country: string; latitude: number; longitude: number }) => ({
            name: item.admin1 
              ? `${item.name}, ${item.admin1}, ${item.country}` 
              : `${item.name}, ${item.country}`,
            lat: item.latitude,
            lon: item.longitude,
          })));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching locations:', err);
        setSearchError('Search failed. Try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [locationInput]);

  const handleSelect = (city: { name: string; lat: number; lon: number }) => {
    onLocationSelect(city);
    setLocationInput('');
    setSearchResults([]);
    onDone();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-medium text-os-text-secondary-dark">
          Change Location
        </span>
        <button 
          onClick={onDone}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-aperol hover:bg-brand-aperol/10 rounded transition-colors"
        >
          <Check className="w-3 h-3" />
          Done
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark" />
        <input
          ref={inputRef}
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Search cities..."
          className="w-full pl-9 pr-3 py-2 bg-os-bg-dark border border-os-border-dark rounded-lg text-sm text-brand-vanilla placeholder-os-text-secondary-dark focus:outline-none focus:border-brand-aperol transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-os-text-secondary-dark animate-spin" />
        )}
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          {searchError}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-h-[120px] overflow-y-auto -mx-1 px-1">
          {searchResults.map((city, index) => (
            <button
              key={`${city.lat}-${city.lon}-${index}`}
              onClick={() => handleSelect(city)}
              className="w-full px-2 py-1.5 text-left text-xs text-brand-vanilla hover:bg-os-bg-dark rounded transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3 h-3 text-os-text-secondary-dark shrink-0" />
              <span className="truncate">{city.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {locationInput.length >= 2 && !isSearching && searchResults.length === 0 && !searchError && (
        <div className="text-xs text-os-text-secondary-dark text-center py-2">
          No cities found. Try a different search.
        </div>
      )}

      {/* Popular Cities */}
      {searchResults.length === 0 && !locationInput && (
        <div>
          <div className="text-[10px] text-os-text-secondary-dark uppercase tracking-wider mb-2">Popular Cities</div>
          <div className="grid grid-cols-2 gap-1">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleSelect(city)}
                className="px-2 py-1.5 text-left text-xs text-brand-vanilla hover:bg-os-bg-dark rounded transition-colors truncate"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Current Location */}
      <button
        onClick={() => {
          onUseCurrentLocation();
          onDone();
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-aperol/10 text-brand-aperol rounded-lg text-xs font-medium hover:bg-brand-aperol/20 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        Use Current Location
      </button>
    </div>
  );
}

export function WeatherWidget() {
  const { weather, location, loading, error, updateLocation } = useWeatherData();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleLocationSelect = (city: { name: string; lat: number; lon: number }) => {
    updateLocation({
      lat: city.lat,
      lon: city.lon,
      name: city.name,
    });
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Current Location',
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (loading && !weather) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-os-text-secondary-dark animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-os-text-secondary-dark">
          <AlertCircle className="w-4 h-4" />
          <span>Unable to load weather</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-xs text-brand-aperol hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <FlipCard
      isFlipped={isFlipped}
      front={
        <WeatherDisplay 
          weather={weather} 
          onFlip={() => setIsFlipped(true)}
          loading={loading}
        />
      }
      back={
        <LocationEditor
          currentLocation={weather.location}
          onLocationSelect={handleLocationSelect}
          onUseCurrentLocation={handleUseCurrentLocation}
          onDone={() => setIsFlipped(false)}
        />
      }
    />
  );
}
