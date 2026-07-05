#!/bin/bash
BASE_URL="http://68.183.13.154.nip.io"
TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "Logging in..."
LOGIN_RESP=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -d '{"email":"admin@foodrms.com","password":"Admin123!"}')
  
TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  echo "Response: $LOGIN_RESP"
  exit 1
fi

echo "Login successful. Testing Delivery endpoints..."

ENDPOINTS=(
  "/api/delivery/suggest-groups"
  "/api/delivery/trips"
)

for EP in "${ENDPOINTS[@]}"; do
  echo -n "Testing $EP ... "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$EP" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Tenant-Id: $TENANT_ID")
  
  if [ "$STATUS" == "200" ]; then
    echo "OK (200)"
  else
    echo "FAILED ($STATUS)"
    curl -s "$BASE_URL$EP" -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID"
    echo ""
  fi
done
