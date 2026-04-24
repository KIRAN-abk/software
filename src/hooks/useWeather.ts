import { useState, useEffect } from "react";

interface WeatherData {
  condition: string;
  temp: number;
  icon: string;
  humidity: number;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate weather data since we need an API key for real weather
    // In production, integrate OpenWeatherMap API
    const conditions = ["Clear", "Clouds", "Rain", "Drizzle", "Thunderstorm"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setTimeout(() => {
      setWeather({
        condition: randomCondition,
        temp: Math.floor(20 + Math.random() * 18),
        icon: "01d",
        humidity: Math.floor(40 + Math.random() * 40),
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { weather, loading };
}
