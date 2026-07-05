#!/bin/bash
set -e

echo "1. Registering new tenant to test API..."
RES=$(curl -s -X POST https://68.183.13.154.nip.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"restaurantName": "UI Test '$RANDOM'", "email": "uitest'$RANDOM'@test.com", "password": "password", "fullName": "UI Test User"}' \
  -k)

TENANT_ID=$(echo $RES | jq -r '.tenant.id')
SUBDOMAIN=$(echo $RES | jq -r '.tenant.subdomain')
echo "Registered Tenant ID: $TENANT_ID"

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" == "null" ]; then
    echo "Failed to extract Tenant ID. Response: $RES"
    exit 1
fi

echo "2. Polling /api/auth/ssl-status?tenantId=$TENANT_ID (simulating frontend)..."
for i in {1..15}; do
    STATUS_RES=$(curl -s -X GET "https://68.183.13.154.nip.io/api/auth/ssl-status?tenantId=$TENANT_ID" -k)
    IS_READY=$(echo $STATUS_RES | jq -r '.isReady')
    
    echo "Polling attempt $i: $STATUS_RES"
    
    if [ "$IS_READY" == "true" ]; then
        echo -e "\nBackend confirmed SSL is Ready!"
        break
    fi
    sleep 3
done

if [ "$IS_READY" != "true" ]; then
    echo -e "\nTimeout waiting for backend to confirm SSL."
    exit 1
fi

echo "3. Testing HTTPS connection to Subdomain..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SUBDOMAIN}.68.183.13.154.nip.io)

if [ "$HTTP_CODE" == "200" ]; then
    echo "SUCCESS! Received HTTP 200 on subdomain!"
else
    echo "FAILURE! Received HTTP $HTTP_CODE."
    exit 1
fi
