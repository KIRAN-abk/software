import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Car, Users, Phone } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link to="/features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Car className="h-4 w-4" /> Rides for rural India
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ fontFamily: 'Outfit' }}>
            Your Village,{" "}
            <span className="text-primary">Your Ride</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            RuralRide connects passengers with local drivers in areas where commercial ride services don't operate. 
            Affordable, safe, and community-driven transportation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 gap-2">
                <Users className="h-5 w-5" /> Book a Ride
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 gap-2">
                <Car className="h-5 w-5" /> Become a Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "Outfit" }}>
            Explore RuralRide
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold">Features</h3>
                <p className="text-muted-foreground text-sm">See safety, weather, and matching features for riders and drivers.</p>
                <Link to="/features"><Button variant="outline" size="sm">Open Features</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold">How It Works</h3>
                <p className="text-muted-foreground text-sm">Learn the step-by-step flow from signup to ride completion.</p>
                <Link to="/how-it-works"><Button variant="outline" size="sm">Open Steps</Button></Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <p className="text-muted-foreground text-sm">Check how fares are calculated with distance, time, and weather.</p>
                <Link to="/pricing"><Button variant="outline" size="sm">Open Pricing</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Outfit' }}>
            Ready to Ride?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of rural commuters and local drivers building a better transportation network.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Emergency: <Phone className="inline h-3 w-3" /> 112</span>
            <span>© 2026 RuralRide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
