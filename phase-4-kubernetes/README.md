# Phase IV: Local Kubernetes Deployment

Deploy the Todo AI Chatbot on a local Kubernetes cluster using Minikube and Helm Charts.

## Overview

| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Docker AI | Gordon (Docker Desktop 4.53+) |
| Orchestration | Kubernetes (Minikube) |
| Package Manager | Helm Charts |
| AI DevOps | kubectl-ai, Kagent |

## Prerequisites

### Required Software

1. **Docker Desktop** (4.53+ for Gordon AI)
   - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Enable WSL 2 backend

2. **Minikube**
   ```bash
   # Windows (via Chocolatey)
   choco install minikube

   # WSL/Linux
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   ```

3. **Helm**
   ```bash
   # Windows (via Chocolatey)
   choco install kubernetes-helm

   # WSL/Linux
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

4. **kubectl**
   ```bash
   # Usually installed with Docker Desktop or Minikube
   kubectl version --client
   ```

### Optional (AIOps)

5. **kubectl-ai**
   ```bash
   # Go install
   go install github.com/sozercan/kubectl-ai@latest

   # Or brew
   brew install sozercan/tap/kubectl-ai
   ```

6. **Kagent**
   ```bash
   pip install kagent
   ```

## Quick Start

### 1. Start Minikube

```bash
# Start with Docker driver
minikube start --driver=docker --memory=4096 --cpus=2

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify
kubectl cluster-info
```

### 2. Build Docker Images

```bash
cd phase-4-kubernetes

# Build images
./scripts/build.sh

# Or manually:
docker build -t todo-frontend:latest -f docker/Dockerfile.frontend ../phase-3-ai-chatbot/frontend
docker build -t todo-backend:latest -f docker/Dockerfile.backend ../phase-3-ai-chatbot/backend

# Load images to Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
```

### 3. Configure Secrets

Create a `.secrets.yaml` file (DO NOT commit this file):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@host:5432/dbname"
  OPENAI_API_KEY: "sk-..."
  BETTER_AUTH_SECRET: "your-32-char-secret"
  GOOGLE_GENAI_API_KEY: "your-google-api-key"
```

Or create via kubectl:

```bash
kubectl create namespace todo

kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL="your-db-url" \
  --from-literal=OPENAI_API_KEY="your-api-key" \
  --from-literal=BETTER_AUTH_SECRET="your-secret" \
  -n todo
```

### 4. Deploy Application

```bash
# Using script
./scripts/deploy.sh

# Or manually with Helm:
helm upgrade --install todo-backend ./k8s/charts/backend -n todo
helm upgrade --install todo-frontend ./k8s/charts/frontend -n todo
```

### 5. Access Application

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts)
# <minikube-ip> todo.local

# Open browser
http://todo.local
```

Or use port-forwarding:

```bash
kubectl port-forward svc/todo-frontend 3000:3000 -n todo
kubectl port-forward svc/todo-backend 8000:8000 -n todo

# Access at http://localhost:3000
```

## Project Structure

```
phase-4-kubernetes/
├── docker/
│   ├── Dockerfile.frontend      # Next.js multi-stage build
│   └── Dockerfile.backend       # FastAPI multi-stage build
├── k8s/
│   ├── base/                    # Basic K8s manifests
│   └── charts/
│       ├── frontend/            # Frontend Helm chart
│       │   ├── Chart.yaml
│       │   ├── values.yaml
│       │   └── templates/
│       └── backend/             # Backend Helm chart
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
├── scripts/
│   ├── build.sh                 # Build Docker images
│   ├── deploy.sh                # Deploy to Minikube
│   └── cleanup.sh               # Remove deployment
├── specs/
│   └── spec.md                  # Phase IV specifications
├── docker-compose.yml           # Local testing
├── plan.md                      # Architecture plan
├── tasks.md                     # Task breakdown
└── README.md                    # This file
```

## Helm Charts

### Frontend Chart

```bash
# Install
helm install todo-frontend ./k8s/charts/frontend -n todo

# Upgrade
helm upgrade todo-frontend ./k8s/charts/frontend -n todo

# Override values
helm upgrade todo-frontend ./k8s/charts/frontend -n todo \
  --set replicaCount=3 \
  --set image.tag=v1.0.1
```

### Backend Chart

```bash
# Install with secrets
helm install todo-backend ./k8s/charts/backend -n todo \
  --set secrets.databaseUrl="your-db-url" \
  --set secrets.openaiApiKey="your-api-key"

# Using values file
helm upgrade todo-backend ./k8s/charts/backend -n todo \
  -f ./k8s/charts/backend/values-prod.yaml
```

## AI-Assisted Operations

### Docker AI (Gordon)

```bash
# Enable in Docker Desktop Settings > Beta Features > Docker AI

# Example commands
docker ai "What can you do?"
docker ai "Build and optimize my Dockerfile"
docker ai "Debug why my container is crashing"
```

### kubectl-ai

```bash
# Set API key
export OPENAI_API_KEY=your-api-key

# Example commands
kubectl-ai "show all pods in todo namespace"
kubectl-ai "scale the backend to 3 replicas"
kubectl-ai "describe the frontend deployment"
kubectl-ai "check why pods are failing"
```

### Kagent

```bash
# Analyze cluster
kagent analyze

# Ask questions
kagent "check cluster health"
kagent "optimize resource allocation"
kagent "troubleshoot networking issues"
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n todo

# Check pod logs
kubectl logs -l app=backend -n todo
kubectl logs -l app=frontend -n todo

# Describe pod for events
kubectl describe pod <pod-name> -n todo
```

### Image Pull Errors

```bash
# Make sure images are loaded in Minikube
minikube image list | grep todo

# Reload if needed
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
```

### Ingress Not Working

```bash
# Check ingress status
kubectl get ingress -n todo

# Check ingress controller
kubectl get pods -n ingress-nginx

# Enable ingress addon
minikube addons enable ingress
```

### Database Connection Issues

```bash
# Verify secret is created
kubectl get secret todo-secrets -n todo

# Check environment in pod
kubectl exec -it <backend-pod> -n todo -- env | grep DATABASE
```

## Cleanup

```bash
# Using script
./scripts/cleanup.sh

# Or manually
helm uninstall todo-frontend -n todo
helm uninstall todo-backend -n todo
kubectl delete namespace todo

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

## Next Steps

Phase V will add:
- Cloud deployment (DigitalOcean DOKS)
- Kafka event streaming (Redpanda Cloud)
- Dapr distributed runtime
- CI/CD with GitHub Actions

## Resources

- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Charts Guide](https://helm.sh/docs/chart_template_guide/)
- [kubectl-ai](https://github.com/sozercan/kubectl-ai)
- [Kagent](https://kagent.dev/)
- [Docker AI (Gordon)](https://docs.docker.com/desktop/ai/)
