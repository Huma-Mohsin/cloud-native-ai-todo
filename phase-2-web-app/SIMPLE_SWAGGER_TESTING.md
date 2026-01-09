# Swagger UI Testing - Bilkul Simple Steps

## Swagger UI Kya Dikhta Hai?

Jab aap `http://localhost:8000/docs` kholte hain to:

```
┌─────────────────────────────────────────────────┐
│  FastAPI - Todo API - Phase II                  │
│                                                  │
│  [Authorize] button (top right)                 │
└─────────────────────────────────────────────────┘

📋 Health (green section)
  GET  /health           Health check endpoint
  GET  /                 Root endpoint

📋 Tasks (green section)
  POST   /tasks                Create a new task
  GET    /tasks                Get all tasks
  GET    /tasks/stats          Get task statistics
  GET    /tasks/today          Get tasks due today
  GET    /tasks/overdue        Get overdue tasks
  GET    /tasks/upcoming       Get upcoming tasks
  GET    /tasks/categories     Get all categories
  POST   /tasks/bulk/positions Update positions
  GET    /tasks/export         Export tasks
  GET    /tasks/{task_id}      Get a task by ID
  PATCH  /tasks/{task_id}      Update a task
  DELETE /tasks/{task_id}      Delete a task

📋 Subtasks (green section)
  POST   /tasks/{task_id}/subtasks    Create subtask
  GET    /tasks/{task_id}/subtasks    Get subtasks
  PATCH  /subtasks/{subtask_id}       Update subtask
  DELETE /subtasks/{subtask_id}       Delete subtask

📋 Authentication (green section)
  POST   /auth/signup          Create account
  POST   /auth/login           Login
  POST   /auth/logout          Logout
```

---

## Test Karne Ka Simple Tareeqa

### Step 1: Health Check (Sabse Pehle)

1. **"/health" wale section ko dhoondo**
2. Us par **click** karein - wo expand hoga
3. **"Try it out"** button (right side) click karein
4. **"Execute"** button (blue color) click karein
5. Neeche **"Response"** section me dekhein:

```json
{
  "status": "healthy",
  "environment": "development",
  "version": "2.0.0"
}
```

Agar yeh dikha to **backend working hai!** ✅

---

### Step 2: Account Banana

1. **"POST /auth/signup"** section dhoondo
2. Click karein - expand hoga
3. **"Try it out"** click karein
4. **Request body** me yeh likha hoga (example):

```json
{
  "name": "string",
  "email": "user@example.com",
  "password": "string"
}
```

5. **Edit karein** - apni details dalein:

```json
{
  "name": "Huma",
  "email": "huma@test.com",
  "password": "Pass1234"
}
```

6. **"Execute"** click karein
7. Neeche **Response** me aayega (green background):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Huma",
    "email": "huma@test.com",
    "created_at": "2026-01-05T..."
  }
}
```

8. **IMPORTANT:** `access_token` ki value **copy** kar lein (poora long text)

---

### Step 3: Authorization (Zaroori!)

1. **Page ke top-right corner** me **"Authorize"** button hai (lock icon)
2. Click karein - popup khulega
3. Input box me **"Bearer "** type karein (space ke saath)
4. Uske baad token paste karein:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **"Authorize"** button click karein
6. **"Close"** button click karein
7. Lock icon **closed** (band) ho jayega - **matlab authorized!** 🔒✅

---

### Step 4: Task Banana (Professional Features Test)

1. **"POST /tasks"** section dhoondo
2. Click karein → **"Try it out"**
3. Request body me yeh hoga:

```json
{
  "title": "string",
  "description": "string"
}
```

4. **Edit karein** - nayi fields add karein:

```json
{
  "title": "Test Professional Todo",
  "description": "Testing all new features",
  "priority": "high",
  "due_date": "2026-01-10T18:00:00Z",
  "category": "Work",
  "tags": ["important", "backend"]
}
```

5. **"Execute"** click karein
6. Response me aayega (green):

```json
{
  "id": 1,
  "user_id": 1,
  "title": "Test Professional Todo",
  "description": "Testing all new features",
  "completed": false,
  "priority": "high",           ← NEW!
  "due_date": "2026-01-10...",  ← NEW!
  "category": "Work",           ← NEW!
  "tags": ["important", "backend"], ← NEW!
  "position": 0,                ← NEW!
  "archived": false,            ← NEW!
  "subtasks": [],               ← NEW!
  "created_at": "...",
  "updated_at": "..."
}
```

**Agar priority, category, tags dikhe to success!** ✅

---

### Step 5: Statistics Dekhna (Professional Stats)

1. **"GET /tasks/stats"** dhoondo
2. Click → **"Try it out"** → **"Execute"**
3. Response:

```json
{
  "total": 1,
  "completed": 0,
  "pending": 1,
  "completion_rate": 0.0,
  "high_priority": 1,      ← NEW!
  "medium_priority": 0,    ← NEW!
  "low_priority": 0,       ← NEW!
  "overdue": 0             ← NEW!
}
```

**Agar priority breakdown aur overdue dikhe to success!** ✅

---

### Step 6: Smart Filters Test

**Today's Tasks:**
1. **"GET /tasks/today"** dhoondo
2. **"Try it out"** → **"Execute"**
3. Response me aaj ke tasks dikhenge

**Overdue Tasks:**
1. **"GET /tasks/overdue"**
2. **"Try it out"** → **"Execute"**

**Upcoming (7 days):**
1. **"GET /tasks/upcoming"**
2. **"Try it out"**
3. `days` parameter = `7` (already filled)
4. **"Execute"**

---

### Step 7: Search & Filter Test

**Search Test:**
1. **"GET /tasks"** (pehla wala) dhoondo
2. **"Try it out"** click karein
3. Parameters dikhenge:
   - `completed` (dropdown)
   - `archived` (checkbox)
   - `category` (text box)
   - `search` (text box) ← **Yahan "test" likhein**
   - `sort_by` (dropdown)

4. `search` box me type karein: `test`
5. **"Execute"**
6. Response me sirf wo tasks aayenge jisme "test" word hai

**Category Filter:**
1. Same **"GET /tasks"** me
2. `category` box me: `Work`
3. **"Execute"**
4. Sirf Work category ke tasks aayenge

**Sort by Priority:**
1. `sort_by` dropdown me select karein: `priority`
2. **"Execute"**
3. Tasks priority order me (high → medium → low)

---

### Step 8: Subtask Banana

1. **"POST /tasks/{task_id}/subtasks"** dhoondo
2. **"Try it out"**
3. `task_id` parameter me: `1` (jo task aapne banaya tha)
4. Request body:

```json
{
  "title": "Complete backend testing"
}
```

5. **"Execute"**
6. Response:

```json
{
  "id": 1,
  "task_id": 1,
  "title": "Complete backend testing",
  "completed": false,
  "position": 0,
  "created_at": "...",
  "updated_at": "..."
}
```

**Subtask ban gaya!** ✅

---

### Step 9: Export Test

**JSON Export:**
1. **"GET /tasks/export"** dhoondo
2. **"Try it out"**
3. `format` parameter: `json` (already selected)
4. **"Execute"**
5. Neeche **"Download file"** link dikhega
6. Click karke `tasks.json` download hogi

**CSV Export:**
1. Same endpoint
2. `format` change karein to: `csv`
3. **"Execute"**
4. **"Download file"** → `tasks.csv` download hogi

---

## ✅ Success Checklist (Quickly Check)

Backend successful hai agar:

- [ ] Health check works (Status: healthy)
- [ ] Signup works (Token mila)
- [ ] Authorization works (Lock icon closed)
- [ ] Task me `priority`, `due_date`, `category`, `tags` fields hai
- [ ] Stats me `high_priority`, `overdue` fields hai
- [ ] Search `?search=test` works
- [ ] Subtask create hua
- [ ] Export se file download hui

---

## 🚫 Common Mistakes (Galtiyan)

### 1️⃣ **401 Unauthorized Error**
**Matlab:** Token nahi diya ya galat hai

**Fix:**
- "Authorize" button click karein
- Token paste karein with "Bearer " prefix
- Authorize karein

### 2️⃣ **422 Validation Error**
**Matlab:** Data galat format me hai

**Fix:**
- JSON syntax check karein (commas, quotes)
- Required fields fill karein
- Date format: `2026-01-10T18:00:00Z`

### 3️⃣ **404 Not Found**
**Matlab:** Task ID galat hai

**Fix:**
- Pehle task create karein
- Response me `id` dekh kar use karein

---

## Alternative: Testing Skip Karein?

Agar testing boring lag rahi hai to **skip kar sakte hain!**

**Main directly frontend components bana dun?** 🎨

1. Priority selector
2. Date picker
3. Category/tags input
4. Subtasks checklist
5. Search bar
6. Filters
7. Complete dashboard

Backend already ready hai, frontend banane se app complete ho jayegi aur **visually** test kar sakti hain! 👍

**Kya karein?**
- Testing continue karein (main help karunga) ✅
- Testing skip karein, frontend components banayein 🎨

Batayein! 😊
