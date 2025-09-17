import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  QrCode,
  Package,
  BarChart3,
  Users,
  Menu,
  X
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "qr-generator", label: "Generate QR", icon: QrCode },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardLayout({ children, currentTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
        <div className="flex h-16 items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-3"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            RailTrack Insight
          </h1>
          <div className="ml-auto text-sm text-muted-foreground">
            Railway Track Fittings Management System
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 top-16 z-30 w-64 bg-card border-r border-border transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    currentTab === item.id && "bg-primary text-primary-foreground shadow-lg"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarOpen ? "ml-64" : "ml-0"
          )}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}