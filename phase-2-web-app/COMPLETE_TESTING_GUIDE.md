# Complete Testing Guide - Professional Todo App
# Mukammal Testing Guide - Professional Todo App

Yeh guide aapko step-by-step batayegi ke har feature ko kaise test karna hai.
This guide will walk you through testing each feature step-by-step.

---

## Table of Contents
1. [Setup Phase](#setup-phase) - Pehle Setup
2. [Backend Testing](#backend-testing) - Backend Ko Test Karna
3. [Frontend Features Testing](#frontend-features-testing) - Frontend Features Ko Test Karna
4. [Common Issues](#common-issues) - Aam Maslay

---

## Setup Phase

### Step 1: Database Migration
**English:** Update the database with new fields (priority, due_date, category, tags, etc.)
**Roman Urdu:** Database ko naye fields ke sath update karen (priority, due_date, category, tags, etc.)

```bash
cd phase-2-web-app/backend
python reset_db.py
```

**Expected Output:**
```
Dropping existing tables...
Creating new tables with updated schema...
Database reset complete!
```

**Note:** ⚠️ Yeh existing data delete kar dega / This will delete existing data!

---

### Step 2: Start Backend Server
**Roman Urdu:** Backend server ko start karen

```bash
cd phase-2-web-app/backend
source .venv/Scripts/activate  # Windows Git Bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Verification:**
- Browser mein jao: http://localhost:8000/docs
- Swagger UI page dekho (API documentation)

---

### Step 3: Start Frontend Server
**Roman Urdu:** Frontend server ko start karen (new terminal mein)

```bash
cd phase-2-web-app/frontend
npm run dev
# OR
pnpm dev
```

**Expected Output:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
```

**Verification:**
- Browser mein jao: http://localhost:3000
- Login page dekho

---

## Backend Testing

### Quick Swagger UI Test
**Roman Urdu:** Swagger UI mein quick test

1. **Open:** http://localhost:8000/docs
2. **Register User:**
   - `/auth/register` endpoint kholen (green POST)
   - "Try it out" click karen
   - Example body:
     ```json
     {
       "email": "test@example.com",
       "password": "test123",
       "name": "Test User"
     }
     ```
   - "Execute" karen
   - Status 201 aana chahiye

3. **Login:**
   - `/auth/login` kholen
   - "Try it out" click karen
   - Email/password enter karen
   - "Execute" karen
   - **Token copy karen** (access_token field se)

4. **Authorize:**
   - Top pe "Authorize" button pe click karen
   - Token paste karen format mein: `Bearer YOUR_TOKEN`
   - "Authorize" karen

5. **Create Test Task:**
   - `/tasks` POST endpoint kholen
   - "Try it out" karen
   - Example:
     ```json
     {
       "title": "Test Priority Feature",
       "description": "Testing high priority task",
       "priority": "high",
       "due_date": "2026-01-10T18:00:00",
       "category": "Work",
       "tags": ["urgent", "test"]
     }
     ```
   - Status 201 aana chahiye

6. **Get Tasks:**
   - `/tasks` GET endpoint try karen
   - Aapka task priority, category, tags ke sath dikhe

7. **Smart Filters Test:**
   - `/tasks/today` - Today ke tasks
   - `/tasks/overdue` - Overdue tasks
   - `/tasks/upcoming?days=7` - Next 7 days

8. **Export Test:**
   - `/tasks/export?format=json` - JSON download
   - `/tasks/export?format=csv` - CSV download

✅ **Success:** Agar yeh sab kaam kare to backend ready hai!

---

## Frontend Features Testing

### Feature 1: User Registration & Login
**Roman Urdu:** User ko register aur login karna

**Test Steps:**
1. http://localhost:3000 kholen
2. "Sign Up" pe click karen
3. Email, password, name enter karen
4. "Sign Up" karen
5. Login page pe redirect ho
6. Same credentials se login karen
7. Dashboard page dekhe

**Expected Result:**
- Login successful ho
- Dashboard load ho
- Header mein "Welcome, [Your Name]" dikhe

---

### Feature 2: Priority Selector
**Roman Urdu:** Priority ko select karna test karen

**Test Steps:**
1. Dashboard pe "Create New Task" section dekhen
2. Title enter karen: "High Priority Test"
3. "Show advanced options" click karen
4. Priority buttons dekhen: Low (gray), Medium (blue), High (red)
5. "High" pe click karen - red color ho jana chahiye
6. Task create karen
7. Task list mein red badge "🔴 High" dikhe

**Expected Result:**
- Priority buttons colorful hon
- Selected priority highlight ho
- Created task mein correct priority badge dikhe

**Visual Check:**
- Low = Gray/White button, ⚪ Low badge
- Medium = Blue button, 🔵 Medium badge
- High = Red button, 🔴 High badge

---

### Feature 3: Date Picker with Presets
**Roman Urdu:** Due date aur presets ko test karen

**Test Steps:**
1. Task form mein "Due Date" section dekhen
2. Preset buttons check karen:
   - "Today" - Aaj ki date set kare
   - "Tomorrow" - Kal ki date set kare
   - "This Weekend" - Is hafte ke Sunday set kare
   - "Next Week" - Agla Monday set kare
   - "Next Month" - Agle mahine ki 1st set kare
3. Har preset pe click kar ke test karen
4. Manual date/time input bhi test karen
5. Task create karen due date ke sath

**Expected Result:**
- Har preset sahi date set kare
- Selected date/time form mein dikhe
- Created task mein "Due: [date]" dikhe
- Agar overdue ho to task red border ke sath dikhe

**Visual Check:**
- Due date format: "Due: Jan 10, 2026 at 6:00 PM"
- Overdue tasks ko red left border hona chahiye

---

### Feature 4: Category Selection
**Roman Urdu:** Category ko select karna

**Test Steps:**
1. "Category" dropdown kholen
2. Predefined categories dekhen: Work, Personal, Shopping, Health, Finance, Other
3. "Work" select karen - orange badge
4. Task create karen
5. New task mein "Personal" select kar ke try karen - blue badge
6. "Other" select kar ke custom category "Study" enter karen
7. Task create karen - gray badge dikhe

**Expected Result:**
- Dropdown mein categories list ho
- Selected category colored badge ho
- Custom category input kaam kare
- Task list mein category badges dikhen

**Visual Check:**
- Work = Orange badge 💼
- Personal = Blue badge 🏠
- Shopping = Green badge 🛒
- Health = Red badge 🏥
- Finance = Yellow badge 💰
- Custom = Gray badge

---

### Feature 5: Tags Input
**Roman Urdu:** Multiple tags add karna

**Test Steps:**
1. "Tags" input field dekhen
2. "urgent" type karen aur Enter press karen
3. "urgent" ka chip/pill dikhe with X button
4. "important" add karen aur Enter press karen
5. 5-6 tags add karen
6. Kisi tag ke X pe click kar ke remove karen
7. 10+ tags add karne ki koshish karen (max 10 allowed)
8. Task create karen

**Expected Result:**
- Enter press karne pe tag add ho
- Tags chips/pills ki tarah dikhen
- X button se tag remove ho
- Max 10 tags allowed
- Created task mein sare tags dikhen

**Visual Check:**
- Tags blue pills mein hon
- Hover karne pe X button red ho

---

### Feature 6: Subtasks / Checklist
**Roman Urdu:** Task ke andar checklist banana

**Test Steps:**
1. Koi task create karen aur save karen
2. Task list mein us task pe click karen (expand karne ke liye)
3. "Subtasks" section dekhen
4. "Add subtask" input mein type karen: "Step 1"
5. Enter press karen ya + button pe click karen
6. 3-4 subtasks add karen
7. Kisi subtask ke checkbox pe click karen - complete ho jana chahiye
8. Progress bar 25%, 50%, 75% update ho
9. Subtask delete button (🗑️) test karen
10. Parent task ko complete karen - subtasks disable ho jane chahiye

**Expected Result:**
- Subtasks list ban jaye
- Checkbox se complete/incomplete toggle ho
- Progress bar update ho (e.g., "2/4 subtasks completed")
- Parent complete hone pe subtasks disable hon

**Visual Check:**
- Progress bar blue color
- Completed subtasks ko line-through (strikethrough)
- Delete button red hover effect

---

### Feature 7: Search Functionality
**Roman Urdu:** Tasks ko search karna

**Test Steps:**
1. 5-10 different tasks create karen different titles ke sath
2. Dashboard pe top mein search bar dekhen (🔍 icon)
3. "urgent" type karen aur wait karen (300ms delay)
4. Sirf "urgent" wale tasks dikhen
5. Search clear karen (X button)
6. "work" search karen
7. Partial matches bhi check karen (e.g., "wor" type karen)

**Expected Result:**
- Type karne ke 300ms baad search filter apply ho
- Matching tasks hi dikhen
- X button se search clear ho
- Real-time filtering kaam kare

**Visual Check:**
- Search icon left side
- Clear button (X) right side when typing
- Results instant update hon

---

### Feature 8: Smart Filters
**Roman Urdu:** Quick filter tabs use karna

**Test Steps:**
1. Different due dates ke sath tasks create karen:
   - Aaj ki date (Today)
   - Kal ki date (Tomorrow/Upcoming)
   - 2 din purani date (Overdue)
   - Completed tasks
2. Smart filter tabs dekhen: All, Today, Overdue, Upcoming, Completed
3. Har tab pe click karen aur count verify karen
4. "Today" - sirf aaj ke tasks
5. "Overdue" - purane incomplete tasks
6. "Upcoming" - next 7 days ke tasks
7. "Completed" - sirf completed tasks

**Expected Result:**
- Active filter blue highlight ho
- Har tab pe task count badge dikhe
- Filter change karne pe tasks list update ho
- Correct tasks filter hon

**Visual Check:**
- Active tab: Blue background, blue border
- Inactive tabs: White background, gray border
- Count badges: Blue for active, gray for inactive
- Icons: 📋 All, 📅 Today, ⚠️ Overdue, 📆 Upcoming, ✅ Completed

---

### Feature 9: Sort Dropdown
**Roman Urdu:** Tasks ko different tarike se sort karna

**Test Steps:**
1. Multiple tasks create karen different dates/priorities ke sath
2. "Sort by" dropdown dekhen
3. Har option test karen:
   - "Date Created" (📅) - newest/oldest first
   - "Due Date" (⏰) - closest deadline first
   - "Priority" (⭐) - High → Medium → Low
   - "Custom Order" (↕️) - position field se
4. Sort change karne pe task order update ho

**Expected Result:**
- Dropdown mein 4 sort options hon
- Sort change karne pe tasks reorder hon
- Icons har option ke sath dikhen

---

### Feature 10: Advanced Filter Panel
**Roman Urdu:** Additional filters use karna

**Test Steps:**
1. "Show advanced filters" link pe click karen
2. Filter panel expand ho
3. **Category Filter:**
   - Dropdown se "Work" select karen
   - Sirf Work category ke tasks dikhen
   - "All Categories" select karen - sab dikhen
4. **Show Completed:**
   - Checkbox check karen
   - Completed + pending dono dikhen
   - Uncheck karen - sirf pending dikhen
5. **Show Archived:**
   - Koi task archive karen (edit mode mein)
   - Checkbox check karen - archived tasks dikhen
   - Uncheck karen - archived hide hon
6. **Reset Filters:**
   - Sare filters apply karen
   - "Reset filters" button click karen
   - Sab clear ho jane chahiye

**Expected Result:**
- Filters combine hoke kaam karen
- Reset button sab clear kar de
- Multiple filters ek sath apply hon

**Visual Check:**
- Gray background panel
- Dropdown + checkboxes properly aligned
- Reset button blue text

---

### Feature 11: Export Functionality
**Roman Urdu:** Tasks ko JSON/CSV mein download karna

**Test Steps:**
1. Header mein export buttons dekhen
2. **Export JSON:**
   - "Export JSON" button click karen
   - File download shuru ho (tasks.json)
   - File khol ke verify karen - JSON format mein tasks hon
3. **Export CSV:**
   - "Export CSV" button click karen
   - File download shuru ho (tasks.csv)
   - Excel/Sheets mein khol ke verify karen - table format mein tasks hon

**Expected Result:**
- Files download hon
- JSON: Readable JSON format
- CSV: Excel/Sheets mein properly open ho

**Visual Check:**
- Export buttons header right side
- Outline style buttons

---

### Feature 12: Enhanced Statistics
**Roman Urdu:** Dashboard pe statistics cards

**Test Steps:**
1. Multiple tasks create karen different priorities ke sath
2. Kuch tasks complete karen
3. Kuch tasks overdue karen (purani due date)
4. Dashboard top pe 8 stat cards dekhen:
   - **Total** (gray) - Kul tasks
   - **Pending** (orange) - Incomplete tasks
   - **Completed** (green) - Completed tasks
   - **Rate** (blue) - Completion percentage
   - **High** (red 🔴) - High priority count
   - **Medium** (yellow 🟡) - Medium priority count
   - **Low** (gray ⚪) - Low priority count
   - **Overdue** (red ⚠️) - Overdue tasks count
5. Task add/complete karne pe cards update hon

**Expected Result:**
- 8 cards properly colored
- Counts accurate hon
- Completion rate calculate ho (e.g., "67%")
- Real-time update ho

**Visual Check:**
- Cards responsive grid mein (2 cols on mobile, 4 on tablet, 8 on desktop)
- Color-coded backgrounds
- Icons for priority/overdue cards

---

### Feature 13: Task Editing
**Roman Urdu:** Existing task ko edit karna

**Test Steps:**
1. Kisi task pe "Edit" button (✏️) click karen
2. Edit mode open ho - sare fields editable hon
3. Title change karen
4. Priority change karen
5. Due date update karen
6. Category change karen
7. Tags add/remove karen
8. "Save" karen
9. Task updated dikhe

**Expected Result:**
- Edit mode properly open ho
- Sare fields editable hon
- Save karne pe changes apply hon
- Cancel button changes discard kare

**Visual Check:**
- Edit mode: Form fields with current values
- Save button blue
- Cancel button gray

---

### Feature 14: Task Deletion
**Roman Urdu:** Task ko delete karna

**Test Steps:**
1. Kisi task pe "Delete" button (🗑️) click karen
2. Confirmation popup aaye (optional, agar implement kiya ho)
3. Confirm karen
4. Task list se task remove ho jaye
5. Stats update hon

**Expected Result:**
- Task delete ho
- List se immediately remove ho
- No errors

---

### Feature 15: Overdue Indication
**Roman Urdu:** Overdue tasks ki visual indication

**Test Steps:**
1. Koi task create karen purani due date ke sath (e.g., 2 days ago)
2. Task list mein check karen
3. Task ko red left border hona chahiye
4. "Overdue" smart filter mein ye task dikhe
5. Overdue stat card mein count +1 ho

**Expected Result:**
- Overdue tasks visually distinct hon (red border)
- Smart filter mein properly filter hon
- Stats accurate hon

**Visual Check:**
- Red thick left border on overdue tasks
- Red "⚠️ Overdue" badge (optional)

---

## Common Issues

### Issue 1: Backend Not Starting
**Problem:** `ModuleNotFoundError` ya similar errors
**Solution:**
```bash
cd phase-2-web-app/backend
source .venv/Scripts/activate  # Activate virtual environment
pip install -r requirements.txt  # Install dependencies
```

---

### Issue 2: Database Connection Error
**Problem:** "Connection refused" ya "Database error"
**Solution:**
- `.env` file check karen
- `DATABASE_URL` correct hai ensure karen
- Database running hai verify karen

---

### Issue 3: Frontend API Calls Failing
**Problem:** Tasks load nahi ho rahe
**Solution:**
1. Backend server running hai check karen (http://localhost:8000/docs)
2. Browser console check karen (F12 → Console tab)
3. Network tab mein API calls dekhen
4. CORS errors check karen

---

### Issue 4: Token Expired
**Problem:** "Unauthorized" errors
**Solution:**
- Logout karen
- Login karen again
- New token generate hoga

---

### Issue 5: Tasks Not Filtering
**Problem:** Filters kaam nahi kar rahe
**Solution:**
1. Browser refresh karen (Ctrl+R)
2. Console mein errors check karen
3. Network tab mein API params check karen

---

## Testing Checklist

Copy-paste this checklist and check off as you test:

```
Setup:
[ ] Database migrated successfully
[ ] Backend server running (http://localhost:8000/docs)
[ ] Frontend server running (http://localhost:3000)
[ ] User registered and logged in

Core Features:
[ ] Task creation with title + description
[ ] Task completion toggle
[ ] Task editing
[ ] Task deletion

Professional Features:
[ ] Priority selector (Low/Medium/High) with colors
[ ] Date picker with presets (Today, Tomorrow, etc.)
[ ] Category selection (predefined + custom)
[ ] Tags input (add/remove chips)
[ ] Subtasks checklist with progress bar
[ ] Search with debouncing
[ ] Smart filters (All, Today, Overdue, Upcoming, Completed)
[ ] Sort dropdown (Date, Due Date, Priority, Position)
[ ] Advanced filters (Category, Show Completed, Show Archived)
[ ] Export JSON working
[ ] Export CSV working
[ ] Enhanced statistics (8 stat cards)
[ ] Overdue indication (red border)
[ ] Task editing modal/form
[ ] Timestamps display (Created, Updated)

Edge Cases:
[ ] Empty state messages (no tasks)
[ ] Loading states (spinners)
[ ] Error messages display
[ ] Max tags limit (10)
[ ] Completed parent disables subtasks
[ ] Filter combinations work together
[ ] Reset filters button works

UI/UX:
[ ] Responsive on mobile
[ ] Buttons have hover effects
[ ] Colors are consistent
[ ] Icons display properly
[ ] Forms validate input
[ ] Feedback messages show
```

---

## Success Criteria

Aapka app fully functional hai agar:

1. ✅ Sare 15 features kaam kar rahe hon
2. ✅ Backend API properly respond kar raha ho
3. ✅ Frontend UI professional dikhe
4. ✅ No console errors hon
5. ✅ Stats accurately calculate hon
6. ✅ Filters combine karke kaam karen
7. ✅ Export downloads properly hon

---

## Next Steps

Testing complete hone ke baad:

1. **Optional:** Dark Mode toggle add karen (Feature 4 in todo list)
2. **Deployment:** Production pe deploy karen
3. **Documentation:** User guide banayen
4. **Enhancements:** Additional features add karen

---

**Happy Testing! / Testing Shuru Karen! 🎉**

Kisi bhi problem ke liye mujhse poochenein!
For any problems, feel free to ask me!
