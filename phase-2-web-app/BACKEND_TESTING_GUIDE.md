# Backend Testing Guide - Professional Features

## 🎯 Purpose
Test karne se pehle yeh guide follow karein taake saari nayi features properly kaam karein.

---

## Step 1: Database Migration ⚡

### Problem:
Purani database me nayi fields nahi hain (priority, due_date, category, tags, etc.)

### Solution: Drop & Recreate Tables

**⚠️ WARNING:** Yeh command **saara purana data delete** kar degi!

```bash
cd phase-2-web-app/backend

# Activate virtual environment (Windows Git Bash)
source .venv/Scripts/activate

# Drop old tables and create new ones
python -c "
import asyncio
from src.database import drop_tables, create_tables

async def reset_db():
    print('Dropping old tables...')
    await drop_tables()
    print('Creating new tables with all fields...')
    await create_tables()
    print('✅ Database reset complete!')

asyncio.run(reset_db())
"
```

### Alternative: Keep Data (Advanced)
Agar data rakhna hai to Alembic migrations use karein (optional):

```bash
# Install alembic
uv pip install alembic

# Initialize migrations
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Add professional features"

# Apply migration
alembic upgrade head
```

---

## Step 2: Backend Server Start 🚀

```bash
cd phase-2-web-app/backend
source .venv/Scripts/activate

# Start FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
Starting up: Creating database tables...
Database tables created successfully
```

---

## Step 3: API Testing with Swagger UI 📊

### Open Swagger Documentation
Browser me open karein: **http://localhost:8000/docs**

### Test Sequence:

#### 3.1 Health Check ✅
```
GET /health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "2.0.0"
}
```

---

#### 3.2 Create User Account 👤
```
POST /auth/signup
```
**Request Body:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (201):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "created_at": "2026-01-05T..."
  }
}
```

**📋 Copy the `access_token` value!**

---

#### 3.3 Authorize (Zaroori!) 🔐

Swagger UI ke top-right corner me **"Authorize"** button click karein:

```
Bearer <YOUR_TOKEN_HERE>
```

Example:
```
Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

Click **Authorize**, phir **Close**.

---

#### 3.4 Create Task with New Fields ✨

```
POST /tasks
```

**Request Body (Full Features):**
```json
{
  "title": "Complete Backend Testing",
  "description": "Test all professional features",
  "priority": "high",
  "due_date": "2026-01-10T23:59:59Z",
  "category": "Development",
  "tags": ["backend", "testing", "urgent"]
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Complete Backend Testing",
  "description": "Test all professional features",
  "completed": false,
  "priority": "high",
  "due_date": "2026-01-10T23:59:59Z",
  "category": "Development",
  "tags": ["backend", "testing", "urgent"],
  "position": 0,
  "archived": false,
  "subtasks": [],
  "created_at": "2026-01-05T...",
  "updated_at": "2026-01-05T..."
}
```

---

#### 3.5 Test Smart Filters 🎯

**Get Today's Tasks:**
```
GET /tasks/today
```

**Get Overdue Tasks:**
```
GET /tasks/overdue
```

**Get Upcoming Tasks (7 days):**
```
GET /tasks/upcoming?days=7
```

---

#### 3.6 Test Search & Filter 🔍

**Search in Title/Description:**
```
GET /tasks?search=backend
```

**Filter by Category:**
```
GET /tasks?category=Development
```

**Filter by Completion:**
```
GET /tasks?completed=false
```

**Sort by Priority:**
```
GET /tasks?sort_by=priority
```

**Sort by Due Date:**
```
GET /tasks?sort_by=due_date
```

**Combine Multiple Filters:**
```
GET /tasks?category=Development&completed=false&sort_by=priority
```

---

#### 3.7 Get Statistics 📈

```
GET /tasks/stats
```

**Expected Response:**
```json
{
  "total": 5,
  "completed": 2,
  "pending": 3,
  "completion_rate": 40.0,
  "high_priority": 2,
  "medium_priority": 1,
  "low_priority": 0,
  "overdue": 1
}
```

---

#### 3.8 Get Categories List 📁

```
GET /tasks/categories
```

**Expected Response:**
```json
["Development", "Personal", "Work", "Shopping"]
```

---

#### 3.9 Create Subtask ✓

```
POST /tasks/1/subtasks
```

**Request Body:**
```json
{
  "title": "Write unit tests"
}
```

**Expected Response (201):**
```json
{
  "id": 1,
  "task_id": 1,
  "title": "Write unit tests",
  "completed": false,
  "position": 0,
  "created_at": "2026-01-05T...",
  "updated_at": "2026-01-05T..."
}
```

---

#### 3.10 Update Subtask

```
PATCH /subtasks/1
```

**Request Body:**
```json
{
  "completed": true
}
```

---

#### 3.11 Bulk Update Positions (Drag & Drop) 🖱️

```
POST /tasks/bulk/positions
```

**Request Body:**
```json
{
  "1": 2,
  "2": 0,
  "3": 1
}
```

**Explanation:** Task ID 1 ko position 2 pe, Task ID 2 ko position 0 pe, etc.

---

#### 3.12 Export Tasks 📤

**Export as JSON:**
```
GET /tasks/export?format=json
```
Download hoga `tasks.json` file.

**Export as CSV:**
```
GET /tasks/export?format=csv
```
Download hoga `tasks.csv` file.

---

## Step 4: cURL Testing (Alternative) 💻

Agar Swagger UI se problem ho to cURL use karein:

```bash
# Set your token
TOKEN="your_token_here"

# Create task
curl -X POST http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "priority": "high",
    "category": "Testing"
  }'

# Get all tasks
curl -X GET http://localhost:8000/tasks \
  -H "Authorization: Bearer $TOKEN"

# Search tasks
curl -X GET "http://localhost:8000/tasks?search=test&sort_by=priority" \
  -H "Authorization: Bearer $TOKEN"

# Get stats
curl -X GET http://localhost:8000/tasks/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Step 5: Common Issues & Solutions 🔧

### Issue 1: "Column does not exist" Error
**Problem:** Purana database nayi fields nahi jaanta.

**Solution:**
```bash
# Drop and recreate tables (data lose hoga!)
python -c "
import asyncio
from src.database import drop_tables, create_tables
asyncio.run(drop_tables())
asyncio.run(create_tables())
"
```

---

### Issue 2: "401 Unauthorized"
**Problem:** Token expire ho gaya ya galat hai.

**Solution:**
1. Naya signup/login karein
2. Naya token copy karein
3. Swagger me "Authorize" karein
4. Token paste karein with "Bearer " prefix

---

### Issue 3: Import Error (Priority, Subtask)
**Problem:** `ImportError: cannot import name 'Priority'`

**Solution:**
```bash
# Restart uvicorn server
# Press Ctrl+C
uvicorn src.main:app --reload
```

---

### Issue 4: Database Connection Error
**Problem:** `asyncpg.exceptions.InvalidCatalogNameError`

**Solution:**
Check `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
```

Verify database exists on Neon.tech.

---

## ✅ Success Criteria

Aapka backend successful hai agar:

- ✅ Health check works (`/health`)
- ✅ User signup works
- ✅ Token authorization works
- ✅ Create task with priority, due_date, category, tags works
- ✅ Smart filters return correct results (today, overdue, upcoming)
- ✅ Search & filter work
- ✅ Statistics include priority breakdown and overdue count
- ✅ Categories endpoint lists unique categories
- ✅ Subtasks CRUD works
- ✅ Export downloads JSON/CSV files
- ✅ Bulk position update works

---

## Next Steps 🚀

Backend test ho jane ke baad:

1. ✅ Confirm all endpoints work
2. ✅ Note down any errors
3. 🔜 **Option C:** Frontend components step-by-step build karenge

---

**Questions?**
Koi issue aaye to batayein, main fix karunga! 🛠️
