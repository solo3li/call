#!/bin/bash
set -e

echo "Building Backend Docker image..."
docker build -t call-backend:latest .

echo "Importing image into k3s..."
docker save call-backend:latest | k3s ctr images import -

IP=$(curl -s ifconfig.me)
DOMAIN="api.${IP}.nip.io"

echo "Deploying to k3s..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: call-backend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: call-backend
  template:
    metadata:
      labels:
        app: call-backend
    spec:
      containers:
        - name: call-backend
          image: call-backend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 8080
          env:
            - name: LIVEKIT_API_KEY
              value: "devkey"
            - name: LIVEKIT_API_SECRET
              value: "devsecret"
---
apiVersion: v1
kind: Service
metadata:
  name: call-backend
  namespace: default
spec:
  selector:
    app: call-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: call-backend-ingress
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(\`${DOMAIN}\`)
      kind: Rule
      services:
        - name: call-backend
          port: 80
  tls:
    secretName: call-backend-tls
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: call-backend-cert
  namespace: default
spec:
  secretName: call-backend-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - "${DOMAIN}"
EOF

echo "Backend deployed at https://${DOMAIN}"
