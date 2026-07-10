import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: Role) => {
    login(role);
    if (role === 'admin') navigate('/hq');
    else if (role === 'cashier') navigate('/pos');
    else if (role === 'agent') navigate('/call-center');
    else if (role === 'inventory_manager') navigate('/inventory');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Welcome to FoodRMS</h1>
      <h2>Unified Desktop Login</h2>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => handleLogin('admin')}>Login as HQ Admin</button>
        <button onClick={() => handleLogin('cashier')}>Login as Cashier (POS)</button>
        <button onClick={() => handleLogin('agent')}>Login as Call Center Agent</button>
        <button onClick={() => handleLogin('inventory_manager')}>Login as Inventory Manager</button>
      </div>
    </div>
  );
}
