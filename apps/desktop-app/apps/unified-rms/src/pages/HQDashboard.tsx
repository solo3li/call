import React from 'react';
import { useAuth } from '../AuthContext';
import DashboardApp from '../modules/hq/components/DashboardApp';
import { DashboardProvider } from '../modules/hq/context/DashboardContext';

export default function HQDashboard() {
  return (
    <DashboardProvider>
      <DashboardApp />
    </DashboardProvider>
  );
}
