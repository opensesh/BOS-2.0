import { useState, useEffect } from 'react';
import { WeatherData } from '@/types';

interface Location {
  lat: number;
  lon: number;
  name: string;
}

// Mock weather data for fallback
const MOCK_WEATHER: WeatherData = {
  temp: '72°',
  condition: 'Clear',
  location: 'San Francisco, CA',
  high: '76°',
  low: '58°',
  forecast: [
    { day: 'Mon', icon: 'clear', high: '76°', low: '58°' },
    { day: 'Tue', icon: 'clouds', high: '74°', low: '59°' },
    { day: 'Wed', icon: 'clouds', high: '70°', low: '57°' },
    { day: 'Thu', icon: 'rain', high: '68°', low: '55°' },
    { day: 'Fri', icon: 'clear', high: '71°', low: '56°' },
  ],
};

export function useWeatherData() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

  // Get user's location from browser
  useEffect(() => {
    const initWeather = async () => {
      // If no API key, use mock data
      if (!apiKey) {
        console.log('No weather API key found, using mock data');
        setWeather(MOCK_WEATHER);
        setLocation({ lat: 37.7749, lon: -122.4194, name: 'San Francisco, CA' });
        setLoading(false);
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Reverse geocode to get location name
              const geoResponse = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
              );
              const geoData = await geoResponse.json();
              const locationName = geoData[0] 
                ? `${geoData[0].name}, ${geoData[0].state || geoData[0].country}`
                : `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
              
              setLocation({ lat: latitude, lon: longitude, name: locationName });
              await fetchWeatherData(latitude, longitude, locationName);
            } catch (err) {
              console.error('Error getting location name:', err);
              setLocation({ 
                lat: latitude, 
                lon: longitude, 
                name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` 
              });
              await fetchWeatherData(latitude, longitude);
            }
          },
          (err) => {
            console.warn('Geolocation error:', err);
            // Use mock data on geolocation error
            setWeather(MOCK_WEATHER);
            setLocation({ lat: 37.7749, lon: -122.4194, name: 'San Francisco, CA' });
            setLoading(false);
          }
        );
      } else {
        // Browser doesn't support geolocation, use mock data
        setWeather(MOCK_WEATHER);
        setLocation({ lat: 37.7749, lon: -122.4194, name: 'San Francisco, CA' });
        setLoading(false);
      }
    };

    initWeather();
  }, [apiKey]);

  const fetchWeatherData = async (lat: number, lon: number, locationName?: string) => {
    if (!apiKey) {
      setWeather({ ...MOCK_WEATHER, location: locationName || MOCK_WEATHER.location });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );
      
      if (!currentResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const currentData = await currentResponse.json();

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );
      const forecastData = await forecastResponse.json();

      // Process forecast data (get daily forecasts)
      const dailyForecasts = forecastData.list
        .filter((_: unknown, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: { dt: number; weather: { main: string }[]; main: { temp_max: number; temp_min: number } }) => ({
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          icon: item.weather[0].main.toLowerCase(),
          high: `${Math.round(item.main.temp_max)}°`,
          low: `${Math.round(item.main.temp_min)}°`,
        }));

      const weatherData: WeatherData = {
        temp: `${Math.round(currentData.main.temp)}°`,
        condition: currentData.weather[0].main,
        location: locationName || location?.name || 'Unknown',
        high: `${Math.round(currentData.main.temp_max)}°`,
        low: `${Math.round(currentData.main.temp_min)}°`,
        forecast: dailyForecasts,
      };

      setWeather(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      // Set mock data as fallback
      setWeather({ ...MOCK_WEATHER, location: locationName || MOCK_WEATHER.location });
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (newLocation: Location) => {
    setLocation(newLocation);
    await fetchWeatherData(newLocation.lat, newLocation.lon, newLocation.name);
  };

  return {
    weather,
    location,
    loading,
    error,
    updateLocation,
  };
}
