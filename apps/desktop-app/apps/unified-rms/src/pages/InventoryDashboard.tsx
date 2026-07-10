import React from 'react';
import { useAuth } from '../AuthContext';

export default function InventoryDashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Inventory Dashboard</h1>
      <p>Welcome, Inventory Manager. View stock across all branches here.</p>
      
      <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Maadi Branch</th>
            <th>Nasr City Branch</th>
            <th>Global Warehouse</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Burger Buns</td>
            <td>500</td>
            <td>300</td>
            <td>5000</td>
          </tr>
          <tr>
            <td>Beef Patties</td>
            <td>450</td>
            <td>280</td>
            <td>4800</td>
          </tr>
        </tbody>
      </table>

      <br/>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
