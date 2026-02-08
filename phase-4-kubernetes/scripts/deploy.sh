#!/bin/bash
# =============================================================================
# Phase IV: Deploy to Minikube
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "  Phase IV: Deploying to Minikube"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
    print_error "Minikube is not running. Starting Minikube..."
    minikube start --driver=docker --memory=4096 --cpus=2
fi

print_status "Minikube is running..."

# Enable required addons
print_status "Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Load Docker images to Minikube
print_status "Loading Docker images to Minikube..."
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Create namespace if not exists
print_status "Creating namespace..."
kubectl create namespace todo --dry-run=client -o yaml | kubectl apply -f -

# Check for secrets file
SECRETS_FILE="$PROJECT_ROOT/.secrets.yaml"
if [ -f "$SECRETS_FILE" ]; then
    print_status "Applying secrets from .secrets.yaml..."
    kubectl apply -f "$SECRETS_FILE" -n todo
else
    print_warning "No .secrets.yaml found. Make sure to create secrets manually!"
    print_warning "Example:"
    echo "  kubectl create secret generic todo-secrets \\"
    echo "    --from-literal=DATABASE_URL=your-db-url \\"
    echo "    --from-literal=OPENAI_API_KEY=your-api-key \\"
    echo "    --from-literal=BETTER_AUTH_SECRET=your-secret \\"
    echo "    -n todo"
fi

# Deploy Backend
print_status "Deploying Backend..."
helm upgrade --install todo-backend \
    "$PROJECT_ROOT/k8s/charts/backend" \
    --namespace todo \
    --set image.tag=latest \
    --wait --timeout=120s

# Deploy Frontend
print_status "Deploying Frontend..."
helm upgrade --install todo-frontend \
    "$PROJECT_ROOT/k8s/charts/frontend" \
    --namespace todo \
    --set image.tag=latest \
    --wait --timeout=120s

# Wait for pods to be ready
print_status "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n todo --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend -n todo --timeout=120s

# Show deployment status
echo ""
print_status "Deployment Status:"
kubectl get pods -n todo
echo ""
kubectl get services -n todo
echo ""
kubectl get ingress -n todo

# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo ""
echo "=============================================="
echo "  Deployment Complete!"
echo "=============================================="
echo ""
print_status "Access the application:"
echo "  1. Add to /etc/hosts: $MINIKUBE_IP todo.local"
echo "  2. Open: http://todo.local"
echo ""
echo "  Or use port-forward:"
echo "  kubectl port-forward svc/todo-frontend 3000:3000 -n todo"
echo "  kubectl port-forward svc/todo-backend 8000:8000 -n todo"
