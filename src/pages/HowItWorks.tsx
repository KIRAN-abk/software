import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { num: "1", title: "Sign Up", desc: "Create your account as a rider or driver in seconds." },
  { num: "2", title: "Book a Ride", desc: "Enter pickup and destination. Get instant fare estimate." },
  { num: "3", title: "Get Matched", desc: "Nearby drivers accept your request with live tracking." },
  { num: "4", title: "Ride and Rate", desc: "Complete your journey and rate the experience." },
];

export default function HowItWorks() {
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
            How RuralRide Works
          </h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
