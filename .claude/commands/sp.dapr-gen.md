---
description: Generate Dapr component configurations and integration code for distributed application runtime features (Pub/Sub, State, Bindings, Secrets, Service Invocation)
handoffs:
  - label: Deploy Dapr Components
    agent: general-purpose
    prompt: Deploy the generated Dapr components to Kubernetes
    send: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill automates Dapr (Distributed Application Runtime) integration for your cloud-native application. It generates:
- **Dapr Component YAML files**: Pub/Sub, State Management, Bindings, Secrets
- **Application Integration Code**: Python/JavaScript code to use Dapr sidecars
- **Kubernetes Manifests**: Dapr-enabled deployments with annotations
- **Configuration Files**: Environment-specific Dapr configs

Dapr simplifies microservices by providing building blocks via HTTP/gRPC APIs, eliminating direct dependencies on infrastructure services.

## Outline

### 1. Setup and Context Loading

- Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec --include-plan` from repo root
- Parse FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN paths
- Read plan.md to understand:
  - Services architecture (frontend, backend, workers)
  - External dependencies (Kafka, Redis, PostgreSQL)
  - Event-driven patterns (pub/sub topics)
  - State management needs (conversation history, cache)
  - Scheduled tasks (reminders, recurring tasks)
  - Secrets required (API keys, DB credentials)
- Read data-model.md to understand data persistence patterns

### 2. Analyze Dapr Requirements

Extract from plan.md and requirements:

**Pub/Sub Requirements**:
- Kafka topics: `task-events`, `reminders`, `task-updates`
- Publishers: Backend API (task operations)
- Subscribers: Notification service, Recurring task service, Audit service

**State Management Requirements**:
- Conversation state (chat history)
- Task cache (frequently accessed tasks)
- User sessions

**Bindings Requirements**:
- Cron triggers for reminder checks (every 5 minutes)
- Scheduled cleanup jobs
- Recurring task generation

**Secrets Requirements**:
- Database connection string
- OpenAI API key
- Kafka credentials
- JWT signing secret

**Service Invocation Requirements**:
- Frontend → Backend API calls
- Backend → Notification service calls

### 3. Generate Dapr Component Directory Structure

Create `dapr/components/` directory:

```
dapr/
├── components/
│   ├── pubsub-kafka.yaml           # Kafka pub/sub
│   ├── statestore-postgresql.yaml  # PostgreSQL state store
│   ├── binding-reminder-cron.yaml  # Cron binding for reminders
│   ├── secretstore-kubernetes.yaml # Kubernetes secrets
│   └── README.md
├── subscriptions/
│   ├── task-events-subscription.yaml
│   ├── reminders-subscription.yaml
│   └── task-updates-subscription.yaml
└── config/
    ├── dapr-config-dev.yaml
    └── dapr-config-prod.yaml
```

### 4. Generate Pub/Sub Component (Kafka)

**dapr/components/pubsub-kafka.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
  namespace: todo-prod
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    # Kafka brokers (Redpanda Cloud or self-hosted)
    - name: brokers
      value: "your-cluster.cloud.redpanda.com:9092"

    # Consumer group for this service
    - name: consumerGroup
      value: "todo-service-group"

    # Authentication (SASL)
    - name: authType
      value: "sasl"
    - name: saslMechanism
      value: "SCRAM-SHA-256"
    - name: saslUsername
      secretKeyRef:
        name: kafka-credentials
        key: username
    - name: saslPassword
      secretKeyRef:
        name: kafka-credentials
        key: password

    # TLS configuration
    - name: enableTLS
      value: "true"

    # Consumer configuration
    - name: consumeRetryInterval
      value: "200ms"
    - name: maxMessageBytes
      value: "1024000"

scopes:
  - backend-api
  - notification-service
  - recurring-task-service
```

**For Local Development** (dapr/components/pubsub-kafka-local.yaml):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "localhost:9092"
    - name: consumerGroup
      value: "todo-service-group"
    - name: authRequired
      value: "false"
```

### 5. Generate State Store Component (PostgreSQL)

**dapr/components/statestore-postgresql.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-prod
spec:
  type: state.postgresql
  version: v1
  metadata:
    # Connection string from Kubernetes secret
    - name: connectionString
      secretKeyRef:
        name: todo-secrets
        key: database-url

    # Table name for state storage
    - name: tableName
      value: "dapr_state"

    # Metadata table
    - name: metadataTableName
      value: "dapr_metadata"

    # Timeout settings
    - name: timeout
      value: "20s"

    # Connection pool
    - name: maxConns
      value: "10"
    - name: connectionMaxIdleTime
      value: "5m"

scopes:
  - backend-api
```

### 6. Generate Cron Binding (Scheduled Reminders)

**dapr/components/binding-reminder-cron.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-cron
  namespace: todo-prod
spec:
  type: bindings.cron
  version: v1
  metadata:
    # Run every 5 minutes
    - name: schedule
      value: "*/5 * * * *"

    # Optional: direction (input only)
    - name: direction
      value: "input"

scopes:
  - notification-service
```

**Additional Cron Bindings**:

**binding-cleanup-cron.yaml** (Daily cleanup):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cleanup-cron
  namespace: todo-prod
spec:
  type: bindings.cron
  version: v1
  metadata:
    # Run daily at 2 AM
    - name: schedule
      value: "0 2 * * *"
scopes:
  - backend-api
```

### 7. Generate Secrets Store Component

**dapr/components/secretstore-kubernetes.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
  namespace: todo-prod
spec:
  type: secretstores.kubernetes
  version: v1
  metadata: []
scopes:
  - backend-api
  - notification-service
```

### 8. Generate Pub/Sub Subscriptions

**dapr/subscriptions/task-events-subscription.yaml**:
```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-events-subscription
  namespace: todo-prod
spec:
  pubsubname: kafka-pubsub
  topic: task-events
  routes:
    default: /dapr/subscribe/task-events
  scopes:
    - recurring-task-service
    - audit-service
```

**dapr/subscriptions/reminders-subscription.yaml**:
```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: reminders-subscription
  namespace: todo-prod
spec:
  pubsubname: kafka-pubsub
  topic: reminders
  routes:
    default: /dapr/subscribe/reminders
  scopes:
    - notification-service
```

### 9. Generate Dapr Configuration

**dapr/config/dapr-config-prod.yaml**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: dapr-config
  namespace: todo-prod
spec:
  # Tracing configuration
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin:9411/api/v2/spans"

  # Metrics configuration
  metrics:
    enabled: true

  # mTLS configuration
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"

  # Access control
  accessControl:
    defaultAction: deny
    trustDomain: "public"
    policies:
      - appId: backend-api
        defaultAction: allow
        trustDomain: "public"
        namespace: "todo-prod"
      - appId: notification-service
        defaultAction: allow
        trustDomain: "public"
        namespace: "todo-prod"
```

### 10. Generate Application Integration Code

**Backend (Python/FastAPI) Integration**:

**backend/dapr_client.py**:
```python
"""Dapr client wrapper for simplified Dapr operations"""
import httpx
import json
from typing import Any, Dict, List, Optional

class DaprClient:
    """Client for interacting with Dapr sidecar"""

    def __init__(self, dapr_port: int = 3500):
        self.base_url = f"http://localhost:{dapr_port}"
        self.client = httpx.AsyncClient(timeout=30.0)

    # Pub/Sub Methods
    async def publish_event(
        self,
        pubsub_name: str,
        topic: str,
        data: Dict[str, Any]
    ) -> None:
        """Publish an event to a topic"""
        url = f"{self.base_url}/v1.0/publish/{pubsub_name}/{topic}"
        response = await self.client.post(url, json=data)
        response.raise_for_status()

    async def subscribe_handler(self, topic: str, handler_func):
        """Decorator for subscription handlers"""
        # This is handled by FastAPI routes
        pass

    # State Management Methods
    async def save_state(
        self,
        store_name: str,
        key: str,
        value: Any,
        metadata: Optional[Dict[str, str]] = None
    ) -> None:
        """Save state to Dapr state store"""
        url = f"{self.base_url}/v1.0/state/{store_name}"
        state_data = [{
            "key": key,
            "value": value,
            "metadata": metadata or {}
        }]
        response = await self.client.post(url, json=state_data)
        response.raise_for_status()

    async def get_state(
        self,
        store_name: str,
        key: str
    ) -> Optional[Any]:
        """Get state from Dapr state store"""
        url = f"{self.base_url}/v1.0/state/{store_name}/{key}"
        response = await self.client.get(url)
        if response.status_code == 204:
            return None
        response.raise_for_status()
        return response.json()

    async def delete_state(
        self,
        store_name: str,
        key: str
    ) -> None:
        """Delete state from Dapr state store"""
        url = f"{self.base_url}/v1.0/state/{store_name}/{key}"
        response = await self.client.delete(url)
        response.raise_for_status()

    # Service Invocation Methods
    async def invoke_service(
        self,
        app_id: str,
        method_name: str,
        data: Optional[Dict[str, Any]] = None,
        http_verb: str = "POST"
    ) -> Any:
        """Invoke another service via Dapr"""
        url = f"{self.base_url}/v1.0/invoke/{app_id}/method/{method_name}"

        if http_verb.upper() == "GET":
            response = await self.client.get(url)
        elif http_verb.upper() == "POST":
            response = await self.client.post(url, json=data)
        elif http_verb.upper() == "PUT":
            response = await self.client.put(url, json=data)
        elif http_verb.upper() == "DELETE":
            response = await self.client.delete(url)
        else:
            raise ValueError(f"Unsupported HTTP verb: {http_verb}")

        response.raise_for_status()
        return response.json() if response.content else None

    # Secrets Methods
    async def get_secret(
        self,
        store_name: str,
        secret_name: str
    ) -> Dict[str, str]:
        """Get secret from Dapr secret store"""
        url = f"{self.base_url}/v1.0/secrets/{store_name}/{secret_name}"
        response = await self.client.get(url)
        response.raise_for_status()
        return response.json()

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Global Dapr client instance
dapr = DaprClient()
```

**backend/routes/dapr_routes.py** (Subscription handlers):
```python
"""Dapr subscription endpoints"""
from fastapi import APIRouter, Request
from backend.dapr_client import dapr
import logging

router = APIRouter(prefix="/dapr", tags=["dapr"])
logger = logging.getLogger(__name__)

@router.post("/subscribe/task-events")
async def handle_task_events(request: Request):
    """Handle task events from Kafka via Dapr"""
    event = await request.json()
    logger.info(f"Received task event: {event}")

    # Process the event (e.g., create recurring task, log audit)
    event_type = event.get("event_type")
    task_data = event.get("task_data")

    if event_type == "completed" and task_data.get("is_recurring"):
        # Create next occurrence of recurring task
        await create_next_recurring_task(task_data)

    return {"status": "SUCCESS"}

@router.post("/subscribe/reminders")
async def handle_reminders(request: Request):
    """Handle reminder events from Kafka via Dapr"""
    event = await request.json()
    logger.info(f"Received reminder event: {event}")

    # Send notification
    await send_notification(event)

    return {"status": "SUCCESS"}

@router.post("/reminder-cron")
async def handle_reminder_cron():
    """Handle cron trigger for checking reminders"""
    logger.info("Reminder cron triggered")

    # Check for due reminders and publish to Kafka
    due_reminders = await get_due_reminders()

    for reminder in due_reminders:
        await dapr.publish_event(
            pubsub_name="kafka-pubsub",
            topic="reminders",
            data=reminder
        )

    return {"status": "SUCCESS", "reminders_sent": len(due_reminders)}
```

**Example Usage in Backend**:
```python
from backend.dapr_client import dapr

# Publish event when task is created
@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    # Create task in database
    new_task = await db.create_task(task)

    # Publish event via Dapr (instead of direct Kafka)
    await dapr.publish_event(
        pubsub_name="kafka-pubsub",
        topic="task-events",
        data={
            "event_type": "created",
            "task_id": new_task.id,
            "task_data": new_task.dict(),
            "user_id": current_user.id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

    return new_task

# Save conversation state
@app.post("/api/chat")
async def chat(message: ChatMessage):
    # Save conversation to Dapr state store
    await dapr.save_state(
        store_name="statestore",
        key=f"conversation-{message.conversation_id}",
        value={"messages": conversation_history}
    )

    # Get AI response
    response = await get_ai_response(message)

    return response

# Get secret
async def get_openai_key():
    secret = await dapr.get_secret(
        store_name="kubernetes-secrets",
        secret_name="openai-api-key"
    )
    return secret["openai-api-key"]
```

### 11. Update Kubernetes Deployments with Dapr Annotations

**k8s/helm/todo-app/templates/deployment-backend.yaml** (add annotations):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-backend
spec:
  template:
    metadata:
      annotations:
        # Enable Dapr sidecar
        dapr.io/enabled: "true"
        # App ID for service invocation
        dapr.io/app-id: "backend-api"
        # Port your app is listening on
        dapr.io/app-port: "8000"
        # Dapr sidecar port (default 3500)
        dapr.io/sidecar-http-port: "3500"
        # Enable metrics
        dapr.io/enable-metrics: "true"
        # Log level
        dapr.io/log-level: "info"
        # Configuration
        dapr.io/config: "dapr-config"
    spec:
      containers:
      - name: backend
        # ... rest of container spec
```

### 12. Generate Installation Scripts

**dapr/install-dapr.sh**:
```bash
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Installing Dapr on Kubernetes..."

# Install Dapr CLI if not present
if ! command -v dapr &> /dev/null; then
    echo "📦 Installing Dapr CLI..."
    curl -fsSL https://raw.githubusercontent.com/dapr/cli/master/install/install.sh | bash
fi

# Initialize Dapr on Kubernetes
echo "⎈ Initializing Dapr on Kubernetes..."
dapr init -k --wait

# Verify installation
echo "✅ Verifying Dapr installation..."
dapr status -k

# Apply Dapr components
echo "📋 Applying Dapr components..."
kubectl apply -f dapr/components/ -n todo-${ENVIRONMENT}

# Apply Dapr subscriptions
echo "📬 Applying Dapr subscriptions..."
kubectl apply -f dapr/subscriptions/ -n todo-${ENVIRONMENT}

# Apply Dapr configuration
echo "⚙️  Applying Dapr configuration..."
kubectl apply -f dapr/config/dapr-config-${ENVIRONMENT}.yaml

echo "✅ Dapr installation complete!"
echo "🔍 Check Dapr components:"
echo "   kubectl get components -n todo-${ENVIRONMENT}"
```

### 13. Generate Documentation

**dapr/README.md**:
```markdown
# Dapr Integration Guide

## Overview

This application uses Dapr (Distributed Application Runtime) to simplify microservices development by providing:
- **Pub/Sub**: Event-driven communication via Kafka
- **State Management**: Conversation and cache storage
- **Service Invocation**: Service-to-service calls with retries
- **Bindings**: Scheduled tasks via cron
- **Secrets Management**: Secure access to credentials

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Backend Pod       │     │  Notification Pod   │
│ ┌───────┬─────────┐ │     │ ┌───────┬─────────┐ │
│ │ App   │  Dapr   │ │     │ │ App   │  Dapr   │ │
│ │       │ Sidecar │ │     │ │       │ Sidecar │ │
│ └───────┴─────────┘ │     │ └───────┴─────────┘ │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └───────────┬───────────────┘
                       │
          ┌────────────▼────────────┐
          │   DAPR COMPONENTS       │
          │  ┌──────────────────┐   │
          │  │ pubsub.kafka     │───┼──▶ Kafka
          │  ├──────────────────┤   │
          │  │ state.postgresql │───┼──▶ Neon DB
          │  ├──────────────────┤   │
          │  │ bindings.cron    │   │
          │  ├──────────────────┤   │
          │  │ secretstores.k8s │   │
          │  └──────────────────┘   │
          └─────────────────────────┘
```

## Installation

### Prerequisites
- Kubernetes cluster (Minikube or cloud)
- kubectl configured
- Dapr CLI

### Install Dapr

```bash
# Local (Minikube)
./dapr/install-dapr.sh dev

# Production (Cloud)
./dapr/install-dapr.sh prod
```

## Components

### 1. Pub/Sub (Kafka)
- **Component**: `kafka-pubsub`
- **Topics**: `task-events`, `reminders`, `task-updates`
- **Usage**: Publish events when tasks are created/updated/deleted

### 2. State Store (PostgreSQL)
- **Component**: `statestore`
- **Usage**: Store conversation history, cache frequently accessed data

### 3. Cron Bindings
- **Component**: `reminder-cron` (every 5 minutes)
- **Usage**: Check for due reminders and send notifications

### 4. Secrets Store (Kubernetes)
- **Component**: `kubernetes-secrets`
- **Usage**: Access database credentials, API keys securely

## Usage Examples

### Publish Event
```python
from backend.dapr_client import dapr

await dapr.publish_event(
    pubsub_name="kafka-pubsub",
    topic="task-events",
    data={"event_type": "created", "task_id": 1}
)
```

### Save State
```python
await dapr.save_state(
    store_name="statestore",
    key="conversation-123",
    value={"messages": [...]}
)
```

### Get Secret
```python
secret = await dapr.get_secret(
    store_name="kubernetes-secrets",
    secret_name="openai-api-key"
)
```

### Invoke Service
```python
result = await dapr.invoke_service(
    app_id="notification-service",
    method_name="send-notification",
    data={"user_id": "123", "message": "Task due!"}
)
```

## Troubleshooting

### Check Dapr Status
```bash
dapr status -k
```

### View Dapr Components
```bash
kubectl get components -n todo-prod
```

### Check Dapr Sidecar Logs
```bash
kubectl logs <pod-name> -c daprd -n todo-prod
```

### Test Pub/Sub
```bash
# Publish test event
curl -X POST http://localhost:3500/v1.0/publish/kafka-pubsub/task-events \
  -H "Content-Type: application/json" \
  -d '{"test": "event"}'
```
```

### 14. Output Summary

Generate completion report:
```markdown
# Dapr Component Generation Complete ✅

## Generated Files

### Dapr Components
- ✅ dapr/components/pubsub-kafka.yaml
- ✅ dapr/components/pubsub-kafka-local.yaml
- ✅ dapr/components/statestore-postgresql.yaml
- ✅ dapr/components/binding-reminder-cron.yaml
- ✅ dapr/components/binding-cleanup-cron.yaml
- ✅ dapr/components/secretstore-kubernetes.yaml

### Subscriptions
- ✅ dapr/subscriptions/task-events-subscription.yaml
- ✅ dapr/subscriptions/reminders-subscription.yaml
- ✅ dapr/subscriptions/task-updates-subscription.yaml

### Configuration
- ✅ dapr/config/dapr-config-dev.yaml
- ✅ dapr/config/dapr-config-prod.yaml

### Application Code
- ✅ backend/dapr_client.py
- ✅ backend/routes/dapr_routes.py

### Scripts
- ✅ dapr/install-dapr.sh

### Documentation
- ✅ dapr/README.md

## Next Steps

1. **Install Dapr on Kubernetes**:
   ```bash
   ./dapr/install-dapr.sh dev
   ```

2. **Update Kubernetes Deployments**:
   - Add Dapr annotations to deployment manifests
   - Redeploy services

3. **Test Dapr Integration**:
   ```bash
   # Check components
   kubectl get components -n todo-dev

   # Check Dapr status
   dapr status -k
   ```

4. **Update Application Code**:
   - Replace direct Kafka calls with `dapr.publish_event()`
   - Replace direct DB state calls with `dapr.save_state()`
   - Use `dapr.get_secret()` for credentials

## Benefits

✅ **Simplified Code**: No need for Kafka, Redis, or DB client libraries
✅ **Portable**: Swap Kafka for RabbitMQ by changing YAML config
✅ **Resilient**: Built-in retries, circuit breakers
✅ **Secure**: mTLS between services, secret management
✅ **Observable**: Distributed tracing, metrics out of the box
```

## Key Rules

- **Sidecar Pattern**: Dapr runs as a sidecar container next to your app
- **HTTP/gRPC API**: All Dapr features accessible via simple HTTP calls
- **Component Abstraction**: Change infrastructure without changing code
- **Scopes**: Limit component access to specific services
- **Subscriptions**: Declarative pub/sub subscriptions via YAML
- **State Consistency**: Support for strong/eventual consistency
- **Secrets Security**: Never hardcode secrets, use Dapr secret stores

## Validation Checklist

Before completing, verify:
- [ ] All required Dapr components are generated
- [ ] Pub/Sub topics match event architecture
- [ ] State store is configured for conversation persistence
- [ ] Cron bindings are set for scheduled tasks
- [ ] Secrets store is configured for credentials
- [ ] Application integration code is complete
- [ ] Kubernetes deployments have Dapr annotations
- [ ] Installation scripts are executable
- [ ] Documentation is comprehensive
- [ ] Local and production configs are separated

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: plan (for Dapr component design)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route: `history/prompts/<feature-name>/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage plan [--feature <name>] --json`
   - Fill all placeholders

4) Validate + report
   - Verify no unresolved placeholders
   - Print ID + path + stage + title
