"""Fix user_id type issue in tasks table.

This script properly converts user_id from INTEGER to TEXT,
handling existing data if present.
"""

import os
import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def diagnose_and_fix():
    """Diagnose the issue and fix user_id type conversion."""

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ ERROR: DATABASE_URL not set!")
        return False

    print("🔍 DIAGNOSING USER_ID TYPE ISSUE...")
    print("=" * 70)
    print()

    try:
        engine = create_async_engine(database_url, echo=False)

        async with engine.begin() as conn:
            # Step 1: Check current state
            print("📊 Step 1: Checking current state...")

            result = await conn.execute(text("""
                SELECT column_name, data_type, udt_name
                FROM information_schema.columns
                WHERE table_name = 'tasks' AND column_name = 'user_id'
            """))

            row = result.fetchone()
            if row:
                print(f"   Current type: {row.data_type} ({row.udt_name})")

            # Step 2: Check if tasks table has data
            result = await conn.execute(text("SELECT COUNT(*) FROM tasks"))
            count = result.scalar()
            print(f"   Tasks in table: {count}")

            if count > 0:
                print(f"   ⚠️  Warning: {count} existing tasks found!")
                print(f"   These will be DELETED as INTEGER user_ids won't match TEXT user_ids")
                print()

                # Show existing tasks
                result = await conn.execute(text("""
                    SELECT id, user_id, title
                    FROM tasks
                    LIMIT 5
                """))

                print("   Existing tasks (first 5):")
                for task in result.fetchall():
                    print(f"     - Task {task.id}: user_id={task.user_id}, title='{task.title}'")

                print()
                confirm = input("   ⚠️  DELETE all existing tasks and proceed? (yes/no): ")

                if confirm.lower() != 'yes':
                    print("   ❌ Migration cancelled by user.")
                    return False

                # Delete all tasks
                print("   🗑️  Deleting existing tasks...")
                await conn.execute(text("DELETE FROM tasks"))
                print("   ✅ All tasks deleted")

            print()
            print("🔧 Step 2: Applying type conversion...")

            # Drop all constraints on user_id
            print("   Dropping constraints...")
            await conn.execute(text("""
                ALTER TABLE tasks
                DROP CONSTRAINT IF EXISTS tasks_user_id_fkey CASCADE
            """))

            # Drop any indexes on user_id
            await conn.execute(text("""
                DROP INDEX IF EXISTS ix_tasks_user_id CASCADE
            """))

            # Now convert the column type with USING clause
            print("   Converting user_id to TEXT...")
            await conn.execute(text("""
                ALTER TABLE tasks
                ALTER COLUMN user_id TYPE TEXT
                USING user_id::TEXT
            """))

            # Re-create the foreign key
            print("   Re-creating foreign key constraint...")
            await conn.execute(text("""
                ALTER TABLE tasks
                ADD CONSTRAINT tasks_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            """))

            # Re-create the index
            print("   Re-creating index...")
            await conn.execute(text("""
                CREATE INDEX ix_tasks_user_id ON tasks(user_id)
            """))

            print()
            print("✅ Type conversion completed!")
            print()

            # Step 3: Verify
            print("🔍 Step 3: Verifying changes...")

            result = await conn.execute(text("""
                SELECT column_name, data_type, udt_name
                FROM information_schema.columns
                WHERE table_name = 'tasks' AND column_name = 'user_id'
            """))

            row = result.fetchone()
            if row:
                print(f"   New type: {row.data_type} ({row.udt_name})")

                if row.data_type == 'text':
                    print()
                    print("=" * 70)
                    print("🎉 SUCCESS! user_id is now TEXT!")
                    print("=" * 70)
                    print()
                    print("📋 Next steps:")
                    print("1. Backend restart karo")
                    print("2. New users create karke test karo")
                    print("3. Tasks create karo aur verify karo")
                    return True
                else:
                    print()
                    print(f"❌ FAILED: user_id is still {row.data_type}")
                    return False

        await engine.dispose()
        return True

    except Exception as e:
        print()
        print(f"❌ ERROR during migration!")
        print(f"Error: {str(e)}")
        print()
        print("🔍 Debug info:")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("📁 Loaded .env file")
        print()
    except ImportError:
        print("⚠️  python-dotenv not installed")
        print()

    success = asyncio.run(diagnose_and_fix())

    if not success:
        print()
        print("💡 Alternative: Use Neon Console SQL Editor")
        print("1. Go to: https://console.neon.tech/")
        print("2. Open SQL Editor")
        print("3. Run this SQL:")
        print()
        print("""
-- Delete existing tasks (if any)
DELETE FROM tasks;

-- Drop constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey CASCADE;
DROP INDEX IF EXISTS ix_tasks_user_id CASCADE;

-- Convert type
ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Re-create constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX ix_tasks_user_id ON tasks(user_id);

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'user_id';
        """)
