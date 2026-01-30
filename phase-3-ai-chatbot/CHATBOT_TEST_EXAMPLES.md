# Chatbot CRUD Testing Examples

## Test Sequence - Complete Flow

### Step 1: CREATE Tasks
```
User: "Add task buy groceries"
Expected: ✅ Task 'Buy groceries' created (ID: 1)!

User: "Create task finish project report"
Expected: ✅ Task 'Finish project report' created (ID: 2)!

User: "I need to call dentist"
Expected: ✅ Task 'Call dentist' created (ID: 3)!

User: "Add task pay bills - electricity and water"
Expected: ✅ Task 'Pay bills' created (ID: 4)! Description: electricity and water
```

### Step 2: READ/LIST Tasks
```
User: "Show me all my tasks"
Expected:
Your tasks (4):

[ ] [1] Buy groceries
[ ] [2] Finish project report
[ ] [3] Call dentist
[ ] [4] Pay bills
   electricity and water

User: "List pending tasks"
Expected: Shows only incomplete tasks

User: "Show completed tasks"
Expected: "You don't have any completed tasks yet"
```

### Step 3: UPDATE Tasks

#### Update Title
```
User: "Update task 1 to Buy groceries and vegetables"
Expected: ✅ Updated title for task 1!

User: "Change task 2 to Complete quarterly report"
Expected: ✅ Updated title for task 2!
```

#### Update Priority
```
User: "Set priority high for task 1"
Expected: ✅ Updated priority to high for task 1!

User: "Update task 2 priority to medium"
Expected: ✅ Updated priority to medium for task 2!

User: "Change task 3 to low priority"
Expected: ✅ Updated priority to low for task 3!
```

#### Update Due Date
```
User: "Set due date tomorrow for task 1"
Expected: ✅ Updated due date for task 1!

User: "Update task 2 due today"
Expected: ✅ Updated due date for task 2!

User: "Change task 3 deadline to next week"
Expected: ✅ Updated due date for task 3!
```

#### Update Category
```
User: "Set category shopping for task 1"
Expected: ✅ Updated category to 'shopping' for task 1!

User: "Update task 2 category to work"
Expected: ✅ Updated category to 'work' for task 2!
```

#### Update Tags
```
User: "Add tags urgent, important to task 1"
Expected: ✅ Updated tags for task 1!

User: "Set tags work, deadline for task 2"
Expected: ✅ Updated tags for task 2!
```

#### Update Multiple Fields
```
User: "Update task 1 with priority high and due date tomorrow"
Expected: ✅ Updated priority to high, due date for task 1! Anything else you'd like to change?

User: "Set task 2 priority medium, category work, and due date today"
Expected: ✅ Updated priority to medium, category to 'work', due date for task 2!
```

### Step 4: COMPLETE Tasks
```
User: "Mark task 1 as complete"
Expected: ✅ Task 1 marked as complete!

User: "Complete task 2"
Expected: ✅ Task 2 marked as complete!

User: "Task 3 is done"
Expected: ✅ Task 3 marked as complete!

User: "Finished task 4"
Expected: ✅ Task 4 marked as complete!
```

### Step 5: Verify Completed
```
User: "Show completed tasks"
Expected:
Your tasks (4):

[X] [1] Buy groceries and vegetables
[X] [2] Complete quarterly report
[X] [3] Call dentist
[X] [4] Pay bills

User: "List pending tasks"
Expected: "You don't have any pending tasks"
```

### Step 6: DELETE Tasks
```
User: "Delete task 1"
Expected: ✅ Task 1 has been deleted

User: "Remove task 2"
Expected: ✅ Task 2 has been deleted

User: "Cancel task 3"
Expected: ✅ Task 3 has been deleted
```

### Step 7: Verify Deletion
```
User: "Show me all my tasks"
Expected:
Your tasks (1):

[X] [4] Pay bills
   electricity and water
```

---

## Advanced Test Scenarios

### Scenario 1: Quick Task Management
```
1. "Add task team meeting"
2. "Set priority high and due date tomorrow"
3. "Add category work and tags important, urgent"
4. "Show my tasks"
5. "Complete the meeting task"
6. "Delete it"
```

### Scenario 2: Multiple Tasks Same Category
```
1. "Add task review code"
2. "Create task write tests"
3. "New task deploy to staging"
4. "Set all to category work"
5. "Set priority high for task 1"
6. "Show work tasks"
```

### Scenario 3: Task Lifecycle
```
1. "Add task research competitors"
   → Task created with ID 1

2. "Set priority medium and category research"
   → Task updated with priority and category

3. "Add description to task 1: Look into pricing and features"
   → Description updated

4. "Update due date to next week"
   → Due date set

5. "Add tags competitive-analysis, market-research"
   → Tags added

6. "Show task 1"
   → View complete task details

7. "Mark as complete"
   → Task completed

8. "Delete task 1"
   → Task removed
```

---

## Edge Cases to Test

### Test Invalid Commands
```
User: "Delete"
Expected: "Please specify a task ID (e.g., 'Delete task 1')"

User: "Update something"
Expected: "Please specify task ID"

User: "Complete"
Expected: "Please specify a task ID"
```

### Test Non-existent Tasks
```
User: "Delete task 999"
Expected: "Failed to delete task: Task not found"

User: "Update task 888 to something"
Expected: "Failed to update task: Task not found"

User: "Complete task 777"
Expected: "Failed to complete task: Task not found"
```

### Test Empty Lists
```
User: "Show my tasks"
(when no tasks exist)
Expected: "You don't have any tasks yet. Try adding one!"
```

---

## Natural Language Variations

### CREATE Variations
```
✅ "Add task buy milk"
✅ "Create a task to buy milk"
✅ "New task: buy milk"
✅ "I need to buy milk"
✅ "Remember to buy milk"
✅ "Add buy milk"
```

### UPDATE Variations
```
✅ "Update task 1 to buy milk and bread"
✅ "Change task 1 title to buy milk"
✅ "Modify task 1 with new title"
✅ "Edit task 1"
✅ "Set task 1 priority high"
```

### LIST Variations
```
✅ "Show my tasks"
✅ "List all tasks"
✅ "What are my tasks?"
✅ "Show pending tasks"
✅ "List completed tasks"
✅ "What do I need to do?"
```

### COMPLETE Variations
```
✅ "Mark task 1 as complete"
✅ "Complete task 1"
✅ "Task 1 is done"
✅ "Finished task 1"
✅ "Mark as complete task 1"
```

### DELETE Variations
```
✅ "Delete task 1"
✅ "Remove task 1"
✅ "Cancel task 1"
✅ "Delete 1"
```

---

## Integration Testing

### Test with Dashboard Sync
1. Create task via chatbot
2. Verify it appears on dashboard
3. Update task via chatbot
4. Verify dashboard reflects changes
5. Complete task via chatbot
6. Verify dashboard shows completion
7. Delete task via chatbot
8. Verify task removed from dashboard

### Test Conversation History
1. Start conversation: "Add task test"
2. Continue: "Set priority high"
3. Continue: "Add tags testing"
4. Verify conversation context maintained
5. Verify all updates applied to same task

---

## Performance Testing

### Rapid Commands
```
1. "Add task 1"
2. "Add task 2"
3. "Add task 3"
4. "Show all tasks"
5. "Complete task 1"
6. "Complete task 2"
7. "Delete task 1"
8. "Delete task 2"
9. "Show remaining tasks"
```

---

## Expected Backend Behavior

### MCP Tool Calls
```
CREATE → calls add_task_handler
READ → calls list_tasks_handler
UPDATE → calls update_task_handler
DELETE → calls delete_task_handler
COMPLETE → calls complete_task_handler (via update_task with completed=true)
```

### Database Updates
```
CREATE → INSERT INTO tasks
READ → SELECT FROM tasks WHERE user_id = ?
UPDATE → UPDATE tasks SET ... WHERE id = ?
DELETE → DELETE FROM tasks WHERE id = ?
COMPLETE → UPDATE tasks SET completed = true WHERE id = ?
```

---

## Success Criteria

✅ All CREATE commands work with various phrasings
✅ All READ/LIST commands show correct filtered results
✅ All UPDATE commands modify correct fields
✅ All DELETE commands remove tasks permanently
✅ All COMPLETE commands mark tasks as done
✅ Task IDs are extracted correctly
✅ Multiple field updates work in one command
✅ Conversation history is maintained
✅ Database reflects all changes
✅ Dashboard syncs with chatbot operations
✅ Error messages are clear for invalid commands
✅ Edge cases handled gracefully
