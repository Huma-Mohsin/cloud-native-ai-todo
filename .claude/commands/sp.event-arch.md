---
description: Design and implement event-driven architecture patterns with Kafka for distributed systems (event schemas, producers, consumers, event sourcing)
handoffs:
  - label: Implement Event Handlers
    agent: sp.implement
    prompt: Implement the generated event handlers and consumers
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill automates the design and implementation of event-driven architecture for your application. It generates:
- **Event Schema Definitions**: Structured event formats with validation
- **Kafka Topic Design**: Topic naming, partitioning, retention policies
- **Producer Code**: Event publishing logic with error handling
- **Consumer Code**: Event handlers for processing messages
- **Event Flow Documentation**: Visual diagrams and sequence flows

Event-driven architecture enables loose coupling, scalability, and asynchronous processing for distributed systems.

## Outline

### 1. Setup and Context Loading

- Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec --include-plan` from repo root
- Parse FEATURE_DIR, FEATURE_SPEC, IMPL_PLAN paths
- Read plan.md to understand:
  - Application features requiring events (reminders, recurring tasks, audit logs)
  - Services architecture (producers and consumers)
  - Data models (entities that generate events)
  - Business workflows (event sequences)
- Read data-model.md to understand entity lifecycle events
- Identify event-driven patterns needed (pub/sub, event sourcing, CQRS)

### 2. Analyze Event Requirements

Extract from requirements and plan:

**Event Sources** (What triggers events):
- Task CRUD operations (create, update, delete, complete)
- User actions (login, logout, preferences change)
- Scheduled triggers (reminders due, recurring task generation)
- System events (errors, performance alerts)

**Event Consumers** (Who processes events):
- Notification service (sends reminders)
- Recurring task service (creates next occurrence)
- Audit service (logs all operations)
- Analytics service (tracks usage patterns)
- WebSocket service (real-time updates to clients)

**Event Patterns**:
- **Fire-and-forget**: Task created → Audit log
- **Request-response**: Task completed → Generate next recurring task
- **Event sourcing**: Rebuild task state from event history
- **Saga pattern**: Multi-step workflows with compensation

### 3. Design Event Schema

Create event taxonomy and schemas:

**Event Naming Convention**:
- Format: `{domain}.{entity}.{action}.{version}`
- Examples:
  - `todo.task.created.v1`
  - `todo.task.completed.v1`
  - `todo.reminder.due.v1`
  - `todo.user.preferences_updated.v1`

**Base Event Schema** (all events inherit):
```json
{
  "event_id": "uuid",
  "event_type": "string",
  "event_version": "string",
  "timestamp": "ISO8601 datetime",
  "source_service": "string",
  "correlation_id": "uuid",
  "user_id": "string",
  "metadata": {
    "ip_address": "string",
    "user_agent": "string"
  }
}
```

**Specific Event Schemas**:

**Task Created Event**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "todo.task.created.v1",
  "event_version": "1.0",
  "timestamp": "2026-01-15T10:30:00Z",
  "source_service": "backend-api",
  "correlation_id": "abc-123",
  "user_id": "user_123",
  "data": {
    "task_id": 42,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "is_recurring": false,
    "due_date": null,
    "priority": "medium",
    "tags": ["shopping", "personal"]
  },
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Task Completed Event**:
```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440001",
  "event_type": "todo.task.completed.v1",
  "event_version": "1.0",
  "timestamp": "2026-01-15T11:00:00Z",
  "source_service": "backend-api",
  "correlation_id": "def-456",
  "user_id": "user_123",
  "data": {
    "task_id": 42,
    "title": "Buy groceries",
    "completed_at": "2026-01-15T11:00:00Z",
    "is_recurring": false,
    "recurrence_pattern": null
  }
}
```

**Reminder Due Event**:
```json
{
  "event_id": "770e8400-e29b-41d4-a716-446655440002",
  "event_type": "todo.reminder.due.v1",
  "event_version": "1.0",
  "timestamp": "2026-01-15T14:00:00Z",
  "source_service": "notification-service",
  "correlation_id": "ghi-789",
  "user_id": "user_123",
  "data": {
    "task_id": 50,
    "title": "Call mom",
    "due_at": "2026-01-15T14:00:00Z",
    "reminder_type": "push_notification",
    "notification_channels": ["email", "push"]
  }
}
```

### 4. Design Kafka Topic Architecture

**Topic Naming Convention**:
- Format: `{environment}.{domain}.{entity}.{event-type}`
- Examples:
  - `prod.todo.task.events`
  - `prod.todo.reminders`
  - `prod.todo.audit.logs`

**Topic Configuration**:

**task-events** (All task operations):
```yaml
topic: prod.todo.task.events
partitions: 6
replication_factor: 3
retention_ms: 604800000  # 7 days
cleanup_policy: delete
compression_type: snappy

# Partition by user_id for ordering guarantees
partition_key: user_id

# Event types on this topic:
# - todo.task.created.v1
# - todo.task.updated.v1
# - todo.task.deleted.v1
# - todo.task.completed.v1
```

**reminders** (Reminder notifications):
```yaml
topic: prod.todo.reminders
partitions: 3
replication_factor: 3
retention_ms: 86400000  # 1 day
cleanup_policy: delete
compression_type: snappy

# Partition by user_id
partition_key: user_id

# Event types:
# - todo.reminder.due.v1
# - todo.reminder.sent.v1
```

**task-updates** (Real-time sync):
```yaml
topic: prod.todo.task.updates
partitions: 6
replication_factor: 3
retention_ms: 3600000  # 1 hour
cleanup_policy: delete
compression_type: snappy

# Partition by user_id
partition_key: user_id

# Event types:
# - todo.task.changed.v1 (for WebSocket broadcast)
```

**audit-logs** (Compliance and debugging):
```yaml
topic: prod.todo.audit.logs
partitions: 12
replication_factor: 3
retention_ms: 2592000000  # 30 days
cleanup_policy: compact  # Keep latest state
compression_type: gzip

# Partition by user_id
partition_key: user_id

# All events are logged here
```

### 5. Generate Event Schema Files

**events/schemas/base_event.py**:
```python
"""Base event schema for all domain events"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

class EventMetadata(BaseModel):
    """Metadata for all events"""
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_id: Optional[str] = None

class BaseEvent(BaseModel):
    """Base class for all domain events"""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    event_version: str = "1.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source_service: str
    correlation_id: str
    user_id: str
    metadata: EventMetadata = Field(default_factory=EventMetadata)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

**events/schemas/task_events.py**:
```python
"""Task-related event schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from events.schemas.base_event import BaseEvent

class TaskCreatedData(BaseModel):
    """Data payload for task created event"""
    task_id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    is_recurring: bool = False
    due_date: Optional[datetime] = None
    priority: str = "medium"
    tags: List[str] = []

class TaskCreatedEvent(BaseEvent):
    """Event published when a task is created"""
    event_type: str = "todo.task.created.v1"
    data: TaskCreatedData

class TaskCompletedData(BaseModel):
    """Data payload for task completed event"""
    task_id: int
    title: str
    completed_at: datetime
    is_recurring: bool
    recurrence_pattern: Optional[str] = None

class TaskCompletedEvent(BaseEvent):
    """Event published when a task is completed"""
    event_type: str = "todo.task.completed.v1"
    data: TaskCompletedData

class TaskUpdatedData(BaseModel):
    """Data payload for task updated event"""
    task_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    updated_fields: List[str]

class TaskUpdatedEvent(BaseEvent):
    """Event published when a task is updated"""
    event_type: str = "todo.task.updated.v1"
    data: TaskUpdatedData

class TaskDeletedData(BaseModel):
    """Data payload for task deleted event"""
    task_id: int
    title: str
    deleted_at: datetime

class TaskDeletedEvent(BaseEvent):
    """Event published when a task is deleted"""
    event_type: str = "todo.task.deleted.v1"
    data: TaskDeletedData
```

**events/schemas/reminder_events.py**:
```python
"""Reminder-related event schemas"""
from pydantic import BaseModel
from typing import List
from datetime import datetime
from events.schemas.base_event import BaseEvent

class ReminderDueData(BaseModel):
    """Data payload for reminder due event"""
    task_id: int
    title: str
    due_at: datetime
    reminder_type: str
    notification_channels: List[str]

class ReminderDueEvent(BaseEvent):
    """Event published when a reminder is due"""
    event_type: str = "todo.reminder.due.v1"
    data: ReminderDueData
```

### 6. Generate Event Producer Code

**events/producers/task_event_producer.py**:
```python
"""Producer for task-related events"""
from kafka import KafkaProducer
from events.schemas.task_events import (
    TaskCreatedEvent,
    TaskCompletedEvent,
    TaskUpdatedEvent,
    TaskDeletedEvent
)
import json
import logging

logger = logging.getLogger(__name__)

class TaskEventProducer:
    """Publishes task events to Kafka"""

    def __init__(self, bootstrap_servers: str):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',  # Wait for all replicas
            retries=3,
            compression_type='snappy'
        )
        self.topic = "prod.todo.task.events"

    async def publish_task_created(self, event: TaskCreatedEvent):
        """Publish task created event"""
        try:
            future = self.producer.send(
                self.topic,
                key=event.user_id,  # Partition by user_id
                value=event.dict()
            )
            # Wait for confirmation
            record_metadata = future.get(timeout=10)
            logger.info(
                f"Published task.created event: {event.event_id} "
                f"to partition {record_metadata.partition}"
            )
        except Exception as e:
            logger.error(f"Failed to publish task.created event: {e}")
            raise

    async def publish_task_completed(self, event: TaskCompletedEvent):
        """Publish task completed event"""
        try:
            future = self.producer.send(
                self.topic,
                key=event.user_id,
                value=event.dict()
            )
            record_metadata = future.get(timeout=10)
            logger.info(
                f"Published task.completed event: {event.event_id} "
                f"to partition {record_metadata.partition}"
            )
        except Exception as e:
            logger.error(f"Failed to publish task.completed event: {e}")
            raise

    async def publish_task_updated(self, event: TaskUpdatedEvent):
        """Publish task updated event"""
        try:
            future = self.producer.send(
                self.topic,
                key=event.user_id,
                value=event.dict()
            )
            future.get(timeout=10)
            logger.info(f"Published task.updated event: {event.event_id}")
        except Exception as e:
            logger.error(f"Failed to publish task.updated event: {e}")
            raise

    async def publish_task_deleted(self, event: TaskDeletedEvent):
        """Publish task deleted event"""
        try:
            future = self.producer.send(
                self.topic,
                key=event.user_id,
                value=event.dict()
            )
            future.get(timeout=10)
            logger.info(f"Published task.deleted event: {event.event_id}")
        except Exception as e:
            logger.error(f"Failed to publish task.deleted event: {e}")
            raise

    def close(self):
        """Close the producer"""
        self.producer.flush()
        self.producer.close()
```

### 7. Generate Event Consumer Code

**events/consumers/recurring_task_consumer.py**:
```python
"""Consumer for processing recurring tasks"""
from kafka import KafkaConsumer
from events.schemas.task_events import TaskCompletedEvent
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RecurringTaskConsumer:
    """Processes task completed events to create recurring tasks"""

    def __init__(self, bootstrap_servers: str):
        self.consumer = KafkaConsumer(
            'prod.todo.task.events',
            bootstrap_servers=bootstrap_servers,
            group_id='recurring-task-service',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )

    async def process_events(self):
        """Process events from Kafka"""
        logger.info("Starting recurring task consumer...")

        for message in self.consumer:
            try:
                event_data = message.value
                event_type = event_data.get('event_type')

                # Only process task completed events
                if event_type == 'todo.task.completed.v1':
                    await self.handle_task_completed(event_data)

            except Exception as e:
                logger.error(f"Error processing event: {e}")
                # Continue processing other events

    async def handle_task_completed(self, event_data: dict):
        """Handle task completed event"""
        data = event_data['data']

        # Check if task is recurring
        if not data.get('is_recurring'):
            return

        logger.info(f"Processing recurring task: {data['task_id']}")

        # Calculate next occurrence based on recurrence pattern
        next_due_date = self.calculate_next_occurrence(
            data.get('recurrence_pattern')
        )

        # Create next task occurrence
        await self.create_next_task(
            user_id=event_data['user_id'],
            title=data['title'],
            due_date=next_due_date,
            recurrence_pattern=data['recurrence_pattern']
        )

    def calculate_next_occurrence(self, pattern: str) -> datetime:
        """Calculate next occurrence based on pattern"""
        now = datetime.utcnow()

        if pattern == 'daily':
            return now + timedelta(days=1)
        elif pattern == 'weekly':
            return now + timedelta(weeks=1)
        elif pattern == 'monthly':
            return now + timedelta(days=30)
        else:
            return now + timedelta(days=1)

    async def create_next_task(
        self,
        user_id: str,
        title: str,
        due_date: datetime,
        recurrence_pattern: str
    ):
        """Create the next occurrence of a recurring task"""
        # Call task creation API or database
        logger.info(
            f"Creating next recurring task for user {user_id}: "
            f"{title} due at {due_date}"
        )
        # Implementation here...

    def close(self):
        """Close the consumer"""
        self.consumer.close()
```

**events/consumers/notification_consumer.py**:
```python
"""Consumer for sending notifications"""
from kafka import KafkaConsumer
from events.schemas.reminder_events import ReminderDueEvent
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer:
    """Processes reminder events and sends notifications"""

    def __init__(self, bootstrap_servers: str):
        self.consumer = KafkaConsumer(
            'prod.todo.reminders',
            bootstrap_servers=bootstrap_servers,
            group_id='notification-service',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True
        )

    async def process_events(self):
        """Process reminder events from Kafka"""
        logger.info("Starting notification consumer...")

        for message in self.consumer:
            try:
                event_data = message.value
                event_type = event_data.get('event_type')

                if event_type == 'todo.reminder.due.v1':
                    await self.handle_reminder_due(event_data)

            except Exception as e:
                logger.error(f"Error processing reminder event: {e}")

    async def handle_reminder_due(self, event_data: dict):
        """Handle reminder due event"""
        data = event_data['data']
        user_id = event_data['user_id']

        logger.info(f"Sending reminder to user {user_id}: {data['title']}")

        # Send notifications via configured channels
        for channel in data['notification_channels']:
            if channel == 'email':
                await self.send_email_notification(user_id, data)
            elif channel == 'push':
                await self.send_push_notification(user_id, data)

    async def send_email_notification(self, user_id: str, data: dict):
        """Send email notification"""
        logger.info(f"Sending email to user {user_id}")
        # Implementation here...

    async def send_push_notification(self, user_id: str, data: dict):
        """Send push notification"""
        logger.info(f"Sending push notification to user {user_id}")
        # Implementation here...

    def close(self):
        """Close the consumer"""
        self.consumer.close()
```

### 8. Generate Integration with Backend API

**backend/routes/tasks.py** (updated with event publishing):
```python
"""Task routes with event publishing"""
from fastapi import APIRouter, Depends
from events.producers.task_event_producer import TaskEventProducer
from events.schemas.task_events import (
    TaskCreatedEvent,
    TaskCreatedData,
    TaskCompletedEvent,
    TaskCompletedData
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# Initialize event producer
event_producer = TaskEventProducer(
    bootstrap_servers="kafka:9092"
)

@router.post("/")
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    """Create a new task and publish event"""

    # Create task in database
    new_task = await db.create_task(task, current_user.id)

    # Publish task created event
    event = TaskCreatedEvent(
        source_service="backend-api",
        correlation_id=str(uuid.uuid4()),
        user_id=current_user.id,
        data=TaskCreatedData(
            task_id=new_task.id,
            title=new_task.title,
            description=new_task.description,
            completed=new_task.completed,
            is_recurring=new_task.is_recurring,
            due_date=new_task.due_date,
            priority=new_task.priority,
            tags=new_task.tags
        )
    )

    await event_producer.publish_task_created(event)

    return new_task

@router.patch("/{task_id}/complete")
async def complete_task(task_id: int, current_user: User = Depends(get_current_user)):
    """Mark task as complete and publish event"""

    # Update task in database
    task = await db.complete_task(task_id, current_user.id)

    # Publish task completed event
    event = TaskCompletedEvent(
        source_service="backend-api",
        correlation_id=str(uuid.uuid4()),
        user_id=current_user.id,
        data=TaskCompletedData(
            task_id=task.id,
            title=task.title,
            completed_at=datetime.utcnow(),
            is_recurring=task.is_recurring,
            recurrence_pattern=task.recurrence_pattern
        )
    )

    await event_producer.publish_task_completed(event)

    return task
```

### 9. Generate Event Flow Documentation

**events/EVENT_FLOWS.md**:
```markdown
# Event Flow Documentation

## Task Creation Flow

```
User → Frontend → Backend API → Database
                       ↓
                  Kafka (task-events)
                       ↓
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   Audit Service  WebSocket     Analytics
                   Service        Service
```

**Sequence**:
1. User creates task via UI
2. Backend API saves to database
3. Backend publishes `task.created` event to Kafka
4. Multiple consumers process event:
   - Audit service logs the action
   - WebSocket service broadcasts to connected clients
   - Analytics service tracks usage

## Recurring Task Flow

```
User completes task → Backend API → Database
                           ↓
                    Kafka (task-events)
                           ↓
              Recurring Task Consumer
                           ↓
              Create next occurrence
                           ↓
                    Backend API (create task)
                           ↓
                    Kafka (task-events)
```

**Sequence**:
1. User marks recurring task as complete
2. Backend publishes `task.completed` event
3. Recurring task consumer receives event
4. Consumer calculates next occurrence
5. Consumer creates new task via API
6. New `task.created` event is published

## Reminder Notification Flow

```
Cron Job (every 5 min) → Check due reminders
                               ↓
                        Kafka (reminders)
                               ↓
                    Notification Consumer
                               ↓
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
         Email Service    Push Service    SMS Service
```

**Sequence**:
1. Cron job runs every 5 minutes
2. Checks database for tasks with due reminders
3. Publishes `reminder.due` events to Kafka
4. Notification consumer receives events
5. Consumer sends notifications via configured channels
```

### 10. Generate Monitoring and Observability

**events/monitoring/event_metrics.py**:
```python
"""Event metrics and monitoring"""
from prometheus_client import Counter, Histogram
import logging

logger = logging.getLogger(__name__)

# Metrics
events_published = Counter(
    'events_published_total',
    'Total number of events published',
    ['event_type', 'topic']
)

events_consumed = Counter(
    'events_consumed_total',
    'Total number of events consumed',
    ['event_type', 'consumer_group']
)

event_processing_duration = Histogram(
    'event_processing_duration_seconds',
    'Time spent processing events',
    ['event_type', 'consumer_group']
)

event_errors = Counter(
    'event_errors_total',
    'Total number of event processing errors',
    ['event_type', 'error_type']
)
```

### 11. Generate Testing Code

**tests/test_event_producers.py**:
```python
"""Tests for event producers"""
import pytest
from events.producers.task_event_producer import TaskEventProducer
from events.schemas.task_events import TaskCreatedEvent, TaskCreatedData

@pytest.mark.asyncio
async def test_publish_task_created_event():
    """Test publishing task created event"""
    producer = TaskEventProducer("localhost:9092")

    event = TaskCreatedEvent(
        source_service="test",
        correlation_id="test-123",
        user_id="user_1",
        data=TaskCreatedData(
            task_id=1,
            title="Test task",
            completed=False
        )
    )

    await producer.publish_task_created(event)

    # Verify event was published
    # (use test consumer to verify)
```

### 12. Output Summary

Generate completion report:
```markdown
# Event Architecture Generation Complete ✅

## Generated Files

### Event Schemas
- ✅ events/schemas/base_event.py
- ✅ events/schemas/task_events.py
- ✅ events/schemas/reminder_events.py

### Producers
- ✅ events/producers/task_event_producer.py
- ✅ events/producers/reminder_event_producer.py

### Consumers
- ✅ events/consumers/recurring_task_consumer.py
- ✅ events/consumers/notification_consumer.py
- ✅ events/consumers/audit_consumer.py

### Documentation
- ✅ events/EVENT_FLOWS.md
- ✅ events/KAFKA_TOPICS.md
- ✅ events/README.md

### Monitoring
- ✅ events/monitoring/event_metrics.py

### Tests
- ✅ tests/test_event_producers.py
- ✅ tests/test_event_consumers.py

## Kafka Topics Created

1. **prod.todo.task.events** (6 partitions)
   - All task CRUD operations
   - Retention: 7 days

2. **prod.todo.reminders** (3 partitions)
   - Reminder notifications
   - Retention: 1 day

3. **prod.todo.task.updates** (6 partitions)
   - Real-time sync events
   - Retention: 1 hour

4. **prod.todo.audit.logs** (12 partitions)
   - Audit trail
   - Retention: 30 days

## Event Types Defined

- ✅ todo.task.created.v1
- ✅ todo.task.updated.v1
- ✅ todo.task.completed.v1
- ✅ todo.task.deleted.v1
- ✅ todo.reminder.due.v1

## Next Steps

1. **Deploy Kafka** (Redpanda Cloud or self-hosted)
2. **Create Kafka Topics**:
   ```bash
   kafka-topics --create --topic prod.todo.task.events --partitions 6
   ```
3. **Start Consumers**:
   ```bash
   python -m events.consumers.recurring_task_consumer
   python -m events.consumers.notification_consumer
   ```
4. **Update Backend API** to publish events
5. **Test Event Flow** end-to-end

## Benefits

✅ **Loose Coupling**: Services communicate via events, not direct calls
✅ **Scalability**: Add consumers without changing producers
✅ **Resilience**: Events are persisted, can replay if consumer fails
✅ **Auditability**: Complete event history for debugging
✅ **Real-time**: WebSocket consumers enable live updates
```

## Key Rules

- **Event Immutability**: Events are facts, never modify published events
- **Schema Versioning**: Use versioned event types (v1, v2) for evolution
- **Idempotency**: Consumers must handle duplicate events gracefully
- **Ordering**: Partition by user_id to guarantee per-user ordering
- **Error Handling**: Dead letter queues for failed events
- **Monitoring**: Track event publishing and consumption metrics
- **Testing**: Test producers and consumers independently

## Validation Checklist

Before completing, verify:
- [ ] All event schemas are defined with Pydantic models
- [ ] Kafka topics are designed with proper partitioning
- [ ] Producers publish events after database operations
- [ ] Consumers handle events idempotently
- [ ] Event flows are documented with diagrams
- [ ] Error handling and retries are implemented
- [ ] Monitoring metrics are in place
- [ ] Tests cover producers and consumers
- [ ] Documentation is comprehensive

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: plan (for event architecture design)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route: `history/prompts/<feature-name>/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage plan [--feature <name>] --json`
   - Fill all placeholders

4) Validate + report
   - Verify no unresolved placeholders
   - Print ID + path + stage + title
