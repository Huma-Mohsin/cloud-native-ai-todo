# Data Model: Phase III AI-Powered Chatbot

**Feature**: 003-phase-iii-chatbot
**Date**: 2026-01-15
**Status**: Phase 1 Design

---

## Overview

This document defines the data model for the AI-powered chatbot feature. The model introduces two new entities (Conversation and Message) that integrate with existing entities (User and Task) to enable persistent, stateless conversation management.

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Existing - Better Auth)
│─────────────│
│ id (PK)     │
│ email       │
│ ...         │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────────────────┐
       │                              │
       │                              │
┌──────▼──────────┐            ┌─────▼─────┐
│  Conversation   │            │   Task    │ (Existing - Phase II)
│─────────────────│            │───────────│
│ id (PK)         │            │ id (PK)   │
│ user_id (FK)    │            │ user_id   │
│ created_at      │            │ title     │
│ updated_at      │            │ completed │
└────────┬────────┘            │ ...       │
         │                     └───────────┘
         │ 1:N
         │
  ┌──────▼──────────┐
  │    Message      │
  │─────────────────│
  │ id (PK)         │
  │ conversation_id │ (FK → Conversation)
  │ user_id (FK)    │ (FK → User)
  │ role            │
  │ content         │
  │ created_at      │
  └─────────────────┘
```

---

## Entities

### 1. Conversation (NEW)

**Purpose**: Represents a chat conversation between a user and the AI assistant.

**Table Name**: `conversations`

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique conversation identifier |
| `user_id` | STRING | FOREIGN KEY (users.id), NOT NULL, INDEXED | User who owns this conversation |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When conversation was created |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last message timestamp |

#### Relationships

- **belongs_to User**: Each conversation belongs to one user
- **has_many Messages**: Each conversation has multiple messages

#### Indexes

```sql
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

**Rationale**: Fast lookup of user's conversations

#### Constraints

- `user_id` must reference valid user in `users` table
- `updated_at` automatically updates when new messages are added

#### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

---

### 2. Message (NEW)

**Purpose**: Represents a single message in a conversation (user or assistant).

**Table Name**: `messages`

#### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| `conversation_id` | INTEGER | FOREIGN KEY (conversations.id), NOT NULL, INDEXED | Conversation this message belongs to |
| `user_id` | STRING | FOREIGN KEY (users.id), NOT NULL, INDEXED | User who owns this message |
| `role` | STRING | NOT NULL, CHECK IN ('user', 'assistant') | Message sender role |
| `content` | TEXT | NOT NULL | Message content (max 10,000 chars) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When message was created |

#### Relationships

- **belongs_to Conversation**: Each message belongs to one conversation
- **belongs_to User**: Each message belongs to one user (for data isolation)

#### Indexes

```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Rationale**:
- `conversation_id`: Fast lookup of conversation's messages
- `user_id`: Fast lookup of user's messages (data isolation)
- `created_at`: Fast ordering by timestamp

#### Constraints

- `conversation_id` must reference valid conversation in `conversations` table
- `user_id` must reference valid user in `users` table
- `role` must be either 'user' or 'assistant'
- `content` length: 1-10,000 characters

#### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    role: MessageRole = Field(sa_column_kwargs={"nullable": False})
    content: str = Field(max_length=10000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
```

---

### 3. User (EXISTING - No Changes)

**Purpose**: Represents an authenticated user (managed by Better Auth).

**Table Name**: `users`

**Note**: This table is managed by Better Auth. No schema changes required for Phase III.

#### Relevant Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | STRING | Unique user identifier (UUID) |
| `email` | STRING | User's email address |
| `...` | ... | Other Better Auth fields |

#### Relationships (NEW)

- **has_many Conversations**: User can have multiple conversations
- **has_many Messages**: User can have multiple messages
- **has_many Tasks**: User can have multiple tasks (existing from Phase II)

---

### 4. Task (EXISTING - No Changes)

**Purpose**: Represents a todo task (from Phase II).

**Table Name**: `tasks`

**Note**: No schema changes required for Phase III. MCP tools will interact with this table.

#### Relevant Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Unique task identifier |
| `user_id` | STRING | User who owns this task |
| `title` | STRING | Task title |
| `description` | TEXT | Task description (optional) |
| `completed` | BOOLEAN | Task completion status |
| `created_at` | TIMESTAMP | When task was created |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### Relationships

- **belongs_to User**: Each task belongs to one user

---

## Data Access Patterns

### Pattern 1: Fetch Conversation History

**Use Case**: Load conversation messages for AI agent context

**Query**:
```sql
SELECT id, role, content, created_at
FROM messages
WHERE conversation_id = ? AND user_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

**Performance**: O(log n) with index on `conversation_id`

**SQLModel**:
```python
async def get_conversation_history(
    conversation_id: int,
    user_id: str,
    limit: int = 50
) -> List[Message]:
    return await session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.user_id == user_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()
```

---

### Pattern 2: Create New Conversation

**Use Case**: Start a new chat conversation

**Query**:
```sql
INSERT INTO conversations (user_id, created_at, updated_at)
VALUES (?, NOW(), NOW())
RETURNING id;
```

**SQLModel**:
```python
async def create_conversation(user_id: str) -> Conversation:
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation
```

---

### Pattern 3: Store Message

**Use Case**: Save user or assistant message to database

**Query**:
```sql
INSERT INTO messages (conversation_id, user_id, role, content, created_at)
VALUES (?, ?, ?, ?, NOW());

-- Also update conversation.updated_at
UPDATE conversations
SET updated_at = NOW()
WHERE id = ?;
```

**SQLModel**:
```python
async def store_message(
    conversation_id: int,
    user_id: str,
    role: MessageRole,
    content: str
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )
    session.add(message)

    # Update conversation timestamp
    conversation = await session.get(Conversation, conversation_id)
    conversation.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(message)
    return message
```

---

### Pattern 4: List User's Conversations

**Use Case**: Show user's conversation history

**Query**:
```sql
SELECT id, created_at, updated_at
FROM conversations
WHERE user_id = ?
ORDER BY updated_at DESC
LIMIT 20;
```

**SQLModel**:
```python
async def list_user_conversations(
    user_id: str,
    limit: int = 20
) -> List[Conversation]:
    return await session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .limit(limit)
    ).all()
```

---

## Database Migration

### Migration File: `003_add_chat_tables.sql`

```sql
-- Migration: Add chat tables for Phase III
-- Date: 2026-01-15
-- Feature: 003-phase-iii-chatbot

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for fast lookup
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for fast lookup
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Add trigger to update conversation.updated_at when message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages');
```

### Rollback Migration: `003_add_chat_tables_rollback.sql`

```sql
-- Rollback: Remove chat tables for Phase III
-- Date: 2026-01-15
-- Feature: 003-phase-iii-chatbot

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
DROP FUNCTION IF EXISTS update_conversation_timestamp();

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_user_id;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_conversations_user_id;

-- Drop tables (cascade will remove foreign key constraints)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
```

---

## Data Validation Rules

### Conversation Validation

1. **user_id**: Must reference existing user in `users` table
2. **created_at**: Must be valid timestamp
3. **updated_at**: Must be >= created_at

### Message Validation

1. **conversation_id**: Must reference existing conversation
2. **user_id**: Must match conversation.user_id (data isolation)
3. **role**: Must be 'user' or 'assistant'
4. **content**:
   - Not empty (min 1 character)
   - Max 10,000 characters
   - No SQL injection (use parameterized queries)
   - No XSS (sanitize before display)
5. **created_at**: Must be valid timestamp

---

## Performance Considerations

### Query Optimization

1. **Indexes**: All foreign keys are indexed for fast joins
2. **Limit Clauses**: Always use LIMIT to prevent loading too many messages
3. **Order By**: created_at index enables fast sorting
4. **Connection Pooling**: Max 10 connections per backend pod

### Scalability

1. **Horizontal Scaling**: Stateless architecture allows multiple backend instances
2. **Database Sharding**: Can shard by user_id if needed (future)
3. **Read Replicas**: Can add read replicas for conversation history queries (future)

### Storage Estimates

**Assumptions**:
- 1,000 users
- Average 10 conversations per user
- Average 100 messages per conversation
- Average 200 characters per message

**Storage**:
- Conversations: 10,000 rows × 100 bytes = 1 MB
- Messages: 1,000,000 rows × 300 bytes = 300 MB
- **Total**: ~301 MB (well within PostgreSQL limits)

---

## Security Considerations

### Data Isolation

1. **User-Level Isolation**: All queries filter by authenticated user's ID
2. **Foreign Key Constraints**: Prevent orphaned records
3. **Cascade Deletes**: When user is deleted, conversations and messages are deleted

### Access Control

1. **Authentication**: JWT token required for all operations
2. **Authorization**: user_id in token must match user_id in query
3. **No Cross-User Access**: Users cannot access other users' conversations

### Input Sanitization

1. **SQL Injection**: Use parameterized queries (SQLModel handles this)
2. **XSS Prevention**: Sanitize message content before display
3. **Content Length**: Enforce max 10,000 characters per message

---

## Testing Strategy

### Unit Tests

1. **Model Creation**: Test creating conversations and messages
2. **Relationships**: Test foreign key constraints
3. **Validation**: Test role enum, content length limits
4. **Timestamps**: Test created_at and updated_at behavior

### Integration Tests

1. **Data Access Patterns**: Test all query patterns
2. **Transaction Handling**: Test rollback on errors
3. **Cascade Deletes**: Test user deletion cascades to conversations/messages
4. **Concurrent Access**: Test multiple users creating conversations simultaneously

### Test Data

```python
# Test fixtures
@pytest.fixture
async def test_user():
    return User(id="user_123", email="test@example.com")

@pytest.fixture
async def test_conversation(test_user):
    return Conversation(user_id=test_user.id)

@pytest.fixture
async def test_messages(test_conversation):
    return [
        Message(
            conversation_id=test_conversation.id,
            user_id=test_conversation.user_id,
            role=MessageRole.USER,
            content="Add a task to buy groceries"
        ),
        Message(
            conversation_id=test_conversation.id,
            user_id=test_conversation.user_id,
            role=MessageRole.ASSISTANT,
            content="✓ Added task: Buy groceries (ID: 42)"
        )
    ]
```

---

## Summary

### New Tables

1. **conversations**: Stores chat conversations (1 per user session)
2. **messages**: Stores individual messages (user and assistant)

### Key Features

1. **Stateless Architecture**: All state persisted in database
2. **User Isolation**: Foreign keys ensure data isolation
3. **Performance**: Indexes on all foreign keys and created_at
4. **Scalability**: Supports 1000+ users, 100+ messages per conversation

### Migration Strategy

1. Run `003_add_chat_tables.sql` to create tables
2. Verify tables created with SELECT query
3. Test with sample data before production deployment
4. Rollback available with `003_add_chat_tables_rollback.sql`

---

**Status**: Phase 1 Data Model Complete
**Next**: Generate API contracts (chat-api.yaml)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
