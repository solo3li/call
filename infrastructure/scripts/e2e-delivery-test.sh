#!/bin/bash
BASE_URL="http://68.183.13.154.nip.io"
TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "=== 1. Logging in as Admin ==="
LOGIN_RESP=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{"email":"admin@foodrms.com","password":"Admin123!"}')
  
TOKEN=$(echo $LOGIN_RESP | jq -r .token)

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Login failed!"
  exit 1
fi

echo "=== 2. Getting Branch & Customer ==="
BRANCH_ID=$(curl -sS -X GET "$BASE_URL/api/branches" -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID" | jq -r '.[0].id')
CUSTOMER_ID=$(curl -sS -X GET "$BASE_URL/api/customers" -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID" | jq -r '.[0].id')

echo "Branch ID: $BRANCH_ID"
echo "Customer ID: $CUSTOMER_ID"

echo "=== 4. Testing Suggest Groups ==="
GROUPS_RESP=$(curl -sS -X GET "$BASE_URL/api/delivery/suggest-groups?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT_ID")

ORDER_ID_1=$(echo "$GROUPS_RESP" | jq -r '.[0].orders[0].id')
ORDER_ID_2=$(echo "$GROUPS_RESP" | jq -r '.[0].orders[1].id')

if [ "$ORDER_ID_1" == "null" ] || [ -z "$ORDER_ID_1" ]; then
  echo "No orders to group found."
else
  echo "Found orders to group: \"$ORDER_ID_1\", \"$ORDER_ID_2\""
  echo "=== 5. Creating a Delivery Trip ==="
  TRIP_RESP=$(curl -sS -X POST "$BASE_URL/api/delivery/trips" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-Id: $TENANT_ID" \
    -H "Content-Type: application/json" \
    -d "{
      \"orderIds\": [\"$ORDER_ID_1\", \"$ORDER_ID_2\"],
      \"driverName\": \"ممدوح المندوب\",
      \"driverPhone\": \"0551234567\",
      \"branchId\": \"$BRANCH_ID\"
    }")
  
  echo "Trip Creation Response:"
  echo "$TRIP_RESP" | jq . || echo "$TRIP_RESP"
fi

echo "=== 6. Fetching Delivery Trips ==="
ALL_TRIPS=$(curl -sS -X GET "$BASE_URL/api/delivery/trips?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT_ID")

echo "All Trips Response:"
echo "$ALL_TRIPS" | jq . || echo "$ALL_TRIPS"

