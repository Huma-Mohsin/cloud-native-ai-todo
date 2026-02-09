# Quickstart Guide: Phase III AI-Powered Chatbot

**Feature**: 003-phase-iii-chatbot
**Date**: 2026-01-15
**Estimated Time**: 30 minutes

---

## Overview

This guide will help you quickly set up and test the AI-powered chatbot feature. By the end of this guide, you'll have a working chatbot that can manage tasks through natural language.

---

## Prerequisites

### Required

- ✅ Phase II (Full-Stack Web App) completed and working
- ✅ Python 3.13+ installed
- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running (Neon or local)
- ✅ OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Recommended

- ✅ Git installed
- ✅ VS Code or similar IDE
- ✅ Postman or curl for API testing

### Verify Prerequisites

```bash
# Check Python version
python --version  # Should be 3.13+

# Check Node.js version
node --version  # Should be 18+

# Check database connection
psql $DATABASE_URL -c "SELECT version();"

# Verify Phase II is working
curl http://localhost:8000/api/health
curl http://localhost:3000
```

---

## Step 1: Environment Setup (5 minutes)

### 1.1 Add OpenAI API Key

Add to your `.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...  # Your OpenAI API key
OPENAI_MODEL=gpt-4o         # Model to use (gpt-4o recommended)

# OpenAI ChatKit (for production)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=  # Leave empty for local development

# Existing variables (from Phase II)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
NODE_ENV=development
```

### 1.2 Install Dependencies

**Backend:**
```bash
cd backend
pip install openai-agents-sdk mcp-sdk pydantic
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install @openai/chatkit
npm install
```

---

## Step 2: Database Migration (5 minutes)

### 2.1 Run Migration

```bash
cd backend

# Run migration to create conversations and messages tables
psql $DATABASE_URL -f migrations/003_add_chat_tables.sql

# Verify tables created
psql $DATABASE_URL -c "\dt conversations messages"
```

**Expected Output:**
```
           List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+---------
 public | conversations | table | postgres
 public | messages      | table | postgres
```

### 2.2 Verify Migration

```bash
# Check conversations table structure
psql $DATABASE_URL -c "\d conversations"

# Check messages table structure
psql $DATABASE_URL -c "\d messages"

# Verify indexes
psql $DATABASE_URL -c "\di idx_conversations_user_id idx_messages_*"
```

---

## Step 3: Backend Setup (10 minutes)

### 3.1 Generate MCP Tools (Using Custom Skill)

```bash
# Use the custom skill to generate MCP tools
/sp.mcp-gen
```

This will generate:
- `backend/src/mcp/server.py` - MCP server initialization
- `backend/src/mcp/tools/` - 5 MCP tools (add_task, list_tasks, etc.)
- `backend/src/mcp/schemas.py` - Pydantic schemas
- `backend/src/models/conversation.py` - Conversation model
- `backend/src/models/message.py` - Message model
- `backend/src/services/chat_service.py` - Chat endpoint logic
- `backend/src/services/agent_service.py` - Agent integration
- `backend/src/api/routes/chat.py` - Chat API endpoint

### 3.2 Start Backend Server

```bash
cd backend

# Start FastAPI server
uvicorn src.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3.3 Test Backend Health

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected: {"status": "healthy"}
```

---

## Step 4: Frontend Setup (5 minutes)

### 4.1 Add Chat Page

The `/sp.mcp-gen` skill should have generated:
- `frontend/src/components/chat/ChatInterface.tsx` - ChatKit wrapper
- `frontend/src/pages/chat.tsx` - Chat page
- `frontend/src/services/chatService.ts` - Chat API client
- `frontend/src/hooks/useChat.ts` - Chat state management

### 4.2 Start Frontend Server

```bash
cd frontend

# Start Next.js development server
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4.3 Open Chat Interface

Open browser: http://localhost:3000/chat

You should see the OpenAI ChatKit interface.

---

## Step 5: Test the Chatbot (5 minutes)

### 5.1 Login

1. Navigate to http://localhost:3000/login
2. Login with your test account
3. Navigate to http://localhost:3000/chat

### 5.2 Test Natural Language Commands

Try these commands in the chat interface:

**Create a task:**
```
Add a task to buy groceries
```
Expected response: `✓ Added task: Buy groceries (ID: 42)`

**List tasks:**
```
Show me all my tasks
```
Expected response: List of your tasks with IDs

**Complete a task:**
```
Mark task 42 as complete
```
Expected response: `✓ Marked task as complete: Buy groceries (ID: 42)`

**Delete a task:**
```
Delete task 42
```
Expected response: `✓ Deleted task: Buy groceries (ID: 42)`

**Update a task:**
```
Change task 1 to 'Call mom tonight'
```
Expected response: `✓ Updated task: Call mom tonight (ID: 1)`

### 5.3 Test Conversation Persistence

1. Send a few messages
2. Refresh the page
3. Verify conversation history is preserved

---

## Step 6: Run Tests (Optional, 5 minutes)

### 6.1 Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_mcp_tools.py -v
```

**Expected Output:**
```
======================== test session starts =========================
collected 25 items

tests/unit/test_mcp_tools.py::test_add_task_success PASSED     [  4%]
tests/unit/test_mcp_tools.py::test_list_tasks_success PASSED   [  8%]
...
======================== 25 passed in 2.34s ==========================
```

### 6.2 Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Quick Reference

### API Endpoint

```bash
POST http://localhost:8000/api/{user_id}/chat
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "conversation_id": 123,  // Optional
  "message": "Add a task to buy groceries"
}
```

### Response Format

```json
{
  "conversation_id": 123,
  "response": "✓ Added task: Buy groceries (ID: 42)",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"user_id": "user_123", "title": "Buy groceries"},
      "result": {"task_id": 42, "status": "created", "title": "Buy groceries"}
    }
  ]
}
```

### Natural Language Patterns

| User Input | Agent Action | MCP Tool(s) |
|------------|--------------|-------------|
| "Add a task to buy groceries" | Create task | `add_task` |
| "Show me all my tasks" | List all tasks | `list_tasks(status="all")` |
| "What's pending?" | List incomplete tasks | `list_tasks(status="pending")` |
| "Mark task 3 as complete" | Complete task | `complete_task(task_id=3)` |
| "Delete task 5" | Delete task | `delete_task(task_id=5)` |
| "Change task 1 to 'Call mom'" | Update task | `update_task(task_id=1, title="Call mom")` |

---

## Troubleshooting

### Issue 1: "OpenAI API key not found"

**Symptom**: Backend fails to start or chat returns 500 error

**Solution**:
```bash
# Verify .env file has OPENAI_API_KEY
cat backend/.env | grep OPENAI_API_KEY

# If missing, add it:
echo "OPENAI_API_KEY=sk-proj-..." >> backend/.env

# Restart backend
```

### Issue 2: "Table 'conversations' does not exist"

**Symptom**: Chat endpoint returns database error

**Solution**:
```bash
# Run migration
cd backend
psql $DATABASE_URL -f migrations/003_add_chat_tables.sql

# Verify tables exist
psql $DATABASE_URL -c "\dt conversations messages"
```

### Issue 3: "401 Unauthorized"

**Symptom**: Chat API returns 401 error

**Solution**:
```bash
# Verify you're logged in
# Check JWT token in browser localStorage
# Token should have user_id field

# Test with curl:
curl -H "Authorization: Bearer <your-token>" \
     http://localhost:8000/api/user_123/chat
```

### Issue 4: "ChatKit not rendering"

**Symptom**: Chat page is blank or shows error

**Solution**:
```bash
# Verify @openai/chatkit is installed
cd frontend
npm list @openai/chatkit

# If not installed:
npm install @openai/chatkit

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 5: "Agent not calling tools"

**Symptom**: Chatbot responds but doesn't perform actions

**Solution**:
1. Check agent instructions in `backend/src/services/agent_service.py`
2. Verify MCP tools are registered in `backend/src/mcp/server.py`
3. Check backend logs for tool call errors
4. Test MCP tools directly with unit tests

### Issue 6: "Conversation history not loading"

**Symptom**: Previous messages don't appear after refresh

**Solution**:
```bash
# Check database for messages
psql $DATABASE_URL -c "SELECT * FROM messages WHERE user_id='user_123' LIMIT 10;"

# Verify conversation_id is being passed in requests
# Check browser network tab for API calls
```

---

## Common Errors and Solutions

### Error: "ModuleNotFoundError: No module named 'openai'"

```bash
cd backend
pip install openai-agents-sdk
```

### Error: "ModuleNotFoundError: No module named 'mcp'"

```bash
cd backend
pip install mcp-sdk
```

### Error: "Cannot find module '@openai/chatkit'"

```bash
cd frontend
npm install @openai/chatkit
```

### Error: "Rate limit exceeded"

**Solution**: OpenAI API rate limit reached. Wait a few minutes or upgrade your OpenAI plan.

### Error: "Database connection failed"

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

---

## Next Steps

### 1. Customize Agent Instructions

Edit `backend/src/services/agent_service.py` to customize:
- Response patterns
- Error messages
- Natural language understanding

### 2. Add More MCP Tools

Create new tools in `backend/src/mcp/tools/`:
- `search_tasks.py` - Search tasks by keyword
- `set_priority.py` - Set task priority
- `add_due_date.py` - Add due dates

### 3. Customize ChatKit UI

Edit `frontend/src/components/chat/ChatInterface.tsx` to:
- Change colors and styling
- Add custom message components
- Add typing indicators

### 4. Deploy to Production

See deployment guide in `plan.md` for:
- OpenAI domain allowlist configuration
- Environment variable setup
- Database migration on production

---

## Useful Commands

### Development

```bash
# Start backend
cd backend && uvicorn src.main:app --reload

# Start frontend
cd frontend && npm run dev

# Run tests
cd backend && pytest
cd frontend && npm test

# Check logs
tail -f backend/logs/app.log
```

### Database

```bash
# Connect to database
psql $DATABASE_URL

# View conversations
SELECT * FROM conversations WHERE user_id='user_123';

# View messages
SELECT * FROM messages WHERE conversation_id=123 ORDER BY created_at;

# Clear test data
DELETE FROM messages WHERE user_id='test_user';
DELETE FROM conversations WHERE user_id='test_user';
```

### Testing API with curl

```bash
# Get JWT token (from browser localStorage or login endpoint)
TOKEN="your-jwt-token"
USER_ID="user_123"

# Send chat message
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'

# Continue conversation
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 123, "message": "Show me all my tasks"}'
```

---

## Performance Tips

### 1. Limit Conversation History

Default: Last 50 messages. Adjust in `backend/src/services/chat_service.py`:

```python
messages = await get_conversation_history(
    conversation_id,
    user_id,
    limit=50  # Adjust this value
)
```

### 2. Enable Database Connection Pooling

In `backend/src/database.py`:

```python
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # Max connections
    max_overflow=20
)
```

### 3. Add Caching (Optional)

For frequently accessed data, add Redis caching:

```python
# Cache conversation history for 5 minutes
@cache(ttl=300)
async def get_conversation_history(...):
    ...
```

---

## Resources

- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/guides/agents)
- [Official MCP SDK](https://github.com/modelcontextprotocol/python-sdk)
- [OpenAI ChatKit](https://platform.openai.com/docs/guides/chatkit)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [spec.md](./spec.md) for detailed requirements
2. Review [plan.md](./plan.md) for architecture details
3. Read [research.md](./research.md) for technical decisions
4. Check [data-model.md](./data-model.md) for database schema
5. Review [contracts/chat-api.yaml](./contracts/chat-api.yaml) for API specification

---

**Status**: Quickstart Guide Complete
**Estimated Time**: 30 minutes
**Next**: Run `/sp.tasks 003-phase-iii-chatbot` to generate implementation tasks

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
