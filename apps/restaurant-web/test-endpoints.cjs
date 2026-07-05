const axios = require('axios');

const API_BASE = 'https://68.183.13.154.nip.io/api';

async function testEndpoints() {
  console.log(`Starting API Tests...`);
  
  // 1. Login to get fresh token and tenantId
  let token, tenantId;
  try {
    const https = require('https');
    console.log(`Logging in...`);
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    }, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    token = loginRes.data.token;
    tenantId = loginRes.data.tenant.id;
    console.log(`✅ Login successful. Tenant: ${tenantId}`);
  } catch (err) {
    console.error(`❌ Login failed:`, err.message);
    if(err.response) console.error(err.response.data);
    return;
  }

  const https = require('https');
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-Id': tenantId
    },
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
  });

  const endpoints = [
    '/dashboard/stats',
    '/branches',
    '/customers',
    '/staff',
    '/menu/categories',
    '/menu/items',
    '/orders',
    '/roles',
    '/departments',
    '/tenantsettings'
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      console.log(`✅ [200 OK] GET ${endpoint} - Returned ${Array.isArray(res.data) ? res.data.length + ' items' : 'Object'}`);
    } catch (err) {
      if (err.response) {
        console.log(`❌ [${err.response.status}] GET ${endpoint} - ${JSON.stringify(err.response.data)}`);
      } else {
        console.log(`❌ [ERROR] GET ${endpoint} - ${err.message}`);
      }
    }
  }
}

testEndpoints();
