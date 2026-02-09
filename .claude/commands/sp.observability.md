---
description: Generate comprehensive observability stack including monitoring (Prometheus), logging (Loki), tracing (Jaeger), dashboards (Grafana), and alerting for production-ready applications
handoffs:
  - label: Deploy Observability Stack
    agent: general-purpose
    prompt: Deploy the generated observability stack to Kubernetes
    send: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill automates observability setup for your cloud-native application. It generates:
- **Metrics**: Prometheus instrumentation and exporters
- **Logging**: Structured logging with Loki/ELK
- **Tracing**: Distributed tracing with Jaeger/Zipkin
- **Dashboards**: Grafana dashboards for visualization
- **Alerting**: Alert rules and notification channels
- **Health Checks**: Liveness and readiness probes

Production-grade observability ensures you can monitor, debug, and optimize your application in real-time.

## Outline

### 1. Setup and Context Loading

- Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec --include-plan` from repo root
- Parse FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN paths
- Read plan.md to understand:
  - Services architecture (frontend, backend, workers)
  - Tech stack (Python/FastAPI, Next.js)
  - Deployment environment (Kubernetes)
  - Critical metrics to track (latency, throughput, errors)
- Identify observability requirements for each service

### 2. Analyze Observability Requirements

**Metrics to Track**:
- **Application Metrics**: Request rate, latency, error rate (RED metrics)
- **Business Metrics**: Tasks created, completed, users active
- **System Metrics**: CPU, memory, disk, network
- **Database Metrics**: Query latency, connection pool
- **Kafka Metrics**: Message rate, lag, consumer offset

**Logging Requirements**:
- **Structured Logs**: JSON format with context
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Correlation IDs**: Track requests across services
- **Log Aggregation**: Centralized log storage

**Tracing Requirements**:
- **Distributed Tracing**: Track requests across microservices
- **Span Context**: Service-to-service calls
- **Performance Profiling**: Identify bottlenecks

**Alerting Requirements**:
- **Error Rate**: Alert when error rate > 5%
- **Latency**: Alert when p95 latency > 500ms
- **Availability**: Alert when service is down
- **Resource Usage**: Alert when CPU/memory > 80%

### 3. Generate Observability Directory Structure

```
observability/
├── prometheus/
│   ├── prometheus.yml           # Prometheus configuration
│   ├── alerts.yml               # Alert rules
│   └── recording-rules.yml      # Recording rules
├── grafana/
│   ├── dashboards/
│   │   ├── application-overview.json
│   │   ├── backend-metrics.json
│   │   ├── frontend-metrics.json
│   │   └── kafka-metrics.json
│   └── datasources.yml          # Data source configuration
├── loki/
│   └── loki-config.yml          # Loki configuration
├── jaeger/
│   └── jaeger-config.yml        # Jaeger configuration
├── k8s/
│   ├── prometheus-deployment.yaml
│   ├── grafana-deployment.yaml
│   ├── loki-deployment.yaml
│   └── jaeger-deployment.yaml
└── README.md
```

### 4. Generate Prometheus Configuration

**observability/prometheus/prometheus.yml**:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'todo-app'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Load alert rules
rule_files:
  - 'alerts.yml'
  - 'recording-rules.yml'

# Scrape configurations
scrape_configs:
  # Backend API metrics
  - job_name: 'backend-api'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - todo-prod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: backend-api
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace

  # Frontend metrics
  - job_name: 'frontend'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - todo-prod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: frontend

  # Kafka metrics (if using Kafka Exporter)
  - job_name: 'kafka'
    static_configs:
      - targets:
          - kafka-exporter:9308

  # PostgreSQL metrics (if using Postgres Exporter)
  - job_name: 'postgresql'
    static_configs:
      - targets:
          - postgres-exporter:9187

  # Kubernetes cluster metrics
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)
```

**observability/prometheus/alerts.yml**:
```yaml
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service)
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s for {{ $labels.service }}"

      # Service down
      - alert: ServiceDown
        expr: up{job=~"backend-api|frontend"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 2 minutes"

      # High CPU usage
      - alert: HighCPUUsage
        expr: |
          (
            sum(rate(container_cpu_usage_seconds_total[5m])) by (pod)
            /
            sum(container_spec_cpu_quota/container_spec_cpu_period) by (pod)
          ) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.pod }}"
          description: "CPU usage is {{ $value | humanizePercentage }}"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (
            sum(container_memory_working_set_bytes) by (pod)
            /
            sum(container_spec_memory_limit_bytes) by (pod)
          ) > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.pod }}"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Kafka consumer lag
      - alert: KafkaConsumerLag
        expr: kafka_consumergroup_lag > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Kafka consumer lag"
          description: "Consumer group {{ $labels.consumergroup }} has lag of {{ $value }}"
```

### 5. Generate Application Instrumentation

**backend/observability/metrics.py**:
```python
"""Prometheus metrics for backend application"""
from prometheus_client import Counter, Histogram, Gauge, Info
import time
from functools import wraps

# Application info
app_info = Info('todo_app', 'Todo application information')
app_info.info({
    'version': '1.0.0',
    'environment': 'production'
})

# HTTP metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Business metrics
tasks_created_total = Counter(
    'tasks_created_total',
    'Total tasks created',
    ['user_id']
)

tasks_completed_total = Counter(
    'tasks_completed_total',
    'Total tasks completed',
    ['user_id']
)

active_users = Gauge(
    'active_users',
    'Number of active users'
)

# Database metrics
db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration',
    ['query_type'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
)

db_connections_active = Gauge(
    'db_connections_active',
    'Active database connections'
)

# Kafka metrics
kafka_messages_published_total = Counter(
    'kafka_messages_published_total',
    'Total Kafka messages published',
    ['topic']
)

kafka_messages_consumed_total = Counter(
    'kafka_messages_consumed_total',
    'Total Kafka messages consumed',
    ['topic', 'consumer_group']
)

# Decorator for tracking HTTP requests
def track_request(endpoint: str):
    """Decorator to track HTTP request metrics"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = 200

            try:
                result = await func(*args, **kwargs)
                return result
            except Exception as e:
                status = 500
                raise
            finally:
                duration = time.time() - start_time
                method = kwargs.get('request', {}).method if 'request' in kwargs else 'GET'

                http_requests_total.labels(
                    method=method,
                    endpoint=endpoint,
                    status=status
                ).inc()

                http_request_duration_seconds.labels(
                    method=method,
                    endpoint=endpoint
                ).observe(duration)

        return wrapper
    return decorator
```

**backend/main.py** (add metrics endpoint):
```python
from fastapi import FastAPI
from prometheus_client import make_asgi_app
from observability.metrics import http_requests_total, track_request

app = FastAPI()

# Mount Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Health check endpoints
@app.get("/health")
async def health_check():
    """Liveness probe"""
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    """Readiness probe - check dependencies"""
    # Check database connection
    try:
        await db.execute("SELECT 1")
        db_healthy = True
    except:
        db_healthy = False

    # Check Kafka connection
    kafka_healthy = True  # Implement actual check

    if db_healthy and kafka_healthy:
        return {"status": "ready"}
    else:
        return {"status": "not ready", "db": db_healthy, "kafka": kafka_healthy}, 503

# Example instrumented endpoint
@app.post("/api/tasks")
@track_request("/api/tasks")
async def create_task(task: TaskCreate):
    # ... implementation
    tasks_created_total.labels(user_id=current_user.id).inc()
    return new_task
```

### 6. Generate Structured Logging

**backend/observability/logging_config.py**:
```python
"""Structured logging configuration"""
import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """Format logs as JSON"""

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Add extra fields
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'correlation_id'):
            log_data['correlation_id'] = record.correlation_id

        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_data)

def setup_logging(level: str = "INFO"):
    """Setup structured logging"""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(level)

    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

# Usage in application
logger = logging.getLogger(__name__)

# Log with context
logger.info(
    "Task created",
    extra={
        'user_id': user.id,
        'task_id': task.id,
        'request_id': request_id
    }
)
```

### 7. Generate Distributed Tracing

**backend/observability/tracing.py**:
```python
"""Distributed tracing with OpenTelemetry"""
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

def setup_tracing(app, service_name: str = "backend-api"):
    """Setup distributed tracing"""

    # Create tracer provider
    resource = Resource.create({"service.name": service_name})
    tracer_provider = TracerProvider(resource=resource)

    # Configure Jaeger exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger-agent",
        agent_port=6831,
    )

    # Add span processor
    tracer_provider.add_span_processor(
        BatchSpanProcessor(jaeger_exporter)
    )

    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)

    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)

    # Instrument SQLAlchemy
    SQLAlchemyInstrumentor().instrument()

    return trace.get_tracer(__name__)

# Usage in application
tracer = setup_tracing(app)

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    with tracer.start_as_current_span("create_task") as span:
        span.set_attribute("user.id", current_user.id)
        span.set_attribute("task.title", task.title)

        # ... implementation

        span.add_event("task_created", {"task_id": new_task.id})
        return new_task
```

### 8. Generate Grafana Dashboards

**observability/grafana/dashboards/application-overview.json**:
```json
{
  "dashboard": {
    "title": "Todo App - Application Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
            "legendFormat": "Error Rate"
          }
        ],
        "type": "graph"
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))",
            "legendFormat": "{{service}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "active_users",
            "legendFormat": "Active Users"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Tasks Created (24h)",
        "targets": [
          {
            "expr": "sum(increase(tasks_created_total[24h]))",
            "legendFormat": "Tasks Created"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
```

### 9. Generate Kubernetes Deployments

**observability/k8s/prometheus-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        args:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus'
          - '--storage.tsdb.retention.time=30d'
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
---
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: observability
spec:
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090
```

**observability/k8s/grafana-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:latest
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-secrets
              key: admin-password
        volumeMounts:
        - name: storage
          mountPath: /var/lib/grafana
        - name: dashboards
          mountPath: /etc/grafana/provisioning/dashboards
        - name: datasources
          mountPath: /etc/grafana/provisioning/datasources
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: grafana-storage
      - name: dashboards
        configMap:
          name: grafana-dashboards
      - name: datasources
        configMap:
          name: grafana-datasources
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: observability
spec:
  selector:
    app: grafana
  ports:
  - port: 3000
    targetPort: 3000
  type: LoadBalancer
```

### 10. Generate Installation Scripts

**observability/install-observability.sh**:
```bash
#!/bin/bash
set -e

NAMESPACE=${1:-observability}

echo "🚀 Installing Observability Stack..."

# Create namespace
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Install Prometheus
echo "📊 Installing Prometheus..."
kubectl apply -f observability/k8s/prometheus-deployment.yaml -n $NAMESPACE

# Install Grafana
echo "📈 Installing Grafana..."
kubectl apply -f observability/k8s/grafana-deployment.yaml -n $NAMESPACE

# Install Loki (optional)
echo "📝 Installing Loki..."
kubectl apply -f observability/k8s/loki-deployment.yaml -n $NAMESPACE

# Install Jaeger (optional)
echo "🔍 Installing Jaeger..."
kubectl apply -f observability/k8s/jaeger-deployment.yaml -n $NAMESPACE

# Wait for deployments
echo "⏳ Waiting for deployments..."
kubectl wait --for=condition=available --timeout=300s \
  deployment/prometheus -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s \
  deployment/grafana -n $NAMESPACE

echo "✅ Observability stack installed!"
echo ""
echo "Access Grafana:"
echo "  kubectl port-forward -n $NAMESPACE svc/grafana 3000:3000"
echo "  Open: http://localhost:3000"
echo ""
echo "Access Prometheus:"
echo "  kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090"
echo "  Open: http://localhost:9090"
```

### 11. Generate Documentation

**observability/README.md**:
```markdown
# Observability Stack

## Overview

Complete observability solution with:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing

## Architecture

```
Application → Prometheus → Grafana
           → Loki       ↗
           → Jaeger    ↗
```

## Installation

### Local (Minikube)

```bash
./observability/install-observability.sh observability
```

### Cloud (Production)

```bash
# Using Helm (recommended)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability --create-namespace

helm install loki grafana/loki-stack \
  --namespace observability
```

## Accessing Dashboards

### Grafana

```bash
kubectl port-forward -n observability svc/grafana 3000:3000
```

Open: http://localhost:3000
- Username: admin
- Password: (from secret)

### Prometheus

```bash
kubectl port-forward -n observability svc/prometheus 9090:9090
```

Open: http://localhost:9090

### Jaeger

```bash
kubectl port-forward -n observability svc/jaeger-query 16686:16686
```

Open: http://localhost:16686

## Key Metrics

### RED Metrics (Requests, Errors, Duration)
- Request rate: `rate(http_requests_total[5m])`
- Error rate: `rate(http_requests_total{status=~"5.."}[5m])`
- Duration: `histogram_quantile(0.95, http_request_duration_seconds_bucket)`

### Business Metrics
- Tasks created: `tasks_created_total`
- Tasks completed: `tasks_completed_total`
- Active users: `active_users`

### System Metrics
- CPU usage: `container_cpu_usage_seconds_total`
- Memory usage: `container_memory_working_set_bytes`
- Disk usage: `node_filesystem_avail_bytes`

## Alerts

Configured alerts:
- ✅ High error rate (> 5%)
- ✅ High latency (p95 > 500ms)
- ✅ Service down
- ✅ High CPU/memory usage
- ✅ Kafka consumer lag

## Troubleshooting

### Check Prometheus targets

```bash
kubectl port-forward -n observability svc/prometheus 9090:9090
# Open: http://localhost:9090/targets
```

### View logs

```bash
kubectl logs -n observability deployment/prometheus
kubectl logs -n observability deployment/grafana
```

### Test metrics endpoint

```bash
kubectl port-forward -n todo-prod svc/backend-api 8000:8000
curl http://localhost:8000/metrics
```
```

### 12. Output Summary

Generate completion report:
```markdown
# Observability Stack Generation Complete ✅

## Generated Files

### Prometheus
- ✅ observability/prometheus/prometheus.yml
- ✅ observability/prometheus/alerts.yml
- ✅ observability/prometheus/recording-rules.yml

### Grafana
- ✅ observability/grafana/dashboards/application-overview.json
- ✅ observability/grafana/dashboards/backend-metrics.json
- ✅ observability/grafana/datasources.yml

### Application Instrumentation
- ✅ backend/observability/metrics.py
- ✅ backend/observability/logging_config.py
- ✅ backend/observability/tracing.py

### Kubernetes
- ✅ observability/k8s/prometheus-deployment.yaml
- ✅ observability/k8s/grafana-deployment.yaml
- ✅ observability/k8s/loki-deployment.yaml
- ✅ observability/k8s/jaeger-deployment.yaml

### Scripts
- ✅ observability/install-observability.sh

### Documentation
- ✅ observability/README.md

## Features

- **Metrics**: Prometheus with custom application metrics
- **Logging**: Structured JSON logging
- **Tracing**: Distributed tracing with Jaeger
- **Dashboards**: Pre-built Grafana dashboards
- **Alerts**: Production-ready alert rules
- **Health Checks**: Liveness and readiness probes

## Next Steps

1. **Install Observability Stack**:
   ```bash
   ./observability/install-observability.sh observability
   ```

2. **Instrument Application**:
   ```python
   from observability.metrics import track_request, tasks_created_total
   from observability.logging_config import setup_logging
   from observability.tracing import setup_tracing
   ```

3. **Access Dashboards**:
   ```bash
   kubectl port-forward -n observability svc/grafana 3000:3000
   ```

4. **Configure Alerts**: Update alert rules in `prometheus/alerts.yml`

## Benefits

✅ **Visibility**: Real-time insights into application health
✅ **Debugging**: Quickly identify and fix issues
✅ **Performance**: Track and optimize latency
✅ **Alerting**: Get notified before users are affected
✅ **Production-Ready**: Industry-standard observability stack
✅ **Impressive**: Shows engineering maturity to judges
```

## Key Rules

- **Golden Signals**: Monitor latency, traffic, errors, saturation
- **Structured Logging**: Always use JSON format with context
- **Correlation IDs**: Track requests across services
- **Cardinality**: Avoid high-cardinality labels in metrics
- **Retention**: Configure appropriate retention periods
- **Alerting**: Alert on symptoms, not causes
- **Dashboards**: Focus on actionable metrics

## Validation Checklist

Before completing, verify:
- [ ] Prometheus scrapes all services
- [ ] Grafana dashboards are pre-configured
- [ ] Structured logging is implemented
- [ ] Distributed tracing is set up
- [ ] Health check endpoints exist
- [ ] Alert rules are configured
- [ ] Kubernetes deployments are ready
- [ ] Documentation is complete

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: misc (for observability setup)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route: `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage misc --json`
   - Fill all placeholders

4) Validate + report
   - Verify no unresolved placeholders
   - Print ID + path + stage + title
