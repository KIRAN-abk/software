import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { mockBackend } from "@/integrations/mock/mockBackend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Users, Car, MapPin, Settings, LogOut, IndianRupee } from "lucide-react";
import RideStatusBadge from "@/components/RideStatusBadge";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [stats, setStats] = useState({ totalRides: 0, totalEarnings: 0, activeRides: 0 });

  useEffect(() => {
    fetchRides();
    fetchPricing();
  }, []);

  async function fetchRides() {
    const { data } = await mockBackend.getAllRides();
    const limited = data.slice(0, 50);
    if (limited) {
      setRides(limited);
      setStats({
        totalRides: limited.length,
        totalEarnings: limited
          .filter((r: any) => r.status === "completed")
          .reduce((sum: number, r: any) => sum + (r.final_fare || 0), 0),
        activeRides: limited.filter((r: any) => ["requested", "accepted", "ongoing"].includes(r.status)).length,
      });
    }
  }

  async function fetchPricing() {
    const { data } = await mockBackend.getPricingConfig();
    if (data) setPricing(data);
  }

  async function updatePricing() {
    if (!pricing) return;
    try {
      await mockBackend.updatePricingConfig({
        base_fare: pricing.base_fare,
        rate_per_km: pricing.rate_per_km,
        night_multiplier: pricing.night_multiplier,
        evening_multiplier: pricing.evening_multiplier,
        rain_multiplier: pricing.rain_multiplier,
        storm_multiplier: pricing.storm_multiplier,
      });
      toast({ title: "Pricing updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</span>
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalRides}</p>
              <p className="text-xs text-muted-foreground">Total Rides</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <IndianRupee className="h-6 w-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
              <p className="text-xs text-muted-foreground">Earnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.activeRides}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rides">
          <TabsList>
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="rides" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rides.map((ride: any) => (
                    <div key={ride.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{ride.pickup_location} → {ride.destination}</p>
                        <p className="text-muted-foreground">{ride.distance_km} km • {new Date(ride.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{ride.final_fare}</p>
                        <RideStatusBadge status={ride.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            {pricing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Pricing Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Base Fare (₹)</Label>
                      <Input type="number" value={pricing.base_fare} onChange={e => setPricing({ ...pricing, base_fare: +e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rate per KM (₹)</Label>
                      <Input type="number" value={pricing.rate_per_km} onChange={e => setPricing({ ...pricing, rate_per_km: +e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Night Multiplier</Label>
                      <Input type="number" step="0.1" value={pricing.night_multiplier} onChange={e => setPricing({ ...pricing, night_multiplier: +e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Evening Multiplier</Label>
                      <Input type="number" step="0.1" value={pricing.evening_multiplier} onChange={e => setPricing({ ...pricing, evening_multiplier: +e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rain Multiplier</Label>
                      <Input type="number" step="0.1" value={pricing.rain_multiplier} onChange={e => setPricing({ ...pricing, rain_multiplier: +e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Storm Multiplier</Label>
                      <Input type="number" step="0.1" value={pricing.storm_multiplier} onChange={e => setPricing({ ...pricing, storm_multiplier: +e.target.value })} />
                    </div>
                  </div>
                  <Button onClick={updatePricing} className="w-full">Save Pricing</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
