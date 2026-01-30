#!/usr/bin/env python3
"""
Add Reminder Fields to Tasks Table

This migration adds reminder/alarm functionality to tasks:
- reminder_time: When to trigger the reminder
- reminder_enabled: Whether reminder is active
- snooze_until: If snoozed, when to remind again
- snooze_count: How many times user has snoozed
"""

import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def add_reminder_columns():
    """Add reminder-related columns to tasks table."""
    async with async_session() as session:
        try:
            print("🔄 Adding reminder columns to tasks table...")

            # Add reminder_time column
            await session.execute(
                text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMP
                """)
            )
            print("✅ Added reminder_time column")

            # Add reminder_enabled column
            await session.execute(
                text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT FALSE
                """)
            )
            print("✅ Added reminder_enabled column")

            # Add snooze_until column
            await session.execute(
                text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS snooze_until TIMESTAMP
                """)
            )
            print("✅ Added snooze_until column")

            # Add snooze_count column
            await session.execute(
                text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS snooze_count INTEGER DEFAULT 0
                """)
            )
            print("✅ Added snooze_count column")

            # Add last_reminded_at column (for tracking when user was last reminded)
            await session.execute(
                text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMP
                """)
            )
            print("✅ Added last_reminded_at column")

            # Commit changes
            await session.commit()

            print("\n✅ Migration completed successfully!")
            print("\n📊 Verifying schema...")

            # Verify columns exist
            result = await session.execute(
                text("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = 'tasks'
                    AND column_name IN ('reminder_time', 'reminder_enabled', 'snooze_until', 'snooze_count', 'last_reminded_at')
                    ORDER BY column_name
                """)
            )

            columns = result.fetchall()
            if columns:
                print("\n✅ Reminder columns verified:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]} (Nullable: {col[2]}, Default: {col[3]})")
            else:
                print("\n⚠️ Warning: Could not verify columns")

        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            await session.rollback()
            raise


async def main():
    """Main function."""
    print("=" * 60)
    print("Task Reminder Migration")
    print("=" * 60)
    print()

    await add_reminder_columns()

    print("\n" + "=" * 60)
    print("✅ Migration complete!")
    print("=" * 60)
    print("\nReminder features added:")
    print("  1. ⏰ Set reminders for tasks")
    print("  2. 🔔 Browser notifications")
    print("  3. ⏸️ Snooze functionality")
    print("  4. 📊 Track reminder history")


if __name__ == "__main__":
    asyncio.run(main())
