---
description: Generate MCP (Model Context Protocol) server tools from specifications for AI agent integration
handoffs:
  - label: Implement Generated MCP Tools
    agent: sp.implement
    prompt: Implement the generated MCP tools
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

This skill automates the creation of MCP server tools that expose your application's functionality to AI agents. It generates:
- MCP tool definitions with proper schemas
- FastAPI endpoint integration
- Type-safe tool handlers
- OpenAI Agents SDK compatible tools

## Outline

1. **Setup and Context Loading**:
   - Run `.specify/scripts/bash/check-prerequisites.sh --json --include-spec` from repo root
   - Parse FEATURE_DIR, FEATURE_SPEC paths
   - Read the feature specification to understand required operations
   - Read plan.md to understand the tech stack and architecture
   - Read data-model.md (if exists) to understand entities

2. **Analyze Required MCP Tools**:
   - Extract all user actions from the spec (CRUD operations, queries, commands)
   - Map each action to an MCP tool:
     - Tool name (snake_case, e.g., `add_task`, `list_tasks`)
     - Tool description (clear, concise purpose)
     - Input parameters (with types and validation rules)
     - Output schema (return type and structure)
   - Identify common patterns (CRUD, search, filter, etc.)

3. **Generate MCP Tool Definitions**:
   - Create `FEATURE_DIR/mcp-tools.md` with:
     ```markdown
     # MCP Tools for [Feature Name]

     ## Tool: tool_name

     **Purpose**: Brief description

     **Parameters**:
     - param_name (type, required/optional): Description

     **Returns**: Return type and structure

     **Example Input**: JSON example

     **Example Output**: JSON example

     **Error Handling**: Common errors and responses
     ```
   - Generate one section per tool
   - Include authentication requirements (user_id parameter)
   - Document error cases

4. **Generate Python MCP Server Code**:
   - Create `backend/mcp_server.py` with:
     - Import Official MCP SDK: `from mcp.server import Server`
     - Import tool decorators and types
     - Define tool handler functions
     - Implement input validation
     - Connect to database/services
     - Return structured responses

   - Code structure:
     ```python
     from mcp.server import Server
     from mcp.types import Tool, TextContent
     from pydantic import BaseModel, Field

     # Tool input schemas
     class AddTaskInput(BaseModel):
         user_id: str = Field(..., description="User ID")
         title: str = Field(..., min_length=1, max_length=200)
         description: str | None = Field(None, max_length=1000)

     # Initialize MCP server
     mcp_server = Server("todo-mcp-server")

     # Tool handlers
     @mcp_server.tool()
     async def add_task(input: AddTaskInput) -> dict:
         """Create a new task"""
         # Implementation
         return {"task_id": id, "status": "created", "title": title}
     ```

5. **Generate FastAPI Integration**:
   - Create `backend/routes/mcp_routes.py`:
     - Endpoint to list available MCP tools: `GET /api/mcp/tools`
     - Endpoint to invoke MCP tools: `POST /api/mcp/invoke`
     - Authentication middleware integration
     - Error handling and logging

   - Integration with OpenAI Agents SDK:
     ```python
     from fastapi import APIRouter, Depends
     from openai import OpenAI

     router = APIRouter(prefix="/api/mcp", tags=["mcp"])

     @router.get("/tools")
     async def list_mcp_tools():
         """Return list of available MCP tools"""
         return mcp_server.list_tools()

     @router.post("/invoke")
     async def invoke_mcp_tool(tool_name: str, arguments: dict):
         """Invoke an MCP tool by name"""
         return await mcp_server.call_tool(tool_name, arguments)
     ```

6. **Generate OpenAI Agents SDK Integration**:
   - Create `backend/agents/todo_agent.py`:
     - Configure OpenAI Agent with MCP tools
     - Set up agent instructions
     - Implement conversation handler

   - Code structure:
     ```python
     from openai import OpenAI
     from agents import Agent

     # Convert MCP tools to OpenAI function format
     def mcp_to_openai_tools(mcp_tools):
         return [
             {
                 "type": "function",
                 "function": {
                     "name": tool.name,
                     "description": tool.description,
                     "parameters": tool.input_schema
                 }
             }
             for tool in mcp_tools
         ]

     # Create agent with MCP tools
     agent = Agent(
         name="Todo Assistant",
         instructions="You help users manage their todo list...",
         tools=mcp_to_openai_tools(mcp_server.list_tools())
     )
     ```

7. **Generate Type Definitions**:
   - Create `backend/types/mcp_types.py`:
     - Pydantic models for all tool inputs
     - Response schemas
     - Error types
   - Ensure type safety across the stack

8. **Generate Tests**:
   - Create `backend/tests/test_mcp_tools.py`:
     - Unit tests for each MCP tool
     - Test input validation
     - Test error handling
     - Test authentication
   - Use pytest with async support

9. **Generate Documentation**:
   - Create `FEATURE_DIR/mcp-integration.md`:
     - How to use the MCP server
     - Tool reference documentation
     - Example conversations
     - Troubleshooting guide

10. **Output Summary**:
    - List all generated files with absolute paths
    - Show tool count and names
    - Provide next steps (run tests, integrate with frontend)
    - Suggest handoff to sp.implement if needed

## Key Rules

- **Stateless Design**: All MCP tools must be stateless (no in-memory state)
- **Database Integration**: Tools interact with database for persistence
- **Authentication**: Every tool requires user_id parameter for multi-user support
- **Error Handling**: Return structured errors with clear messages
- **Type Safety**: Use Pydantic models for all inputs/outputs
- **Documentation**: Generate comprehensive docs for each tool
- **Testing**: Create tests for all tools before implementation

## Technology Stack

- **MCP SDK**: Official Python MCP SDK (`mcp` package)
- **FastAPI**: REST API framework
- **OpenAI Agents SDK**: AI agent orchestration
- **Pydantic**: Data validation and serialization
- **SQLModel**: Database ORM
- **Pytest**: Testing framework

## Example Output Structure

```
backend/
├── mcp_server.py              # MCP server with tool definitions
├── routes/
│   └── mcp_routes.py          # FastAPI endpoints for MCP
├── agents/
│   └── todo_agent.py          # OpenAI Agent configuration
├── types/
│   └── mcp_types.py           # Type definitions
└── tests/
    └── test_mcp_tools.py      # MCP tool tests

specs/[feature]/
├── mcp-tools.md               # Tool specifications
└── mcp-integration.md         # Integration documentation
```

## Validation Checklist

Before completing, verify:
- [ ] All CRUD operations from spec have corresponding MCP tools
- [ ] Each tool has proper input validation
- [ ] Authentication is enforced (user_id parameter)
- [ ] Error handling is comprehensive
- [ ] Type definitions are complete
- [ ] Tests cover all tools
- [ ] Documentation is clear and complete
- [ ] Integration with OpenAI Agents SDK is configured

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: plan (for MCP tool design) or misc (for general MCP generation)

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - Feature stages → `history/prompts/<feature-name>/`
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.
