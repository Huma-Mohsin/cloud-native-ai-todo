# Data Model: Phase II Full-Stack Web Todo Application

**Feature**: 001-phase-ii-web-app
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document defines the database schema for the Phase II multi-user web todo application. The data model supports user authentication, task management, and complete data isolation between users.

---

## Database: Neon Serverless PostgreSQL

**Version**: PostgreSQL 16+ compatible
**ORM**: SQLModel (Python backend)
**Migrations**: Alembic (if schema changes needed)

---

## Entities

### 1. User

**Purpose**: Represents a registered user account. Managed by Better Auth library.

**Table Name**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | UUID v4 |
| name | VARCHAR(255) | NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email (login identifier) |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Relationships**:
- One user → Many tasks (one-to-many)

---

### 2. Task

**Purpose**: Represents a todo item owned by exactly one user.

**Table Name**: `tasks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Task ID |
| user_id | VARCHAR(36) | NOT NULL, FK -> users(id) | Owner's user ID |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | NULL | Task description (optional) |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Task creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for filtering by owner)
- INDEX on `completed` (for status-based queries)
- COMPOSITE INDEX on `(user_id, created_at DESC)` (for user's tasks ordered by date)

**Foreign Keys**:
- `user_id` REFERENCES `users(id)` ON DELETE CASCADE

**Check Constraints**:
- `title` length: 1 to 200 characters
- `description` length: 0 to 1000 characters (if not NULL)

---

## SQLModel Definitions

### User Model (Backend)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    name: str = Field(max_length=255)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tasks: List["Task"] = Relationship(back_populates="owner")
```

### Task Model (Backend)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    owner: User = Relationship(back_populates="tasks")
```

---

## TypeScript Types (Frontend)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
}
```

---

**Status**: ✅ Data model complete
