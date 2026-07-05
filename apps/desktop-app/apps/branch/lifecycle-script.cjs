const axios = require('axios');

const BASE_URL = 'http://68.183.13.154.nip.io/api';
let token = '';

async function runLifecycle() {
  console.log("=== Starting End-to-End Order Lifecycle ===");

  // 1. Authenticate
  try {
    const authRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    });
    token = authRes.data.token;
    console.log("✅ Authenticated successfully");
  } catch(e) {
    console.error("❌ Auth failed", e.response?.data || e.message);
    return;
  }

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  // 2. Fetch Menu Items to get an ID
  let menuItemId;
  try {
    const menuRes = await api.get('/menu/items');
    menuItemId = menuRes.data[0]?.id;
    console.log(`✅ Fetched menu item: ${menuItemId}`);
  } catch(e) {
    console.error("❌ Fetch Menu failed", e.response?.data || e.message);
    return;
  }

  // 3. Create Order (POS)
  let orderId;
  try {
    const createRes = await api.post('/orders', {
      items: [{ menuItemId, quantity: 2 }]
    });
    orderId = createRes.data.id;
    console.log(`✅ Order Created (Pending): ${orderId}`);
  } catch(e) {
    console.error("❌ Create Order failed", e.response?.data || e.message);
    return;
  }

  // 4. Update Status in KDS (Pending -> Preparing -> Ready)
  try {
    const kdsRes = await api.get('/orders/kds');
    const orderInKds = kdsRes.data.find(o => o.id === orderId);
    if (!orderInKds) throw new Error("Order not found in KDS");
    
    const itemId = orderInKds.items[0].id;
    await api.put(`/orders/${orderId}/items/${itemId}/status`, { status: "Preparing" }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(`✅ Order Item status updated to Preparing`);
    
    await api.put(`/orders/${orderId}/items/${itemId}/status`, { status: "Ready" }, {
        headers: { "Content-Type": "application/json" }
    });
    console.log(`✅ Order Item status updated to Ready`);
  } catch(e) {
    console.error("❌ KDS Update failed", e.response?.data || e.message);
    return;
  }

  // 5. Assign Driver
  try {
    // We will just assign a dummy driver
    await api.put(`/orders/${orderId}/driver`, {
      driverName: "Ahmed Ali",
      driverPhone: "0501234567"
    });
    console.log(`✅ Driver Assigned (Delivering)`);
  } catch(e) {
    console.error("❌ Assign Driver failed", e.response?.data || e.message);
    return;
  }

  // 6. Complete Order
  try {
    await api.put(`/orders/${orderId}/status`, { status: "Completed" }, {
      headers: { "Content-Type": "application/json" }
    });
    console.log(`✅ Order Completed`);
  } catch(e) {
    console.error("❌ Complete Order failed", e.response?.data || e.message);
    return;
  }

  // 7. Verify Dashboard Stats
  try {
    const statsRes = await api.get('/dashboard/stats');
    console.log(`✅ Dashboard Stats Fetched: Total Orders: ${statsRes.data.totalOrders}, Revenue: ${statsRes.data.totalRevenue}`);
  } catch(e) {
    console.error("❌ Dashboard Stats failed", e.response?.data || e.message);
    return;
  }

  console.log("🎉 End-to-End Order Lifecycle completed 1000% successfully!");
}

runLifecycle();
