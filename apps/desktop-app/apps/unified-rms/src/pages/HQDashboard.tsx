import React from 'react';
import { useAuth } from '../AuthContext';

export default function HQDashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>HQ Dashboard</h1>
      <p>Welcome to the central headquarters. Here you can view global reports, manage all branches, and configure the system.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
