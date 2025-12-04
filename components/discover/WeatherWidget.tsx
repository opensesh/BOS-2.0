'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, MapPin, Loader2, Search, RotateCcw, Check } from 'lucide-react';
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
];

function getWeatherIcon(condition: string, size: 'sm' | 'md' = 'sm') {
  const className = size === 'sm' 
    ? "w-4 h-4 text-os-text-secondary-dark" 
    : "w-6 h-6 text-brand-vanilla";
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return <Sun className={className} />;
  } else if (conditionLower.includes('cloud')) {
    return conditionLower.includes('partly') ? <CloudSun className={className} /> : <Cloud className={className} />;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className={className} />;
  }
  return <Sun className={className} />;
}

// Front face component - Weather display
function WeatherDisplay({ 
  weather, 
  onFlip 
}: { 
  weather: NonNullable<ReturnType<typeof useWeatherData>['weather']>;
  onFlip: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Location header with flip trigger */}
      <button 
        onClick={onFlip}
        className="flex items-center justify-between text-os-text-secondary-dark text-xs uppercase tracking-wider font-medium hover:text-brand-aperol transition-colors group w-full text-left"
      >
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[140px]">{weather.location}</span>
          <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex gap-2">
          <span>H: {weather.high}</span>
          <span>L: {weather.low}</span>
        </div>
      </button>
      
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Search for locations as user types
  useEffect(() => {
    if (!locationInput.trim() || locationInput.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationInput)}&limit=5&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY || ''}`;
        const response = await fetch(geoUrl);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSearchResults(data.map((item: { lat: number; lon: number; name: string; state?: string; country: string }) => ({
            name: item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`,
            lat: item.lat,
            lon: item.lon,
          })));
        }
      } catch (err) {
        console.error('Error searching locations:', err);
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
        <div className="text-xs text-red-500">{error}</div>
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
