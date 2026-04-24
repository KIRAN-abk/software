export interface PricingConfig {
  base_fare: number;
  rate_per_km: number;
  night_multiplier: number;
  evening_multiplier: number;
  rain_multiplier: number;
  storm_multiplier: number;
}

const DEFAULT_CONFIG: PricingConfig = {
  base_fare: 30,
  rate_per_km: 12,
  night_multiplier: 2.0,
  evening_multiplier: 1.2,
  rain_multiplier: 1.3,
  storm_multiplier: 1.5,
};

export function getTimeMultiplier(config: PricingConfig = DEFAULT_CONFIG): { multiplier: number; label: string } {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 21) return { multiplier: 1.0, label: "Day Rate" };
  if (hour >= 21 && hour < 24) return { multiplier: config.evening_multiplier, label: "Evening Rate (+20%)" };
  return { multiplier: config.night_multiplier, label: "Night Rate (2×)" };
}

export function getWeatherMultiplier(
  condition: string,
  config: PricingConfig = DEFAULT_CONFIG
): { multiplier: number; label: string } {
  const lower = condition.toLowerCase();
  if (lower.includes("storm") || lower.includes("thunder") || lower.includes("extreme"))
    return { multiplier: config.storm_multiplier, label: "Storm Surcharge (+50%)" };
  if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("shower"))
    return { multiplier: config.rain_multiplier, label: "Rain Surcharge (+30%)" };
  return { multiplier: 1.0, label: "Clear Weather" };
}

export function calculateFare(
  distanceKm: number,
  weatherCondition: string = "clear",
  config: PricingConfig = DEFAULT_CONFIG
) {
  const time = getTimeMultiplier(config);
  const weather = getWeatherMultiplier(weatherCondition, config);
  const fare = config.base_fare + distanceKm * config.rate_per_km * time.multiplier * weather.multiplier;
  return {
    fare: Math.round(fare * 100) / 100,
    breakdown: {
      baseFare: config.base_fare,
      distanceCharge: Math.round(distanceKm * config.rate_per_km * 100) / 100,
      timeMultiplier: time,
      weatherMultiplier: weather,
      distanceKm,
    },
  };
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
