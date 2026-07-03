#!/bin/bash
set -e

echo "Building Backend Docker image..."
docker build -t backend:latest .

echo "Importing image into k3s..."
docker save backend:latest | k3s ctr images import -

IP=$(curl -s ifconfig.me)
DOMAIN="api.${IP}.nip.io"

echo "Deploying to k3s..."
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: backend:latest
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
  name: backend
  namespace: default
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: backend-ingress
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(\`${DOMAIN}\`)
      kind: Rule
      services:
        - name: backend
          port: 80
  tls:
    secretName: backend-tls
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: backend-cert
  namespace: default
spec:
  secretName: backend-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - "${DOMAIN}"
EOF

echo "Backend deployed at https://${DOMAIN}"
