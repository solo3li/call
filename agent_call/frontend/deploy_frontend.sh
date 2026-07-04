#!/bin/bash
set -e

echo "Building Frontend Docker image..."
docker build -t call-frontend:latest .

echo "Importing image into k3s..."
docker save call-frontend:latest | k3s ctr images import -

IP=$(curl -s ifconfig.me)
DOMAIN="app.${IP}.nip.io"

echo "Deploying to k3s..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: call-frontend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: call-frontend
  template:
    metadata:
      labels:
        app: call-frontend
    spec:
      containers:
        - name: call-frontend
          image: call-frontend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: call-frontend
  namespace: default
spec:
  selector:
    app: call-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: call-frontend-ingress
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(\`${DOMAIN}\`)
      kind: Rule
      services:
        - name: call-frontend
          port: 80
  tls:
    secretName: call-frontend-tls
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: call-frontend-cert
  namespace: default
spec:
  secretName: call-frontend-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - "${DOMAIN}"
EOF

echo "Frontend deployed at https://${DOMAIN}"
