"use client";
import HomeAssistant from "@/components/voice/HomeAssistant";
import ManualEntryActions from "@/components/dashboard/ManualEntryActions";
import BusinessSummary from "@/components/dashboard/BusinessSummary";
import RecentActivity from "@/components/dashboard/RecentActivity";
export default function Home() {
  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <HomeAssistant />
        <RecentActivity />
      </div>
      <div className="dashboard-right">
        <ManualEntryActions />
        <BusinessSummary />
      </div>
    </div>
  );
}
