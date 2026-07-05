#!/bin/bash
set -e

IP=$(curl -s ifconfig.me)
DOMAIN="livekit.${IP}.nip.io"

echo "Installing Redis..."
helm upgrade --install redis bitnami/redis \
  --set architecture=standalone \
  --set auth.enabled=false \
  --namespace default

cat <<EOF > /root/call/agent_call/k8s/livekit-custom-values.yaml
livekit:
  port: 7880
  rtc:
    tcp_port: 7881
    port_range_start: 50000
    port_range_end: 50050
    use_external_ip: true
  redis:
    address: redis-master.default.svc.cluster.local:6379
  keys:
    devkey: devsecret
podHostNetwork: true
EOF

echo "Installing LiveKit Server..."
helm upgrade --install livekit-server livekit/livekit-server \
  --namespace default \
  -f /root/call/agent_call/k8s/livekit-custom-values.yaml

echo "Creating Certificate and IngressRoute for Traefik..."
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: livekit-cert
  namespace: default
spec:
  secretName: livekit-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - "${DOMAIN}"
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: livekit-ingress
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(\`${DOMAIN}\`)
      kind: Rule
      services:
        - name: livekit-server
          port: 7880
  tls:
    secretName: livekit-tls
EOF

echo "LiveKit deployed at wss://${DOMAIN}"
