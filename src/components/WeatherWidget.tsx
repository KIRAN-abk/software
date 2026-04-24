import { Cloud, Sun, CloudRain, CloudLightning, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherWidgetProps {
  weather: {
    condition: string;
    temp: number;
    icon: string;
    humidity: number;
  } | null;
  loading?: boolean;
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return <CloudLightning className="h-8 w-8 text-secondary" />;
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="h-8 w-8 text-primary" />;
  if (c.includes("cloud")) return <Cloud className="h-8 w-8 text-muted-foreground" />;
  return <Sun className="h-8 w-8 text-secondary" />;
}

export default function WeatherWidget({ weather, loading }: WeatherWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Cloud className="h-8 w-8 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground">Fetching weather...</span>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        {getWeatherIcon(weather.condition)}
        <div>
          <p className="font-semibold text-lg">{weather.temp}°C</p>
          <p className="text-sm text-muted-foreground capitalize">{weather.condition}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <Droplets className="h-4 w-4" />
          {weather.humidity}%
        </div>
      </CardContent>
    </Card>
  );
}
