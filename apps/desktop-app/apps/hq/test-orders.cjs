const http = require('http');

const data = JSON.stringify({
  email: "admin@test.com",
  password: "password123"
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const token = parsed.token;
      if (!token) {
        console.log("Login failed", parsed);
        return;
      }
      console.log("Logged in!");
      
      const ordersReq = http.request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, ores => {
        let obody = '';
        ores.on('data', d => obody += d);
        ores.on('end', () => {
          console.log("Orders:", obody.substring(0, 1000));
        });
      });
      ordersReq.end();
    } catch (e) {
      console.log("Error parsing response", body);
    }
  });
});

req.write(data);
req.end();
