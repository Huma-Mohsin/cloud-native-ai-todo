#!/usr/bin/env python3
"""
Reset Task ID Sequence Script

This script will:
1. Delete all tasks for a specific user (optional)
2. Reset the task ID sequence to start from 1
3. Useful when you want fresh task IDs without gaps

WARNING: This will delete tasks! Use with caution.
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


async def reset_task_sequence(delete_all_tasks: bool = False, user_id: str | None = None):
    """Reset the task ID sequence.

    Args:
        delete_all_tasks: If True, deletes all tasks before resetting sequence
        user_id: If provided, only deletes tasks for this user
    """
    async with async_session() as session:
        try:
            # Step 1: Delete tasks (optional)
            if delete_all_tasks:
                if user_id:
                    # Delete only for specific user
                    result = await session.execute(
                        text("DELETE FROM tasks WHERE user_id = :user_id"),
                        {"user_id": user_id}
                    )
                    deleted_count = result.rowcount
                    print(f"✅ Deleted {deleted_count} tasks for user {user_id}")
                else:
                    # Delete all tasks
                    result = await session.execute(text("DELETE FROM tasks"))
                    deleted_count = result.rowcount
                    print(f"✅ Deleted {deleted_count} tasks (all users)")

            # Step 2: Get current max ID
            result = await session.execute(text("SELECT MAX(id) FROM tasks"))
            max_id = result.scalar()

            if max_id is None:
                # No tasks exist, reset to 1
                next_id = 1
            else:
                # Tasks exist, set next ID after max
                next_id = max_id + 1

            # Step 3: Reset the sequence
            await session.execute(
                text(f"ALTER SEQUENCE tasks_id_seq RESTART WITH {next_id}")
            )
            print(f"✅ Sequence reset! Next task ID will be: {next_id}")

            # Commit changes
            await session.commit()

            # Step 4: Verify
            result = await session.execute(
                text("SELECT last_value FROM tasks_id_seq")
            )
            current_value = result.scalar()
            print(f"✅ Current sequence value: {current_value}")

            # Show remaining tasks
            result = await session.execute(text("SELECT COUNT(*) FROM tasks"))
            task_count = result.scalar()
            print(f"📊 Total tasks in database: {task_count}")

            if task_count > 0:
                result = await session.execute(
                    text("SELECT id, title, user_id FROM tasks ORDER BY id")
                )
                tasks = result.fetchall()
                print("\n📋 Current tasks:")
                for task in tasks:
                    print(f"  - ID {task[0]}: {task[1]} (User: {task[2]})")

            print("\n✅ Sequence reset complete!")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            await session.rollback()
            raise


async def main():
    """Main function with interactive prompts."""
    print("=" * 60)
    print("Task ID Sequence Reset Tool")
    print("=" * 60)
    print()

    # Ask user what they want to do
    print("What would you like to do?")
    print("1. Delete ALL tasks and reset sequence to 1")
    print("2. Delete tasks for SPECIFIC user and reset sequence")
    print("3. Just reset sequence (keep existing tasks)")
    print()

    choice = input("Enter choice (1/2/3): ").strip()

    if choice == "1":
        confirm = input("⚠️  DELETE ALL TASKS? This cannot be undone! (yes/no): ").strip().lower()
        if confirm == "yes":
            await reset_task_sequence(delete_all_tasks=True)
        else:
            print("❌ Cancelled.")

    elif choice == "2":
        user_id = input("Enter user ID (from Better Auth): ").strip()
        if user_id:
            confirm = input(f"⚠️  DELETE all tasks for user {user_id}? (yes/no): ").strip().lower()
            if confirm == "yes":
                await reset_task_sequence(delete_all_tasks=True, user_id=user_id)
            else:
                print("❌ Cancelled.")
        else:
            print("❌ Invalid user ID.")

    elif choice == "3":
        print("ℹ️  This will reset sequence based on current max ID.")
        confirm = input("Continue? (yes/no): ").strip().lower()
        if confirm == "yes":
            await reset_task_sequence(delete_all_tasks=False)
        else:
            print("❌ Cancelled.")

    else:
        print("❌ Invalid choice.")


if __name__ == "__main__":
    asyncio.run(main())
