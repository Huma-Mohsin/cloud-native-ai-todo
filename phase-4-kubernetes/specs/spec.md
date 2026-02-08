# Phase IV: Local Kubernetes Deployment Specification

## Overview

**Phase**: IV - Local Kubernetes Deployment
**Points**: 250
**Objective**: Deploy the Todo Chatbot on a local Kubernetes cluster using Minikube and Helm Charts.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Containerization | Docker (Docker Desktop) |
| Docker AI | Docker AI Agent (Gordon) |
| Orchestration | Kubernetes (Minikube) |
| Package Manager | Helm Charts |
| AI DevOps | kubectl-ai, Kagent |
| Application | Phase III Todo Chatbot |

---

## Requirements

### 1. Docker Containerization

#### 1.1 Frontend Container (Next.js)
- **Base Image**: `node:20-alpine`
- **Build Stage**: Multi-stage build for production
- **Port**: 3000
- **Features**:
  - Production build optimization
  - Non-root user for security
  - Health check endpoint
  - Environment variable support

#### 1.2 Backend Container (FastAPI + MCP)
- **Base Image**: `python:3.13-slim`
- **Build Stage**: Multi-stage build
- **Port**: 8000
- **Features**:
  - UV package manager
  - Non-root user
  - Health check endpoint (`/health`)
  - Readiness probe (`/ready`)
  - MCP server integration

### 2. Kubernetes Deployment (Minikube)

#### 2.1 Minikube Setup
- **Driver**: Docker (recommended for Windows/WSL2)
- **Resources**: 4GB memory, 2 CPUs minimum
- **Addons**: ingress, metrics-server, dashboard

#### 2.2 Kubernetes Resources

**Frontend Deployment**:
- Replicas: 2 (for high availability)
- Resource Limits: 256MB memory, 0.5 CPU
- Liveness Probe: HTTP GET /
- Readiness Probe: HTTP GET /

**Backend Deployment**:
- Replicas: 2
- Resource Limits: 512MB memory, 1 CPU
- Liveness Probe: HTTP GET /health
- Readiness Probe: HTTP GET /ready

**Services**:
- Frontend Service: ClusterIP, port 3000
- Backend Service: ClusterIP, port 8000

**Ingress**:
- Host-based routing
- Path-based routing for `/api/*` to backend
- TLS (optional for local)

**ConfigMaps**:
- Application configuration
- Environment-specific settings

**Secrets**:
- Database credentials
- API keys (OpenAI, Better Auth)

### 3. Helm Charts

#### 3.1 Frontend Chart
```
charts/frontend/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml (Horizontal Pod Autoscaler)
│   └── _helpers.tpl
```

#### 3.2 Backend Chart
```
charts/backend/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── hpa.yaml
│   └── _helpers.tpl
```

### 4. AI-Assisted Operations (AIOps)

#### 4.1 Docker AI (Gordon)
- Generate Dockerfile recommendations
- Build optimization suggestions
- Container debugging assistance

#### 4.2 kubectl-ai
- AI-assisted Kubernetes operations
- Natural language to K8s commands
- Examples:
  ```bash
  kubectl-ai "deploy the todo frontend with 2 replicas"
  kubectl-ai "scale the backend to handle more load"
  kubectl-ai "check why the pods are failing"
  ```

#### 4.3 Kagent
- Cluster health analysis
- Resource optimization recommendations
- Troubleshooting assistance

---

## Acceptance Criteria

### Docker

- [ ] Frontend Dockerfile builds successfully
- [ ] Backend Dockerfile builds successfully
- [ ] Multi-stage builds implemented
- [ ] Images use non-root users
- [ ] Health checks implemented
- [ ] Image sizes optimized (< 500MB each)

### Kubernetes

- [ ] Minikube cluster starts successfully
- [ ] All pods running and healthy
- [ ] Services accessible within cluster
- [ ] Ingress routes traffic correctly
- [ ] ConfigMaps and Secrets properly mounted
- [ ] HPA configured for auto-scaling

### Helm

- [ ] Charts lint successfully (`helm lint`)
- [ ] Charts install without errors
- [ ] Values can be overridden
- [ ] Upgrade and rollback work correctly

### Application

- [ ] Todo CRUD operations work via chatbot
- [ ] Authentication works correctly
- [ ] Conversation history persists
- [ ] Database connectivity (Neon) works

### AIOps

- [ ] kubectl-ai installed and functional
- [ ] kagent installed and functional
- [ ] Gordon (Docker AI) available (optional)

---

## Non-Functional Requirements

### Performance
- Pod startup time: < 30 seconds
- Request latency: < 500ms (p95)
- Memory usage: Within defined limits

### Reliability
- Pods survive restarts
- Rolling updates with zero downtime
- Automatic pod recovery on failure

### Security
- No secrets in plain text
- Network policies (optional)
- Non-root container execution

---

## Reusable Intelligence Components

### 1. Helm Chart Templates (Reusable)
- Base deployment template
- Service template
- Ingress template
- ConfigMap/Secret templates

### 2. Docker Best Practices (Reusable)
- Multi-stage build pattern
- Security hardening pattern
- Health check pattern

### 3. kubectl-ai Commands (Reusable)
- Common deployment commands
- Debugging commands
- Scaling commands

---

## Dependencies

### From Phase III
- Working frontend application (Next.js)
- Working backend application (FastAPI + MCP)
- Database schema (Neon PostgreSQL)
- Authentication (Better Auth)

### External Services
- Neon Database (external, not containerized)
- OpenAI API (for chatbot)

---

## Deliverables

1. **Docker**:
   - `docker/Dockerfile.frontend`
   - `docker/Dockerfile.backend`
   - `docker-compose.yml` (for local testing)

2. **Kubernetes**:
   - Base manifests in `k8s/base/`
   - Helm charts in `k8s/charts/`

3. **Documentation**:
   - `README.md` with setup instructions
   - `DEPLOYMENT.md` with deployment guide

4. **Scripts**:
   - `scripts/build.sh` - Build Docker images
   - `scripts/deploy.sh` - Deploy to Minikube
   - `scripts/cleanup.sh` - Remove deployment

---

## References

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Helm Charts Guide](https://helm.sh/docs/chart_template_guide/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl-ai](https://github.com/sozercan/kubectl-ai)
- [Kagent](https://kagent.dev/)
