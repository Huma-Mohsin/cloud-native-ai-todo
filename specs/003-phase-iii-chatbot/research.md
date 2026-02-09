# Phase 0: Research & Technical Decisions

**Feature**: Phase III AI-Powered Chatbot
**Date**: 2026-01-15
**Status**: Complete

---

## Overview

This document captures research findings and technical decisions for implementing an AI-powered chatbot using OpenAI Agents SDK with MCP (Model Context Protocol) tools. The research focuses on integration patterns, best practices, and architectural decisions to ensure a stateless, scalable, and production-ready implementation.

---

## Research Area 1: OpenAI Agents SDK + MCP Integration Pattern

### Research Question
How to integrate OpenAI Agents SDK with MCP server tools for stateless, database-backed task management?

### Findings

#### Agent + Runner Pattern
**Decision**: Use OpenAI Agents SDK's agent + runner pattern with MCP tools

**Pattern**:
```python
# 1. Define MCP tools with Official MCP SDK
from mcp import Tool, Server

server = Server("task-manager")

@server.tool()
def add_task(user_id: str, title: str, description: str = "") -> dict:
    # Database operation
    return {"task_id": 42, "status": "created"}

# 2. Create OpenAI Agent with tools
from openai import Agent

agent = Agent(
    name="TaskBot",
    instructions="You are a helpful task management assistant...",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
    model="gpt-4o"
)

# 3. Run agent with conversation history
from openai import Runner

runner = Runner(agent=agent)
response = runner.run(
    messages=[
        {"role": "user", "content": "Add a task to buy groceries"},
        # ... previous conversation history
    ]
)
```

**Rationale**:
- Agent handles natural language understanding and tool selection
- Runner manages execution flow and tool calling
- MCP tools provide type-safe, database-backed operations
- Stateless: Each request creates new runner with full history

**Alternatives Considered**:
1. **Direct OpenAI API calls**: More control but requires manual tool calling logic
2. **LangChain**: More complex, additional dependency, overkill for this use case
3. **Custom agent framework**: Reinventing the wheel, not production-ready

### Conversation History Management

**Decision**: Fetch full conversation history from database on each request

**Implementation**:
```python
async def process_chat(user_id: str, conversation_id: int, new_message: str):
    # 1. Fetch conversation history from database
    messages = await db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.user_id == user_id
    ).order_by(Message.created_at).limit(50).all()

    # 2. Build message array
    history = [{"role": msg.role, "content": msg.content} for msg in messages]
    history.append({"role": "user", "content": new_message})

    # 3. Run agent with history
    runner = Runner(agent=agent)
    response = runner.run(messages=history)

    # 4. Store user message and assistant response
    await db.add(Message(conversation_id=conversation_id, role="user", content=new_message))
    await db.add(Message(conversation_id=conversation_id, role="assistant", content=response.content))

    return response
```

**Rationale**:
- Stateless server: No in-memory state
- Horizontal scalability: Any server can handle any request
- Resilience: Server restarts don't lose state
- Testability: Each request is independent

**Performance Optimization**: Limit to last 50 messages to prevent performance degradation

### Tool Call Result Handling

**Decision**: Return tool call results in API response for transparency

**Response Format**:
```json
{
  "conversation_id": 123,
  "response": "✓ Added task: Buy groceries (ID: 42)",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": {"user_id": "user_123", "title": "Buy groceries"},
      "result": {"task_id": 42, "status": "created"}
    }
  ]
}
```

**Rationale**:
- Transparency: User sees what actions were taken
- Debugging: Easier to trace tool execution
- Frontend flexibility: Can display tool results differently

---

## Research Area 2: Official MCP SDK (Python) Best Practices

### Research Question
How to structure MCP server with Official MCP SDK for production-ready tool definitions?

### Findings

#### MCP Server Initialization

**Decision**: Use Official MCP SDK with FastAPI integration

**Structure**:
```python
# backend/src/mcp/server.py
from mcp import Server
from mcp.types import Tool, TextContent

server = Server("task-manager-mcp")

# Register tools
from .tools import add_task, list_tasks, complete_task, delete_task, update_task

server.tool()(add_task.handler)
server.tool()(list_tasks.handler)
server.tool()(complete_task.handler)
server.tool()(delete_task.handler)
server.tool()(update_task.handler)
```

**Rationale**:
- Official SDK ensures protocol compliance
- Centralized server registration
- Easy to add/remove tools
- Type-safe tool definitions

#### Tool Schema Definition with Pydantic

**Decision**: Use Pydantic models for tool input/output schemas

**Example**:
```python
# backend/src/mcp/schemas.py
from pydantic import BaseModel, Field

class AddTaskInput(BaseModel):
    user_id: str = Field(..., description="User ID from JWT token")
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str = Field("", max_length=1000, description="Task description")

class AddTaskOutput(BaseModel):
    task_id: int
    status: str
    title: str

# backend/src/mcp/tools/add_task.py
from mcp import tool
from ..schemas import AddTaskInput, AddTaskOutput

@tool(
    name="add_task",
    description="Create a new task for the user",
    input_schema=AddTaskInput,
    output_schema=AddTaskOutput
)
async def handler(input: AddTaskInput) -> AddTaskOutput:
    # Database operation
    task = await create_task(input.user_id, input.title, input.description)
    return AddTaskOutput(task_id=task.id, status="created", title=task.title)
```

**Rationale**:
- Type safety: Pydantic validates inputs
- Auto-generated schemas: MCP SDK uses Pydantic for OpenAPI
- Clear documentation: Field descriptions help AI understand tool usage
- Validation: min_length, max_length prevent invalid inputs

#### Error Handling in MCP Tools

**Decision**: Raise structured exceptions that MCP SDK can serialize

**Pattern**:
```python
from mcp.exceptions import ToolError

@tool(name="complete_task")
async def handler(input: CompleteTaskInput) -> CompleteTaskOutput:
    task = await db.get(Task, input.task_id)

    if not task:
        raise ToolError(
            code="TASK_NOT_FOUND",
            message=f"Task {input.task_id} not found",
            details={"task_id": input.task_id}
        )

    if task.user_id != input.user_id:
        raise ToolError(
            code="UNAUTHORIZED",
            message="You don't have permission to complete this task"
        )

    task.completed = True
    await db.commit()
    return CompleteTaskOutput(task_id=task.id, status="completed", title=task.title)
```

**Rationale**:
- Structured errors: AI can understand and communicate errors to user
- Error codes: Enable programmatic error handling
- Details: Provide context for debugging

#### Testing MCP Tools in Isolation

**Decision**: Test tools independently of agent using direct function calls

**Test Pattern**:
```python
# backend/tests/unit/test_mcp_tools.py
import pytest
from src.mcp.tools.add_task import handler
from src.mcp.schemas import AddTaskInput

@pytest.mark.asyncio
async def test_add_task_success():
    input = AddTaskInput(user_id="user_123", title="Buy groceries")
    result = await handler(input)

    assert result.status == "created"
    assert result.title == "Buy groceries"
    assert result.task_id > 0

@pytest.mark.asyncio
async def test_add_task_invalid_title():
    with pytest.raises(ValidationError):
        input = AddTaskInput(user_id="user_123", title="")  # Empty title
```

**Rationale**:
- Fast tests: No agent overhead
- Isolated: Test tool logic independently
- 100% coverage: Test all error paths

---

## Research Area 3: OpenAI ChatKit Configuration

### Research Question
How to configure OpenAI ChatKit with Next.js for production deployment?

### Findings

#### ChatKit Setup with Next.js

**Decision**: Use OpenAI ChatKit as React component with custom API integration

**Implementation**:
```typescript
// frontend/src/components/chat/ChatInterface.tsx
import { ChatKit } from '@openai/chatkit';
import { useChat } from '@/hooks/useChat';

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <ChatKit
      messages={messages}
      onSendMessage={sendMessage}
      isLoading={isLoading}
      placeholder="Ask me to manage your tasks..."
      theme={{
        primaryColor: '#0070f3',
        backgroundColor: '#ffffff'
      }}
    />
  );
}

// frontend/src/hooks/useChat.ts
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const sendMessage = async (content: string) => {
    const response = await fetch(`/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: content
      })
    });

    const data = await response.json();
    setConversationId(data.conversation_id);
    setMessages([...messages,
      { role: 'user', content },
      { role: 'assistant', content: data.response }
    ]);
  };

  return { messages, sendMessage, isLoading };
}
```

**Rationale**:
- Pre-built UI: ChatKit handles message rendering, input, loading states
- Custom API: We control backend integration (not OpenAI's hosted chat)
- Flexible: Can customize styling and behavior

#### Domain Allowlist Configuration

**Decision**: Configure domain allowlist for production, skip for local development

**Setup Process**:
1. Deploy frontend to get production URL (e.g., `https://todo-app.vercel.app`)
2. Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
3. Add domain (without trailing slash)
4. Get domain key from OpenAI
5. Set environment variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-key`

**Local Development**:
- `localhost` works without domain key
- No allowlist configuration needed

**Rationale**:
- Security: Prevents unauthorized domains from using your OpenAI account
- Production-ready: Required for deployment
- Development-friendly: localhost exemption for testing

#### Authentication Integration

**Decision**: Pass JWT token in Authorization header for all chat requests

**Implementation**:
```typescript
// frontend/src/services/chatService.ts
export class ChatService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async sendMessage(conversationId: number | null, message: string) {
    const response = await fetch(`/api/${this.getUserId()}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation_id: conversationId, message })
    });

    if (response.status === 401) {
      throw new Error('Unauthorized: Please log in again');
    }

    return response.json();
  }

  private getUserId(): string {
    const payload = JSON.parse(atob(this.token.split('.')[1]));
    return payload.user_id;
  }
}
```

**Rationale**:
- Security: JWT token authenticates user
- User isolation: user_id from token ensures data isolation
- Standard pattern: Authorization header is REST best practice

---

## Research Area 4: Stateless Chat Architecture

### Research Question
What are the best practices for stateless conversation handling with database persistence?

### Findings

#### Stateless Request Cycle

**Decision**: Implement 6-step stateless request cycle

**Flow**:
```
1. Receive Request (conversation_id?, message)
   ↓
2. Fetch Conversation History (from database)
   ↓
3. Store User Message (in database)
   ↓
4. Run AI Agent (with history + new message)
   ↓
5. Store Assistant Response (in database)
   ↓
6. Return Response (conversation_id, response, tool_calls)
```

**Implementation**:
```python
async def chat_endpoint(user_id: str, request: ChatRequest):
    # 1. Receive request
    conversation_id = request.conversation_id
    message = request.message

    # 2. Fetch or create conversation
    if not conversation_id:
        conversation = await create_conversation(user_id)
        conversation_id = conversation.id

    # Fetch history (last 50 messages)
    messages = await get_conversation_history(conversation_id, user_id, limit=50)

    # 3. Store user message
    await store_message(conversation_id, user_id, "user", message)

    # 4. Run agent
    history = [{"role": m.role, "content": m.content} for m in messages]
    history.append({"role": "user", "content": message})

    agent_response = await run_agent(history, user_id)

    # 5. Store assistant response
    await store_message(conversation_id, user_id, "assistant", agent_response.content)

    # 6. Return response
    return {
        "conversation_id": conversation_id,
        "response": agent_response.content,
        "tool_calls": agent_response.tool_calls
    }
```

**Rationale**:
- Stateless: Server holds no state between requests
- Scalable: Any server instance can handle any request
- Resilient: Server restarts don't lose conversations
- Testable: Each request is independent

#### Database Query Optimization

**Decision**: Use indexes and query limits for performance

**Optimizations**:
```sql
-- Index on foreign keys
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- Query with limit
SELECT * FROM messages
WHERE conversation_id = ? AND user_id = ?
ORDER BY created_at DESC
LIMIT 50;
```

**Rationale**:
- Indexes: Fast lookups on user_id and conversation_id
- Limit: Prevents loading thousands of messages
- Order by created_at: Most recent messages first

#### Pagination Strategy

**Decision**: Implement cursor-based pagination for long conversations

**Pattern**:
```python
async def get_conversation_history(
    conversation_id: int,
    user_id: str,
    limit: int = 50,
    before_id: int | None = None
):
    query = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.user_id == user_id
    )

    if before_id:
        query = query.filter(Message.id < before_id)

    return query.order_by(Message.created_at.desc()).limit(limit).all()
```

**Rationale**:
- Cursor-based: More efficient than offset pagination
- Scalable: Works with large conversation histories
- Optional: Only implement if conversations exceed 50 messages

#### Caching Strategy

**Decision**: No caching for Phase III (keep it simple)

**Rationale**:
- Simplicity: Database queries are fast enough (< 100ms)
- Consistency: No cache invalidation complexity
- Future: Can add Redis caching in Phase V if needed

**Alternatives Considered**:
1. **Redis caching**: Adds complexity, not needed for 100 concurrent users
2. **In-memory caching**: Breaks stateless architecture
3. **CDN caching**: Not applicable for dynamic, user-specific data

---

## Research Area 5: Natural Language Understanding Patterns

### Research Question
How to design agent instructions and handle ambiguous inputs for task management?

### Findings

#### Agent Instruction Design

**Decision**: Provide clear, structured instructions with examples

**Instructions**:
```python
agent = Agent(
    name="TaskBot",
    instructions="""
You are a helpful task management assistant. You help users manage their todo tasks through natural language.

AVAILABLE TOOLS:
- add_task: Create a new task
- list_tasks: Show user's tasks (all, pending, or completed)
- complete_task: Mark a task as complete
- delete_task: Remove a task
- update_task: Modify a task's title or description

RESPONSE PATTERNS:
- Task creation: "✓ Added task: {title} (ID: {id})"
- Task listing: "Here are your {status} tasks:\n1. {title} (ID: {id})\n..."
- Task completion: "✓ Marked task as complete: {title} (ID: {id})"
- Task deletion: "✓ Deleted task: {title} (ID: {id})"
- Task update: "✓ Updated task: {title} (ID: {id})"
- Not found: "I couldn't find task {id}. Use 'show me all my tasks' to see your tasks."
- Ambiguous: "I found multiple tasks matching '{query}'. Which one did you mean?\n1. {title} (ID: {id})\n..."
- Error: "I couldn't understand that. Try saying 'Add a task to...' or 'Show me my tasks'."

EXAMPLES:
User: "Add a task to buy groceries"
You: Call add_task(title="Buy groceries"), then respond "✓ Added task: Buy groceries (ID: 42)"

User: "Show me all my tasks"
You: Call list_tasks(status="all"), then list tasks in readable format

User: "Mark task 3 as complete"
You: Call complete_task(task_id=3), then respond "✓ Marked task as complete: {title} (ID: 3)"

User: "I finished the groceries task"
You: Call list_tasks() to search for "groceries", then call complete_task() with the found task ID

Always be friendly, concise, and confirm actions taken.
""",
    model="gpt-4o"
)
```

**Rationale**:
- Clear expectations: Agent knows what tools are available
- Response patterns: Consistent, user-friendly responses
- Examples: Few-shot learning improves accuracy
- Error handling: Graceful fallbacks for unclear inputs

#### Handling Ambiguous Inputs

**Decision**: Implement multi-step tool calling for ambiguous references

**Pattern**:
```
User: "I finished the groceries task"
  ↓
Agent: Call list_tasks() to search for "groceries"
  ↓
Result: [{"id": 42, "title": "Buy groceries"}, {"id": 43, "title": "Put away groceries"}]
  ↓
Agent: Multiple matches found, ask user to clarify
  ↓
Response: "I found multiple tasks matching 'groceries'. Which one did you mean?
1. Buy groceries (ID: 42)
2. Put away groceries (ID: 43)"
```

**Rationale**:
- User-friendly: No need to remember task IDs
- Accurate: Prevents completing wrong task
- Conversational: Natural language interaction

#### Multi-Step Tool Call Patterns

**Decision**: Allow agent to chain tool calls within single request

**Example**:
```
User: "Delete all completed tasks"
  ↓
Agent:
  1. Call list_tasks(status="completed")
  2. For each task, call delete_task(task_id)
  ↓
Response: "✓ Deleted 3 completed tasks: Buy groceries (ID: 42), Call mom (ID: 43), Pay bills (ID: 44)"
```

**Rationale**:
- Powerful: Enables complex operations
- Efficient: Single request handles multiple actions
- Transparent: Response shows all actions taken

**Constraint**: Limit to 10 tool calls per request to prevent abuse

#### Error Recovery and Fallback Responses

**Decision**: Provide helpful fallback responses for unclear inputs

**Pattern**:
```python
# In agent instructions
"""
If you cannot understand the user's request:
1. Try to identify what they might be asking for
2. Suggest similar commands they could try
3. Provide examples of valid commands

Example:
User: "Do the thing"
You: "I couldn't understand that. Here are some things I can help with:
- 'Add a task to...' - Create a new task
- 'Show me my tasks' - List your tasks
- 'Mark task X as complete' - Complete a task
- 'Delete task X' - Remove a task
What would you like to do?"
"""
```

**Rationale**:
- User-friendly: Guides user to correct usage
- Educational: User learns valid commands
- Reduces frustration: Clear next steps

---

## Summary of Key Decisions

### Architecture
1. **Stateless Server**: No in-memory state, database-persisted conversations
2. **Agent + Runner Pattern**: OpenAI Agents SDK with MCP tools
3. **6-Step Request Cycle**: Fetch history → Store user message → Run agent → Store response → Return

### Technology Choices
1. **OpenAI Agents SDK**: Official framework for agent logic
2. **Official MCP SDK (Python)**: Type-safe tool definitions
3. **OpenAI ChatKit**: Pre-built chat UI for frontend
4. **Pydantic**: Schema validation for MCP tools
5. **PostgreSQL**: Database persistence for conversations and messages

### Performance
1. **Conversation History Limit**: Last 50 messages per request
2. **Database Indexing**: user_id, conversation_id, created_at
3. **Connection Pooling**: Max 10 connections per pod
4. **Rate Limiting**: 10 requests/minute per user

### Security
1. **JWT Authentication**: Required for all chat endpoints
2. **User Isolation**: All queries filter by authenticated user
3. **Input Validation**: Pydantic schemas, message length limits
4. **Secrets Management**: Environment variables for API keys

### Testing
1. **Unit Tests**: MCP tools tested independently (100% coverage)
2. **Integration Tests**: Chat endpoint + agent integration
3. **E2E Tests**: Full conversation flows

---

## Risks and Mitigations

### Identified Risks
1. **OpenAI API Rate Limits**: Implement request queuing and retry logic
2. **Conversation History Performance**: Limit to 50 messages, add pagination
3. **Natural Language Accuracy**: Clear agent instructions, diverse testing
4. **ChatKit Domain Allowlist**: Configure early, test on production domain

### No Blockers
All research questions have been answered. No technical blockers identified. Ready to proceed to Phase 1 (Design & Contracts).

---

## Next Steps

1. ✅ Phase 0 Complete: All research questions answered
2. **Phase 1**: Generate data-model.md, contracts/chat-api.yaml, quickstart.md
3. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh claude`
4. **Phase 2**: Run `/sp.tasks 003-phase-iii-chatbot` to generate tasks.md

---

**Status**: Phase 0 Complete
**Date**: 2026-01-15
**Next Phase**: Phase 1 (Design & Contracts)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
