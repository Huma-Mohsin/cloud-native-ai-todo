#!/bin/bash
# =============================================================================
# Phase IV: Cleanup Deployment
# =============================================================================

set -e

echo "=============================================="
echo "  Phase IV: Cleaning Up Deployment"
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

# Uninstall Helm releases
print_status "Uninstalling Helm releases..."
helm uninstall todo-frontend -n todo 2>/dev/null || print_warning "todo-frontend not found"
helm uninstall todo-backend -n todo 2>/dev/null || print_warning "todo-backend not found"

# Delete secrets
print_status "Deleting secrets..."
kubectl delete secret todo-secrets -n todo 2>/dev/null || print_warning "todo-secrets not found"

# Optional: Delete namespace
read -p "Delete the 'todo' namespace? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deleting namespace..."
    kubectl delete namespace todo 2>/dev/null || print_warning "Namespace not found"
fi

# Optional: Remove Docker images
read -p "Remove Docker images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing Docker images..."
    docker rmi todo-frontend:latest 2>/dev/null || print_warning "todo-frontend image not found"
    docker rmi todo-backend:latest 2>/dev/null || print_warning "todo-backend image not found"
fi

echo ""
echo "=============================================="
echo "  Cleanup Complete!"
echo "=============================================="
