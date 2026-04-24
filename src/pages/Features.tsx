import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Shield, Clock, Cloud, Car, Users } from "lucide-react";

const features = [
  { icon: MapPin, title: "Location-Based Matching", desc: "Find nearby drivers instantly using GPS or manual location input." },
  { icon: Clock, title: "Dynamic Pricing", desc: "Fair fares that adjust based on time of day and weather conditions." },
  { icon: Cloud, title: "Weather-Aware", desc: "Real-time weather integration for transparent pricing adjustments." },
  { icon: Shield, title: "Safe & Verified", desc: "OTP verification, emergency SOS button, and driver ratings." },
  { icon: Car, title: "Local Drivers", desc: "Connect with trusted local vehicle owners in your community." },
  { icon: Users, title: "Community First", desc: "Built specifically for rural and semi-urban communities." },
];

export default function Features() {
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
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10" style={{ fontFamily: "Outfit" }}>
            Platform Features
          </h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <f.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
