#!/bin/bash
set -e

echo "========================================="
echo "Setting up Phase 4 Kubernetes Environment"
echo "========================================="

# Install kubectl-ai
echo "Installing kubectl-ai..."
curl -sSL https://github.com/sozercan/kubectl-ai/releases/latest/download/kubectl-ai_linux_amd64.tar.gz | tar -xz
sudo mv kubectl-ai /usr/local/bin/
chmod +x /usr/local/bin/kubectl-ai

# Install kagent (if available)
echo "Installing kagent..."
pip install kagent-cli || echo "kagent not available via pip, skipping..."

# Install UV package manager for Python
echo "Installing UV..."
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add UV to PATH
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc

# Start Minikube with Docker driver
echo "Starting Minikube..."
minikube start --driver=docker --memory=2048 --cpus=2

# Enable ingress addon
minikube addons enable ingress

# Verify installations
echo ""
echo "========================================="
echo "Verifying installations..."
echo "========================================="
echo "Docker version:"
docker --version

echo ""
echo "Kubectl version:"
kubectl version --client

echo ""
echo "Helm version:"
helm version --short

echo ""
echo "Minikube status:"
minikube status

echo ""
echo "========================================="
echo "Phase 4 Environment Ready!"
echo "========================================="
echo ""
echo "Available tools:"
echo "  - docker        : Container runtime"
echo "  - kubectl       : Kubernetes CLI"
echo "  - helm          : Kubernetes package manager"
echo "  - minikube      : Local Kubernetes cluster"
echo "  - kubectl-ai    : AI-assisted kubectl"
echo "  - uv            : Python package manager"
echo ""
echo "Next steps:"
echo "  1. cd phase-4-kubernetes"
echo "  2. docker build -t backend:latest -f docker/Dockerfile.backend ."
echo "  3. helm install backend ./k8s/charts/backend"
echo ""
