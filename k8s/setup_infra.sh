#!/bin/bash
set -e

echo "Adding Helm repos..."
helm repo add traefik https://helm.traefik.io/traefik
helm repo add jetstack https://charts.jetstack.io
helm repo update

echo "Installing Traefik..."
helm upgrade --install traefik traefik/traefik \
  --namespace kube-system \
  --set ingressRoute.dashboard.enabled=false \
  --set "providers.kubernetesCRD.allowCrossNamespace=true" \
  --set "providers.kubernetesIngress.publishedService.enabled=true"

echo "Installing Cert-Manager..."
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true

echo "Waiting for Cert-Manager webhooks to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/component=webhook -n cert-manager --timeout=120s || true
sleep 5 # Extra safety margin

IP=$(curl -s ifconfig.me)
EMAIL="admin@${IP}.nip.io"

echo "Applying ClusterIssuer for Let's Encrypt with email: $EMAIL..."
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod-account-key
    solvers:
    - http01:
        ingress:
          class: traefik
EOF

echo "Infra setup complete!"
