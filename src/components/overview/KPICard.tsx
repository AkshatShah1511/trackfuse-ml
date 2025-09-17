import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  className 
}: KPICardProps) {
  return (
    <div className={cn("kpi-card group", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
      </div>
    </div>
  );
}