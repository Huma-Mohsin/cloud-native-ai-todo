# Phase IV: Local Kubernetes Deployment - Architecture Plan

## 1. Scope and Dependencies

### In Scope
- Containerization of Phase III frontend (Next.js) and backend (FastAPI + MCP)
- Local Kubernetes deployment using Minikube
- Helm chart creation for reproducible deployments
- AI-assisted operations using kubectl-ai and kagent

### Out of Scope
- Cloud deployment (Phase V)
- Kafka/Event-driven architecture (Phase V)
- Dapr integration (Phase V)
- Database containerization (Neon is external)

### External Dependencies
| Dependency | Owner | Purpose |
|------------|-------|---------|
| Neon PostgreSQL | External | Database storage |
| OpenAI API | External | Chatbot AI |
| Docker Desktop | Local | Container runtime |
| Minikube | Local | K8s cluster |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MINIKUBE CLUSTER                             │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │   Ingress   │  (NGINX Ingress Controller)                        │
│  │  Controller │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                            │
│         ├────────────────────────────────────────┐                  │
│         │                                        │                  │
│         ▼                                        ▼                  │
│  ┌─────────────────────┐              ┌─────────────────────┐      │
│  │  Frontend Service   │              │  Backend Service    │      │
│  │    (ClusterIP)      │              │   (ClusterIP)       │      │
│  │      :3000          │              │     :8000           │      │
│  └──────────┬──────────┘              └──────────┬──────────┘      │
│             │                                    │                  │
│             ▼                                    ▼                  │
│  ┌─────────────────────┐              ┌─────────────────────┐      │
│  │ Frontend Deployment │              │ Backend Deployment  │      │
│  │   (2 replicas)      │              │   (2 replicas)      │      │
│  │                     │              │                     │      │
│  │  ┌───────┐ ┌───────┐│              │  ┌───────┐ ┌───────┐│      │
│  │  │ Pod 1 │ │ Pod 2 ││              │  │ Pod 1 │ │ Pod 2 ││      │
│  │  │Next.js│ │Next.js││              │  │FastAPI│ │FastAPI││      │
│  │  └───────┘ └───────┘│              │  │ + MCP │ │ + MCP ││      │
│  └─────────────────────┘              │  └───────┘ └───────┘│      │
│                                       └──────────┬──────────┘      │
│                                                  │                  │
└──────────────────────────────────────────────────┼──────────────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────────┐
                                        │   Neon PostgreSQL   │
                                        │    (External DB)    │
                                        └─────────────────────┘
```

---

## 3. Key Decisions and Rationale

### Decision 1: Multi-stage Docker Builds
**Options Considered**:
1. Single-stage builds
2. Multi-stage builds
3. Distroless images

**Selected**: Multi-stage builds

**Rationale**:
- Reduces final image size significantly
- Separates build-time and runtime dependencies
- Better security (no build tools in production)
- Standard industry practice

### Decision 2: Helm Charts over Raw Manifests
**Options Considered**:
1. Raw YAML manifests
2. Helm Charts
3. Kustomize

**Selected**: Helm Charts

**Rationale**:
- Required by hackathon
- Templating for environment-specific values
- Easy upgrades and rollbacks
- Package management with versioning

### Decision 3: Minikube with Docker Driver
**Options Considered**:
1. Docker driver
2. VirtualBox driver
3. Hyper-V driver

**Selected**: Docker driver

**Rationale**:
- Works well on Windows with WSL2
- Faster startup time
- Better resource utilization
- Native Docker integration

### Decision 4: Ingress Controller (NGINX)
**Options Considered**:
1. NGINX Ingress
2. Traefik
3. Kong

**Selected**: NGINX Ingress (Minikube addon)

**Rationale**:
- Built-in Minikube addon
- Simple setup
- Well-documented
- Sufficient for local development

---

## 4. Docker Strategy

### 4.1 Frontend Dockerfile Pattern

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4.2 Backend Dockerfile Pattern

```dockerfile
# Stage 1: Build
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev --frozen

# Stage 2: Production
FROM python:3.13-slim AS runner
WORKDIR /app
RUN useradd --create-home --uid 1000 appuser
COPY --from=builder /app/.venv /app/.venv
COPY . .
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5. Kubernetes Strategy

### 5.1 Resource Organization

```
k8s/
├── base/                    # Basic manifests (optional)
│   ├── namespace.yaml
│   └── secrets.yaml
├── charts/
│   ├── frontend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-dev.yaml
│   │   └── templates/
│   │       ├── _helpers.tpl
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       ├── configmap.yaml
│   │       └── hpa.yaml
│   └── backend/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       └── templates/
│           ├── _helpers.tpl
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── configmap.yaml
│           ├── secret.yaml
│           └── hpa.yaml
```

### 5.2 Networking Strategy

**Ingress Rules**:
```yaml
paths:
  - path: /api
    pathType: Prefix
    backend: backend-service:8000
  - path: /
    pathType: Prefix
    backend: frontend-service:3000
```

**Service Communication**:
- Frontend → Backend: `http://backend-service:8000/api`
- Backend → Neon: External connection (DATABASE_URL)

### 5.3 Configuration Management

**ConfigMaps**:
- `frontend-config`: NEXT_PUBLIC_* variables
- `backend-config`: Non-sensitive configuration

**Secrets**:
- `backend-secrets`: DATABASE_URL, OPENAI_API_KEY, BETTER_AUTH_SECRET

---

## 6. Reusable Intelligence Strategy

### 6.1 Reusable Helm Templates

Create helper templates that can be reused across charts:

```yaml
# _helpers.tpl
{{- define "common.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "common.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```

### 6.2 Reusable Docker Patterns

Create shared Dockerfile snippets:

```dockerfile
# docker/base/python.Dockerfile - Base Python image
FROM python:3.13-slim AS python-base
RUN pip install uv
WORKDIR /app

# docker/base/node.Dockerfile - Base Node image
FROM node:20-alpine AS node-base
WORKDIR /app
```

### 6.3 kubectl-ai Command Library

Save common commands for reuse:

```bash
# kubectl-ai commands library
DEPLOY_FRONTEND="kubectl-ai 'deploy frontend with image todo-frontend:latest, 2 replicas, port 3000'"
SCALE_BACKEND="kubectl-ai 'scale backend deployment to 3 replicas'"
DEBUG_PODS="kubectl-ai 'show me why pods are not starting in todo namespace'"
```

---

## 7. Deployment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT PIPELINE                             │
└─────────────────────────────────────────────────────────────────────┘

1. BUILD PHASE
   ┌─────────┐    ┌─────────┐    ┌─────────────────┐
   │ Source  │───▶│ Docker  │───▶│ Local Registry  │
   │  Code   │    │  Build  │    │ (minikube)      │
   └─────────┘    └─────────┘    └─────────────────┘

2. DEPLOY PHASE
   ┌─────────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Helm Install/   │───▶│ K8s API     │───▶│ Pods        │
   │    Upgrade      │    │  Server     │    │ Running     │
   └─────────────────┘    └─────────────┘    └─────────────┘

3. VERIFY PHASE
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Health      │───▶│ kubectl-ai  │───▶│ Application │
   │  Checks     │    │ Verification│    │ Ready       │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 8. Operational Readiness

### 8.1 Health Endpoints

| Service | Liveness | Readiness |
|---------|----------|-----------|
| Frontend | GET / | GET / |
| Backend | GET /health | GET /ready |

### 8.2 Logging Strategy
- All containers log to stdout/stderr
- Structured JSON logging
- Correlation IDs for request tracing

### 8.3 Monitoring (Optional)
- Minikube dashboard for basic monitoring
- metrics-server addon for resource metrics

---

## 9. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Minikube resource limits | Pod scheduling failures | Set appropriate resource limits |
| Image pull failures | Deployment blocked | Use local registry (minikube image load) |
| Secret management | Security breach | Use K8s secrets, never hardcode |
| Network connectivity to Neon | App failure | Implement retry logic, health checks |

---

## 10. Validation Checklist

### Pre-deployment
- [ ] Docker images build successfully
- [ ] Helm charts lint without errors
- [ ] Secrets properly configured
- [ ] Minikube cluster running

### Post-deployment
- [ ] All pods in Running state
- [ ] Services reachable
- [ ] Ingress routing correctly
- [ ] Application functional (CRUD operations)
- [ ] Logs accessible

---

## 11. Follow-up Actions

1. **Phase V Preparation**: Design Dapr integration points
2. **CI/CD Integration**: GitHub Actions for automated builds
3. **Cloud Migration**: Adapt Helm charts for DOKS/GKE/AKS
