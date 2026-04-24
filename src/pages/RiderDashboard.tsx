import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWeather } from "@/hooks/useWeather";
import { mockBackend } from "@/integrations/mock/mockBackend";
import { calculateFare, generateOTP } from "@/lib/pricing";
import WeatherWidget from "@/components/WeatherWidget";
import FareBreakdown from "@/components/FareBreakdown";
import RideStatusBadge from "@/components/RideStatusBadge";
import LocationMapPicker from "@/components/LocationMapPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MapPin, Navigation, Phone, Star, AlertTriangle, History, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RiderDashboard() {
  const { user, signOut } = useAuth();
  const { weather, loading: weatherLoading } = useWeather();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState<number>(0);
  const [fareData, setFareData] = useState<any>(null);
  const [rides, setRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) fetchRides();
  }, [user]);

  useEffect(() => {
    // Refresh rider rides after any local mock backend update (accept/cancel/rate).
    const onUpdate = () => {
      if (user) fetchRides();
    };
    window.addEventListener("rr_mock_backend_updated", onUpdate);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rr_mock_backend_v1") onUpdate();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("rr_mock_backend_updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  async function fetchRides() {
    if (!user) return;
    const { data } = await mockBackend.getRidesByRider(user.id);
    setRides(data);
    const active = data.find((r: any) => ["requested", "accepted", "ongoing"].includes(r.status));
    setActiveRide(active || null);
  }

  function estimateFare() {
    if (!pickup || !destination) {
      toast({ title: "Error", description: "Enter both pickup and destination", variant: "destructive" });
      return;
    }
    // Simulate distance (in production use Maps API)
    const dist = Math.round((3 + Math.random() * 25) * 10) / 10;
    setDistance(dist);
    const result = calculateFare(dist, weather?.condition || "clear");
    setFareData(result);
  }

  async function requestRide() {
    if (!fareData) return;
    const otp = generateOTP();
    await mockBackend.insertRide({
      rider_id: user!.id,
      pickup_location: pickup,
      destination: destination,
      distance_km: distance,
      base_fare: fareData.breakdown.baseFare,
      time_multiplier: fareData.breakdown.timeMultiplier.multiplier,
      weather_multiplier: fareData.breakdown.weatherMultiplier.multiplier,
      final_fare: fareData.fare,
      weather_condition: weather?.condition || "clear",
      otp_code: otp,
      status: "requested",
    });
    toast({ title: "Ride Requested!", description: `OTP: ${otp}. Waiting for a driver...` });
    setFareData(null);
    setPickup("");
    setDestination("");
    fetchRides();
  }

  async function cancelRide(rideId: string) {
    await mockBackend.updateRide(rideId, { status: "cancelled" });
    toast({ title: "Ride cancelled" });
    fetchRides();
  }

  async function rateRide(rideId: string, rating: number) {
    await mockBackend.updateRide(rideId, { rating } as any);
    toast({ title: "Thanks for rating!" });
    fetchRides();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Rider</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { window.location.href = "tel:112"; }}>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Weather */}
        <WeatherWidget weather={weather} loading={weatherLoading} />

        {/* Active Ride */}
        {activeRide && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Active Ride <RideStatusBadge status={activeRide.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p><MapPin className="inline h-3 w-3 text-primary" /> {activeRide.pickup_location}</p>
                <p><Navigation className="inline h-3 w-3 text-secondary" /> {activeRide.destination}</p>
                <p className="font-semibold mt-2">Fare: ₹{activeRide.final_fare}</p>
                {activeRide.otp_code && activeRide.status === "accepted" && (
                  <p className="text-lg font-bold text-primary">OTP: {activeRide.otp_code}</p>
                )}
              </div>
              {activeRide.status === "requested" && (
                <Button variant="destructive" size="sm" onClick={() => cancelRide(activeRide.id)}>Cancel Ride</Button>
              )}
              {activeRide.status === "completed" && !activeRide.rating && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => rateRide(activeRide.id, s)} className="hover:scale-110 transition">
                      <Star className={`h-6 w-6 ${s <= (activeRide.rating || 0) ? "text-secondary fill-secondary" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {!activeRide && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Book a Ride</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> Pickup Location</Label>
                <Input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Enter pickup location" />
                <LocationMapPicker title="Choose Pickup Location" onSelect={setPickup} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Navigation className="h-3 w-3 text-secondary" /> Destination</Label>
                <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Enter destination" />
                <LocationMapPicker title="Choose Destination" onSelect={setDestination} />
              </div>
              <Button onClick={estimateFare} className="w-full">Estimate Fare</Button>
              {fareData && (
                <>
                  <FareBreakdown fare={fareData.fare} breakdown={fareData.breakdown} />
                  <Button onClick={requestRide} className="w-full" size="lg">
                    Confirm & Request Ride — ₹{fareData.fare}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ride History */}
        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ride History</CardTitle>
            </CardHeader>
            <CardContent>
              {rides.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rides yet.</p>
              ) : (
                <div className="space-y-3">
                  {rides.map((ride: any) => (
                    <div key={ride.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{ride.pickup_location} → {ride.destination}</p>
                        <p className="text-muted-foreground">{new Date(ride.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{ride.final_fare}</p>
                        <RideStatusBadge status={ride.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
