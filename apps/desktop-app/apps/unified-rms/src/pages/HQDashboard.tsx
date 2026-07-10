import React from 'react';
import { useAuth } from '../AuthContext';
import DashboardApp from '../modules/hq/components/DashboardApp';
import { DashboardProvider } from '../modules/hq/context/DashboardContext';

export default function HQDashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <span>HQ Management</span>
        <button onClick={logout}>Logout</button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DashboardProvider>
          <DashboardApp />
        </DashboardProvider>
      </div>
    </div>
  );
}
