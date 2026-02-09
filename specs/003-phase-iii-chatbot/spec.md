# Phase III: AI-Powered Todo Chatbot - Feature Specification

## Metadata

- **Feature ID**: 003-phase-iii-chatbot
- **Phase**: III
- **Priority**: High (200 points)
- **Status**: Planning
- **Due Date**: December 21, 2025
- **Dependencies**: Phase II (Full-Stack Web App)

---

## Overview

Transform the Todo web application into an AI-powered chatbot that allows users to manage their tasks through natural language conversations. The chatbot uses OpenAI Agents SDK with MCP (Model Context Protocol) tools to provide an intuitive, conversational interface for task management.

### Goals

1. Enable natural language task management (e.g., "Add a task to buy groceries")
2. Implement stateless, scalable chat architecture with database-persisted conversations
3. Build MCP server exposing task operations as AI-callable tools
4. Maintain conversation context across sessions
5. Provide friendly, helpful responses with action confirmations

### Non-Goals

- Voice input/output (Phase V bonus feature)
- Multi-language support (Phase V bonus feature)
- Advanced task features (priorities, tags, due dates - Phase V)
- Real-time collaboration

---

## User Stories

### US-1: Natural Language Task Creation
**As a** user
**I want to** create tasks using natural language
**So that** I can quickly add todos without filling forms

**Acceptance Criteria:**
- User can say "Add a task to buy groceries" and task is created
- User can say "I need to remember to call mom" and task is created
- User can include descriptions: "Add task: Buy groceries - milk, eggs, bread"
- Chatbot confirms task creation with task ID and title
- Task is associated with authenticated user

### US-2: Natural Language Task Listing
**As a** user
**I want to** view my tasks using natural language
**So that** I can see what I need to do

**Acceptance Criteria:**
- User can say "Show me all my tasks" to see all tasks
- User can say "What's pending?" to see incomplete tasks
- User can say "What have I completed?" to see completed tasks
- Chatbot displays tasks in readable format with IDs
- Only user's own tasks are shown

### US-3: Natural Language Task Completion
**As a** user
**I want to** mark tasks complete using natural language
**So that** I can track my progress

**Acceptance Criteria:**
- User can say "Mark task 3 as complete"
- User can say "I finished the groceries task" (searches by title)
- Chatbot confirms completion with task details
- Task status updates in database

### US-4: Natural Language Task Deletion
**As a** user
**I want to** delete tasks using natural language
**So that** I can remove unwanted tasks

**Acceptance Criteria:**
- User can say "Delete task 5"
- User can say "Remove the meeting task" (searches by title)
- Chatbot confirms deletion with task details
- Task is removed from database

### US-5: Natural Language Task Updates
**As a** user
**I want to** update tasks using natural language
**So that** I can modify task details

**Acceptance Criteria:**
- User can say "Change task 1 to 'Call mom tonight'"
- User can say "Update the groceries task description to include fruits"
- Chatbot confirms update with new details
- Task updates in database

### US-6: Conversation Persistence
**As a** user
**I want** my conversation history to be saved
**So that** I can resume conversations later

**Acceptance Criteria:**
- Conversations persist across browser sessions
- User can see previous messages when returning
- Server restart doesn't lose conversation history
- Each user has separate conversation history

### US-7: Error Handling
**As a** user
**I want** helpful error messages
**So that** I understand what went wrong

**Acceptance Criteria:**
- "Task not found" when referencing invalid task ID
- "Please specify which task" when ambiguous
- "I couldn't understand that" for unclear requests
- Friendly, conversational error messages

---

## Technical Requirements

### Architecture

**Frontend:**
- Framework: OpenAI ChatKit
- Authentication: Better Auth JWT tokens
- API Communication: Fetch API with Authorization headers

**Backend:**
- Framework: FastAPI (Python)
- AI Framework: OpenAI Agents SDK (agent + runner pattern)
- MCP Server: Official MCP SDK (Python)
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL

**Key Architectural Principles:**
- **Stateless Server**: No in-memory conversation state
- **Database-Persisted State**: All conversations and messages in database
- **Stateless Request Cycle**: Fetch history → Process → Store → Respond
- **MCP Tools**: Stateless, database-backed operations

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend UI | OpenAI ChatKit | Latest |
| Backend API | FastAPI | Latest |
| AI Framework | OpenAI Agents SDK | Latest |
| MCP Server | Official MCP SDK | Latest |
| ORM | SQLModel | Latest |
| Database | Neon PostgreSQL | Latest |
| Authentication | Better Auth | Latest |

---

## API Specifications

### Chat Endpoint

**Endpoint:** `POST /api/{user_id}/chat`

**Authentication:** Required (JWT token in Authorization header)

**Request Body:**
```json
{
  "conversation_id": 123,  // Optional: existing conversation ID
  "message": "Add a task to buy groceries"  // Required: user message
}
```

**Response:**
```json
{
  "conversation_id": 123,
  "response": "✓ Added task: Buy groceries (ID: 42)",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {
        "user_id": "user_123",
        "title": "Buy groceries"
      },
      "result": {
        "task_id": 42,
        "status": "created",
        "title": "Buy groceries"
      }
    }
  ]
}
```

**Status Codes:**
- 200 OK: Successful chat interaction
- 400 Bad Request: Invalid message format
- 401 Unauthorized: Missing/invalid JWT token
- 403 Forbidden: User ID mismatch
- 500 Internal Server Error: Server error

---

## MCP Tools Specification

### Tool 1: add_task

**Purpose:** Create a new task

**Parameters:**
- `user_id` (string, required): User ID from JWT token
- `title` (string, required): Task title (1-200 characters)
- `description` (string, optional): Task description (max 1000 characters)

**Returns:**
```json
{
  "task_id": 42,
  "status": "created",
  "title": "Buy groceries"
}
```

**Example:**
```python
# Input
{"user_id": "user_123", "title": "Buy groceries", "description": "Milk, eggs, bread"}

# Output
{"task_id": 42, "status": "created", "title": "Buy groceries"}
```

### Tool 2: list_tasks

**Purpose:** Retrieve user's tasks

**Parameters:**
- `user_id` (string, required): User ID from JWT token
- `status` (string, optional): Filter by status ("all", "pending", "completed")
  - Default: "all"

**Returns:**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2025-12-21T10:00:00Z"
  },
  ...
]
```

### Tool 3: complete_task

**Purpose:** Mark a task as complete

**Parameters:**
- `user_id` (string, required): User ID from JWT token
- `task_id` (integer, required): Task ID to complete

**Returns:**
```json
{
  "task_id": 3,
  "status": "completed",
  "title": "Call mom"
}
```

**Error Cases:**
- Task not found: `{"error": "Task not found", "task_id": 3}`
- Task belongs to different user: `{"error": "Unauthorized"}`

### Tool 4: delete_task

**Purpose:** Remove a task

**Parameters:**
- `user_id` (string, required): User ID from JWT token
- `task_id` (integer, required): Task ID to delete

**Returns:**
```json
{
  "task_id": 2,
  "status": "deleted",
  "title": "Old task"
}
```

### Tool 5: update_task

**Purpose:** Modify task title or description

**Parameters:**
- `user_id` (string, required): User ID from JWT token
- `task_id` (integer, required): Task ID to update
- `title` (string, optional): New title
- `description` (string, optional): New description

**Returns:**
```json
{
  "task_id": 1,
  "status": "updated",
  "title": "Buy groceries and fruits"
}
```

**Validation:**
- At least one of `title` or `description` must be provided
- Title: 1-200 characters if provided
- Description: max 1000 characters if provided

---

## Database Schema

### New Tables

#### conversations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Conversation ID |
| user_id | STRING | FOREIGN KEY (users.id), NOT NULL, INDEXED | User who owns conversation |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_conversations_user_id` on `user_id`

#### messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Message ID |
| conversation_id | INTEGER | FOREIGN KEY (conversations.id), NOT NULL, INDEXED | Conversation this message belongs to |
| user_id | STRING | FOREIGN KEY (users.id), NOT NULL, INDEXED | User who owns message |
| role | STRING | NOT NULL, CHECK IN ('user', 'assistant') | Message role |
| content | TEXT | NOT NULL | Message content |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_messages_conversation_id` on `conversation_id`
- `idx_messages_user_id` on `user_id`

### Existing Tables (No Changes)

- `users` (managed by Better Auth)
- `tasks` (from Phase II)

---

## Agent Behavior Specification

### Natural Language Understanding

The AI agent must understand these patterns:

| User Input | Agent Action | MCP Tool(s) |
|------------|--------------|-------------|
| "Add a task to buy groceries" | Create task with title "Buy groceries" | `add_task` |
| "I need to remember to call mom" | Create task with title "Call mom" | `add_task` |
| "Show me all my tasks" | List all tasks | `list_tasks(status="all")` |
| "What's pending?" | List incomplete tasks | `list_tasks(status="pending")` |
| "What have I completed?" | List completed tasks | `list_tasks(status="completed")` |
| "Mark task 3 as complete" | Complete task ID 3 | `complete_task(task_id=3)` |
| "I finished the groceries task" | Search for "groceries", then complete | `list_tasks` + `complete_task` |
| "Delete task 5" | Delete task ID 5 | `delete_task(task_id=5)` |
| "Remove the meeting task" | Search for "meeting", then delete | `list_tasks` + `delete_task` |
| "Change task 1 to 'Call mom tonight'" | Update task 1 title | `update_task(task_id=1, title="Call mom tonight")` |

### Response Patterns

**Task Creation:**
- Success: "✓ Added task: {title} (ID: {task_id})"
- Error: "I couldn't create that task. {error_message}"

**Task Listing:**
- Success: "Here are your {status} tasks:\n1. {title} (ID: {id})\n2. ..."
- Empty: "You don't have any {status} tasks."

**Task Completion:**
- Success: "✓ Marked task as complete: {title} (ID: {task_id})"
- Not found: "I couldn't find task {task_id}. Use 'show me all my tasks' to see your tasks."

**Task Deletion:**
- Success: "✓ Deleted task: {title} (ID: {task_id})"
- Not found: "I couldn't find task {task_id}."

**Task Update:**
- Success: "✓ Updated task: {title} (ID: {task_id})"
- Not found: "I couldn't find task {task_id}."

**Ambiguity:**
- "I found multiple tasks matching '{query}'. Which one did you mean?\n1. {title} (ID: {id})\n2. ..."

**Errors:**
- "I couldn't understand that. Try saying 'Add a task to...' or 'Show me my tasks'."

---

## Conversation Flow (Stateless Request Cycle)

### Request Processing Steps

1. **Receive Request**
   - Extract `user_id` from JWT token
   - Extract `conversation_id` (optional) and `message` from request body
   - Validate authentication and authorization

2. **Fetch Conversation History**
   - If `conversation_id` provided: Fetch messages from database
   - If not provided: Create new conversation in database
   - Build message array: `[{role: "user", content: "..."}, {role: "assistant", content: "..."}, ...]`

3. **Store User Message**
   - Insert user message into `messages` table
   - Associate with `conversation_id` and `user_id`

4. **Run AI Agent**
   - Initialize OpenAI Agent with MCP tools
   - Pass conversation history + new message
   - Agent decides which MCP tool(s) to call
   - Execute tool calls (all tools interact with database)

5. **Store Assistant Response**
   - Insert assistant message into `messages` table
   - Include tool call results in response

6. **Return Response**
   - Return `conversation_id`, `response`, and `tool_calls` to client
   - Server holds NO state (ready for next request)

### Stateless Architecture Benefits

- **Scalability**: Any server instance can handle any request
- **Resilience**: Server restarts don't lose conversation state
- **Horizontal Scaling**: Load balancer can route to any backend
- **Testability**: Each request is independent and reproducible

---

## OpenAI ChatKit Setup

### Domain Allowlist Configuration

**Required for Production Deployment:**

1. Deploy frontend to get production URL (e.g., Vercel)
2. Add domain to OpenAI allowlist:
   - Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
   - Click "Add domain"
   - Enter frontend URL (without trailing slash)
   - Save changes
3. Get domain key from OpenAI
4. Set environment variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`

**Local Development:**
- `localhost` works without domain key
- No allowlist configuration needed for local testing

---

## Security Requirements

### Authentication

- All chat endpoints require valid JWT token
- Token must contain `user_id`
- `user_id` in token must match `{user_id}` in URL path
- Return 401 Unauthorized if token missing/invalid
- Return 403 Forbidden if user_id mismatch

### Data Isolation

- Users can only access their own conversations
- Users can only access their own messages
- Users can only access their own tasks
- All database queries filter by authenticated user's ID

### Input Validation

- Validate all user inputs (SQL injection prevention)
- Sanitize message content (XSS prevention)
- Limit message length (max 2000 characters)
- Rate limiting on chat endpoint (max 10 requests/minute per user)

### Secrets Management

- OpenAI API key in environment variable (never in code)
- Database credentials in environment variable
- Better Auth secret in environment variable
- All secrets in `.env` (gitignored)

---

## Testing Requirements

### Unit Tests

**MCP Tools:**
- Test each tool with valid inputs
- Test each tool with invalid inputs (error handling)
- Test user isolation (users can't access other users' tasks)
- Test edge cases (empty lists, non-existent IDs)

**Database Models:**
- Test Conversation model CRUD operations
- Test Message model CRUD operations
- Test foreign key constraints

### Integration Tests

**Chat Endpoint:**
- Test successful chat interaction
- Test conversation creation (no conversation_id)
- Test conversation continuation (with conversation_id)
- Test authentication (valid/invalid tokens)
- Test authorization (user_id mismatch)
- Test error handling (invalid inputs)

**Agent + MCP Integration:**
- Test agent calls correct MCP tool for each user intent
- Test agent handles tool errors gracefully
- Test agent maintains conversation context

### E2E Tests (Optional but Recommended)

- User creates task via chat
- User lists tasks via chat
- User completes task via chat
- User deletes task via chat
- User updates task via chat
- Conversation persists across sessions

### Test Coverage Goals

- Backend: 80%+ coverage
- MCP Tools: 100% coverage (critical functionality)
- Chat endpoint: 100% coverage

---

## Performance Requirements

### Response Times

- Chat endpoint: < 2s (p95) - includes AI processing
- MCP tool execution: < 200ms (p95)
- Database queries: < 100ms (p95)

### Scalability

- Support 100+ concurrent users
- Support 1000+ messages per conversation
- Support 10,000+ tasks per user

### Resource Limits

- Backend pods: 512MB memory, 1 CPU
- Database connections: Max 10 per pod

---

## Deployment Requirements

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
BETTER_AUTH_SECRET=your-32-char-secret

# Environment
NODE_ENV=production
ENVIRONMENT=production
```

### Database Migrations

- Create `conversations` table
- Create `messages` table
- Add indexes on foreign keys
- Migration script: `backend/migrations/003_add_chat_tables.sql`

### Deployment Steps

1. Run database migrations
2. Deploy backend with MCP server
3. Deploy frontend with ChatKit
4. Configure OpenAI domain allowlist
5. Test chat functionality
6. Monitor logs and errors

---

## Deliverables

### Code

- [ ] Frontend: ChatKit-based UI (`frontend/`)
- [ ] Backend: FastAPI + Agents SDK + MCP (`backend/`)
- [ ] MCP Server: 5 tools implemented (`backend/mcp/`)
- [ ] Database migrations (`backend/migrations/`)
- [ ] Tests: Unit + Integration (`backend/tests/`)

### Documentation

- [ ] README: Setup instructions
- [ ] API Documentation: Chat endpoint + MCP tools
- [ ] Architecture diagram
- [ ] Natural language examples

### Deployment

- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed
- [ ] Database migrations applied
- [ ] OpenAI domain allowlist configured

### Demo Video

- [ ] 90-second demo showing:
  - Natural language task creation
  - Task listing
  - Task completion
  - Conversation persistence
  - Error handling

---

## Success Criteria

### Functional

- ✅ User can create tasks via natural language
- ✅ User can list tasks via natural language
- ✅ User can complete tasks via natural language
- ✅ User can delete tasks via natural language
- ✅ User can update tasks via natural language
- ✅ Conversations persist across sessions
- ✅ Server is stateless (no in-memory state)
- ✅ Errors are handled gracefully

### Technical

- ✅ All 5 MCP tools implemented and tested
- ✅ Chat endpoint is stateless
- ✅ Conversation state persists in database
- ✅ Authentication and authorization working
- ✅ 80%+ test coverage
- ✅ Response times meet requirements

### Quality

- ✅ Code follows constitution standards
- ✅ All tests passing
- ✅ No security vulnerabilities
- ✅ Documentation complete
- ✅ Demo video under 90 seconds

---

## Risks and Mitigations

### Risk 1: OpenAI API Rate Limits

**Impact:** High
**Probability:** Medium
**Mitigation:**
- Implement request queuing
- Add retry logic with exponential backoff
- Monitor API usage
- Consider caching common responses

### Risk 2: Conversation History Performance

**Impact:** Medium
**Probability:** Low
**Mitigation:**
- Limit conversation history to last 50 messages
- Add pagination for long conversations
- Index conversation_id and user_id
- Monitor query performance

### Risk 3: Natural Language Understanding Accuracy

**Impact:** Medium
**Probability:** Medium
**Mitigation:**
- Provide clear agent instructions
- Test with diverse user inputs
- Implement fallback responses
- Allow users to rephrase

### Risk 4: OpenAI ChatKit Domain Allowlist

**Impact:** High
**Probability:** Low
**Mitigation:**
- Configure allowlist early
- Test on production domain before submission
- Document setup process clearly
- Have backup plan (custom chat UI)

---

## Timeline

### Week 1 (Dec 15-21)

- [ ] Day 1-2: MCP server implementation (5 tools)
- [ ] Day 3-4: Chat endpoint + OpenAI Agents SDK integration
- [ ] Day 5: Database migrations + models
- [ ] Day 6: Frontend ChatKit integration
- [ ] Day 7: Testing + deployment + demo video

### Milestones

- **Dec 17**: MCP tools working
- **Dec 19**: Chat endpoint working
- **Dec 20**: Frontend integrated
- **Dec 21**: Deployed and submitted

---

## References

- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/guides/agents)
- [Official MCP SDK](https://github.com/modelcontextprotocol/python-sdk)
- [OpenAI ChatKit](https://platform.openai.com/docs/guides/chatkit)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)

---

**Status**: Ready for Planning
**Next Step**: Run `/sp.plan` to create implementation plan
**Estimated Effort**: 40-50 hours (with custom skills: 15-20 hours)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
