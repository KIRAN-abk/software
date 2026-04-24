import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  requested: { label: "Requested", className: "bg-secondary/20 text-secondary border-secondary/30" },
  accepted: { label: "Accepted", className: "bg-primary/20 text-primary border-primary/30" },
  ongoing: { label: "Ongoing", className: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  completed: { label: "Completed", className: "bg-green-500/20 text-green-700 border-green-500/30" },
  cancelled: { label: "Cancelled", className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function RideStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.requested;
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}
