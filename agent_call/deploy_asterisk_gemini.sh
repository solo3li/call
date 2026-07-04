#!/bin/bash
set -e

echo "Building Gemini Agent..."
cd /root/call/agent_call/agent
docker build -t gemini-agent:latest .
docker save gemini-agent:latest | k3s ctr images import -

echo "Building Asterisk..."
cd /root/call/agent_call/asterisk
docker build -t asterisk:latest .
docker save asterisk:latest | k3s ctr images import -

echo "Deploying to k3s..."
kubectl create secret generic gemini-agent-secret --from-env-file=/root/call/agent_call/agent/.env --dry-run=client -o yaml | kubectl apply -f -

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gemini-agent
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: gemini-agent
  template:
    metadata:
      labels:
        app: gemini-agent
    spec:
      containers:
        - name: gemini-agent
          image: gemini-agent:latest
          imagePullPolicy: Never
          envFrom:
            - secretRef:
                name: gemini-agent-secret
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asterisk
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: asterisk
  template:
    metadata:
      labels:
        app: asterisk
    spec:
      hostNetwork: true
      containers:
        - name: asterisk
          image: asterisk:latest
          imagePullPolicy: Never
          securityContext:
            capabilities:
              add: ["NET_ADMIN", "NET_RAW"]
EOF
echo "Agent and Asterisk deployed."
