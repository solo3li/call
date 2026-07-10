import React from 'react';
import { useAuth } from '../AuthContext';
import DashboardApp from '../modules/branch/components/DashboardApp';
import { DashboardProvider } from '../modules/branch/context/DashboardContext';

export default function POSDashboard() {
  return (
    <DashboardProvider>
      <DashboardApp />
    </DashboardProvider>
  );
}
