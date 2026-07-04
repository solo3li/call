#!/bin/bash
echo "Uninstalling existing helm release (if any)..."
helm uninstall foodrms || true

echo "Waiting for pods to terminate..."
sleep 10

echo "Installing comprehensive helm chart (FoodRMS + Asterisk + Gemini Agent)..."
helm install foodrms /root/call/foodRMS/project/helm/foodrms

echo "Deployment finished! Checking pods..."
kubectl get pods
