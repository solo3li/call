import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, Role } from "./AuthContext";

import Login from "./pages/Login";
import HQDashboard from "./pages/HQDashboard";
import POSDashboard from "./pages/POSDashboard";
import CallCenterDashboard from "./pages/CallCenterDashboard";
import InventoryDashboard from "./pages/InventoryDashboard";
import BranchDashboard from "./pages/BranchDashboard";

import "./App.css";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactElement, allowedRoles: Role[] }) {
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
    <div className="min-h-screen w-full bg-carbon-bg text-carbon-text">
      <Routes>
        <Route path="/" element={role ? <Navigate to={
          role === 'admin' ? '/hq' : 
          role === 'cashier' ? '/pos' : 
          role === 'agent' ? '/call-center' :
          role === 'branch_manager' ? '/branch' : '/inventory'
        } /> : <Login />} />
        
        <Route path="/login" element={<Login />} />
        
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
        
        <Route path="/branch" element={
          <ProtectedRoute allowedRoles={['admin', 'branch_manager']}>
            <BranchDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
