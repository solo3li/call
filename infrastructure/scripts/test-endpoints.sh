#!/bin/bash
BASE_URL="http://68.183.13.154.nip.io"
TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "Logging in..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  LOGIN_RESP=$(curl -sS -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-Id: $TENANT_ID" \
    -d '{"email":"admin@foodrms.com","password":"Admin123!"}')
    
  TOKEN=$(echo $LOGIN_RESP | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ]; then
    break
  fi
  
  echo "Login failed. Retrying in 5 seconds..."
  sleep 5
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ -z "$TOKEN" ]; then
  echo "Login failed after $MAX_RETRIES attempts!"
  echo "Response: $LOGIN_RESP"
  exit 1
fi

echo "Login successful. Testing endpoints..."

ENDPOINTS=(
  "/api/dashboard/stats"
  "/api/branches"
  "/api/customers"
  "/api/delivery/zones"
  "/api/staff"
  "/api/menu/categories"
  "/api/menu/items"
  "/api/orders"
  "/api/roles"
  "/api/roles/permissions"
  "/api/telegrambot/config"
  "/api/departments"
  "/api/employees"
  "/api/plans"
  "/api/currencies"
  "/api/tenantsettings"
  "/api/businessdays/active"
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
    # Fetch error body
    curl -s "$BASE_URL$EP" -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID"
    echo ""
  fi
done
