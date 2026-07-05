const axios = require('axios');
const https = require('https');

const API_BASE = 'https://68.183.13.154.nip.io/api';

async function testCreateOrder() {
  let token, tenantId;
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    }, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    token = loginRes.data.token;
    tenantId = loginRes.data.tenant.id;
  } catch (err) {
    console.error(`Login failed`);
    return;
  }

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  try {
    console.log("Starting Business Day if needed...");
    await api.post('/businessdays/start').catch(e => console.log("Business day might already be active"));

    console.log("Fetching menu items...");
    const menuRes = await api.get('/menu/items');
    if(menuRes.data.length === 0) {
        console.log("No menu items to order");
        return;
    }
    const menuItemId = menuRes.data[0].id;

    console.log("Creating Order...");
    const orderReq = {
      orderType: "DineIn",
      customerName: "Test Customer",
      items: [
        { menuItemId: menuItemId, quantity: 1 }
      ]
    };
    const res = await api.post('/orders', orderReq);
    console.log(`✅ Order Created: ${res.data.orderNumber}`);
  } catch (err) {
    if (err.response) {
      console.log(`❌ Order Failed: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    } else {
      console.log(`❌ Order Error: ${err.message}`);
    }
  }
}

testCreateOrder();
