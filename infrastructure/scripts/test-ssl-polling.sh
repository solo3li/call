#!/bin/bash

echo "1. Registering new tenant to test SSL Polling Endpoint..."
RES=$(curl -s -X POST https://68.183.13.154.nip.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"restaurantName": "Polling Test '$RANDOM'", "email": "poll'$RANDOM'@test.com", "password": "password", "fullName": "Polling User"}' \
  -k)

TENANT_ID=$(echo $RES | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" == "null" ]; then
    echo "Failed to extract Tenant ID. Response: $RES"
    exit 1
fi

echo "Registered Tenant ID: $TENANT_ID"
echo "2. Polling /api/auth/ssl-status endpoint..."

START_TIME=$(date +%s)

for i in {1..20}; do
    STATUS_RES=$(curl -s "https://68.183.13.154.nip.io/api/auth/ssl-status?tenantId=${TENANT_ID}" -k)
    IS_READY=$(echo $STATUS_RES | grep -o '"isReady":true' || true)
    
    if [ ! -z "$IS_READY" ]; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "\nSUCCESS! Endpoint returned isReady=true after $DURATION seconds."
        exit 0
    fi
    echo -n "Not ready yet ($STATUS_RES)... "
    sleep 3
done

echo -e "\nTimeout waiting for ssl-status to return true."
exit 1
