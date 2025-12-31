---
description: "Task breakdown for Phase I - In-Memory Python Console Todo App"
---

# Tasks: Phase I - In-Memory Python Console Todo App

**Input**: Design documents from `phase-1-console-app/`
- `specs/console-app.spec.md` (user stories and requirements)
- `plan.md` (architecture and implementation plan)

**Prerequisites**: ✅ spec.md complete, ✅ plan.md complete

**Development Approach**: Test-Driven Development (TDD) - Red-Green-Refactor
- **Red**: Write failing tests first
- **Green**: Implement minimal code to pass tests
- **Refactor**: Improve code while keeping tests green

**Organization**: Tasks organized by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, or SETUP)
- File paths relative to `phase-1-console-app/`

## Path Conventions

Single Python package structure:
- Source code: `src/todo_app/`
- Tests: `tests/`
- Configuration: Root level (pyproject.toml, .python-version, .gitignore)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Estimated Time**: 15-20 minutes

- [ ] T001 [SETUP] Create project folder structure (src/todo_app/, tests/)
- [ ] T002 [P] [SETUP] Create .python-version file with "3.13"
- [ ] T003 [P] [SETUP] Create .gitignore with Python, testing, IDE ignores
- [ ] T004 [SETUP] Create pyproject.toml with project metadata, dev dependencies (pytest, pytest-cov, ruff, mypy)
- [ ] T005 [P] [SETUP] Configure ruff in pyproject.toml (line-length: 100, target: py313, select lints)
- [ ] T006 [P] [SETUP] Configure mypy in pyproject.toml (strict mode enabled)
- [ ] T007 [P] [SETUP] Configure pytest in pyproject.toml (testpaths, coverage settings)
- [ ] T008 [SETUP] Initialize UV virtual environment (`uv venv`)
- [ ] T009 [SETUP] Install dev dependencies (`uv pip install -e ".[dev]"`)

**Checkpoint**: ✅ Project structure ready, tools configured, dependencies installed

---

## Phase 2: User Story 1 - Add New Task (Priority: P1) 🎯 MVP

**Goal**: Users can add tasks with title and optional description

**Independent Test**: Launch app, select "Add Task", enter details, verify task appears in list

**Why P1**: Creating tasks is fundamental - without this, app has no purpose. This is MVP core.

### Tests for User Story 1 (TDD - Red Phase) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

**Estimated Time**: 30-40 minutes

#### Models Layer Tests

- [ ] T010 [P] [US1] Test Task creation with valid data in tests/test_models.py
  - Test: Task with id, title, description creates successfully
  - Test: Task timestamps (created_at, updated_at) are set
  - Test: Task defaults to completed=False

- [ ] T011 [P] [US1] Test Task title validation in tests/test_models.py
  - Test: Empty title raises ValueError
  - Test: Title with 200 chars passes
  - Test: Title with 201 chars raises ValueError

- [ ] T012 [P] [US1] Test Task description validation in tests/test_models.py
  - Test: Empty description is allowed
  - Test: Description with 1000 chars passes
  - Test: Description with 1001 chars raises ValueError

#### Storage Layer Tests

- [ ] T013 [P] [US1] Test TaskStorage.add() basic functionality in tests/test_storage.py
  - Test: Adding first task assigns id=1
  - Test: Adding second task assigns id=2
  - Test: Adding task returns Task object
  - Test: Task is stored in storage

- [ ] T014 [P] [US1] Test TaskStorage.add() validation in tests/test_storage.py
  - Test: Adding task with empty title raises ValueError
  - Test: Adding task with title too long raises ValueError
  - Test: Adding task with description too long raises ValueError

#### Operations Layer Tests

- [ ] T015 [P] [US1] Test TodoOperations.add_task() success cases in tests/test_operations.py
  - Test: add_task with valid title and description returns (Task, success_message)
  - Test: add_task with only title (no description) succeeds
  - Test: Success message contains task ID

- [ ] T016 [P] [US1] Test TodoOperations.add_task() error handling in tests/test_operations.py
  - Test: add_task with empty title returns error message
  - Test: add_task with title too long returns error message
  - Test: Error messages are user-friendly (no stack traces)

### Implementation for User Story 1 (TDD - Green Phase)

**Estimated Time**: 45-60 minutes

#### Models Implementation

- [ ] T017 [US1] Create Task dataclass in src/todo_app/models.py
  - Define fields: id, title, description, completed, created_at, updated_at
  - Add type hints for all fields
  - Implement __post_init__ for validation
  - Add Google-style docstring
  - Run tests: T010, T011, T012 should pass

#### Storage Implementation

- [ ] T018 [US1] Create TaskStorage class in src/todo_app/storage.py
  - Define __init__ with _tasks list and _next_id counter
  - Implement add(title, description) method
  - Add validation by calling Task creation
  - Add type hints and docstring
  - Run tests: T013, T014 should pass

#### Operations Implementation

- [ ] T019 [US1] Create TodoOperations class in src/todo_app/operations.py
  - Define __init__ accepting TaskStorage
  - Implement add_task(title, description) method
  - Add try/except for user-friendly error messages
  - Return (Task, message) tuple
  - Add type hints and docstring
  - Run tests: T015, T016 should pass

**Checkpoint**: ✅ User Story 1 backend logic complete (models, storage, operations tested)

---

## Phase 3: User Story 2 - View All Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can view all tasks in a clear, formatted list

**Independent Test**: Add a few tasks, select "View Tasks", verify all tasks display with ID, title, status

**Why P1**: Viewing tasks is essential - users need to see what they've captured. Equal priority with Add Task.

### Tests for User Story 2 (TDD - Red Phase) ⚠️

**Estimated Time**: 20-30 minutes

#### Storage Layer Tests

- [ ] T020 [P] [US2] Test TaskStorage.get_all() in tests/test_storage.py
  - Test: get_all() returns empty list when no tasks
  - Test: get_all() returns all tasks after adding multiple
  - Test: get_all() returns copy (modifications don't affect storage)

#### Operations Layer Tests

- [ ] T021 [P] [US2] Test TodoOperations.list_tasks() in tests/test_operations.py
  - Test: list_tasks() returns empty list when no tasks
  - Test: list_tasks() returns all tasks sorted by ID
  - Test: list_tasks() shows both pending and completed tasks

### Implementation for User Story 2 (TDD - Green Phase)

**Estimated Time**: 20-30 minutes

- [ ] T022 [US2] Implement TaskStorage.get_all() in src/todo_app/storage.py
  - Return copy of _tasks list
  - Add type hints and docstring
  - Run tests: T020 should pass

- [ ] T023 [US2] Implement TodoOperations.list_tasks() in src/todo_app/operations.py
  - Call storage.get_all()
  - Sort by ID (already sorted, but ensure)
  - Add type hints and docstring
  - Run tests: T021 should pass

**Checkpoint**: ✅ User Story 2 backend logic complete (list functionality tested)

---

## Phase 4: User Story 3 - Mark Task Complete (Priority: P2)

**Goal**: Users can toggle task completion status (Pending ↔ Completed)

**Independent Test**: Add task, mark it complete, verify status changes; mark again, verify toggles back

**Why P2**: Completing tasks provides satisfaction and progress tracking. Depends on Add and View.

### Tests for User Story 3 (TDD - Red Phase) ⚠️

**Estimated Time**: 25-35 minutes

#### Models Layer Tests

- [ ] T024 [P] [US3] Test Task.toggle_complete() in tests/test_models.py
  - Test: toggle_complete() on pending task sets completed=True
  - Test: toggle_complete() on completed task sets completed=False
  - Test: toggle_complete() updates updated_at timestamp

#### Storage Layer Tests

- [ ] T025 [P] [US3] Test TaskStorage.toggle_complete() in tests/test_storage.py
  - Test: toggle_complete(id) toggles existing task
  - Test: toggle_complete(id) returns updated Task
  - Test: toggle_complete(invalid_id) raises ValueError

#### Operations Layer Tests

- [ ] T026 [P] [US3] Test TodoOperations.toggle_task_complete() in tests/test_operations.py
  - Test: toggle_task_complete(id) returns (Task, success_message)
  - Test: Success message indicates new status ("marked as completed" or "marked as pending")
  - Test: toggle_task_complete(invalid_id) returns user-friendly error

### Implementation for User Story 3 (TDD - Green Phase)

**Estimated Time**: 30-40 minutes

- [ ] T027 [US3] Implement Task.toggle_complete() in src/todo_app/models.py
  - Toggle completed field
  - Update updated_at timestamp
  - Add docstring
  - Run tests: T024 should pass

- [ ] T028 [US3] Implement TaskStorage.toggle_complete() in src/todo_app/storage.py
  - Find task by ID
  - Call task.toggle_complete()
  - Raise ValueError if not found
  - Add type hints and docstring
  - Run tests: T025 should pass

- [ ] T029 [US3] Implement TodoOperations.toggle_task_complete() in src/todo_app/operations.py
  - Call storage.toggle_complete()
  - Generate success message based on new status
  - Add error handling
  - Add type hints and docstring
  - Run tests: T026 should pass

**Checkpoint**: ✅ User Story 3 backend logic complete (toggle completion tested)

---

## Phase 5: User Story 4 - Update Task Details (Priority: P3)

**Goal**: Users can update task title and/or description

**Independent Test**: Create task, update title, verify change; update description, verify change

**Why P3**: Updating is valuable but not critical for MVP. Users can work around by delete/re-add.

### Tests for User Story 4 (TDD - Red Phase) ⚠️

**Estimated Time**: 25-35 minutes

#### Models Layer Tests

- [ ] T030 [P] [US4] Test Task.update_details() in tests/test_models.py
  - Test: update_details(title) updates title only
  - Test: update_details(description) updates description only
  - Test: update_details(title, description) updates both
  - Test: update_details validates title (not empty, max 200 chars)
  - Test: update_details validates description (max 1000 chars)
  - Test: update_details updates updated_at timestamp

#### Storage Layer Tests

- [ ] T031 [P] [US4] Test TaskStorage.update() in tests/test_storage.py
  - Test: update(id, title) updates task title
  - Test: update(id, description) updates task description
  - Test: update(id, title, description) updates both
  - Test: update(invalid_id) raises ValueError
  - Test: Updated task remains in storage at same position

#### Operations Layer Tests

- [ ] T032 [P] [US4] Test TodoOperations.update_task() in tests/test_operations.py
  - Test: update_task(id, title, description) returns (Task, success_message)
  - Test: update_task with None values keeps existing values
  - Test: update_task(invalid_id) returns user-friendly error
  - Test: update_task with empty title returns error

### Implementation for User Story 4 (TDD - Green Phase)

**Estimated Time**: 30-40 minutes

- [ ] T033 [US4] Implement Task.update_details() in src/todo_app/models.py
  - Accept optional title and description
  - Validate inputs
  - Update only provided fields
  - Update updated_at timestamp
  - Add docstring
  - Run tests: T030 should pass

- [ ] T034 [US4] Implement TaskStorage.update() in src/todo_app/storage.py
  - Find task by ID
  - Call task.update_details()
  - Raise ValueError if not found
  - Return updated task
  - Add type hints and docstring
  - Run tests: T031 should pass

- [ ] T035 [US4] Implement TodoOperations.update_task() in src/todo_app/operations.py
  - Call storage.update()
  - Generate success message
  - Add error handling
  - Add type hints and docstring
  - Run tests: T032 should pass

**Checkpoint**: ✅ User Story 4 backend logic complete (update functionality tested)

---

## Phase 6: User Story 5 - Delete Task (Priority: P3)

**Goal**: Users can delete tasks they no longer need

**Independent Test**: Create multiple tasks, delete one, verify it no longer appears in list

**Why P3**: Deletion is useful but not essential for MVP. Users can ignore unwanted tasks.

### Tests for User Story 5 (TDD - Red Phase) ⚠️

**Estimated Time**: 20-30 minutes

#### Storage Layer Tests

- [ ] T036 [P] [US5] Test TaskStorage.delete() in tests/test_storage.py
  - Test: delete(id) removes task from storage
  - Test: delete(id) doesn't affect other tasks
  - Test: delete(invalid_id) raises ValueError
  - Test: Deleted ID is not reused for new tasks

#### Operations Layer Tests

- [ ] T037 [P] [US5] Test TodoOperations.delete_task() in tests/test_operations.py
  - Test: delete_task(id) returns success message
  - Test: Success message includes task ID
  - Test: delete_task(invalid_id) returns user-friendly error

### Implementation for User Story 5 (TDD - Green Phase)

**Estimated Time**: 20-30 minutes

- [ ] T038 [US5] Implement TaskStorage.delete() in src/todo_app/storage.py
  - Find task by ID
  - Remove from _tasks list
  - Raise ValueError if not found
  - DO NOT decrement _next_id (IDs never reused)
  - Add type hints and docstring
  - Run tests: T036 should pass

- [ ] T039 [US5] Implement TodoOperations.delete_task() in src/todo_app/operations.py
  - Call storage.delete()
  - Generate success message
  - Add error handling
  - Add type hints and docstring
  - Run tests: T037 should pass

**Checkpoint**: ✅ User Story 5 backend logic complete (delete functionality tested)

---

## Phase 7: CLI Interface (All User Stories)

**Purpose**: Interactive command-line interface for all features

**Estimated Time**: 60-90 minutes

### Tests for CLI (TDD - Red Phase) ⚠️

- [ ] T040 [P] [CLI] Test menu display in tests/test_cli.py
  - Test: display_menu() shows all 6 options
  - Test: Menu is clear and numbered

- [ ] T041 [P] [CLI] Test input validation in tests/test_cli.py
  - Test: get_menu_choice() validates numeric input (1-6)
  - Test: Invalid menu choice re-prompts user
  - Test: prompt_task_id() validates numeric input

- [ ] T042 [P] [CLI] Test task display formatting in tests/test_cli.py
  - Test: display_tasks() shows pending tasks with "[ ]"
  - Test: display_tasks() shows completed tasks with "[✓]"
  - Test: display_tasks() shows "No tasks found" for empty list
  - Test: display_tasks() formats tasks with ID, title, description

### Implementation for CLI (TDD - Green Phase)

- [ ] T043 [CLI] Create TodoCLI class in src/todo_app/cli.py
  - Define __init__ accepting TodoOperations
  - Implement display_menu() - show 6 options
  - Implement get_menu_choice() - validate input (1-6)
  - Add type hints and docstring
  - Run tests: T040, T041 (partial) should pass

- [ ] T044 [CLI] Implement task display in src/todo_app/cli.py
  - Implement display_tasks(tasks) - format with ID, title, status, description
  - Use "[ ]" for pending, "[✓]" for completed
  - Handle empty list case
  - Run tests: T042 should pass

- [ ] T045 [CLI] Implement input prompts in src/todo_app/cli.py
  - Implement prompt_task_details() - get title (required), description (optional)
  - Implement prompt_task_id(action) - get numeric task ID
  - Add validation and error handling
  - Run tests: T041 (complete) should pass

- [ ] T046 [CLI] Implement main run() loop in src/todo_app/cli.py
  - Display menu
  - Get choice
  - Execute operation based on choice:
    1. Add Task - prompt details, call add_task, display result
    2. View Tasks - call list_tasks, display tasks
    3. Update Task - prompt ID and details, call update_task, display result
    4. Delete Task - prompt ID, call delete_task, display result
    5. Mark Complete - prompt ID, call toggle_task_complete, display result
    6. Exit - break loop
  - Handle errors gracefully
  - Return to menu after each operation

- [ ] T047 [CLI] Create __main__.py entry point in src/todo_app/__main__.py
  - Import and instantiate TaskStorage
  - Import and instantiate TodoOperations(storage)
  - Import and instantiate TodoCLI(operations)
  - Call cli.run() in try/except
  - Handle KeyboardInterrupt (Ctrl+C) gracefully
  - Print "Goodbye!" on exit

- [ ] T048 [CLI] Create package __init__.py in src/todo_app/__init__.py
  - Set __version__ = "1.0.0"
  - Optional: Export main classes for import

**Checkpoint**: ✅ CLI interface complete, application fully functional

---

## Phase 8: Integration Testing & Quality Gates

**Purpose**: Verify end-to-end functionality and code quality

**Estimated Time**: 30-45 minutes

### Manual Integration Testing

- [ ] T049 [QA] Test complete workflow: Add → View → Mark Complete → Update → Delete
  - Verify all operations work together
  - Verify task list updates correctly
  - Verify error messages are clear

- [ ] T050 [QA] Test all edge cases from spec
  - Empty list operations
  - Invalid task IDs
  - Invalid input types (non-numeric IDs)
  - Boundary conditions (200-char title, 1000-char description)
  - Ctrl+C graceful exit

### Code Quality Checks

- [ ] T051 [P] [QA] Run ruff format and verify all files formatted
  - Command: `ruff format src/ tests/`
  - Expected: All files formatted, no changes needed

- [ ] T052 [P] [QA] Run ruff check and fix all warnings
  - Command: `ruff check src/ tests/`
  - Expected: Zero warnings

- [ ] T053 [P] [QA] Run mypy strict and fix all type errors
  - Command: `mypy --strict src/`
  - Expected: Zero errors

- [ ] T054 [QA] Run pytest with coverage and verify ≥80%
  - Command: `pytest --cov=src/todo_app --cov-report=term-missing --cov-report=html`
  - Expected: Coverage ≥ 80%
  - Target breakdown:
    - models.py: 100%
    - storage.py: 100%
    - operations.py: 90%
    - cli.py: 70%

### Documentation

- [ ] T055 [P] [QA] Verify all functions have type hints
  - Check: Every function has return type and parameter types
  - Fix: Add missing type hints

- [ ] T056 [P] [QA] Verify all public functions have docstrings
  - Check: Every public function has Google-style docstring
  - Fix: Add missing docstrings with params, returns, raises

- [ ] T057 [P] [QA] Verify function and file size limits
  - Check: No function > 50 lines
  - Check: No file > 300 lines
  - Fix: Split large functions/files if needed

**Checkpoint**: ✅ All quality gates passed, code ready for documentation

---

## Phase 9: Documentation & Submission

**Purpose**: Create user documentation and demo video

**Estimated Time**: 45-60 minutes

- [ ] T058 [DOC] Create README.md in phase-1-console-app/
  - Section: Project Overview
  - Section: Features (list 5 Basic Level features)
  - Section: Prerequisites (Python 3.13+, UV)
  - Section: Installation (step-by-step with commands)
  - Section: Usage (how to run, menu options, examples)
  - Section: Testing (how to run tests, coverage)
  - Section: Development (ruff, mypy commands)
  - Section: Project Structure (folder layout)

- [ ] T059 [P] [DOC] Add inline comments for complex logic
  - Review code for non-obvious logic
  - Add comments explaining "why" not "what"
  - Keep comments concise

- [ ] T060 [DOC] Create demo video (< 90 seconds)
  - Show: Application startup
  - Demo: Add task
  - Demo: View tasks
  - Demo: Mark task complete
  - Demo: Update task
  - Demo: Delete task
  - Show: Spec-driven development workflow (spec → plan → tasks → implement)
  - Upload to YouTube/Vimeo
  - Add link to README.md

- [ ] T061 [DOC] Final validation against spec acceptance criteria
  - Verify: All 27 acceptance scenarios pass
  - Verify: All edge cases handled
  - Verify: All success criteria met (SC-001 to SC-019)
  - Create checklist and mark completed items

**Checkpoint**: ✅ Phase I complete and ready for submission

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - START HERE
2. **User Story 1-5 (Phases 2-6)**: Depend on Setup completion
   - Can proceed sequentially in priority order: US1(P1) → US2(P1) → US3(P2) → US4(P3) → US5(P3)
   - OR implement all tests first (T010-T042), then all implementations (T017-T048)
3. **CLI (Phase 7)**: Depends on all User Stories (US1-US5) complete
4. **Quality Gates (Phase 8)**: Depends on CLI completion
5. **Documentation (Phase 9)**: Depends on Quality Gates passing

### TDD Workflow Within Each User Story

For each User Story (US1-US5):
1. **Red Phase**: Write ALL tests for that story (tests should FAIL)
2. **Green Phase**: Implement code to make tests PASS
3. **Refactor Phase**: Improve code while keeping tests green
4. **Checkpoint**: Verify story is independently functional

### Recommended Execution Order

**Option A: Story-by-Story (Recommended)**
```
Phase 1: Setup → Complete all setup tasks
Phase 2: US1 → Write tests (T010-T016) → Implement (T017-T019) → Verify
Phase 3: US2 → Write tests (T020-T021) → Implement (T022-T023) → Verify
Phase 4: US3 → Write tests (T024-T026) → Implement (T027-T029) → Verify
Phase 5: US4 → Write tests (T030-T032) → Implement (T033-T035) → Verify
Phase 6: US5 → Write tests (T036-T037) → Implement (T038-T039) → Verify
Phase 7: CLI → Write tests (T040-T042) → Implement (T043-T048) → Verify
Phase 8: Quality Gates → Run all checks (T049-T057)
Phase 9: Documentation → Create README, demo video (T058-T061)
```

**Option B: All Tests First (TDD Purist)**
```
Phase 1: Setup → Complete all setup
Phases 2-7 (Red): Write ALL tests (T010-T042) - all should fail
Phases 2-7 (Green): Implement ALL code (T017-T048) - tests turn green
Phases 2-7 (Refactor): Improve code quality
Phase 8: Quality Gates
Phase 9: Documentation
```

### Parallel Opportunities

Tasks marked **[P]** can run in parallel:
- Setup tasks: T002, T003, T005, T006, T007 (different files)
- Test tasks within a story can run in parallel (different test files)
- Model tests (T010-T012), Storage tests (T013-T014), Operations tests (T015-T016) for same story
- Quality checks: T051, T052, T053, T055, T056, T057 (independent)

### Critical Path

**Blocking tasks** (nothing else can proceed until these complete):
- T001-T009: Setup (blocks everything)
- T017-T019: US1 Implementation (blocks US2-US5 if doing story-by-story)
- T043-T048: CLI Implementation (blocks integration testing)
- T049-T054: Quality Gates (blocks submission)

---

## Task Summary

**Total Tasks**: 61
- Setup: 9 tasks
- User Story 1: 10 tasks (6 tests + 3 implementation + 1 checkpoint)
- User Story 2: 4 tasks (2 tests + 2 implementation)
- User Story 3: 6 tasks (3 tests + 3 implementation)
- User Story 4: 6 tasks (3 tests + 3 implementation)
- User Story 5: 4 tasks (2 tests + 2 implementation)
- CLI: 9 tasks (3 tests + 6 implementation)
- Quality Gates: 9 tasks
- Documentation: 4 tasks

**Estimated Total Time**: 6-9 hours
- Setup: 15-20 min
- User Stories (tests + implementation): 3.5-5 hours
- CLI: 1-1.5 hours
- Quality Gates: 30-45 min
- Documentation: 45-60 min
- Buffer for debugging: 1-2 hours

**With Claude Code (Spec-Driven)**: 2-3 hours
- Setup: 10 min (mostly automated)
- Spec → Code generation: 1-1.5 hours
- Quality checks & refinement: 30-45 min
- Documentation: 30-45 min

---

## Notes

- **[P]** = Parallelizable tasks (different files, no dependencies)
- **[Story]** = Maps task to user story (US1-US5, SETUP, CLI, QA, DOC)
- **TDD Required**: All tests written BEFORE implementation
- **Tests Must Fail**: Verify tests fail before implementing code (Red phase)
- **Commit Frequently**: Commit after each task or logical group of tasks
- **Quality First**: Do not skip quality gates (ruff, mypy, pytest coverage)
- **Constitution Compliance**: All code generated by Claude Code from specs
- **No Manual Coding**: If code is wrong, refine spec and regenerate

---

**Tasks Status**: ✅ Ready for Implementation
**Next Command**: `/sp.implement` to begin code generation with Claude Code
**Success Criteria**: All 61 tasks completed, all quality gates passed, Phase I ready for submission
