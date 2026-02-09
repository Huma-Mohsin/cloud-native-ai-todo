---
description: Generate complete Kubernetes deployment blueprints including Helm charts, manifests, and Docker configurations for cloud-native applications
handoffs:
  - label: Deploy to Minikube
    agent: general-purpose
    prompt: Deploy the generated Kubernetes blueprints to Minikube
    send: false
  - label: Deploy to Cloud
    agent: general-purpose
    prompt: Deploy the generated Kubernetes blueprints to cloud (DOKS/GKE/AKS)
    send: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill generates production-ready Kubernetes deployment blueprints for your application. It creates:
- **Helm Charts**: Templated Kubernetes manifests for easy deployment
- **Docker Configurations**: Multi-stage Dockerfiles optimized for each service
- **Kubernetes Manifests**: Deployments, Services, ConfigMaps, Secrets, Ingress
- **Environment Configs**: Dev, staging, and production configurations
- **CI/CD Integration**: GitHub Actions workflows for automated deployment

**Bonus Points**: This skill earns you **+200 points** for "Cloud-Native Blueprints via Agent Skills"

## Outline

### 1. Setup and Context Loading

- Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec --include-plan` from repo root
- Parse FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN paths
- Read plan.md to understand:
  - Tech stack (frontend, backend, database)
  - Service architecture (monolith vs microservices)
  - External dependencies (databases, message queues, caches)
  - Port configurations
- Read data-model.md (if exists) to understand data persistence needs
- Detect project structure (monorepo vs separate repos)

### 2. Analyze Application Architecture

Extract from plan.md:
- **Services**: List all services (frontend, backend, workers, etc.)
- **Dependencies**: External services (Neon DB, Kafka, Redis, etc.)
- **Networking**: Service-to-service communication patterns
- **Storage**: Persistent volumes, ConfigMaps, Secrets
- **Scaling**: Replica counts, resource limits
- **Environment Variables**: Required configs per service

Create architecture map:
```yaml
services:
  - name: frontend
    type: web
    port: 3000
    replicas: 2
    dependencies: [backend]
  - name: backend
    type: api
    port: 8000
    replicas: 3
    dependencies: [database, kafka]
```

### 3. Generate Docker Configurations

For each service, create optimized Dockerfile:

**Frontend (Next.js) Example**:
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

**Backend (FastAPI) Example**:
```dockerfile
# backend/Dockerfile
FROM python:3.13-slim AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM base AS runner
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `.dockerignore` for each service to optimize build context.

### 4. Generate Helm Chart Structure

Create Helm chart in `k8s/helm/[app-name]/`:

```
k8s/helm/todo-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
├── values-dev.yaml         # Development overrides
├── values-staging.yaml     # Staging overrides
├── values-prod.yaml        # Production overrides
├── templates/
│   ├── _helpers.tpl        # Template helpers
│   ├── deployment-frontend.yaml
│   ├── deployment-backend.yaml
│   ├── service-frontend.yaml
│   ├── service-backend.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml            # Horizontal Pod Autoscaler
│   └── serviceaccount.yaml
└── README.md
```

**Chart.yaml**:
```yaml
apiVersion: v2
name: todo-app
description: Cloud-native AI Todo application
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - todo
  - ai
  - chatbot
maintainers:
  - name: Your Name
    email: your.email@example.com
```

**values.yaml** (with sensible defaults):
```yaml
# Global settings
global:
  environment: development
  domain: todo-app.local

# Frontend configuration
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3000
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  env:
    - name: NEXT_PUBLIC_API_URL
      value: "http://backend:8000"

# Backend configuration
backend:
  enabled: true
  replicaCount: 3
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8000
  resources:
    requests:
      memory: "256Mi"
      cpu: "200m"
    limits:
      memory: "512Mi"
      cpu: "500m"
  env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-secrets
          key: database-url
    - name: OPENAI_API_KEY
      valueFrom:
        secretKeyRef:
          name: todo-secrets
          key: openai-api-key

# Ingress configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: todo-app.example.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend
  tls:
    - secretName: todo-tls
      hosts:
        - todo-app.example.com

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

### 5. Generate Kubernetes Manifests (Templates)

**Deployment Template** (`templates/deployment-backend.yaml`):
```yaml
{{- if .Values.backend.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-backend
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
    app.kubernetes.io/component: backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      {{- include "todo-app.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: backend
  template:
    metadata:
      labels:
        {{- include "todo-app.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: backend
    spec:
      containers:
      - name: backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.backend.service.port }}
          protocol: TCP
        env:
        {{- range .Values.backend.env }}
        - name: {{ .name }}
          {{- if .value }}
          value: {{ .value | quote }}
          {{- else if .valueFrom }}
          valueFrom:
            {{- toYaml .valueFrom | nindent 12 }}
          {{- end }}
        {{- end }}
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          {{- toYaml .Values.backend.resources | nindent 10 }}
{{- end }}
```

**Service Template** (`templates/service-backend.yaml`):
```yaml
{{- if .Values.backend.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "todo-app.fullname" . }}-backend
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
    app.kubernetes.io/component: backend
spec:
  type: {{ .Values.backend.service.type }}
  ports:
  - port: {{ .Values.backend.service.port }}
    targetPort: http
    protocol: TCP
    name: http
  selector:
    {{- include "todo-app.selectorLabels" . | nindent 4 }}
    app.kubernetes.io/component: backend
{{- end }}
```

**ConfigMap Template** (`templates/configmap.yaml`):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "todo-app.fullname" . }}-config
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
data:
  environment: {{ .Values.global.environment | quote }}
  log_level: {{ .Values.logLevel | default "info" | quote }}
  # Add non-sensitive configuration here
```

**Secret Template** (`templates/secret.yaml`):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "todo-app.fullname" . }}-secrets
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
type: Opaque
data:
  # Base64 encoded secrets (use external secret management in production)
  database-url: {{ .Values.secrets.databaseUrl | b64enc | quote }}
  openai-api-key: {{ .Values.secrets.openaiApiKey | b64enc | quote }}
```

### 6. Generate Environment-Specific Values

**values-dev.yaml** (Local Minikube):
```yaml
global:
  environment: development
  domain: todo-app.local

frontend:
  replicaCount: 1
  resources:
    requests:
      memory: "64Mi"
      cpu: "50m"
    limits:
      memory: "128Mi"
      cpu: "100m"

backend:
  replicaCount: 1
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"

ingress:
  enabled: false

autoscaling:
  enabled: false
```

**values-prod.yaml** (Cloud - DOKS/GKE/AKS):
```yaml
global:
  environment: production
  domain: todo-app.com

frontend:
  replicaCount: 3
  image:
    tag: "v1.0.0"
  resources:
    requests:
      memory: "256Mi"
      cpu: "200m"
    limits:
      memory: "512Mi"
      cpu: "500m"

backend:
  replicaCount: 5
  image:
    tag: "v1.0.0"
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

ingress:
  enabled: true
  hosts:
    - host: todo-app.com
      paths:
        - path: /
          pathType: Prefix
          service: frontend
        - path: /api
          pathType: Prefix
          service: backend

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
```

### 7. Generate Deployment Scripts

**deploy-local.sh** (Minikube):
```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Minikube..."

# Start Minikube if not running
minikube status || minikube start

# Build Docker images in Minikube context
eval $(minikube docker-env)

echo "📦 Building Docker images..."
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# Install/Upgrade Helm chart
echo "⎈ Installing Helm chart..."
helm upgrade --install todo-app ./k8s/helm/todo-app \
  -f ./k8s/helm/todo-app/values-dev.yaml \
  --create-namespace \
  --namespace todo-dev

# Wait for deployments
echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/todo-app-frontend -n todo-dev
kubectl wait --for=condition=available --timeout=300s \
  deployment/todo-app-backend -n todo-dev

# Get service URL
echo "✅ Deployment complete!"
echo "🌐 Access the app at: $(minikube service todo-app-frontend -n todo-dev --url)"
```

**deploy-cloud.sh** (DOKS/GKE/AKS):
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-production}
REGISTRY=${2:-your-registry.com}

echo "🚀 Deploying to Cloud ($ENVIRONMENT)..."

# Build and push Docker images
echo "📦 Building and pushing Docker images..."
docker build -t $REGISTRY/todo-frontend:$VERSION ./frontend
docker build -t $REGISTRY/todo-backend:$VERSION ./backend

docker push $REGISTRY/todo-frontend:$VERSION
docker push $REGISTRY/todo-backend:$VERSION

# Install/Upgrade Helm chart
echo "⎈ Installing Helm chart..."
helm upgrade --install todo-app ./k8s/helm/todo-app \
  -f ./k8s/helm/todo-app/values-${ENVIRONMENT}.yaml \
  --set frontend.image.repository=$REGISTRY/todo-frontend \
  --set frontend.image.tag=$VERSION \
  --set backend.image.repository=$REGISTRY/todo-backend \
  --set backend.image.tag=$VERSION \
  --create-namespace \
  --namespace todo-${ENVIRONMENT}

# Wait for deployments
echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/todo-app-frontend -n todo-${ENVIRONMENT}
kubectl wait --for=condition=available --timeout=300s \
  deployment/todo-app-backend -n todo-${ENVIRONMENT}

echo "✅ Deployment complete!"
kubectl get ingress -n todo-${ENVIRONMENT}
```

### 8. Generate CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-dev:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - uses: actions/checkout@v4

      - name: Install kubectl
        uses: azure/setup-kubectl@v3

      - name: Install Helm
        uses: azure/setup-helm@v3

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=./kubeconfig

      - name: Deploy to Development
        run: |
          helm upgrade --install todo-app ./k8s/helm/todo-app \
            -f ./k8s/helm/todo-app/values-dev.yaml \
            --set frontend.image.tag=${{ github.sha }} \
            --set backend.image.tag=${{ github.sha }} \
            --namespace todo-dev

  deploy-prod:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Install kubectl
        uses: azure/setup-kubectl@v3

      - name: Install Helm
        uses: azure/setup-helm@v3

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBECONFIG_PROD }}" | base64 -d > kubeconfig
          export KUBECONFIG=./kubeconfig

      - name: Deploy to Production
        run: |
          helm upgrade --install todo-app ./k8s/helm/todo-app \
            -f ./k8s/helm/todo-app/values-prod.yaml \
            --set frontend.image.tag=${{ github.sha }} \
            --set backend.image.tag=${{ github.sha }} \
            --namespace todo-prod
```

### 9. Generate kubectl-ai and kagent Integration

**kubectl-ai-commands.md**:
```markdown
# kubectl-ai Commands for Todo App

## Deployment
kubectl-ai "deploy the todo app with 3 replicas for backend"
kubectl-ai "scale the frontend to handle more traffic"
kubectl-ai "update the backend image to version 1.2.0"

## Debugging
kubectl-ai "check why the backend pods are crashing"
kubectl-ai "show me the logs for the frontend service"
kubectl-ai "diagnose network issues between frontend and backend"

## Monitoring
kubectl-ai "show resource usage for all todo app pods"
kubectl-ai "check if any pods are being throttled"
kubectl-ai "analyze the health of the todo-app deployment"

## Scaling
kubectl-ai "enable autoscaling for backend with min 2 max 10 replicas"
kubectl-ai "scale down the frontend during low traffic hours"
```

### 10. Generate Documentation

**k8s/README.md**:
```markdown
# Kubernetes Deployment Guide

## Prerequisites
- Docker Desktop with Kubernetes enabled OR Minikube
- kubectl CLI
- Helm 3.x
- kubectl-ai (optional, for AI-assisted operations)

## Local Deployment (Minikube)

1. Start Minikube:
   ```bash
   minikube start --cpus=4 --memory=8192
   ```

2. Deploy the application:
   ```bash
   ./k8s/scripts/deploy-local.sh
   ```

3. Access the application:
   ```bash
   minikube service todo-app-frontend -n todo-dev
   ```

## Cloud Deployment (DOKS/GKE/AKS)

1. Configure kubectl for your cluster:
   ```bash
   # DigitalOcean
   doctl kubernetes cluster kubeconfig save <cluster-name>

   # Google Cloud
   gcloud container clusters get-credentials <cluster-name>

   # Azure
   az aks get-credentials --resource-group <rg> --name <cluster-name>
   ```

2. Create secrets:
   ```bash
   kubectl create secret generic todo-secrets \
     --from-literal=database-url="postgresql://..." \
     --from-literal=openai-api-key="sk-..." \
     -n todo-prod
   ```

3. Deploy the application:
   ```bash
   VERSION=v1.0.0 ./k8s/scripts/deploy-cloud.sh production
   ```

## Using kubectl-ai

```bash
# Deploy
kubectl-ai "deploy todo app to production with high availability"

# Scale
kubectl-ai "scale backend to 5 replicas"

# Debug
kubectl-ai "why are my pods failing?"

# Monitor
kubectl-ai "show me resource usage"
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n todo-dev
kubectl logs <pod-name> -n todo-dev
```

### Service not accessible
```bash
kubectl get svc -n todo-dev
kubectl get ingress -n todo-dev
```

### Using kagent for analysis
```bash
kagent "analyze cluster health"
kagent "optimize resource allocation for todo-app"
```
```

### 11. Output Summary

Generate a summary report:
```markdown
# Kubernetes Blueprint Generation Complete ✅

## Generated Files

### Docker Configurations
- ✅ frontend/Dockerfile
- ✅ frontend/.dockerignore
- ✅ backend/Dockerfile
- ✅ backend/.dockerignore

### Helm Chart
- ✅ k8s/helm/todo-app/Chart.yaml
- ✅ k8s/helm/todo-app/values.yaml
- ✅ k8s/helm/todo-app/values-dev.yaml
- ✅ k8s/helm/todo-app/values-staging.yaml
- ✅ k8s/helm/todo-app/values-prod.yaml
- ✅ k8s/helm/todo-app/templates/ (8 manifests)

### Deployment Scripts
- ✅ k8s/scripts/deploy-local.sh
- ✅ k8s/scripts/deploy-cloud.sh

### CI/CD
- ✅ .github/workflows/deploy.yml

### Documentation
- ✅ k8s/README.md
- ✅ k8s/kubectl-ai-commands.md

## Next Steps

1. **Test Locally**:
   ```bash
   ./k8s/scripts/deploy-local.sh
   ```

2. **Verify Deployment**:
   ```bash
   kubectl get all -n todo-dev
   ```

3. **Use kubectl-ai**:
   ```bash
   kubectl-ai "show me the status of todo app"
   ```

4. **Deploy to Cloud** (when ready):
   ```bash
   VERSION=v1.0.0 ./k8s/scripts/deploy-cloud.sh production
   ```

## Bonus Points Earned 🎉
✅ **+200 points** for Cloud-Native Blueprints via Agent Skills
```

## Key Rules

- **Multi-stage Dockerfiles**: Optimize image size and build time
- **Resource Limits**: Always set requests and limits
- **Health Checks**: Include liveness and readiness probes
- **Secrets Management**: Never commit secrets, use Kubernetes Secrets or external secret managers
- **Environment Separation**: Separate configs for dev/staging/prod
- **Helm Best Practices**: Use templates and values for flexibility
- **CI/CD Integration**: Automate builds and deployments
- **Documentation**: Comprehensive guides for deployment and troubleshooting

## Validation Checklist

Before completing, verify:
- [ ] Dockerfiles are multi-stage and optimized
- [ ] Helm chart follows best practices
- [ ] All services have proper resource limits
- [ ] Health checks are configured
- [ ] Secrets are properly managed
- [ ] Environment-specific values are created
- [ ] Deployment scripts are executable and tested
- [ ] CI/CD pipeline is configured
- [ ] Documentation is complete
- [ ] kubectl-ai integration examples provided

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: plan (for K8s blueprint design)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route: `history/prompts/<feature-name>/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage plan [--feature <name>] --json`
   - Fill all placeholders with complete information

4) Validate + report
   - Verify no unresolved placeholders
   - Print ID + path + stage + title
