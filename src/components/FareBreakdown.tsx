import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Cloud, IndianRupee } from "lucide-react";

interface FareBreakdownProps {
  fare: number;
  breakdown: {
    baseFare: number;
    distanceCharge: number;
    timeMultiplier: { multiplier: number; label: string };
    weatherMultiplier: { multiplier: number; label: string };
    distanceKm: number;
  };
}

export default function FareBreakdown({ fare, breakdown }: FareBreakdownProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" /> Fare Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Fare</span>
          <span>₹{breakdown.baseFare}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" /> Distance ({breakdown.distanceKm} km)
          </span>
          <span>₹{breakdown.distanceCharge}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {breakdown.timeMultiplier.label}
          </span>
          <span>×{breakdown.timeMultiplier.multiplier}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Cloud className="h-3 w-3" /> {breakdown.weatherMultiplier.label}
          </span>
          <span>×{breakdown.weatherMultiplier.multiplier}</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg">
          <span>Total Fare</span>
          <span className="text-primary">₹{fare}</span>
        </div>
      </CardContent>
    </Card>
  );
}
