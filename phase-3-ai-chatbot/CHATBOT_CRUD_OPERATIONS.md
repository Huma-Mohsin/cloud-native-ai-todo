# Chatbot CRUD Operations Guide

## Overview
Your Phase 3 AI Chatbot already supports **complete CRUD operations** (Create, Read, Update, Delete) through natural language commands! All task management can be done entirely through the chatbot.

## Available Operations

### 1. CREATE - Add New Tasks

**Keywords:** `add`, `create`, `new task`, `remember to`, `need to`

**Examples:**
```
✅ "Add a task to buy groceries"
✅ "Create a task to call mom"
✅ "New task: Finish project report"
✅ "I need to schedule dentist appointment"
✅ "Remember to pay electricity bill"
```

**With Description:**
```
✅ "Add task buy groceries - milk, eggs, bread"
✅ "Create task meeting prep - prepare slides and agenda"
```

**Response:**
- Chatbot will create the task immediately
- Show quick action buttons for customization (priority, due date, category, tags)
- Display task ID for future reference

---

### 2. READ - List/View Tasks

**Keywords:** `show`, `list`, `what`, `my tasks`, `pending`, `completed`

**Examples:**
```
✅ "Show me all my tasks"
✅ "List my tasks"
✅ "What are my pending tasks?"
✅ "Show completed tasks"
✅ "What tasks do I have?"
```

**Response:**
```
Your tasks (3):

[ ] [1] Buy groceries
   milk, eggs, bread

[ ] [2] Call mom

[X] [3] Finish project report
```

---

### 3. UPDATE - Modify Existing Tasks

**Keywords:** `update`, `change`, `modify`, `edit`, `set`

#### Update Title:
```
✅ "Update task 1 to Buy groceries and vegetables"
✅ "Change task 2 to Call mom tomorrow"
```

#### Update Priority:
```
✅ "Set priority high for task 1"
✅ "Update task 2 priority to medium"
✅ "Change task 3 to low priority"
```

#### Update Due Date:
```
✅ "Set due date tomorrow for task 1"
✅ "Update task 2 due today"
✅ "Change task 3 deadline to next week"
```

#### Update Category:
```
✅ "Set category work for task 1"
✅ "Update task 2 category to personal"
```

#### Update Tags:
```
✅ "Add tags urgent, important to task 1"
✅ "Set tags groceries, shopping for task 2"
```

#### Update Description:
```
✅ "Update task 1 description to Remember to buy organic milk"
```

#### Multiple Fields at Once:
```
✅ "Update task 1 with priority high and due date tomorrow"
✅ "Set task 2 priority medium, category work, and tags urgent"
```

**Response:**
```
✅ Updated priority to high, due date for task 1! Anything else you'd like to change?
```

---

### 4. DELETE - Remove Tasks

**Keywords:** `delete`, `remove`, `cancel`

**Examples:**
```
✅ "Delete task 1"
✅ "Remove task 3"
✅ "Cancel task 2"
```

**Response:**
```
✅ Task 1 has been deleted
```

---

### 5. COMPLETE - Mark as Done

**Keywords:** `complete`, `done`, `finish`, `mark as complete`

**Examples:**
```
✅ "Mark task 1 as complete"
✅ "Complete task 2"
✅ "Task 3 is done"
✅ "Finished task 4"
```

**Response:**
```
✅ Task 1 marked as complete!
```

---

## Implementation Details

### Backend Files:
1. **Agent Service** (`src/services/agent_service.py`):
   - `_handle_add_task()` - Line 215
   - `_handle_list_tasks()` - Line 301
   - `_handle_update_task()` - Line 374
   - `_handle_delete_task()` - Line 354
   - `_handle_complete_task()` - Line 334

2. **MCP Server** (`src/mcp/server.py`):
   - Registers all 5 CRUD tools
   - Provides OpenAI-compatible tool definitions

3. **MCP Tools** (`src/mcp/tools.py`):
   - Individual handlers for each operation

4. **Task Service** (`src/services/task_service.py`):
   - Database operations for all CRUD

### Supported Task Fields:
- ✅ Title (required)
- ✅ Description (optional)
- ✅ Priority (high/medium/low)
- ✅ Due Date (datetime)
- ✅ Category (text)
- ✅ Tags (array of strings)
- ✅ Completed (boolean)
- ✅ Position (integer)
- ✅ Archived (boolean)

---

## Natural Language Processing

The chatbot uses **pattern matching** to understand commands:

### Pattern Recognition:
```python
# CREATE patterns
["add", "create", "new task", "remember to", "need to"]

# READ patterns
["show", "list", "what", "my tasks", "pending", "completed"]

# UPDATE patterns
["update", "change", "modify", "edit", "set"]
+ Specific fields: ["priority", "due", "category", "tags", "description"]

# DELETE patterns
["delete", "remove", "cancel"]

# COMPLETE patterns
["complete", "done", "finish", "mark as complete"]
```

### Task ID Extraction:
```python
# Regex pattern
r"(?:task\s+)?(\d+)"

# Examples:
"Update task 1" → task_id = 1
"Delete 5" → task_id = 5
"Mark task 42 as complete" → task_id = 42
```

---

## Testing All Operations

### Test Scenario 1: Complete CRUD Flow
```
User: "Add task buy groceries"
Bot: "✅ Task 'Buy groceries' created (ID: 1)!"

User: "Set priority high for task 1"
Bot: "✅ Updated priority to high for task 1!"

User: "Show me all my tasks"
Bot: "Your tasks (1):
     [ ] [1] Buy groceries"

User: "Complete task 1"
Bot: "✅ Task 1 marked as complete!"

User: "Delete task 1"
Bot: "✅ Task 1 has been deleted"
```

### Test Scenario 2: Multiple Updates
```
User: "Add task project deadline"
Bot: "✅ Task 'Project deadline' created (ID: 2)!"

User: "Update task 2 with priority high and due date tomorrow"
Bot: "✅ Updated priority to high, due date for task 2!"

User: "Set category work and tags urgent, important for task 2"
Bot: "✅ Updated category to 'work', tags for task 2!"
```

---

## Known Features

### ✅ What's Working:
1. All CRUD operations through natural language
2. Pattern-based command recognition
3. Task ID extraction from messages
4. Multiple field updates in single command
5. Due date parsing (tomorrow, today, next week)
6. Priority levels (high, medium, low)
7. Categories and tags support
8. Conversation history tracking

### 🎯 Quick Actions:
- When creating a task, chatbot offers quick action buttons
- Interactive UI for setting priority, due date, category, tags
- Frontend can display these as clickable buttons

---

## How to Test

1. **Start Backend:**
   ```bash
   cd phase-3-ai-chatbot/backend
   source venv/Scripts/activate
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd phase-3-ai-chatbot/frontend
   npm run dev
   ```

3. **Test Commands:**
   - Open chatbot interface
   - Try each operation type
   - Verify database updates
   - Check dashboard reflects changes

---

## API Endpoint

**POST** `/api/{user_id}/chat`

**Request:**
```json
{
  "conversation_id": null,
  "message": "Add task buy groceries"
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": 1,
  "response": "✅ Task 'Buy groceries' created (ID: 42)!",
  "quick_actions": {...},
  "tool_calls": [{"tool": "add_task", "result": "success"}]
}
```

---

## Conclusion

**Your chatbot already has complete CRUD functionality!** Users can:
- ✅ Create tasks with natural language
- ✅ List all/pending/completed tasks
- ✅ Update any task field (title, priority, due date, category, tags, description)
- ✅ Delete tasks
- ✅ Mark tasks as complete

**Everything is controlled through the chatbot - no need to use dashboard controls!**
