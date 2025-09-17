import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Map,
  AlertTriangle,
  Shield,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Pie
} from "recharts";

// Mock data for charts
const vendorDefectData = [
  { vendor: "RailTech Solutions", defectRate: 2.3 },
  { vendor: "TrackFit Industries", defectRate: 8.1 },
  { vendor: "SteelRail Corp", defectRate: 1.8 },
  { vendor: "FlexiTrack Ltd", defectRate: 4.2 },
  { vendor: "DuraRail Systems", defectRate: 3.1 },
];

const warrantyExpiryData = [
  { name: "Within 30 days", value: 45, color: "#ef4444" },
  { name: "31-90 days", value: 123, color: "#f59e0b" },
  { name: "91-365 days", value: 489, color: "#3b82f6" },
  { name: "1-2 years", value: 876, color: "#10b981" },
  { name: "2+ years", value: 1314, color: "#8b5cf6" },
];

const inspectionTrends = [
  { month: "Jan", passed: 185, failed: 12, pending: 8 },
  { month: "Feb", passed: 201, failed: 15, pending: 6 },
  { month: "Mar", passed: 198, failed: 9, pending: 11 },
  { month: "Apr", passed: 234, failed: 18, pending: 7 },
  { month: "May", passed: 267, failed: 21, pending: 9 },
  { month: "Jun", passed: 289, failed: 14, pending: 5 },
];

const failurePredictionData = [
  { month: "Jul", predicted: 16, actual: 14 },
  { month: "Aug", predicted: 19, actual: 18 },
  { month: "Sep", predicted: 22, actual: 21 },
  { month: "Oct", predicted: 18, actual: null },
  { month: "Nov", predicted: 15, actual: null },
  { month: "Dec", predicted: 20, actual: null },
];

const zoneData = [
  { zone: "Zone A", defects: 23, total: 547 },
  { zone: "Zone B", defects: 18, total: 423 },
  { zone: "Zone C", defects: 31, total: 689 },
  { zone: "Zone D", defects: 12, total: 298 },
  { zone: "Zone E", defects: 27, total: 456 },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">Insights and trends for railway track fittings</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <Badge className="status-active">Good</Badge>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">96.2%</h3>
            <p className="text-muted-foreground text-sm font-medium">Overall Quality Score</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <Badge className="status-warning">Monitor</Badge>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">3.8%</h3>
            <p className="text-muted-foreground text-sm font-medium">Average Defect Rate</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-success/10 text-success">
              <Shield className="h-6 w-6" />
            </div>
            <Badge className="status-active">Excellent</Badge>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">84%</h3>
            <p className="text-muted-foreground text-sm font-medium">Items Under Warranty</p>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <Badge className="status-active">+2.3%</Badge>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">92.1%</h3>
            <p className="text-muted-foreground text-sm font-medium">Inspection Pass Rate</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Defect Rate Chart */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Vendor-wise Defect Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorDefectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vendor" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar 
                  dataKey="defectRate" 
                  fill="hsl(var(--primary))" 
                  name="Defect Rate (%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Warranty Expiry Distribution */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Warranty Expiry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={warrantyExpiryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {warrantyExpiryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone-wise Defect Heatmap */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Zone-wise Defect Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneData.map((zone) => {
                const defectRate = ((zone.defects / zone.total) * 100).toFixed(1);
                const severity = 
                  parseFloat(defectRate) > 5 ? 'high' : 
                  parseFloat(defectRate) > 3 ? 'medium' : 'low';
                
                return (
                  <div key={zone.zone} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium">{zone.zone}</h4>
                      <p className="text-sm text-muted-foreground">
                        {zone.defects} defects out of {zone.total} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold">{defectRate}%</div>
                        <Badge 
                          className={
                            severity === 'high' ? 'status-expired' :
                            severity === 'medium' ? 'status-warning' : 'status-active'
                          }
                        >
                          {severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Failure Prediction */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Failure Prediction Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={failurePredictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Actual Failures"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Failures"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inspection Trends */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Inspection Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={inspectionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="passed" stackId="a" fill="hsl(var(--success))" name="Passed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" stackId="a" fill="hsl(var(--destructive))" name="Failed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--warning))" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}