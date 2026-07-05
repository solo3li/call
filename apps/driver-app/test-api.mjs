import axios from 'axios';

const API_URL = 'https://68.183.13.154.nip.io/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function runTests() {
  console.log('Testing driver app APIs against backend:', API_URL);

  let token = '';

  try {
    console.log('1. Testing Employee Login with DRIVERTEST code...');
    const response = await api.post('/auth/login-employee', { totpCode: 'DRIVERTEST' });
    token = response.data.token;
    console.log('✅ Successfully logged in as driver! Token received.');
  } catch (error) {
    if (error.response) {
      console.log('❌ Failed login. Status:', error.response.status, error.response.data);
    } else {
      console.error('❌ Failed to reach backend:', error.message);
    }
    return;
  }

  try {
    console.log('2. Testing /orders endpoint with driver token...');
    const orderRes = await api.get('/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Successfully reached /orders endpoint! Orders count:', orderRes.data.length);
  } catch (error) {
    if (error.response) {
      console.log('❌ Failed to fetch orders. Status:', error.response.status);
    } else {
      console.error('❌ Failed to reach /orders endpoint:', error.message);
    }
  }
}

runTests();
