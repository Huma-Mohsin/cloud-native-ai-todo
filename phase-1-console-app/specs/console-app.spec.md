# Feature Specification: Phase I - In-Memory Python Console Todo App

**Feature Branch**: `phase-1-console-app`
**Created**: 2025-12-31
**Status**: Draft
**Phase**: Phase I - Hackathon II
**Points**: 100
**Due Date**: December 7, 2025

## Overview

Build a command-line todo application that stores tasks in memory using Python 3.13+, UV package manager, and spec-driven development with Claude Code. This is the foundation phase that implements the 5 Basic Level features which will be carried forward to all subsequent phases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add New Task (Priority: P1)

As a user, I want to add new tasks to my todo list so that I can keep track of things I need to do.

**Why this priority**: Creating tasks is the fundamental action - without this, the app has no purpose. This is the MVP core.

**Independent Test**: Can be fully tested by launching the app, selecting "Add Task", entering task details, and verifying the task appears in the list. Delivers immediate value by allowing task capture.

**Acceptance Scenarios**:

1. **Given** I am at the main menu, **When** I select "Add Task" and enter title "Buy groceries" and description "Milk, eggs, bread", **Then** a new task is created with ID 1, status "Pending", and the task appears in the list
2. **Given** I have 3 existing tasks, **When** I add a new task with title "Call doctor", **Then** the task is assigned ID 4 and added to the list
3. **Given** I am adding a task, **When** I provide only a title "Pay bills" without description, **Then** the task is created successfully with empty description
4. **Given** I am adding a task, **When** I enter a title with 200 characters, **Then** the task is created successfully
5. **Given** I am adding a task, **When** I try to create a task without a title, **Then** I receive an error "Title is required" and task is not created

---

### User Story 2 - View All Tasks (Priority: P1)

As a user, I want to view all my tasks in a clear list so that I can see what I need to do.

**Why this priority**: Viewing tasks is essential - users need to see what they've captured. Equal priority with Add Task for MVP.

**Independent Test**: Can be tested by pre-populating a few tasks in memory and selecting "View Tasks". Verifies display format, status indicators, and readability.

**Acceptance Scenarios**:

1. **Given** I have 3 tasks in my list, **When** I select "View Tasks", **Then** I see all 3 tasks displayed with ID, title, description, and status (Pending/Completed)
2. **Given** I have no tasks, **When** I select "View Tasks", **Then** I see the message "No tasks found. Add your first task!"
3. **Given** I have tasks with both Pending and Completed status, **When** I view the list, **Then** I can clearly distinguish between Pending (e.g., "[ ]") and Completed (e.g., "[✓]") tasks
4. **Given** I have a task with a long description (500 chars), **When** I view tasks, **Then** the description is displayed without truncation or wrapping issues

---

### User Story 3 - Mark Task as Complete (Priority: P2)

As a user, I want to mark tasks as complete so that I can track my progress.

**Why this priority**: Completing tasks provides satisfaction and progress tracking. Depends on Add and View, hence P2.

**Independent Test**: Can be tested by adding a task, marking it complete, and verifying the status changes in the list.

**Acceptance Scenarios**:

1. **Given** I have a pending task with ID 2, **When** I select "Mark Complete" and enter ID 2, **Then** the task status changes to "Completed" and displays with "[✓]" indicator
2. **Given** I have a completed task with ID 3, **When** I select "Mark Complete" and enter ID 3 again, **Then** the task status toggles back to "Pending" with "[ ]" indicator
3. **Given** I select "Mark Complete", **When** I enter a task ID that doesn't exist (e.g., 999), **Then** I receive an error "Task with ID 999 not found"
4. **Given** I have an empty task list, **When** I try to mark a task complete, **Then** I receive an error "No tasks available"

---

### User Story 4 - Update Task Details (Priority: P3)

As a user, I want to update task titles and descriptions so that I can correct mistakes or add more information.

**Why this priority**: Updating is valuable but not critical for MVP. Users can work around by deleting and re-adding.

**Independent Test**: Can be tested by creating a task, updating its title/description, and verifying the changes persist.

**Acceptance Scenarios**:

1. **Given** I have a task with ID 1, title "Buy groceries", **When** I select "Update Task", enter ID 1, and change title to "Buy groceries and snacks", **Then** the task title is updated and displayed correctly
2. **Given** I have a task with ID 2, **When** I update only the description to "Updated description", **Then** the title remains unchanged and description is updated
3. **Given** I have a task with ID 3, **When** I update both title and description, **Then** both fields are updated successfully
4. **Given** I select "Update Task", **When** I enter a non-existent task ID (e.g., 500), **Then** I receive an error "Task with ID 500 not found"
5. **Given** I am updating a task, **When** I try to set an empty title, **Then** I receive an error "Title cannot be empty" and the update is rejected

---

### User Story 5 - Delete Task (Priority: P3)

As a user, I want to delete tasks I no longer need so that my list stays clean and relevant.

**Why this priority**: Deletion is useful but not essential for initial MVP. Users can ignore unwanted tasks.

**Independent Test**: Can be tested by creating multiple tasks, deleting one, and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** I have 5 tasks, **When** I select "Delete Task" and enter ID 3, **Then** task 3 is removed and I see "Task 3 deleted successfully"
2. **Given** I delete a task with ID 2, **When** I view the task list, **Then** task 2 no longer appears
3. **Given** I select "Delete Task", **When** I enter a non-existent task ID (e.g., 100), **Then** I receive an error "Task with ID 100 not found"
4. **Given** I have 1 task remaining, **When** I delete it, **Then** the list becomes empty and shows "No tasks found"
5. **Given** I have deleted a task with ID 3, **When** I add a new task, **Then** the new task gets the next available ID (not reusing deleted IDs)

---

### Edge Cases

- What happens when a user enters non-numeric input for task ID? → Display error "Invalid input. Please enter a numeric task ID"
- What happens when a task title exceeds 200 characters? → Display error "Title must be 200 characters or less"
- What happens when a task description exceeds 1000 characters? → Display error "Description must be 1000 characters or less"
- What happens when user presses Ctrl+C during operation? → Gracefully exit with message "Goodbye!"
- What happens when user selects an invalid menu option? → Display error "Invalid option. Please select 1-6"
- How does the system handle empty input when prompted? → Re-prompt user with clear instructions
- What happens when the app is restarted? → All tasks are lost (in-memory storage, expected behavior for Phase I)

## Requirements *(mandatory)*

### Functional Requirements

#### Core Operations

- **FR-001**: System MUST allow users to add new tasks with a title (required) and description (optional)
- **FR-002**: System MUST display all tasks with ID, title, description, and completion status
- **FR-003**: System MUST allow users to toggle task completion status (Pending ↔ Completed)
- **FR-004**: System MUST allow users to update existing task title and/or description
- **FR-005**: System MUST allow users to delete tasks by ID
- **FR-006**: System MUST assign unique auto-incrementing integer IDs to tasks starting from 1
- **FR-007**: System MUST NOT reuse deleted task IDs

#### Validation

- **FR-008**: System MUST validate that task titles are not empty
- **FR-009**: System MUST validate that task titles do not exceed 200 characters
- **FR-010**: System MUST validate that task descriptions do not exceed 1000 characters
- **FR-011**: System MUST validate that task IDs exist before update/delete/complete operations
- **FR-012**: System MUST validate that menu selections are valid options (1-6)
- **FR-013**: System MUST validate that task ID inputs are numeric

#### User Interface

- **FR-014**: System MUST display a main menu with 6 options: Add Task, View Tasks, Update Task, Delete Task, Mark Complete, Exit
- **FR-015**: System MUST show clear visual distinction between Pending "[ ]" and Completed "[✓]" tasks
- **FR-016**: System MUST display confirmation messages after successful operations (e.g., "Task added successfully")
- **FR-017**: System MUST display clear error messages for invalid operations
- **FR-018**: System MUST return to main menu after each operation
- **FR-019**: System MUST allow graceful exit via menu option or Ctrl+C

#### Data Storage

- **FR-020**: System MUST store all tasks in memory (Python list/dict)
- **FR-021**: System MUST NOT persist tasks to disk (Phase I constraint)
- **FR-022**: System MUST initialize with an empty task list on startup

### Key Entities

- **Task**: Represents a todo item with the following attributes:
  - `id`: Unique integer identifier (auto-generated, sequential)
  - `title`: String, required, max 200 characters
  - `description`: String, optional, max 1000 characters
  - `completed`: Boolean, default False (Pending)
  - `created_at`: Timestamp when task was created
  - `updated_at`: Timestamp when task was last modified

- **TaskList**: In-memory collection of tasks
  - Stores all active tasks
  - Provides CRUD operations
  - Maintains next available ID counter

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can add a task in under 10 seconds from menu selection
- **SC-002**: User can view all tasks instantly (< 0.1 second response time for lists up to 100 tasks)
- **SC-003**: User can complete an entire workflow (Add → View → Mark Complete → Delete) in under 30 seconds
- **SC-004**: System handles invalid inputs gracefully with clear error messages (100% of error cases)
- **SC-005**: All 5 Basic Level features work correctly as demonstrated in acceptance scenarios
- **SC-006**: Code passes all unit tests with minimum 80% code coverage
- **SC-007**: Code passes ruff linting with zero warnings
- **SC-008**: Code passes mypy type checking in strict mode with zero errors
- **SC-009**: Application can be run with single command: `python -m todo_app`
- **SC-010**: First-time setup (uv venv, install dependencies, run app) takes under 5 minutes

### User Experience

- **SC-011**: User never sees Python stack traces for expected errors (validation, invalid IDs)
- **SC-012**: Menu is readable and self-explanatory without external documentation
- **SC-013**: All prompts clearly indicate what input is expected (e.g., "Enter task ID:", "Enter task title:")
- **SC-014**: User can exit the application cleanly at any time

### Code Quality

- **SC-015**: All functions have type hints and Google-style docstrings
- **SC-016**: Code follows single responsibility principle (functions max 50 lines)
- **SC-017**: No hardcoded values (use named constants)
- **SC-018**: All public functions are tested with pytest
- **SC-019**: Code is generated entirely by Claude Code from specifications (no manual coding)

## Technical Constraints

### Technology Stack (NON-NEGOTIABLE per Constitution)

- **Language**: Python 3.13+
- **Package Manager**: UV (mandatory)
- **Testing Framework**: pytest
- **Linter**: ruff
- **Type Checker**: mypy (strict mode)
- **Development Approach**: Spec-Driven Development with Claude Code

### Project Structure

```
phase-1-console-app/
├── specs/
│   └── console-app.spec.md          # This file
├── src/
│   └── todo_app/
│       ├── __init__.py
│       ├── __main__.py              # Entry point
│       ├── models.py                # Task data class
│       ├── storage.py               # In-memory task storage
│       ├── operations.py            # CRUD operations
│       └── cli.py                   # CLI interface
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_storage.py
│   ├── test_operations.py
│   └── test_cli.py
├── pyproject.toml                   # UV project configuration
├── README.md                        # Setup and usage instructions
└── .python-version                  # Python 3.13+
```

### Non-Functional Requirements

- **NFR-001**: Code must be formatted with `ruff format`
- **NFR-002**: Code must pass `ruff check` with zero warnings
- **NFR-003**: Code must pass `mypy --strict` with zero errors
- **NFR-004**: Test coverage must be minimum 80%
- **NFR-005**: Application startup time must be under 1 second
- **NFR-006**: Memory usage must stay under 50MB for lists up to 1000 tasks

## Out of Scope (Phase I)

- ❌ Persistence to disk/database
- ❌ Multi-user support
- ❌ User authentication
- ❌ Task priorities or tags
- ❌ Due dates or reminders
- ❌ Search or filter functionality
- ❌ Task sorting
- ❌ Recurring tasks
- ❌ Web interface
- ❌ API endpoints
- ❌ Configuration files

These features will be added in subsequent phases (II-V).

## Dependencies

### Development Dependencies

- Python 3.13+
- UV package manager
- pytest (testing)
- pytest-cov (coverage)
- ruff (linting and formatting)
- mypy (type checking)

### No External Runtime Dependencies

Phase I must use only Python standard library. No third-party packages for runtime.

## Testing Strategy

### Unit Tests (Required)

- **test_models.py**: Test Task data class creation, validation, state changes
- **test_storage.py**: Test in-memory storage operations (add, get, update, delete, list)
- **test_operations.py**: Test business logic for each CRUD operation
- **test_cli.py**: Test CLI menu display, input handling, error messages

### Test Coverage Goals

- Models: 100%
- Storage: 100%
- Operations: 90%
- CLI: 70% (focus on logic, not I/O)

### Edge Cases to Test

- Empty task list operations
- Invalid task IDs
- Invalid input types (non-numeric IDs)
- Boundary conditions (200-char title, 1000-char description)
- Title validation (empty, too long)
- ID reuse after deletion
- Toggle completion multiple times

## Acceptance Criteria Summary

Before Phase I is considered complete:

- ✅ All 5 user stories implemented and tested
- ✅ All acceptance scenarios pass
- ✅ All edge cases handled gracefully
- ✅ Test coverage ≥ 80%
- ✅ Ruff linting passes with zero warnings
- ✅ Mypy strict type checking passes
- ✅ Application runs with `python -m todo_app`
- ✅ README.md documents setup and usage
- ✅ Code generated entirely by Claude Code (no manual coding)
- ✅ Demo video created (< 90 seconds)

## Next Steps

After specification approval:
1. Create `plan.md` - Architecture and implementation plan (`/sp.plan`)
2. Create `tasks.md` - Testable task breakdown (`/sp.tasks`)
3. Implement via Claude Code (`/sp.implement`)
4. Run tests and verify
5. Create README and demo video
6. Submit Phase I

---

**Specification Status**: ✅ Ready for Planning
**Estimated Effort**: 2-3 hours (spec-driven with Claude Code)
**Phase I Completion Target**: Before December 7, 2025
