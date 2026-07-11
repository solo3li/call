import React from 'react';
import AppShell from '../layouts/AppShell';
import DashboardApp from '../modules/hq/components/DashboardApp';
import { DashboardProvider } from '../modules/hq/context/DashboardContext';

export default function HQDashboard() {
  return (
    <AppShell pageTitle="اللوحة الرئيسية">
      <DashboardProvider>
        <DashboardApp />
      </DashboardProvider>
    </AppShell>
  );
}
