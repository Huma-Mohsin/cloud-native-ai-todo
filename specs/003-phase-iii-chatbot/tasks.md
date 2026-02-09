# Implementation Tasks: Phase III AI-Powered Chatbot

**Feature**: 003-phase-iii-chatbot
**Branch**: `003-phase-iii-chatbot`
**Date**: 2026-01-15
**Status**: Ready for Implementation

---

## Overview

This document contains implementation tasks for Phase III AI-Powered Chatbot feature. Tasks are organized by user story to enable independent implementation and testing. The feature adds natural language task management capabilities using OpenAI Agents SDK with MCP (Model Context Protocol) server.

**Key Architecture:**
- Stateless server with database-persisted conversations
- OpenAI Agents SDK (agent + runner pattern)
- MCP server with 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)
- OpenAI ChatKit for frontend UI
- PostgreSQL for conversation and message storage

**Testing Approach:**
- TDD (Test-Driven Development) required
- 80%+ backend coverage target
- 100% MCP tools coverage target
- Tests written before implementation

---

## Task Summary

**Total Tasks**: 67
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational - US-6): 10 tasks
- Phase 3 (US-1 Task Creation): 8 tasks
- Phase 4 (US-2 Task Listing): 7 tasks
- Phase 5 (US-3 Task Completion): 7 tasks
- Phase 6 (US-4 Task Deletion): 7 tasks
- Phase 7 (US-5 Task Updates): 7 tasks
- Phase 8 (US-7 Error Handling): 6 tasks
- Phase 9 (Frontend Integration): 8 tasks
- Phase 10 (Polish & E2E): 2 tasks

**Parallel Opportunities**: 35 tasks marked [P] can be executed in parallel within their phase

---

## Phase 1: Setup & Dependencies

**Goal**: Install dependencies, configure environment, and run database migration

**Duration**: 30 minutes

### Tasks

- [X] T001 Install backend dependencies in backend/requirements.txt (openai-agents-sdk, mcp-sdk, pydantic)
- [X] T002 Install frontend dependencies in frontend/package.json (@openai/chatkit)
- [ ] T003 Add OpenAI API key to backend/.env (OPENAI_API_KEY, OPENAI_MODEL)
- [X] T004 Run database migration backend/migrations/003_add_chat_tables.sql
- [X] T005 Verify migration created conversations and messages tables with indexes

**Acceptance Criteria:**
- ✅ All dependencies installed without errors
- ✅ Database migration completed successfully
- ✅ Tables `conversations` and `messages` exist with proper indexes
- ✅ Environment variables configured

---

## Phase 2: Foundational - US-6 Conversation Persistence

**User Story**: US-6 - Conversation Persistence
**Goal**: Implement database models and services for conversation persistence
**Priority**: P0 (Blocking - required by all other user stories)

**Acceptance Criteria:**
- ✅ Conversations persist across browser sessions
- ✅ User can see previous messages when returning
- ✅ Server restart doesn't lose conversation history
- ✅ Each user has separate conversation history

### Tasks

- [ ] T006 [P] [US6] Write unit tests for Conversation model in backend/tests/unit/test_conversation.py
- [ ] T007 [P] [US6] Write unit tests for Message model in backend/tests/unit/test_message.py
- [X] T008 [US6] Create Conversation SQLModel in backend/src/models/conversation.py
- [X] T009 [US6] Create Message SQLModel with MessageRole enum in backend/src/models/message.py
- [ ] T010 [P] [US6] Write integration tests for conversation CRUD in backend/tests/integration/test_conversation_crud.py
- [X] T011 [US6] Implement get_conversation_history() in backend/src/services/chat_service.py
- [X] T012 [US6] Implement create_conversation() in backend/src/services/chat_service.py
- [X] T013 [US6] Implement store_message() in backend/src/services/chat_service.py
- [X] T014 [US6] Implement list_user_conversations() in backend/src/services/chat_service.py
- [ ] T015 [US6] Run tests and verify 100% coverage for conversation models

**Dependencies**: Phase 1 complete

---

## Phase 3: US-1 Natural Language Task Creation

**User Story**: US-1 - Natural Language Task Creation
**Goal**: Implement add_task MCP tool and agent integration for task creation
**Priority**: P1 (MVP - Core functionality)

**Acceptance Criteria:**
- ✅ User can say "Add a task to buy groceries" and task is created
- ✅ User can say "I need to remember to call mom" and task is created
- ✅ User can include descriptions: "Add task: Buy groceries - milk, eggs, bread"
- ✅ Chatbot confirms task creation with task ID and title
- ✅ Task is associated with authenticated user

### Tasks

- [X] T016 [P] [US1] Write unit tests for add_task MCP tool in backend/tests/unit/test_mcp_tools.py
- [X] T017 [P] [US1] Create AddTaskInput Pydantic schema in backend/src/mcp/schemas.py
- [X] T018 [P] [US1] Create AddTaskOutput Pydantic schema in backend/src/mcp/schemas.py
- [X] T019 [US1] Implement add_task MCP tool handler in backend/src/mcp/tools/add_task.py
- [X] T020 [US1] Register add_task tool in MCP server in backend/src/mcp/server.py
- [ ] T021 [P] [US1] Write integration tests for add_task tool in backend/tests/integration/test_mcp_add_task.py
- [ ] T022 [US1] Test add_task tool with agent in backend/tests/integration/test_agent_mcp.py
- [ ] T023 [US1] Run tests and verify 100% coverage for add_task tool

**Dependencies**: Phase 2 complete

**Independent Test**: Create task via chat, verify task exists in database with correct user_id

---

## Phase 4: US-2 Natural Language Task Listing

**User Story**: US-2 - Natural Language Task Listing
**Goal**: Implement list_tasks MCP tool for viewing tasks
**Priority**: P1 (MVP - Core functionality)

**Acceptance Criteria:**
- ✅ User can say "Show me all my tasks" to see all tasks
- ✅ User can say "What's pending?" to see incomplete tasks
- ✅ User can say "What have I completed?" to see completed tasks
- ✅ Chatbot displays tasks in readable format with IDs
- ✅ Only user's own tasks are shown

### Tasks

- [X] T024 [P] [US2] Write unit tests for list_tasks MCP tool in backend/tests/unit/test_mcp_tools.py
- [X] T025 [P] [US2] Create ListTasksInput Pydantic schema in backend/src/mcp/schemas.py
- [X] T026 [P] [US2] Create ListTasksOutput Pydantic schema in backend/src/mcp/schemas.py
- [X] T027 [US2] Implement list_tasks MCP tool handler in backend/src/mcp/tools/list_tasks.py
- [X] T028 [US2] Register list_tasks tool in MCP server in backend/src/mcp/server.py
- [ ] T029 [P] [US2] Write integration tests for list_tasks tool in backend/tests/integration/test_mcp_list_tasks.py
- [ ] T030 [US2] Run tests and verify 100% coverage for list_tasks tool

**Dependencies**: Phase 2 complete (independent of Phase 3)

**Independent Test**: List tasks via chat, verify only authenticated user's tasks are returned

---

## Phase 5: US-3 Natural Language Task Completion

**User Story**: US-3 - Natural Language Task Completion
**Goal**: Implement complete_task MCP tool for marking tasks complete
**Priority**: P1 (MVP - Core functionality)

**Acceptance Criteria:**
- ✅ User can say "Mark task 3 as complete"
- ✅ User can say "I finished the groceries task" (searches by title)
- ✅ Chatbot confirms completion with task details
- ✅ Task status updates in database

### Tasks

- [X] T031 [P] [US3] Write unit tests for complete_task MCP tool in backend/tests/unit/test_mcp_tools.py
- [X] T032 [P] [US3] Create CompleteTaskInput Pydantic schema in backend/src/mcp/schemas.py
- [X] T033 [P] [US3] Create CompleteTaskOutput Pydantic schema in backend/src/mcp/schemas.py
- [X] T034 [US3] Implement complete_task MCP tool handler in backend/src/mcp/tools/complete_task.py
- [X] T035 [US3] Register complete_task tool in MCP server in backend/src/mcp/server.py
- [ ] T036 [P] [US3] Write integration tests for complete_task tool in backend/tests/integration/test_mcp_complete_task.py
- [ ] T037 [US3] Run tests and verify 100% coverage for complete_task tool

**Dependencies**: Phase 2 complete (independent of Phase 3 and 4)

**Independent Test**: Complete task via chat, verify task.completed = true in database

---

## Phase 6: US-4 Natural Language Task Deletion

**User Story**: US-4 - Natural Language Task Deletion
**Goal**: Implement delete_task MCP tool for removing tasks
**Priority**: P2 (Important but not MVP)

**Acceptance Criteria:**
- ✅ User can say "Delete task 5"
- ✅ User can say "Remove the meeting task" (searches by title)
- ✅ Chatbot confirms deletion with task details
- ✅ Task is removed from database

### Tasks

- [X] T038 [P] [US4] Write unit tests for delete_task MCP tool in backend/tests/unit/test_mcp_tools.py
- [X] T039 [P] [US4] Create DeleteTaskInput Pydantic schema in backend/src/mcp/schemas.py
- [X] T040 [P] [US4] Create DeleteTaskOutput Pydantic schema in backend/src/mcp/schemas.py
- [X] T041 [US4] Implement delete_task MCP tool handler in backend/src/mcp/tools/delete_task.py
- [X] T042 [US4] Register delete_task tool in MCP server in backend/src/mcp/server.py
- [ ] T043 [P] [US4] Write integration tests for delete_task tool in backend/tests/integration/test_mcp_delete_task.py
- [ ] T044 [US4] Run tests and verify 100% coverage for delete_task tool

**Dependencies**: Phase 2 complete (independent of Phase 3, 4, and 5)

**Independent Test**: Delete task via chat, verify task no longer exists in database

---

## Phase 7: US-5 Natural Language Task Updates

**User Story**: US-5 - Natural Language Task Updates
**Goal**: Implement update_task MCP tool for modifying tasks
**Priority**: P2 (Important but not MVP)

**Acceptance Criteria:**
- ✅ User can say "Change task 1 to 'Call mom tonight'"
- ✅ User can say "Update the groceries task description to include fruits"
- ✅ Chatbot confirms update with new details
- ✅ Task updates in database

### Tasks

- [X] T045 [P] [US5] Write unit tests for update_task MCP tool in backend/tests/unit/test_mcp_tools.py
- [X] T046 [P] [US5] Create UpdateTaskInput Pydantic schema in backend/src/mcp/schemas.py
- [X] T047 [P] [US5] Create UpdateTaskOutput Pydantic schema in backend/src/mcp/schemas.py
- [X] T048 [US5] Implement update_task MCP tool handler in backend/src/mcp/tools/update_task.py
- [X] T049 [US5] Register update_task tool in MCP server in backend/src/mcp/server.py
- [ ] T050 [P] [US5] Write integration tests for update_task tool in backend/tests/integration/test_mcp_update_task.py
- [ ] T051 [US5] Run tests and verify 100% coverage for update_task tool

**Dependencies**: Phase 2 complete (independent of Phase 3, 4, 5, and 6)

**Independent Test**: Update task via chat, verify task title/description changed in database

---

## Phase 8: US-7 Error Handling & Agent Integration

**User Story**: US-7 - Error Handling
**Goal**: Implement agent service with comprehensive error handling
**Priority**: P1 (MVP - Required for production)

**Acceptance Criteria:**
- ✅ "Task not found" when referencing invalid task ID
- ✅ "Please specify which task" when ambiguous
- ✅ "I couldn't understand that" for unclear requests
- ✅ Friendly, conversational error messages

### Tasks

- [ ] T052 [P] [US7] Write integration tests for chat endpoint in backend/tests/integration/test_chat_endpoint.py
- [X] T053 [US7] Initialize MCP server with all 5 tools in backend/src/mcp/server.py
- [X] T054 [US7] Create agent with instructions in backend/src/services/agent_service.py
- [X] T055 [US7] Implement run_agent() with error handling in backend/src/services/agent_service.py (rule-based fallback agent)
- [X] T056 [US7] Implement chat endpoint POST /api/{user_id}/chat in backend/src/api/routes/chat.py
- [ ] T057 [US7] Add rate limiting (10 req/min) to chat endpoint in backend/src/api/routes/chat.py

**Dependencies**: Phase 2, 3, 4, 5, 6, 7 complete (needs all MCP tools)

**Independent Test**: Send invalid requests, verify friendly error messages returned

---

## Phase 9: Frontend Integration

**Goal**: Implement OpenAI ChatKit UI and connect to backend API
**Priority**: P1 (MVP - User interface)

### Tasks

- [X] T058 [P] Write unit tests for chatService in frontend/tests/unit/chat/chatService.test.ts
- [X] T059 [P] Write unit tests for useChat hook in frontend/tests/unit/chat/useChat.test.ts
- [X] T060 [P] Write unit tests for ChatInterface in frontend/tests/unit/chat/ChatInterface.test.tsx
- [X] T061 [P] Create ChatService API client in frontend/src/services/chatService.ts
- [X] T062 [P] Create useChat hook for state management in frontend/src/hooks/useChat.ts
- [X] T063 Create ChatMessage component in frontend/src/components/chat/ChatMessage.tsx
- [X] T064 Create ChatInterface with Better Auth integration in frontend/components/chat/ChatInterface.tsx
- [X] T065 Create chat page in frontend/app/chat/page.tsx

**Dependencies**: Phase 8 complete (needs working chat endpoint)

**Independent Test**: Open chat page, send message, verify response displayed

---

## Phase 10: Polish & E2E Testing

**Goal**: End-to-end testing and production readiness
**Priority**: P1 (MVP - Quality assurance)

### Tasks

- [ ] T066 Write E2E tests for conversation flows in backend/tests/e2e/test_chat_flows.py
- [ ] T067 Run full test suite and verify 80%+ backend coverage, 100% MCP tools coverage

**Dependencies**: All previous phases complete

**Acceptance Criteria:**
- ✅ All E2E tests passing
- ✅ 80%+ backend test coverage
- ✅ 100% MCP tools test coverage
- ✅ All user stories verified working end-to-end

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

1. **Phase 1** (Setup) → Blocks all other phases
2. **Phase 2** (US-6 Foundational) → Blocks Phase 3-8
3. **Phase 3-7** (US-1 through US-5) → Can run in parallel, blocks Phase 8
4. **Phase 8** (US-7 Agent Integration) → Blocks Phase 9
5. **Phase 9** (Frontend) → Blocks Phase 10
6. **Phase 10** (E2E Testing) → Final phase

### Parallel Execution Opportunities

**After Phase 2 completes, these can run in parallel:**
- Phase 3 (US-1 Task Creation) - 8 tasks
- Phase 4 (US-2 Task Listing) - 7 tasks
- Phase 5 (US-3 Task Completion) - 7 tasks
- Phase 6 (US-4 Task Deletion) - 7 tasks
- Phase 7 (US-5 Task Updates) - 7 tasks

**Total parallel tasks**: 36 tasks can execute simultaneously

**Within each phase, tasks marked [P] can run in parallel:**
- Test writing tasks (different test files)
- Schema creation tasks (different schemas)
- Tool implementation tasks (different tools)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended MVP**: Phase 1, 2, 3, 4, 8, 9 (Core chat with create and list)

**MVP User Stories:**
- US-6: Conversation Persistence (foundational)
- US-1: Natural Language Task Creation
- US-2: Natural Language Task Listing
- US-7: Error Handling (production requirement)

**MVP Deliverables:**
- Working chat interface
- Create tasks via natural language
- List tasks via natural language
- Conversation persistence
- Error handling

**Estimated Time**: 8-10 hours with custom skills (`/sp.mcp-gen`, `/sp.test-suite`)

### Full Feature Scope

**All User Stories**: US-1 through US-7

**Additional Features Beyond MVP:**
- US-3: Task Completion
- US-4: Task Deletion
- US-5: Task Updates

**Estimated Time**: 15-20 hours with custom skills

### Incremental Delivery Plan

**Week 1 (MVP)**:
- Day 1-2: Phase 1, 2 (Setup + Foundational)
- Day 3-4: Phase 3, 4 (Create + List tasks)
- Day 5: Phase 8, 9 (Agent + Frontend)
- Day 6: Phase 10 (Testing)
- Day 7: Buffer + Demo

**Week 2 (Full Feature)**:
- Day 1: Phase 5 (Task Completion)
- Day 2: Phase 6 (Task Deletion)
- Day 3: Phase 7 (Task Updates)
- Day 4-5: Polish, optimization, additional testing
- Day 6-7: Production deployment + demo video

---

## Testing Strategy

### Test Coverage Targets

**Backend:**
- Overall: 80%+ coverage
- MCP Tools: 100% coverage (critical functionality)
- Models: 100% coverage
- Services: 90%+ coverage
- API Endpoints: 100% coverage

**Frontend:**
- Overall: 70%+ coverage
- Components: 80%+ coverage
- Services: 90%+ coverage
- Hooks: 90%+ coverage

### Test Types

**Unit Tests** (backend/tests/unit/):
- test_mcp_tools.py: All 5 MCP tools (100% coverage)
- test_conversation.py: Conversation model CRUD
- test_message.py: Message model CRUD

**Integration Tests** (backend/tests/integration/):
- test_chat_endpoint.py: Chat API endpoint
- test_agent_mcp.py: Agent + MCP tool integration
- test_mcp_*.py: Individual MCP tool integration

**E2E Tests** (backend/tests/e2e/):
- test_chat_flows.py: Full conversation flows
  - Create task flow
  - List tasks flow
  - Complete task flow
  - Delete task flow
  - Update task flow
  - Conversation persistence flow

**Frontend Tests** (frontend/tests/unit/chat/):
- ChatInterface.test.tsx: ChatKit component
- chatService.test.ts: API client
- useChat.test.ts: State management hook

---

## Performance Targets

**Response Times:**
- Chat endpoint: < 2s (p95) including AI processing
- MCP tool execution: < 200ms (p95)
- Database queries: < 100ms (p95)

**Scalability:**
- Support 100+ concurrent users
- Support 1000+ messages per conversation
- Support 10,000+ tasks per user

**Resource Limits:**
- Backend pods: 512MB memory, 1 CPU
- Database connections: Max 10 per pod

---

## Security Checklist

- [ ] JWT authentication required for all chat endpoints
- [ ] User ID in token matches {user_id} in URL path
- [ ] All database queries filter by authenticated user's ID
- [ ] Message content sanitized (XSS prevention)
- [ ] Message length limited to 2000 characters
- [ ] Rate limiting: 10 requests/minute per user
- [ ] OpenAI API key in environment variable (not in code)
- [ ] Database credentials in environment variable
- [ ] Input validation with Pydantic schemas

---

## Deployment Checklist

- [ ] Database migration 003_add_chat_tables.sql applied
- [ ] Environment variables configured (OPENAI_API_KEY, DATABASE_URL)
- [ ] OpenAI domain allowlist configured for production
- [ ] Backend deployed with MCP server
- [ ] Frontend deployed with ChatKit
- [ ] Health check endpoint working
- [ ] Monitoring and logging configured
- [ ] All tests passing (80%+ coverage)

---

## Custom Skills Usage

**Recommended Skills to Accelerate Implementation:**

1. **`/sp.mcp-gen`** - MCP Server Generator
   - Generates: MCP server, 5 tools, schemas, models, services, endpoint
   - Time saved: 8-10 hours
   - Use after: Phase 1 complete

2. **`/sp.test-suite`** - Testing Automation
   - Generates: Unit tests, integration tests, E2E tests
   - Time saved: 6-8 hours
   - Use after: Phase 1 complete

**Total Time Saved**: 14-18 hours

**With Custom Skills**: 15-20 hours total
**Without Custom Skills**: 34-43 hours total

---

## Success Criteria

### Functional Requirements

- ✅ User can create tasks via natural language
- ✅ User can list tasks via natural language
- ✅ User can complete tasks via natural language
- ✅ User can delete tasks via natural language
- ✅ User can update tasks via natural language
- ✅ Conversations persist across sessions
- ✅ Server is stateless (no in-memory state)
- ✅ Errors are handled gracefully with friendly messages

### Technical Requirements

- ✅ All 5 MCP tools implemented and tested (100% coverage)
- ✅ Chat endpoint is stateless
- ✅ Conversation state persists in database
- ✅ Authentication and authorization working
- ✅ 80%+ backend test coverage
- ✅ Response times meet targets (< 2s chat, < 200ms tools)

### Quality Requirements

- ✅ Code follows constitution standards
- ✅ All tests passing
- ✅ No security vulnerabilities
- ✅ Documentation complete
- ✅ Demo video under 90 seconds

---

## Next Steps

1. **Start Implementation**: Begin with Phase 1 (Setup)
2. **Use Custom Skills**: Run `/sp.mcp-gen` after Phase 1 to generate MCP server and tools
3. **Follow TDD**: Write tests before implementation for each user story
4. **Test Incrementally**: Verify each phase works before moving to next
5. **Deploy MVP**: Deploy Phase 1-4, 8-9 for early feedback
6. **Complete Full Feature**: Add Phase 5-7 for complete functionality

**Ready to start?** Run `/sp.implement` to begin implementation! 🚀

---

**Status**: Tasks Ready for Implementation
**Total Tasks**: 67
**Estimated Time**: 15-20 hours (with custom skills)
**Points**: 200 (Phase III completion)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
