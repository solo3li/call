#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5109/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@foodrms.com","password":"Admin123!"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
curl -s -X GET http://localhost:5109/api/orders -H "Authorization: Bearer $TOKEN" > orders.json
node -e "const orders = require('./orders.json'); console.log(orders.find(o => o.customerPhone !== ''));"
