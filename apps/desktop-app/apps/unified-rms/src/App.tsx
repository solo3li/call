import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, Role } from "./AuthContext";

import Login from "./pages/Login";
import HQDashboard from "./pages/HQDashboard";
import POSDashboard from "./pages/POSDashboard";
import CallCenterDashboard from "./pages/CallCenterDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";

import "./App.css";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: Role[] }) {
  const { role } = useAuth();
  
  if (!role) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(role)) {
    return <div>Unauthorized Access! You don't have permission to view this dashboard.</div>;
  }
  
  return children;
}

function App() {
  const { role } = useAuth();

  return (
    <div className="container">
      <Routes>
        <Route path="/" element={role ? <Navigate to={
          role === 'admin' ? '/hq' : 
          role === 'cashier' ? '/pos' : 
          role === 'agent' ? '/call-center' : '/inventory'
        } /> : <Login />} />
        
        <Route path="/hq" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <HQDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={['admin', 'cashier']}>
            <POSDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/call-center" element={
          <ProtectedRoute allowedRoles={['admin', 'agent']}>
            <CallCenterDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['admin', 'inventory_manager']}>
            <InventoryDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
