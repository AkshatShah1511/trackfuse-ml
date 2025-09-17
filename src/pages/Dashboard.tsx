import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Overview } from "./Overview";
import { QRGenerator } from "./QRGenerator";
import { Inventory } from "./Inventory";
import { Analytics } from "./Analytics";
import { Users } from "./Users";

export function Dashboard() {
  const [currentTab, setCurrentTab] = useState("overview");

  const renderTabContent = () => {
    switch (currentTab) {
      case "overview":
        return <Overview onTabChange={setCurrentTab} />;
      case "qr-generator":
        return <QRGenerator />;
      case "inventory":
        return <Inventory />;
      case "analytics":
        return <Analytics />;
      default:
        return <Overview onTabChange={setCurrentTab} />;
    }
  };

  return (
    <DashboardLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}