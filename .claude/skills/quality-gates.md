# Quality Gates Skill

**Skill Type**: Agent Skill for Automated Code Quality Enforcement

**Purpose**: Automates all quality checks and ensures code meets production standards before commits, PRs, or deployments.

## Description

This skill runs comprehensive quality gates that validate:
- Code formatting and style
- Type safety
- Test coverage
- Security vulnerabilities
- Documentation completeness
- Performance benchmarks (where applicable)

## Usage

Run quality gates before commits:

```
Run quality-gates on phase-1-console-app
```

Or as a slash command:

```
/quality-gates
```

Or integrated into CI/CD:

```
/quality-gates --ci-mode
```

## Quality Gate Checklist

### Gate 1: Code Formatting ✨

**Tool**: Ruff
**Threshold**: Zero formatting issues
**Auto-fix**: Yes

Checks:
- ✅ Line length ≤ 100 characters
- ✅ Consistent indentation (4 spaces)
- ✅ Import sorting (isort)
- ✅ Trailing whitespace removed
- ✅ Consistent quote style

**Command**:
```bash
ruff format src/ tests/
```

**Expected Output**: `N files reformatted, M files left unchanged`

---

### Gate 2: Code Linting 🔍

**Tool**: Ruff
**Threshold**: Zero warnings
**Auto-fix**: Partial (most issues)

Linting rules:
- ✅ pycodestyle (E, W)
- ✅ pyflakes (F)
- ✅ pep8-naming (N)
- ✅ pyupgrade (UP)
- ✅ flake8-bugbear (B)
- ✅ flake8-comprehensions (C4)
- ✅ flake8-simplify (SIM)

**Command**:
```bash
ruff check src/ tests/ --fix
```

**Expected Output**: `All checks passed` or `Found N errors (N fixed, 0 remaining)`

---

### Gate 3: Type Safety 🔒

**Tool**: Mypy (strict mode)
**Threshold**: Zero type errors
**Auto-fix**: No (manual fixes required)

Type checking requirements:
- ✅ All functions have type hints
- ✅ Return types specified
- ✅ No `Any` types (unless necessary)
- ✅ Generic types properly annotated
- ✅ Optional types handled correctly

**Command**:
```bash
mypy --strict src/
```

**Expected Output**: `Success: no issues found in N source files`

---

### Gate 4: Test Coverage 📊

**Tool**: Pytest + Coverage.py
**Threshold**: ≥80% (configurable)
**Auto-fix**: No (write more tests)

Coverage requirements:
- ✅ Overall coverage ≥80%
- ✅ models.py: 100% (critical business logic)
- ✅ storage.py: 100% (data persistence)
- ✅ operations.py: ≥90% (business operations)
- ✅ CLI/UI: Exempt (user interface)

**Command**:
```bash
pytest --cov=src --cov-report=term-missing --cov-report=html
```

**Expected Output**: `Required test coverage of 80.0% reached. Total coverage: XX.XX%`

---

### Gate 5: Test Execution ✅

**Tool**: Pytest
**Threshold**: 100% pass rate
**Auto-fix**: No (fix failing tests)

Test requirements:
- ✅ All tests pass
- ✅ No skipped tests (unless explicitly allowed)
- ✅ No flaky tests
- ✅ Test execution time <60s (for Phase I)

**Command**:
```bash
pytest -v
```

**Expected Output**: `N passed in X.XXs`

---

### Gate 6: Security Scan 🛡️

**Tool**: Bandit (Python security linter)
**Threshold**: Zero high/medium severity issues
**Auto-fix**: No (manual security review)

Security checks:
- ✅ No hardcoded secrets
- ✅ No SQL injection vulnerabilities
- ✅ No unsafe YAML loading
- ✅ No exec() or eval() usage
- ✅ No insecure random number generation

**Command**:
```bash
bandit -r src/ -ll
```

**Expected Output**: `No issues identified`

*(Note: Add bandit to dev dependencies if using this gate)*

---

### Gate 7: Documentation 📚

**Tool**: Custom validation script
**Threshold**: 100% documentation coverage
**Auto-fix**: Partial (generate stubs)

Documentation requirements:
- ✅ All public functions have docstrings
- ✅ All modules have docstrings
- ✅ All classes have docstrings
- ✅ Docstrings follow Google style
- ✅ README.md is comprehensive

**Validation**:
```python
# Check for missing docstrings
def validate_docstrings(path: str) -> bool:
    # Implementation checks all .py files
    pass
```

---

### Gate 8: Code Complexity 🧩

**Tool**: Radon (cyclomatic complexity)
**Threshold**: Complexity score ≤10 per function
**Auto-fix**: No (refactor complex functions)

Complexity requirements:
- ✅ No function >50 lines
- ✅ No file >300 lines
- ✅ Cyclomatic complexity ≤10
- ✅ Maintainability index ≥20

**Command**:
```bash
radon cc src/ -a -nb
```

**Expected Output**: `Average complexity: A (low)`

*(Note: Add radon to dev dependencies if using this gate)*

---

## Execution Modes

### Mode 1: Quick Check (Pre-commit)

Fast validation before committing:
```bash
# Run essential gates only
ruff format src/ tests/
ruff check src/ tests/ --fix
mypy --strict src/
pytest --tb=short
```

**Time**: ~10-15 seconds
**Use**: Before every commit

---

### Mode 2: Full Validation (Pre-PR)

Complete quality check before pull requests:
```bash
# Run all gates
ruff format src/ tests/
ruff check src/ tests/ --fix
mypy --strict src/
pytest --cov=src --cov-report=term-missing
# bandit -r src/ -ll (if configured)
# radon cc src/ (if configured)
```

**Time**: ~30-60 seconds
**Use**: Before creating PR

---

### Mode 3: CI/CD Mode (Automated)

Strict validation for continuous integration:
```bash
# No auto-fix, fail on any issue
ruff format --check src/ tests/
ruff check src/ tests/
mypy --strict src/
pytest --cov=src --cov-fail-under=80
```

**Time**: ~30-60 seconds
**Use**: GitHub Actions, CI/CD pipelines

---

## Configuration

Configure thresholds in `pyproject.toml`:

```toml
[tool.quality-gates]
coverage_threshold = 80
max_line_length = 100
max_function_lines = 50
max_file_lines = 300
max_complexity = 10
require_docstrings = true
security_scan = false  # Enable when bandit added
```

## Integration Examples

### Pre-commit Hook

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "Running quality gates..."
ruff format src/ tests/
ruff check src/ tests/ --fix
mypy --strict src/
pytest --tb=short -q

if [ $? -ne 0 ]; then
    echo "Quality gates failed. Commit aborted."
    exit 1
fi
```

### GitHub Actions Workflow

Create `.github/workflows/quality-gates.yml`:
```yaml
name: Quality Gates

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          pip install uv
          uv pip install -e ".[dev]"

      - name: Run quality gates
        run: |
          ruff format --check src/ tests/
          ruff check src/ tests/
          mypy --strict src/
          pytest --cov=src --cov-fail-under=80
```

### VS Code Integration

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Quality Gates",
      "type": "shell",
      "command": "./scripts/run-quality-gates.sh",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

## Skill Output Format

### Success Output
```
🎯 Quality Gates: PASSED ✅

Gate 1: Code Formatting ✅ (0 issues)
Gate 2: Code Linting    ✅ (0 warnings)
Gate 3: Type Safety     ✅ (0 errors)
Gate 4: Test Coverage   ✅ (98.99% ≥ 80%)
Gate 5: Test Execution  ✅ (54/54 passed)

Summary:
- All quality gates passed
- Code is production-ready
- Safe to commit/deploy
```

### Failure Output
```
🎯 Quality Gates: FAILED ❌

Gate 1: Code Formatting ✅ (0 issues)
Gate 2: Code Linting    ❌ (3 warnings)
Gate 3: Type Safety     ❌ (2 errors)
Gate 4: Test Coverage   ✅ (98.99% ≥ 80%)
Gate 5: Test Execution  ❌ (52/54 passed, 2 failed)

Issues Found:
📍 src/operations.py:47 - Unused import 'os'
📍 src/models.py:25 - Missing return type hint
📍 tests/test_operations.py::test_invalid_input - FAILED

Fix these issues before committing.
```

## Phase-Specific Gates

### Phase I (Console App)
- Focus: Core logic, TDD coverage
- Skip: UI testing, API tests

### Phase II (Web App)
- Add: API endpoint tests
- Add: Database integration tests
- Add: Security scanning (SQL injection)

### Phase III (Chatbot)
- Add: MCP tool validation
- Add: Agent behavior tests
- Add: Conversation flow tests

### Phase IV/V (Kubernetes)
- Add: Infrastructure validation
- Add: Deployment tests
- Add: Performance benchmarks

## Benefits

1. **Consistency**: Same quality standards across all code
2. **Automation**: No manual quality checks needed
3. **Speed**: Catch issues in 30-60 seconds
4. **Confidence**: Know code meets standards before PR
5. **Team Alignment**: Everyone follows same rules

## Reusability Score

This skill is reusable across:
- ✅ All 5 project phases
- ✅ Different project types
- ✅ CI/CD pipelines
- ✅ Pre-commit hooks
- ✅ IDE integrations

---

**Created**: 2025-12-31
**Version**: 1.0
**Reusable Intelligence Type**: Agent Skill
**Applicable Phases**: I, II, III, IV, V
**Bonus Points Qualification**: Reusable Intelligence (+200 points)
