# Phase IV: Tasks Breakdown

## Task Overview

| ID | Task | Priority | Status | Dependencies |
|----|------|----------|--------|--------------|
| T1 | Create Frontend Dockerfile | High | Pending | Phase III frontend |
| T2 | Create Backend Dockerfile | High | Pending | Phase III backend |
| T3 | Create docker-compose.yml | Medium | Pending | T1, T2 |
| T4 | Setup Minikube cluster | High | Pending | Docker Desktop |
| T5 | Create Frontend Helm Chart | High | Pending | T1 |
| T6 | Create Backend Helm Chart | High | Pending | T2 |
| T7 | Configure Kubernetes Secrets | High | Pending | T4 |
| T8 | Deploy to Minikube | High | Pending | T4, T5, T6, T7 |
| T9 | Setup Ingress Controller | Medium | Pending | T8 |
| T10 | Verify Application | High | Pending | T8, T9 |
| T11 | Install kubectl-ai | Medium | Pending | - |
| T12 | Install Kagent | Medium | Pending | - |
| T13 | Create Deployment Scripts | Medium | Pending | T8 |
| T14 | Write Documentation | Medium | Pending | All |

---

## Detailed Tasks

### T1: Create Frontend Dockerfile

**Status**: [ ] Pending

**Description**: Create optimized multi-stage Dockerfile for Next.js frontend

**File**: `docker/Dockerfile.frontend`

**Acceptance Criteria**:
- [ ] Multi-stage build implemented
- [ ] Production build optimization
- [ ] Non-root user configured
- [ ] Image size < 200MB
- [ ] Health check included
- [ ] Environment variables supported

**Test Cases**:
```bash
# Build test
docker build -t todo-frontend:test -f docker/Dockerfile.frontend ../phase-3-ai-chatbot/frontend

# Run test
docker run -p 3000:3000 todo-frontend:test

# Health check
curl http://localhost:3000

# Size check
docker images todo-frontend:test --format "{{.Size}}"
```

---

### T2: Create Backend Dockerfile

**Status**: [ ] Pending

**Description**: Create optimized multi-stage Dockerfile for FastAPI backend with MCP

**File**: `docker/Dockerfile.backend`

**Acceptance Criteria**:
- [ ] Multi-stage build implemented
- [ ] UV package manager used
- [ ] Non-root user configured
- [ ] Image size < 300MB
- [ ] Health check endpoint (/health)
- [ ] All dependencies installed

**Test Cases**:
```bash
# Build test
docker build -t todo-backend:test -f docker/Dockerfile.backend ../phase-3-ai-chatbot/backend

# Run test
docker run -p 8000:8000 -e DATABASE_URL=... todo-backend:test

# Health check
curl http://localhost:8000/health

# Size check
docker images todo-backend:test --format "{{.Size}}"
```

---

### T3: Create docker-compose.yml

**Status**: [ ] Pending

**Description**: Create docker-compose for local testing before Kubernetes

**File**: `docker-compose.yml`

**Acceptance Criteria**:
- [ ] Frontend and backend services defined
- [ ] Environment variables from .env
- [ ] Network configuration
- [ ] Volume mounts for development
- [ ] Health checks configured

**Test Cases**:
```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health

# Stop services
docker-compose down
```

---

### T4: Setup Minikube Cluster

**Status**: [ ] Pending

**Description**: Initialize and configure Minikube for local Kubernetes

**Prerequisites**: Docker Desktop installed and running

**Acceptance Criteria**:
- [ ] Minikube installed
- [ ] Cluster started with Docker driver
- [ ] Required addons enabled (ingress, metrics-server)
- [ ] kubectl configured to use minikube context

**Test Cases**:
```bash
# Install minikube (if not installed)
# Windows: choco install minikube
# WSL/Linux: curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Start cluster
minikube start --driver=docker --memory=4096 --cpus=2

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify
kubectl cluster-info
kubectl get nodes
```

---

### T5: Create Frontend Helm Chart

**Status**: [ ] Pending

**Description**: Create Helm chart for frontend deployment

**Directory**: `k8s/charts/frontend/`

**Files to Create**:
- `Chart.yaml` - Chart metadata
- `values.yaml` - Default values
- `templates/deployment.yaml` - Deployment manifest
- `templates/service.yaml` - Service manifest
- `templates/ingress.yaml` - Ingress rules
- `templates/configmap.yaml` - Configuration
- `templates/_helpers.tpl` - Template helpers
- `templates/hpa.yaml` - Horizontal Pod Autoscaler

**Acceptance Criteria**:
- [ ] Chart.yaml with correct metadata
- [ ] Configurable replicas, image, resources
- [ ] Ingress with path routing
- [ ] ConfigMap for environment variables
- [ ] HPA for auto-scaling
- [ ] Linting passes: `helm lint`

**Test Cases**:
```bash
# Lint chart
helm lint k8s/charts/frontend

# Template preview
helm template frontend k8s/charts/frontend

# Dry-run install
helm install frontend k8s/charts/frontend --dry-run
```

---

### T6: Create Backend Helm Chart

**Status**: [ ] Pending

**Description**: Create Helm chart for backend deployment

**Directory**: `k8s/charts/backend/`

**Files to Create**:
- `Chart.yaml`
- `values.yaml`
- `templates/deployment.yaml`
- `templates/service.yaml`
- `templates/configmap.yaml`
- `templates/secret.yaml`
- `templates/_helpers.tpl`
- `templates/hpa.yaml`

**Acceptance Criteria**:
- [ ] Secrets for sensitive data (DATABASE_URL, API keys)
- [ ] Configurable resources and replicas
- [ ] Health check probes configured
- [ ] Linting passes

**Test Cases**:
```bash
# Lint chart
helm lint k8s/charts/backend

# Template with values
helm template backend k8s/charts/backend --set secrets.databaseUrl=test

# Dry-run install
helm install backend k8s/charts/backend --dry-run
```

---

### T7: Configure Kubernetes Secrets

**Status**: [ ] Pending

**Description**: Create and manage secrets for sensitive configuration

**Secrets Required**:
- DATABASE_URL (Neon connection string)
- OPENAI_API_KEY
- BETTER_AUTH_SECRET

**Acceptance Criteria**:
- [ ] Secrets created in cluster
- [ ] Base64 encoding correct
- [ ] Referenced in backend deployment
- [ ] Not committed to git

**Test Cases**:
```bash
# Create secret from file
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL=... \
  --from-literal=OPENAI_API_KEY=... \
  --from-literal=BETTER_AUTH_SECRET=...

# Verify
kubectl get secrets
kubectl describe secret todo-secrets
```

---

### T8: Deploy to Minikube

**Status**: [ ] Pending

**Description**: Deploy frontend and backend to Minikube cluster

**Dependencies**: T4, T5, T6, T7

**Acceptance Criteria**:
- [ ] Images loaded into Minikube
- [ ] Frontend Helm chart installed
- [ ] Backend Helm chart installed
- [ ] All pods running (2/2 ready)
- [ ] Services created

**Test Cases**:
```bash
# Load images to Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Install charts
helm install todo-frontend k8s/charts/frontend
helm install todo-backend k8s/charts/backend

# Verify pods
kubectl get pods
kubectl get services

# Check pod logs
kubectl logs -l app=frontend
kubectl logs -l app=backend
```

---

### T9: Setup Ingress Controller

**Status**: [ ] Pending

**Description**: Configure ingress for routing traffic to services

**Acceptance Criteria**:
- [ ] Ingress resource created
- [ ] Path /api/* routes to backend
- [ ] Path /* routes to frontend
- [ ] Accessible via minikube IP

**Test Cases**:
```bash
# Get Minikube IP
minikube ip

# Check ingress
kubectl get ingress

# Test routes (add to /etc/hosts: <minikube-ip> todo.local)
curl http://todo.local/
curl http://todo.local/api/health

# Or use port-forward
kubectl port-forward svc/todo-frontend 3000:3000
kubectl port-forward svc/todo-backend 8000:8000
```

---

### T10: Verify Application

**Status**: [ ] Pending

**Description**: End-to-end verification of deployed application

**Acceptance Criteria**:
- [ ] Frontend loads correctly
- [ ] Login/signup works
- [ ] Chatbot responds
- [ ] Task CRUD operations work
- [ ] Conversation history persists

**Test Cases**:
```bash
# Access application
minikube service todo-frontend --url

# Test chatbot
# 1. Login/signup
# 2. "Add a task to test kubernetes deployment"
# 3. "Show my tasks"
# 4. "Mark task 1 as complete"
# 5. "Delete task 1"
```

---

### T11: Install kubectl-ai

**Status**: [ ] Pending

**Description**: Install and configure kubectl-ai for AI-assisted K8s operations

**Acceptance Criteria**:
- [ ] kubectl-ai installed
- [ ] OpenAI API key configured
- [ ] Basic commands working

**Test Cases**:
```bash
# Install
brew install sozercan/tap/kubectl-ai
# or
go install github.com/sozercan/kubectl-ai@latest

# Configure
export OPENAI_API_KEY=...

# Test commands
kubectl-ai "show all pods in default namespace"
kubectl-ai "describe the frontend deployment"
```

---

### T12: Install Kagent

**Status**: [ ] Pending

**Description**: Install and configure Kagent for cluster analysis

**Acceptance Criteria**:
- [ ] Kagent installed
- [ ] Cluster analysis working
- [ ] Recommendations visible

**Test Cases**:
```bash
# Install
pip install kagent

# Test
kagent analyze
kagent "check cluster health"
```

---

### T13: Create Deployment Scripts

**Status**: [ ] Pending

**Description**: Create helper scripts for common operations

**Files**:
- `scripts/build.sh` - Build Docker images
- `scripts/deploy.sh` - Deploy to Minikube
- `scripts/cleanup.sh` - Remove deployment

**Acceptance Criteria**:
- [ ] Scripts executable
- [ ] Error handling included
- [ ] Usage instructions

**Script Templates**:

```bash
# scripts/build.sh
#!/bin/bash
set -e
echo "Building Docker images..."
docker build -t todo-frontend:latest -f docker/Dockerfile.frontend ../phase-3-ai-chatbot/frontend
docker build -t todo-backend:latest -f docker/Dockerfile.backend ../phase-3-ai-chatbot/backend
echo "Loading images to Minikube..."
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
echo "Build complete!"
```

```bash
# scripts/deploy.sh
#!/bin/bash
set -e
echo "Deploying to Minikube..."
helm upgrade --install todo-backend k8s/charts/backend
helm upgrade --install todo-frontend k8s/charts/frontend
echo "Waiting for pods..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s
echo "Deployment complete!"
kubectl get pods
```

```bash
# scripts/cleanup.sh
#!/bin/bash
echo "Cleaning up..."
helm uninstall todo-frontend || true
helm uninstall todo-backend || true
kubectl delete secret todo-secrets || true
echo "Cleanup complete!"
```

---

### T14: Write Documentation

**Status**: [ ] Pending

**Description**: Create comprehensive documentation for Phase IV

**Files**:
- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide

**Acceptance Criteria**:
- [ ] Setup instructions complete
- [ ] Prerequisites listed
- [ ] Troubleshooting section
- [ ] Command reference

---

## Progress Tracking

### Completion Summary

| Category | Total | Completed | Remaining |
|----------|-------|-----------|-----------|
| Docker | 3 | 0 | 3 |
| Kubernetes | 4 | 0 | 4 |
| Helm Charts | 2 | 0 | 2 |
| AIOps | 2 | 0 | 2 |
| Scripts | 1 | 0 | 1 |
| Documentation | 1 | 0 | 1 |
| **Total** | **14** | **0** | **14** |

---

## Execution Order

```
Week 1: Docker & Minikube Setup
├── T1: Frontend Dockerfile
├── T2: Backend Dockerfile
├── T3: docker-compose.yml
└── T4: Minikube Setup

Week 2: Helm & Deployment
├── T5: Frontend Helm Chart
├── T6: Backend Helm Chart
├── T7: Kubernetes Secrets
├── T8: Deploy to Minikube
└── T9: Ingress Setup

Week 3: AIOps & Documentation
├── T10: Verify Application
├── T11: kubectl-ai
├── T12: Kagent
├── T13: Scripts
└── T14: Documentation
```
