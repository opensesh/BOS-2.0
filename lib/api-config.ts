/**
 * API Configuration
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_WEATHER_API_KEY: OpenWeatherMap API key
 * - NEXT_PUBLIC_FINANCIAL_API_KEY: Alpha Vantage API key (optional, can use Yahoo Finance)
 */

export const API_CONFIG = {
  weather: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY || '',
    // Fallback to a demo key if not set (will have rate limits)
    useDemo: !process.env.NEXT_PUBLIC_WEATHER_API_KEY,
  },
  financial: {
    // Using Yahoo Finance API (no key required) as primary
    yahooFinance: {
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    },
    // Alpha Vantage as backup (requires API key)
    alphaVantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: process.env.NEXT_PUBLIC_FINANCIAL_API_KEY || '',
    },
  },
};

/**
 * Get weather API endpoint
 */
export function getWeatherUrl(endpoint: string, params: Record<string, string>): string {
  const baseUrl = API_CONFIG.weather.baseUrl;
  const apiKey = API_CONFIG.weather.apiKey;
  const queryParams = new URLSearchParams({
    ...params,
    appid: apiKey,
    units: 'imperial', // Use Fahrenheit
  });
  return `${baseUrl}/${endpoint}?${queryParams.toString()}`;
}

/**
 * Get financial API endpoint
 */
export function getFinancialUrl(symbol: string): string {
  // Use Yahoo Finance (no API key needed)
  return `${API_CONFIG.financial.yahooFinance.baseUrl}/${symbol}?interval=1d&range=1d`;
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

