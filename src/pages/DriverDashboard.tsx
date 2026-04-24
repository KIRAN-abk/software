import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWeather } from "@/hooks/useWeather";
import { mockBackend } from "@/integrations/mock/mockBackend";
import WeatherWidget from "@/components/WeatherWidget";
import RideStatusBadge from "@/components/RideStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MapPin, Navigation, Phone, Car, LogOut, History, Check, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DriverDashboard() {
  const { user, signOut } = useAuth();
  const { weather, loading: weatherLoading } = useWeather();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<any[]>([]);
  const [myRides, setMyRides] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchMyRides();
    }
  }, [user]);

  useEffect(() => {
    // Refresh driver views after any local mock backend update.
    const onUpdate = () => {
      if (!user) return;
      fetchRequests();
      fetchMyRides();
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

  async function fetchRequests() {
    const { data } = await mockBackend.getRequestedRides();
    setRequests(data || []);
  }

  async function fetchMyRides() {
    if (!user) return;
    const { data } = await mockBackend.getRidesByDriver(user.id);
    setMyRides(data || []);
  }

  async function acceptRide(rideId: string) {
    try {
      await mockBackend.updateRide(rideId, { driver_id: user!.id, status: "accepted" } as any);
      toast({ title: "Ride accepted!" });
      fetchRequests();
      fetchMyRides();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  async function startRide(rideId: string) {
    await mockBackend.updateRide(rideId, { status: "ongoing" } as any);
    toast({ title: "Ride started!" });
    fetchMyRides();
  }

  async function completeRide(rideId: string) {
    await mockBackend.updateRide(rideId, { status: "completed" } as any);
    toast({ title: "Ride completed! Payment received." });
    fetchMyRides();
  }

  const activeRide = myRides.find(r => ["accepted", "ongoing"].includes(r.status));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</span>
            <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Driver</span>
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
        <WeatherWidget weather={weather} loading={weatherLoading} />

        {/* Active Ride */}
        {activeRide && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Current Ride <RideStatusBadge status={activeRide.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1">
                <p><MapPin className="inline h-3 w-3 text-primary" /> {activeRide.pickup_location}</p>
                <p><Navigation className="inline h-3 w-3 text-secondary" /> {activeRide.destination}</p>
                <p className="font-semibold">Fare: ₹{activeRide.final_fare} | {activeRide.distance_km} km</p>
                {activeRide.otp_code && (
                  <p className="text-lg font-bold text-primary">Verify OTP: {activeRide.otp_code}</p>
                )}
              </div>
              <div className="flex gap-2">
                {activeRide.status === "accepted" && (
                  <Button onClick={() => startRide(activeRide.id)} className="flex-1">Start Ride</Button>
                )}
                {activeRide.status === "ongoing" && (
                  <Button onClick={() => completeRide(activeRide.id)} className="flex-1">Complete Ride</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incoming Requests */}
        {!activeRide && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incoming Ride Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No ride requests at the moment. Stay online!</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((ride: any) => (
                    <div key={ride.id} className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <p className="font-medium"><MapPin className="inline h-3 w-3 text-primary" /> {ride.pickup_location}</p>
                          <p><Navigation className="inline h-3 w-3 text-secondary" /> {ride.destination}</p>
                          <p className="text-muted-foreground mt-1">{ride.distance_km} km • {ride.weather_condition}</p>
                        </div>
                        <span className="font-bold text-primary text-lg">₹{ride.final_fare}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => acceptRide(ride.id)} size="sm" className="flex-1 gap-1">
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Rides</CardTitle>
            </CardHeader>
            <CardContent>
              {myRides.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed rides yet.</p>
              ) : (
                <div className="space-y-3">
                  {myRides.map((ride: any) => (
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
