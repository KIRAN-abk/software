import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import RiderDashboard from "./RiderDashboard";
import DriverDashboard from "./DriverDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Show dashboard immediately based on role
  // Default to RiderDashboard if role not yet loaded from database
  if (role === "driver") return <DriverDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <RiderDashboard />;
}
