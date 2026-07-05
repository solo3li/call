#!/bin/bash
set -e

echo "1. Registering new tenant..."
RES=$(curl -s -X POST https://68.183.13.154.nip.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"restaurantName": "E2E Test '$RANDOM'", "email": "e2e'$RANDOM'@test.com", "password": "password", "fullName": "E2E User"}' \
  -k)

TENANT_ID=$(echo $RES | jq -r '.tenant.id')
SUBDOMAIN=$(echo $RES | jq -r '.tenant.subdomain')
echo "Registered Tenant ID: $TENANT_ID"
echo "Expected Subdomain: $SUBDOMAIN"

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" == "null" ]; then
    echo "Failed to extract Tenant ID. Response: $RES"
    exit 1
fi

echo "2. Checking for Ingress..."
sleep 2
kubectl get ingress "tenant-${TENANT_ID}-ingress" -n default || { echo "Ingress not found!"; exit 1; }

echo "3. Waiting for SSL Certificate (Timeout: 60s)..."
for i in {1..12}; do
    STATUS=$(kubectl get certificate "tenant-${TENANT_ID}-tls" -n default -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}')
    if [ "$STATUS" == "True" ]; then
        echo -e "\nCertificate is Ready!"
        break
    fi
    echo -n "."
    sleep 5
done

if [ "$STATUS" != "True" ]; then
    echo -e "\nTimeout waiting for certificate."
    exit 1
fi

echo "4. Testing HTTPS connection to Subdomain..."
# Wait a moment for ingress controller to pick up the new secret
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${SUBDOMAIN}.68.183.13.154.nip.io)

if [ "$HTTP_CODE" == "200" ]; then
    echo "SUCCESS! Received HTTP 200 with valid Let's Encrypt certificate."
else
    echo "FAILURE! Received HTTP $HTTP_CODE."
    exit 1
fi

echo "End-to-end test completed successfully."
