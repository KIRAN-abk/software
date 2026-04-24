import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Cloud, MapPin } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <span className="font-bold text-primary" style={{ fontFamily: "Outfit" }}>RuralRide</span>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm">Home</Button></Link>
            <Link to="/auth"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-6" style={{ fontFamily: "Outfit" }}>
            Transparent Dynamic Pricing
          </h1>
          <p className="text-center text-muted-foreground mb-10">
            Fares are calculated using distance, time, and weather so pricing stays clear and fair.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Time-Based</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>7 AM - 9 PM: Normal</p>
                  <p>9 PM - 12 AM: +20%</p>
                  <p>12 AM - 7 AM: 2x</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Cloud className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Weather-Based</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Clear: Normal</p>
                  <p>Rain: +30%</p>
                  <p>Storm: +50%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Distance-Based</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Base Fare: Rs 30</p>
                  <p>Per Km: Rs 12</p>
                  <p>Fair and transparent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
