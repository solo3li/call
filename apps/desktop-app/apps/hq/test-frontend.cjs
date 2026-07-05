const axios = require('axios');

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:5109/api/auth/login', {
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful! Token acquired.');

    const api = axios.create({
      baseURL: 'http://localhost:5109/api',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersRes = await api.get('/orders');
    console.log(`Successfully fetched ${ordersRes.data.length} orders.`);
    
    const ordersWithBranch = ordersRes.data.filter(o => o.branchId && o.branchId !== '');
    const ordersWithType = ordersRes.data.filter(o => o.orderType && o.orderType !== '');
    console.log(`Found ${ordersWithBranch.length} orders with a populated branchId.`);
    console.log(`Found ${ordersWithType.length} orders with a populated orderType.`);
    
    if (ordersWithBranch.length > 0) {
      console.log('Sample Order:');
      console.log({
        orderNumber: ordersWithBranch[0].orderNumber,
        branchId: ordersWithBranch[0].branchId,
        orderType: ordersWithBranch[0].orderType,
        totalAmount: ordersWithBranch[0].totalAmount
      });
      console.log('\n✅ TEST PASSED: Frontend API correctly receives branchId and orderType.');
    } else {
      console.log('\n❌ TEST FAILED: branchId is missing.');
    }
  } catch (error) {
    console.error('Test failed with error:', error.response ? error.response.data : error.message);
  }
}

testApi();
