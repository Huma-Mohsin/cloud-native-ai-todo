"""Quick script to check reminders in database."""

import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Load environment
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def check_reminders():
    """Check all reminders in database."""
    async with async_session() as session:
        # Query tasks with reminders
        result = await session.execute(
            text("""
                SELECT
                    id,
                    title,
                    user_id,
                    reminder_time,
                    reminder_enabled,
                    snooze_until,
                    snooze_count,
                    last_reminded_at,
                    completed
                FROM tasks
                WHERE reminder_enabled = TRUE
                ORDER BY reminder_time DESC
                LIMIT 10
            """)
        )

        tasks = result.fetchall()

        print("\n" + "="*70)
        print("📋 TASKS WITH REMINDERS ENABLED")
        print("="*70)

        if not tasks:
            print("❌ No tasks with reminders found!")
            return

        current_time = datetime.utcnow()
        print(f"\n⏰ Current UTC Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📍 Your local time might be different (check timezone)\n")

        for task in tasks:
            print(f"\n{'='*70}")
            print(f"Task ID: {task.id}")
            print(f"Title: {task.title}")
            print(f"User ID: {task.user_id}")
            print(f"Completed: {task.completed}")
            print(f"Reminder Enabled: {task.reminder_enabled}")
            print(f"Reminder Time: {task.reminder_time}")
            print(f"Snooze Until: {task.snooze_until}")
            print(f"Snooze Count: {task.snooze_count}")
            print(f"Last Reminded: {task.last_reminded_at}")

            # Check if should trigger
            trigger_time = task.snooze_until if task.snooze_until else task.reminder_time

            if trigger_time and not task.completed:
                time_diff = (current_time - trigger_time).total_seconds()
                print(f"\n🔔 Time Analysis:")
                print(f"   Trigger Time: {trigger_time}")
                print(f"   Current Time: {current_time}")
                print(f"   Time Difference: {time_diff:.1f} seconds")

                if time_diff >= 0:
                    print(f"   ✅ SHOULD TRIGGER NOW! (time has passed)")
                else:
                    print(f"   ⏳ Will trigger in {abs(time_diff):.1f} seconds")

                # Check last reminded
                if task.last_reminded_at:
                    since_last = (current_time - task.last_reminded_at).total_seconds()
                    print(f"   Last notified {since_last:.1f} seconds ago")
                    if since_last < 60:
                        print(f"   ⚠️ Recently notified (within 60s) - might be suppressed")


if __name__ == "__main__":
    print("\n🔍 Checking reminders in database...\n")
    asyncio.run(check_reminders())
    print("\n" + "="*70 + "\n")
