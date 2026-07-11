import React from "react";
import AppShell from "../layouts/AppShell";
import DashboardApp from "../modules/branch/components/DashboardApp";
import { DashboardProvider } from "../modules/branch/context/DashboardContext";

export default function BranchDashboard() {
  return (
    <AppShell pageTitle="إدارة الفرع">
      <DashboardProvider>
        <DashboardApp />
      </DashboardProvider>
    </AppShell>
  );
}
