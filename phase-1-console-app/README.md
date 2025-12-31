# Todo App - Phase I: In-Memory Python Console Application

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Code style: ruff](https://img.shields.io/badge/code%20style-ruff-000000.svg)](https://github.com/astral-sh/ruff)
[![Type checked: mypy](https://img.shields.io/badge/type%20checked-mypy-blue.svg)](http://mypy-lang.org/)
[![Test Coverage: 98.99%](https://img.shields.io/badge/coverage-98.99%25-brightgreen.svg)](https://pytest.org/)

A command-line todo application built using **Spec-Driven Development** with Claude Code and Spec-Kit Plus. This project demonstrates Test-Driven Development (TDD), clean code principles, and comprehensive testing.

## Features

This application implements all 5 Basic Level features:

1. **Add New Task** - Create tasks with title and optional description
2. **View All Tasks** - Display all tasks with their status and details
3. **Mark as Complete** - Toggle task completion status (Pending ↔ Completed)
4. **Update Task** - Modify task title and/or description
5. **Delete Task** - Remove tasks from the list

## Technology Stack

- **Language**: Python 3.13+
- **Package Manager**: UV
- **Testing**: pytest with coverage reporting
- **Linting**: Ruff
- **Type Checking**: mypy (strict mode)
- **Development Approach**: Test-Driven Development (TDD)
- **Methodology**: Spec-Driven Development with Claude Code

## Prerequisites

- Python 3.13 or higher
- UV package manager ([installation instructions](https://github.com/astral-sh/uv))

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd phase-1-console-app
```

### 2. Create virtual environment

```bash
uv venv
```

### 3. Activate virtual environment

**Windows (Git Bash/MSYS)**:
```bash
source .venv/Scripts/activate
```

**Linux/macOS**:
```bash
source .venv/bin/activate
```

### 4. Install dependencies

```bash
uv pip install -e ".[dev]"
```

## Usage

### Running the Application

```bash
python -m todo_app
```

### Menu Options

The application provides an interactive menu:

```
MAIN MENU
--------------------------------------------------
1. Add New Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Task as Complete/Pending
6. Exit
--------------------------------------------------
```

### Example Workflow

1. **Add a task**: Select option 1, enter title and description
2. **View tasks**: Select option 2 to see all tasks with their status
3. **Mark complete**: Select option 5, enter task ID to toggle status
4. **Update task**: Select option 3 to modify title/description
5. **Delete task**: Select option 4 to remove a task
6. **Exit**: Select option 6 to quit the application

## Development

### Project Structure

```
phase-1-console-app/
├── src/
│   └── todo_app/
│       ├── __init__.py         # Package initialization
│       ├── __main__.py         # Application entry point
│       ├── models.py           # Task data model with validation
│       ├── storage.py          # In-memory task storage
│       ├── operations.py       # Business logic layer
│       └── cli.py              # Command-line interface
├── tests/
│   ├── test_models.py          # Model tests
│   ├── test_storage.py         # Storage tests
│   ├── test_operations.py      # Operations tests
│   └── test_*_additional.py    # Additional test coverage
├── specs/
│   └── console-app.spec.md     # Feature specification
├── pyproject.toml              # Project configuration
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

### Running Tests

Run all tests:
```bash
pytest
```

Run tests with verbose output:
```bash
pytest -v
```

Run tests with coverage report:
```bash
pytest --cov=src/todo_app --cov-report=term-missing --cov-report=html
```

View HTML coverage report:
```bash
# Open htmlcov/index.html in your browser
```

### Code Quality

**Format code with Ruff**:
```bash
ruff format src/ tests/
```

**Check code with Ruff**:
```bash
ruff check src/ tests/
```

**Auto-fix Ruff issues**:
```bash
ruff check --fix src/ tests/
```

**Type check with mypy**:
```bash
mypy --strict src/
```

### Code Quality Standards

This project maintains high code quality standards:

- **Test Coverage**: 98.99% (exceeds 80% requirement)
  - models.py: 100%
  - storage.py: 100%
  - operations.py: 97.22%
- **Type Safety**: Full type hints with mypy strict mode
- **Code Style**: Ruff formatting and linting (zero warnings)
- **Testing**: Comprehensive TDD approach with 54 test cases

## Architecture

### Three-Layer Architecture

1. **Models Layer** (`models.py`)
   - Task dataclass with validation
   - Business rules enforcement
   - Data integrity

2. **Storage Layer** (`storage.py`)
   - In-memory task persistence
   - ID management
   - CRUD operations

3. **Operations Layer** (`operations.py`)
   - Business logic
   - User-friendly error handling
   - Transaction coordination

4. **CLI Layer** (`cli.py`)
   - User interface
   - Input validation
   - Output formatting

### Design Principles

- **Test-Driven Development**: All tests written before implementation
- **Clean Code**: Type hints, docstrings, and clear naming
- **SOLID Principles**: Single responsibility, dependency injection
- **Validation**: Input validation at multiple layers
- **Error Handling**: User-friendly error messages

## Spec-Driven Development Workflow

This project was built using Spec-Driven Development:

1. **Specification** (`specs/console-app.spec.md`) - User stories and acceptance criteria
2. **Planning** (`plan.md`) - Architecture and implementation strategy
3. **Tasks** (`tasks.md`) - Detailed task breakdown with TDD approach
4. **Implementation** - Code generated from specs using Claude Code
5. **Quality Gates** - Automated checks (ruff, mypy, pytest)

## Constraints

- **No Manual Coding**: Code generated by Claude Code from specifications
- **Spec Refinement**: If output is incorrect, refine the spec and regenerate
- **Constitution Compliance**: All code follows project principles

## Testing Strategy

### Test-Driven Development (TDD)

Following the Red-Green-Refactor cycle:

1. **Red Phase**: Write failing tests first
2. **Green Phase**: Implement minimal code to pass tests
3. **Refactor Phase**: Improve code while keeping tests green

### Test Organization

Tests are organized by layer and user story:
- Models layer tests (creation, validation, operations)
- Storage layer tests (CRUD operations)
- Operations layer tests (business logic, error handling)
- Independent test files for each user story

## License

This project is created for the Hackathon II: Spec-Driven Development.

## Acknowledgments

- Built with [Claude Code](https://claude.com/product/claude-code)
- Uses [Spec-Kit Plus](https://github.com/panaversity/spec-kit-plus)
- Part of Hackathon II: The Evolution of Todo

---

**Author**: Hackathon Participant
**Date**: 2025-12-31
**Phase**: I - In-Memory Console Application
