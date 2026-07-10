import React from "react";
import DashboardApp from "../modules/branch/components/DashboardApp";
import { DashboardProvider } from "../modules/branch/context/DashboardContext";

export default function BranchDashboard() {
  return (
    <DashboardProvider>
      <DashboardApp />
    </DashboardProvider>
  );
}
