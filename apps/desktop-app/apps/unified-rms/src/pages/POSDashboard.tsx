import React from 'react';
import { useAuth } from '../AuthContext';
import DashboardApp from '../modules/branch/components/DashboardApp';

export default function POSDashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <span>POS System</span>
        <button onClick={logout}>Logout</button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <DashboardApp />
      </div>
    </div>
  );
}
