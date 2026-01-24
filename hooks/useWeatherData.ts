import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '@/types';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

const STORAGE_KEY = 'bos-weather-location';

// Get stored location from localStorage
function getStoredLocation(): Location | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Store location to localStorage
function storeLocation(location: Location) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

// Get weather condition description from WMO codes
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear',
    1: 'Mostly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Heavy Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Heavy Thunderstorm',
  };
  return conditions[code] || 'Unknown';
}

// Get icon string from WMO code
function getWeatherIcon(code: number): string {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2) return 'partly cloudy';
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 85 && code <= 86) return 'snow showers';
  if (code >= 95) return 'thunderstorm';
  return 'clear';
}

export function useWeatherData() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather from Open-Meteo API (free, no key required)
  const fetchWeatherData = useCallback(async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch current weather and 7-day forecast from Open-Meteo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      if (!data.current || !data.daily) {
        throw new Error('Invalid weather data received');
      }

      // Process forecast (skip today, get next 5 days)
      const dailyForecasts = data.daily.time.slice(1, 6).map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        icon: getWeatherIcon(data.daily.weather_code[index + 1]),
        high: `${Math.round(data.daily.temperature_2m_max[index + 1])}°`,
        low: `${Math.round(data.daily.temperature_2m_min[index + 1])}°`,
      }));

      const weatherData: WeatherData = {
        temp: `${Math.round(data.current.temperature_2m)}°`,
        condition: getWeatherCondition(data.current.weather_code),
        location: locationName,
        high: `${Math.round(data.daily.temperature_2m_max[0])}°`,
        low: `${Math.round(data.daily.temperature_2m_min[0])}°`,
        forecast: dailyForecasts,
      };

      setWeather(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize - get stored location or use geolocation
  useEffect(() => {
    const initWeather = async () => {
      // Try to get stored location first
      const storedLocation = getStoredLocation();
      
      if (storedLocation) {
        setLocation(storedLocation);
        await fetchWeatherData(storedLocation.lat, storedLocation.lon, storedLocation.name);
        return;
      }

      // Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Reverse geocode using Open-Meteo Geocoding
              const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1`
              );
              
              // Fallback - just use coordinates as name
              let locationName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
              
              // Try to get a better name from nominatim
              try {
                const nominatimResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const nominatimData = await nominatimResponse.json();
                if (nominatimData.address) {
                  const { city, town, village, state, country } = nominatimData.address;
                  const place = city || town || village || 'Unknown';
                  locationName = state ? `${place}, ${state}` : `${place}, ${country || ''}`;
                }
              } catch {
                // Use coordinate-based name
              }
              
              const newLocation = { lat: latitude, lon: longitude, name: locationName };
              setLocation(newLocation);
              storeLocation(newLocation);
              await fetchWeatherData(latitude, longitude, locationName);
            } catch (err) {
              console.error('Error getting location:', err);
              // Use default location
              const defaultLocation = { lat: 40.7128, lon: -74.006, name: 'New York, NY' };
              setLocation(defaultLocation);
              await fetchWeatherData(defaultLocation.lat, defaultLocation.lon, defaultLocation.name);
            }
          },
          (err) => {
            console.warn('Geolocation error:', err);
            // Use default location
            const defaultLocation = { lat: 40.7128, lon: -74.006, name: 'New York, NY' };
            setLocation(defaultLocation);
            fetchWeatherData(defaultLocation.lat, defaultLocation.lon, defaultLocation.name);
          },
          { timeout: 5000 }
        );
      } else {
        // No geolocation support, use default
        const defaultLocation = { lat: 40.7128, lon: -74.006, name: 'New York, NY' };
        setLocation(defaultLocation);
        await fetchWeatherData(defaultLocation.lat, defaultLocation.lon, defaultLocation.name);
      }
    };

    initWeather();
  }, [fetchWeatherData]);

  // Update location and refetch weather
  const updateLocation = useCallback(async (newLocation: Location) => {
    setLocation(newLocation);
    storeLocation(newLocation);
    await fetchWeatherData(newLocation.lat, newLocation.lon, newLocation.name);
  }, [fetchWeatherData]);

  return {
    weather,
    location,
    loading,
    error,
    updateLocation,
  };
}
