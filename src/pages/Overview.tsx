import { KPICard } from "@/components/overview/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Users,
  Shield,
  AlertTriangle,
  QrCode,
  Calendar,
  MapPin,
  TrendingUp
} from "lucide-react";
import railwayHero from "@/assets/railway-hero.jpg";

interface OverviewProps {
  onTabChange?: (tab: string) => void;
}

const recentActivity = [
  { id: "QR-2024-001", vendor: "RailTech Solutions", item: "Elastic Rail Clip", date: "2024-01-15" },
  { id: "QR-2024-002", vendor: "TrackFit Industries", item: "Rail Pad", date: "2024-01-14" },
  { id: "QR-2024-003", vendor: "SteelRail Corp", item: "Concrete Sleeper", date: "2024-01-14" },
  { id: "QR-2024-004", vendor: "FlexiTrack Ltd", item: "Rail Liner", date: "2024-01-13" },
  { id: "QR-2024-005", vendor: "DuraRail Systems", item: "Elastic Rail Clip", date: "2024-01-13" },
];

const alerts = [
  { type: "warranty", message: "50 items expiring within 30 days", severity: "warning" },
  { type: "defect", message: "RailTech Solutions: 8% defect rate", severity: "high" },
  { type: "inspection", message: "Zone A inspection overdue", severity: "medium" },
];

export function Overview({ onTabChange }: OverviewProps) {
  const handleGenerateQR = () => {
    if (onTabChange) {
      onTabChange("qr-generator");
    }
  };

  const handleViewReports = () => {
    if (onTabChange) {
      onTabChange("analytics");
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden dashboard-card p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Railway Track Fittings Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Monitor, track, and manage railway infrastructure components with precision and reliability.
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="btn-primary" onClick={handleGenerateQR}>
                <QrCode className="h-5 w-5 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline" size="lg" onClick={handleViewReports}>
                View Reports
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={railwayHero}
              alt="Railway Infrastructure"
              className="rounded-lg shadow-lg object-cover w-full h-64"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Items Registered"
          value="2,847"
          change="+12%"
          changeType="positive"
          icon={Package}
        />
        <KPICard
          title="Active Vendors"
          value="24"
          change="+2"
          changeType="positive"
          icon={Users}
        />
        <KPICard
          title="Items Under Warranty"
          value="2,391"
          change="84%"
          changeType="neutral"
          icon={Shield}
        />
        <KPICard
          title="Failed Inspections"
          value="43"
          change="-5%"
          changeType="positive"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="dashboard-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium text-foreground">{activity.id}</div>
                    <div className="text-sm text-muted-foreground">{activity.vendor}</div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {activity.item}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card className="dashboard-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className={`p-2 rounded-full ${alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    alert.severity === 'warning' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.type === 'warranty' ? 'Warranty Management' :
                        alert.type === 'defect' ? 'Quality Control' : 'Inspection Schedule'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}