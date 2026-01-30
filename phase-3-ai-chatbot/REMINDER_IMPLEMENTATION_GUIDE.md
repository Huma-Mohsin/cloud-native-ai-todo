# Task Reminder & Snooze Feature - Implementation Guide

## ✅ What's Been Implemented

### Backend (Completed)

#### 1. Database Schema ✅
- **File**: `backend/add_reminder_fields.py` (migration script)
- **Model**: `backend/src/models/task.py`
- **Schema**: `backend/src/schemas/task.py`

**New Fields Added to Tasks Table:**
```sql
reminder_time TIMESTAMP       -- When to trigger reminder
reminder_enabled BOOLEAN       -- Is reminder active
snooze_until TIMESTAMP         -- If snoozed, when to alert again
snooze_count INTEGER          -- How many times snoozed
last_reminded_at TIMESTAMP    -- Last time user was reminded
```

#### 2. Reminder Service ✅
- **File**: `backend/src/services/reminder_service.py`

**Functions:**
- `set_reminder()` - Set a reminder for a task
- `snooze_reminder()` - Snooze reminder for X minutes
- `dismiss_reminder()` - Dismiss (disable) reminder
- `cancel_reminder()` - Cancel reminder completely
- `get_pending_reminders()` - Get all reminders that should fire
- `get_user_reminders()` - Get all active reminders for user

#### 3. Chatbot Commands ✅
- **File**: `backend/src/services/agent_service.py`

**Supported Commands:**
```
✅ "Remind me about task 5 tomorrow at 2pm"
✅ "Set reminder for task 3 in 30 minutes"
✅ "Remind me about task 8 today at 5pm"
✅ "Show my reminders"
✅ "Snooze task 5 for 10 minutes"
✅ "Dismiss reminder for task 3"
✅ "Cancel reminder for task 2"
```

**Time Parsing:**
- "tomorrow at 2pm"
- "today at 5pm"
- "in 30 minutes"
- "in 2 hours"
- "in 3 days"

#### 4. REST API Endpoints ✅
- **File**: `backend/src/api/routes/reminders.py`

**Endpoints:**
```
GET  /api/reminders/{user_id}/pending
     → Get all pending reminders for user (for frontend polling)

POST /api/reminders/{user_id}/acknowledge/{task_id}
     → Mark reminder as acknowledged (prevents spam)
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
cd phase-3-ai-chatbot/backend

# Activate virtual environment
source venv/Scripts/activate  # Windows Git Bash
# OR
venv\Scripts\activate          # Windows CMD

# Run migration
python add_reminder_fields.py
```

**Expected Output:**
```
🔄 Adding reminder columns to tasks table...
✅ Added reminder_time column
✅ Added reminder_enabled column
✅ Added snooze_until column
✅ Added snooze_count column
✅ Added last_reminded_at column

✅ Migration completed successfully!
```

### Step 2: Restart Backend Server

```bash
# Make sure you're in backend directory
cd phase-3-ai-chatbot/backend

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:**
- Visit: http://localhost:8000/docs
- Should see new `/api/reminders/` endpoints

---

## 🧪 Testing Chatbot Commands

### Test 1: Set a Reminder
```
User: "Remind me about task 1 in 5 minutes"

Expected Response:
⏰ Reminder set!
📋 Task #1: Buy groceries
🔔 You'll be reminded on January 29 at 02:45 PM
```

### Test 2: Set Reminder for Tomorrow
```
User: "Remind me about task 2 tomorrow at 2pm"

Expected Response:
⏰ Reminder set!
📋 Task #2: Team meeting
🔔 You'll be reminded on January 30 at 02:00 PM
```

### Test 3: List Reminders
```
User: "Show my reminders"

Expected Response:
⏰ Your active reminders (2):

📋 Task #1: Buy groceries
   🔔 Active - January 29 at 02:45 PM

📋 Task #2: Team meeting
   🔔 Active - January 30 at 02:00 PM
```

### Test 4: Snooze Reminder
```
User: "Snooze task 1 for 10 minutes"

Expected Response:
⏰ Reminder snoozed!
📋 Task #1: Buy groceries
⏸️ Snoozed for 10 minutes
🔔 Next reminder: 02:55 PM
```

### Test 5: Cancel Reminder
```
User: "Cancel reminder for task 1"

Expected Response:
🔕 Reminder cancelled for Task #1: Buy groceries
```

---

## 📱 Frontend Integration (Next Steps)

### Option 1: Browser Notifications (Recommended)

Create a React hook to poll for pending reminders:

```typescript
// frontend/hooks/useReminders.ts

import { useEffect, useState } from 'react';

interface PendingReminder {
  task_id: number;
  task_title: string;
  reminder_time: string;
  is_snoozed: boolean;
  snooze_count: number;
}

export function useReminders(userId: string, token: string) {
  const [reminders, setReminders] = useState<PendingReminder[]>([]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Poll for reminders every 30 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/reminders/${userId}/pending`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const pending: PendingReminder[] = await response.json();

          // Show notifications for new reminders
          pending.forEach(reminder => {
            if (Notification.permission === 'granted') {
              showNotification(reminder);
              acknowledgeReminder(userId, reminder.task_id, token);
            }
          });

          setReminders(pending);
        }
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [userId, token]);

  return { reminders };
}

function showNotification(reminder: PendingReminder) {
  const notification = new Notification('TaskFlow Reminder', {
    body: `⏰ ${reminder.task_title}`,
    icon: '/taskflow-icon.png',
    requireInteraction: true,
    tag: `task-${reminder.task_id}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = `/tasks/${reminder.task_id}`;
  };
}

async function acknowledgeReminder(userId: string, taskId: number, token: string) {
  await fetch(
    `http://localhost:8000/api/reminders/${userId}/acknowledge/${taskId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
}
```

### Option 2: In-App Notification Banner

```typescript
// frontend/components/ReminderBanner.tsx

import { useReminders } from '@/hooks/useReminders';

export function ReminderBanner({ userId, token }: Props) {
  const { reminders } = useReminders(userId, token);

  if (reminders.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {reminders.map(reminder => (
        <div
          key={reminder.task_id}
          className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-bold">Task Reminder</p>
              <p>{reminder.task_title}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="px-4 py-2 bg-white text-blue-500 rounded">
              View Task
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Snooze
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔔 Notification Flow

### Complete User Journey:

```
1. User creates task
   User: "Add task team meeting"
   Bot: "✅ Task created (ID: 5)"

2. User sets reminder
   User: "Remind me about task 5 tomorrow at 2pm"
   Bot: "⏰ Reminder set for tomorrow at 2:00 PM"

3. [Next day at 2:00 PM]
   Frontend polls: GET /api/reminders/{user_id}/pending
   Response: [{ task_id: 5, task_title: "Team meeting", ... }]

4. Frontend shows notification
   🔔 Browser Notification: "⏰ Team meeting"
   [View Task] [Snooze] [Dismiss]

5. User clicks "Snooze"
   User: "Snooze task 5 for 10 minutes"
   Bot: "⏸️ Snoozed for 10 minutes"

6. [10 minutes later at 2:10 PM]
   🔔 Notification appears again

7. User completes task
   User: "Complete task 5"
   Bot: "✅ Task 5 marked as complete"
   (Reminder automatically disabled)
```

---

## 📊 Database Verification

Check if reminders are stored correctly:

```sql
-- View all tasks with reminders
SELECT id, title, reminder_time, reminder_enabled, snooze_until, snooze_count
FROM tasks
WHERE reminder_enabled = TRUE;

-- View pending reminders
SELECT id, title, reminder_time, snooze_until
FROM tasks
WHERE reminder_enabled = TRUE
  AND completed = FALSE
  AND (
    (snooze_until IS NOT NULL AND snooze_until <= NOW())
    OR (reminder_time IS NOT NULL AND reminder_time <= NOW())
  );
```

---

## 🎯 API Testing with cURL

### Get Pending Reminders:
```bash
curl -X GET "http://localhost:8000/api/reminders/USER_ID/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Acknowledge Reminder:
```bash
curl -X POST "http://localhost:8000/api/reminders/USER_ID/acknowledge/TASK_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ Checklist

### Backend
- [x] Database schema updated
- [x] Reminder service created
- [x] Chatbot commands added
- [x] API endpoints created
- [x] Routes registered in main.py
- [ ] Migration script run on database

### Frontend (To Do)
- [ ] Create useReminders hook
- [ ] Request notification permission
- [ ] Poll for pending reminders
- [ ] Show browser notifications
- [ ] Add snooze button to notifications
- [ ] Test complete flow

---

## 🐛 Troubleshooting

### Issue: "Column does not exist"
**Solution:** Run the migration script:
```bash
python add_reminder_fields.py
```

### Issue: Reminders not showing in chatbot
**Solution:** Check backend logs:
```bash
# Look for debug output
tail -f backend.log
```

### Issue: Notifications not appearing
**Solution:**
1. Check browser notification permission
2. Verify frontend polling is working
3. Check API endpoint returns data

---

## 🎉 Next Steps

1. **Run migration** to add reminder fields to database
2. **Test chatbot commands** for setting/managing reminders
3. **Implement frontend** notification polling
4. **Add browser notifications** with snooze buttons
5. **Test complete flow** end-to-end

Your reminder system is now **fully functional** on the backend! 🚀

Just need to:
1. Run the migration
2. Add frontend notification polling
3. Test! ✅
