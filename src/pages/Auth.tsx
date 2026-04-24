import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Car, User, MapPin, Zap, AlertCircle } from "lucide-react";

export default function Auth() {
  const location = useLocation();
  const [suppressAutoRedirect, setSuppressAutoRedirect] = useState(false);
  const [isLogin, setIsLogin] = useState(
    // Allow other pages to choose which tab to show
    location.state?.mode === "login" ? true : location.state?.mode === "signup" ? false : false
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoRetryWait, setDemoRetryWait] = useState(0);
  const { signUp, signIn, user, session } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect to dashboard if already logged in
  useEffect(() => {
    if (user && session && !suppressAutoRedirect) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, session, navigate, suppressAutoRedirect]);

  // Test credentials
  const TEST_RIDER = { email: "kiran@test.com", password: "Test123456" };
  const TEST_DRIVER = { email: "driver@test.com", password: "Test123456" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        setSuppressAutoRedirect(false);
        await signIn(email, password);
        // Redirect to dashboard after successful login so rider/driver flows work
        navigate("/dashboard", { replace: true });
      } else {
        const vehicleDetails = role === "driver" ? { vehicle_type: vehicleType, vehicle_model: vehicleModel, vehicle_number: vehicleNumber } : undefined;
        await signUp(email, password, fullName, role, vehicleDetails);
        // After successful sign up, switch back to login screen
        setSuppressAutoRedirect(true);
        toast({ title: "Account created!", description: "Please sign in with your new account." });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(demoUser: typeof TEST_RIDER) {
    setDemoLoading(true);
    try {
      const demoRole = demoUser.email.includes("driver") ? "driver" : "rider";
      const fullName = demoRole === "driver" ? "Demo Driver" : "Demo Rider";
      const vehicleDetails = demoRole === "driver" ? { vehicle_type: "Auto", vehicle_model: "Bajaj Auto", vehicle_number: "DL01AB1234" } : undefined;

      try {
        await signIn(demoUser.email, demoUser.password);
      } catch {
        // First time: create demo account locally, then sign in
        try {
          await signUp(demoUser.email, demoUser.password, fullName, demoRole, vehicleDetails);
        } catch {
          // If it already exists, just continue to sign in.
        }
        await signIn(demoUser.email, demoUser.password);
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      let errorMsg = err.message;
      
      // Handle rate limiting
      if (errorMsg.includes("only request this after")) {
        const waitSeconds = 60;
        errorMsg = `Too many attempts. Please wait ${waitSeconds} seconds before trying again.`;
        setDemoRetryWait(waitSeconds);
        
        // Countdown timer
        const interval = setInterval(() => {
          setDemoRetryWait((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMsg = "⚠️ Email confirmation is enabled in Supabase.\n\nSteps to fix:\n1) Go to https://app.supabase.com\n2) Select your project\n3) Auth → Providers → Email\n4) Toggle OFF 'Confirm email'\n5) Refresh and try again";
      } else if (errorMsg.includes("Invalid login")) {
        errorMsg = "Account not found. Please ensure email confirmation is disabled in Supabase.";
      }
      
      toast({ 
        title: "Demo Login Issue", 
        description: errorMsg,
        variant: "destructive" 
      });
      
      console.error("Demo login error:", err);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: 'Outfit' }}>RuralRide</h1>
          </div>
          <p className="text-muted-foreground">Connecting rural communities, one ride at a time</p>
        </div>

        {isLogin && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">First Time Here?</p>
              <p className="text-amber-800 text-xs mt-1">Click "Demo: Rider" or "Demo: Driver" below to test the app instantly!</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>{isLogin ? "Sign in to your account" : "Join RuralRide today"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={role === "rider" ? "default" : "outline"}
                        className="w-full gap-2"
                        onClick={() => setRole("rider")}
                      >
                        <User className="h-4 w-4" /> Rider
                      </Button>
                      <Button
                        type="button"
                        variant={role === "driver" ? "default" : "outline"}
                        className="w-full gap-2"
                        onClick={() => setRole("driver")}
                      >
                        <Car className="h-4 w-4" /> Driver
                      </Button>
                    </div>
                  </div>
                  {role === "driver" && (
                    <div className="space-y-3 p-3 rounded-lg bg-muted">
                      <p className="text-sm font-medium">Vehicle Details</p>
                      <Input value={vehicleType} onChange={e => setVehicleType(e.target.value)} placeholder="Vehicle type (e.g., Bike, Auto, Car)" required />
                      <Input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="Vehicle model" required />
                      <Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} placeholder="Vehicle number" required />
                    </div>
                  )}
                </>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
              
              {isLogin && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or try demo</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      disabled={demoLoading || demoRetryWait > 0}
                      onClick={() => handleDemoLogin(TEST_RIDER)}
                    >
                      <Zap className="h-4 w-4 mr-2" /> 
                      {demoRetryWait > 0 ? `Wait ${demoRetryWait}s` : "Demo: Rider"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      disabled={demoLoading || demoRetryWait > 0}
                      onClick={() => handleDemoLogin(TEST_DRIVER)}
                    >
                      <Zap className="h-4 w-4 mr-2" /> 
                      {demoRetryWait > 0 ? `Wait ${demoRetryWait}s` : "Demo: Driver"}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Test credentials: rider@test.com / Test123456
                  </p>
                </>
              )}
            </form>
            <div className="mt-4 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
