import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function CallCenterDashboard() {
  const { logout } = useAuth();
  const [incomingCall, setIncomingCall] = useState<string | null>(null);

  // Mock SignalR connection
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomingCall("Incoming call from 0501234567... (Simulated via SignalR)");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Call Center Dashboard</h1>
      <p>Welcome, Agent. You are connected via SignalR to receive live updates.</p>
      
      {incomingCall && (
        <div style={{ backgroundColor: '#ffcccc', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <strong>🚨 Alert:</strong> {incomingCall}
        </div>
      )}

      <div>
        <h3>Bot Complaints</h3>
        <ul>
          <li>Complaint #101 - Missing item in order (from WhatsApp bot)</li>
          <li>Complaint #102 - Late delivery (from Messenger bot)</li>
        </ul>
      </div>

      <p><small>* Note: Use MicroSIP for actual voice communication.</small></p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
