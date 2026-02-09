# Phase V: Advanced Cloud Deployment

## Overview
Advanced cloud deployment with Kafka event streaming, Dapr runtime, and production Kubernetes.

## Technology Stack
- **Event Streaming**: Kafka on Redpanda Cloud (Free tier)
- **Distributed Runtime**: Dapr (Pub/Sub, State, Bindings, Secrets, Service Invocation)
- **Cloud Platform**: Oracle Cloud (Always Free) / DigitalOcean DOKS / GKE / AKS
- **CI/CD**: GitHub Actions

## Features to Implement
- [ ] Recurring Tasks (auto-reschedule)
- [ ] Search & Filter
- [ ] Sort by date/priority
- [ ] Kafka event streaming
- [ ] Dapr integration
- [ ] Cloud deployment
- [ ] CI/CD pipeline

## Project Structure
```
phase-5-cloud-deployment/
├── kafka/                 # Kafka configuration
│   └── topics.yaml        # Topic definitions
├── dapr/
│   └── components/        # Dapr component configs
│       ├── pubsub.yaml    # Kafka pub/sub
│       ├── statestore.yaml
│       ├── secrets.yaml
│       └── cron-binding.yaml
├── k8s/
│   └── cloud/             # Cloud-specific K8s configs
├── scripts/               # Deployment scripts
├── specs/                 # Feature specifications
└── .github/
    └── workflows/         # CI/CD pipelines
```

## Quick Start

### 1. Setup Redpanda Cloud (Kafka)
```bash
# Sign up at https://redpanda.com/cloud
# Create serverless cluster
# Create topics: task-events, reminders, task-updates
```

### 2. Install Dapr
```bash
# Install Dapr CLI
curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | bash

# Initialize on Kubernetes
dapr init -k

# Apply components
kubectl apply -f dapr/components/
```

### 3. Deploy to Cloud
```bash
# Configure kubectl for cloud cluster
# Deploy using Helm charts from Phase 4
helm install backend ../phase-4-kubernetes/k8s/charts/backend
helm install frontend ../phase-4-kubernetes/k8s/charts/frontend
```

## Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| task-events | Chat API | Recurring Task Service, Audit | All CRUD operations |
| reminders | Chat API | Notification Service | Scheduled reminders |
| task-updates | Chat API | WebSocket Service | Real-time sync |

## Dapr Components

| Component | Type | Purpose |
|-----------|------|---------|
| kafka-pubsub | pubsub.kafka | Event streaming |
| statestore | state.postgresql | Conversation state |
| reminder-cron | bindings.cron | Trigger reminder checks |
| kubernetes-secrets | secretstores.kubernetes | Secure credentials |
