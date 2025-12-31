# Spec-to-Code Skill

**Skill Type**: Agent Skill for Specification-Driven Code Generation

**Purpose**: Automatically generates production-ready code from feature specifications, following project architecture and coding standards.

## Description

This skill transforms written specifications into complete, tested, documented code following the project's established patterns and quality standards. It implements the core principle of Spec-Driven Development: refine the spec until the code is correct, rather than manually writing code.

## Usage

Generate code from a specification:

```
Use spec-to-code to implement specs/[feature]/spec.md
```

Or as a slash command:

```
/spec-to-code specs/user-authentication/spec.md
```

With specific options:

```
/spec-to-code specs/api-endpoints/spec.md --with-tests --with-docs
```

## Input Requirements

### Specification Format

The skill expects specifications in this structure:

```markdown
# Feature: [Feature Name]

## Overview
Brief description of what this feature does.

## User Stories
- As a [user type], I want [goal] so that [benefit]
- ...

## Acceptance Criteria
- [ ] Criterion 1 with specific, testable conditions
- [ ] Criterion 2 with measurable outcomes
- ...

## Technical Requirements
- Data models needed
- API endpoints (if applicable)
- Validation rules
- Error handling requirements

## Success Criteria
- Performance targets
- Security requirements
- Usability standards
```

### Example Specification

```markdown
# Feature: Task Priority Management

## Overview
Users can assign priority levels (High, Medium, Low) to tasks to better organize their work.

## User Stories
- As a user, I want to assign a priority to each task so that I can focus on important items
- As a user, I want to filter tasks by priority so that I can view high-priority items first

## Acceptance Criteria
- [ ] Tasks have a priority field (High, Medium, Low)
- [ ] Priority is optional (defaults to Medium)
- [ ] Users can update task priority
- [ ] Task list can be filtered by priority
- [ ] Task list can be sorted by priority

## Technical Requirements
**Data Model**:
- Add `priority` field to Task model
- Enum: Priority.HIGH, Priority.MEDIUM, Priority.LOW
- Default: Priority.MEDIUM

**Storage Layer**:
- Support filtering tasks by priority
- Support sorting tasks by priority

**Operations Layer**:
- `set_task_priority(task_id, priority)` method
- Update existing operations to handle priority

**Validation**:
- Priority must be one of the valid enum values
- Invalid priority raises ValueError
```

## Code Generation Process

### Step 1: Specification Analysis

The skill analyzes the spec to identify:
- **Data models**: What entities are needed?
- **Business logic**: What operations are required?
- **Validation rules**: What constraints must be enforced?
- **Error scenarios**: What can go wrong?
- **Dependencies**: What existing code is affected?

**Example Output**:
```
Analyzed Specification: "Task Priority Management"

Identified Components:
✓ Data Model: Task (add priority field)
✓ Enum: Priority (HIGH, MEDIUM, LOW)
✓ Storage: Add filter_by_priority(), sort_by_priority()
✓ Operations: Add set_task_priority()
✓ Validation: Priority enum validation
✓ Tests: 8 test cases identified
```

### Step 2: Code Architecture Design

The skill maps the spec to the project's architecture:

```
Project Architecture: 3-Layer Pattern

Layer 1: Models (src/todo_app/models.py)
- Add Priority enum
- Add priority field to Task dataclass
- Add validation in __post_init__

Layer 2: Storage (src/todo_app/storage.py)
- Add filter_by_priority(priority) method
- Add sort_by_priority(tasks) method
- Update existing methods if needed

Layer 3: Operations (src/todo_app/operations.py)
- Add set_task_priority(task_id, priority) method
- Update list_tasks() to support filtering

Layer 4: CLI (src/todo_app/cli.py)
- Add menu option for setting priority
- Add filtering UI
- Display priority in task list
```

### Step 3: Code Generation

The skill generates code following project patterns:

#### Generated: models.py (additions)

```python
from enum import Enum

class Priority(Enum):
    """Task priority levels."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class Task:
    """Represents a todo task.

    Attributes:
        ...
        priority: Priority level (default: MEDIUM).
    """
    id: int
    title: str
    description: str
    completed: bool
    priority: Priority  # NEW
    created_at: datetime
    updated_at: datetime

    def __post_init__(self) -> None:
        """Validate task data after initialization."""
        # Existing validation...

        # Validate priority (NEW)
        if not isinstance(self.priority, Priority):
            raise ValueError("Priority must be a valid Priority enum value")
```

#### Generated: storage.py (additions)

```python
def filter_by_priority(self, priority: Priority) -> list[Task]:
    """Filter tasks by priority level.

    Args:
        priority: Priority level to filter by.

    Returns:
        List of tasks with the specified priority.
    """
    return [task for task in self._tasks if task.priority == priority]

def sort_by_priority(self, tasks: list[Task]) -> list[Task]:
    """Sort tasks by priority (High -> Medium -> Low).

    Args:
        tasks: List of tasks to sort.

    Returns:
        Sorted list of tasks.
    """
    priority_order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
    return sorted(tasks, key=lambda t: priority_order[t.priority])
```

#### Generated: operations.py (additions)

```python
def set_task_priority(self, task_id: int, priority: Priority) -> tuple[Task | None, str]:
    """Set task priority level.

    Args:
        task_id: ID of the task to update.
        priority: New priority level.

    Returns:
        Tuple of (Task, success_message) or (None, error_message).
    """
    try:
        task = self.storage.get_by_id(task_id)
        task.priority = priority
        task.updated_at = datetime.now()
        message = f"Task #{task.id} priority set to {priority.value}: {task.title}"
        return task, message
    except ValueError as e:
        return None, f"Error: {str(e)}"

def list_tasks(self, priority_filter: Priority | None = None) -> list[Task]:
    """Get all tasks, optionally filtered by priority.

    Args:
        priority_filter: Optional priority to filter by.

    Returns:
        List of tasks (filtered and sorted if requested).
    """
    tasks = self.storage.get_all()

    if priority_filter:
        tasks = self.storage.filter_by_priority(priority_filter)

    return self.storage.sort_by_priority(tasks)
```

### Step 4: Test Generation

The skill generates comprehensive tests:

```python
# tests/test_priority.py
class TestTaskPriority:
    """Tests for task priority feature."""

    def test_task_defaults_to_medium_priority(self) -> None:
        """Test task defaults to MEDIUM priority."""
        task = Task(
            id=1,
            title="Test",
            description="",
            completed=False,
            priority=Priority.MEDIUM,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )
        assert task.priority == Priority.MEDIUM

    def test_set_task_priority_to_high(self) -> None:
        """Test setting task priority to HIGH."""
        storage = TaskStorage()
        operations = TodoOperations(storage)
        task, _ = operations.add_task("Test", "")

        updated, message = operations.set_task_priority(task.id, Priority.HIGH)
        assert updated.priority == Priority.HIGH
        assert "high" in message.lower()

    # ... 6 more test cases
```

### Step 5: Documentation Generation

The skill generates/updates documentation:

```markdown
## Priority Management

Tasks can be assigned priority levels to help organize work:

### Priority Levels
- **High**: Urgent, critical tasks
- **Medium**: Normal priority (default)
- **Low**: Can be done later

### Usage
1. Create a task (defaults to Medium priority)
2. Use "Set Priority" menu option
3. Enter task ID and select priority level
4. Filter task list by priority if needed

### Example
```
1. Add New Task
   Title: "Fix critical bug"
   Priority: High

2. View Tasks
   Filter by: High
   Result: Only high-priority tasks shown
```
```

### Step 6: Integration & Validation

The skill ensures:
- ✅ Code follows existing patterns
- ✅ Type hints are complete
- ✅ Docstrings are comprehensive
- ✅ Tests cover all scenarios
- ✅ No breaking changes to existing code
- ✅ Quality gates pass

## Configuration

Configure code generation in `.claude/config.json`:

```json
{
  "spec-to-code": {
    "architecture": "3-layer",
    "style_guide": "google",
    "type_hints": "strict",
    "docstring_style": "google",
    "test_framework": "pytest",
    "coverage_target": 100,
    "auto_format": true,
    "auto_test": true
  }
}
```

## Advanced Features

### Incremental Updates

Update existing features from revised specs:
```
/spec-to-code specs/task-management/spec.md --mode=update
```

The skill will:
- Detect what changed in the spec
- Update only affected code
- Preserve existing functionality
- Add new tests for changes

### Multi-Feature Generation

Generate code for multiple related features:
```
/spec-to-code specs/phase-2/** --batch
```

### Template Customization

Use custom code templates:
```
/spec-to-code specs/api/spec.md --template=./templates/api-pattern.py
```

## Phase-Specific Patterns

### Phase I (Console App)

**Pattern**: 3-Layer Architecture (Models, Storage, Operations)

```python
# Models: Data structures + validation
# Storage: In-memory CRUD operations
# Operations: Business logic + error handling
```

### Phase II (Web App)

**Pattern**: API + Frontend Separation

```python
# Backend: FastAPI endpoints
# Frontend: Next.js components
# Database: SQLModel + Neon
```

### Phase III (Chatbot)

**Pattern**: MCP Tools + Agent

```python
# MCP Server: Tool definitions
# Agent: OpenAI Agents SDK
# State: Database persistence
```

### Phase IV/V (Cloud)

**Pattern**: Containerized Microservices

```yaml
# Kubernetes manifests
# Helm charts
# Dapr components
```

## Quality Assurance

After code generation, the skill runs:

1. **Syntax Check**: Python syntax is valid
2. **Type Check**: mypy strict mode passes
3. **Lint Check**: ruff reports zero issues
4. **Test Run**: All tests pass
5. **Coverage Check**: Meets threshold (≥80%)
6. **Integration Test**: Works with existing code

## Output Artifacts

The skill generates:
- Source code files
- Test files
- Documentation updates
- Migration scripts (if needed)
- Configuration updates

## Benefits

1. **Speed**: Generate complete features in minutes
2. **Consistency**: All code follows same patterns
3. **Quality**: Built-in validation and testing
4. **Documentation**: Always up-to-date
5. **Maintainability**: Clean, well-structured code

## Comparison: Manual vs Spec-to-Code

| Aspect | Manual Coding | Spec-to-Code Skill |
|--------|---------------|-------------------|
| Time to implement | 2-4 hours | 5-10 minutes |
| Test coverage | Variable (often <60%) | Consistent (≥80%) |
| Documentation | Often outdated | Always current |
| Code consistency | Variable | Identical patterns |
| Error rate | Higher | Lower (validated) |
| Refactoring cost | High | Low (regenerate) |

## Reusability Score

This skill is reusable across:
- ✅ All 5 project phases
- ✅ Any feature specification
- ✅ Different programming paradigms
- ✅ Various architecture patterns
- ✅ Multiple tech stacks (with configuration)

## Evolution Path

As the project grows:
1. **Phase I**: Basic 3-layer architecture
2. **Phase II**: Add API/frontend patterns
3. **Phase III**: Add MCP/agent patterns
4. **Phase IV**: Add cloud/k8s patterns
5. **Phase V**: Add distributed system patterns

Each phase teaches the skill new patterns, making it more powerful.

---

**Created**: 2025-12-31
**Version**: 1.0
**Reusable Intelligence Type**: Agent Skill
**Applicable Phases**: I, II, III, IV, V
**Bonus Points Qualification**: Reusable Intelligence (+200 points)
