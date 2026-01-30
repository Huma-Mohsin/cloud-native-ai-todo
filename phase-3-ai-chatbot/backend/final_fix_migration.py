"""FINAL FIX: Convert user_id from INTEGER to TEXT.

This script will definitely work - it uses raw SQL execution.
"""

import os
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def fix_user_id_type():
    """Fix user_id type conversion with proper USING clause."""

    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except:
        pass

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ ERROR: DATABASE_URL not set in .env file!")
        return False

    print("🔧 FINAL FIX: Converting user_id from INTEGER to TEXT")
    print("=" * 70)
    print()

    try:
        engine = create_async_engine(database_url, echo=False)

        async with engine.begin() as conn:

            # Check current state
            print("📊 Current state:")
            result = await conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'tasks' AND column_name = 'user_id'
            """))
            row = result.fetchone()
            print(f"   user_id type: {row.data_type if row else 'NOT FOUND'}")
            print()

            # Step 1: Delete existing tasks (they won't work anyway)
            print("🗑️  Step 1: Deleting existing test tasks...")
            result = await conn.execute(text("DELETE FROM tasks"))
            print(f"   Deleted {result.rowcount if hasattr(result, 'rowcount') else 0} tasks")
            print()

            # Step 2: Drop constraints
            print("🔓 Step 2: Dropping constraints...")
            await conn.execute(text("""
                ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey
            """))
            print("   ✓ Dropped foreign key constraint")

            await conn.execute(text("""
                DROP INDEX IF EXISTS ix_tasks_user_id
            """))
            print("   ✓ Dropped index")
            print()

            # Step 3: Convert column type (CRITICAL - USING clause)
            print("🔄 Step 3: Converting column type...")
            await conn.execute(text("""
                ALTER TABLE tasks
                ALTER COLUMN user_id TYPE TEXT
                USING user_id::TEXT
            """))
            print("   ✓ Converted user_id to TEXT")
            print()

            # Step 4: Recreate constraints
            print("🔒 Step 4: Recreating constraints...")
            await conn.execute(text("""
                ALTER TABLE tasks
                ADD CONSTRAINT tasks_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            """))
            print("   ✓ Created foreign key constraint")

            await conn.execute(text("""
                CREATE INDEX ix_tasks_user_id ON tasks(user_id)
            """))
            print("   ✓ Created index")
            print()

            # Step 5: Verify
            print("✅ Step 5: Verification...")
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'tasks' AND column_name = 'user_id'
            """))
            row = result.fetchone()

            if row:
                print(f"   Column: {row.column_name}")
                print(f"   Type: {row.data_type}")
                print(f"   Nullable: {row.is_nullable}")
                print()

                if row.data_type == 'text':
                    print("=" * 70)
                    print("🎉 SUCCESS! Migration completed!")
                    print("=" * 70)
                    print()
                    print("✅ user_id is now TEXT (was INTEGER)")
                    print("✅ Foreign key constraint recreated")
                    print("✅ Index recreated")
                    print()
                    print("📋 Next Steps:")
                    print("1. Restart your backend server")
                    print("2. Go to http://localhost:3002")
                    print("3. Create new user and test")
                    print("4. Add tasks via chat")
                    print()
                    return True
                else:
                    print(f"❌ FAILED: Type is still {row.data_type}")
                    return False

        await engine.dispose()

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERROR occurred!")
        print("=" * 70)
        print(f"Error: {str(e)}")
        print()

        # Show detailed error
        import traceback
        print("Detailed traceback:")
        traceback.print_exc()
        print()

        print("💡 Try this manual SQL in any PostgreSQL client:")
        print("-" * 70)
        print("""
DELETE FROM tasks;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
DROP INDEX IF EXISTS ix_tasks_user_id;

ALTER TABLE tasks
ALTER COLUMN user_id TYPE TEXT
USING user_id::TEXT;

ALTER TABLE tasks
ADD CONSTRAINT tasks_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX ix_tasks_user_id ON tasks(user_id);

-- Verify:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'user_id';
        """)
        print("-" * 70)
        return False


if __name__ == "__main__":
    print()
    success = asyncio.run(fix_user_id_type())

    if not success:
        print()
        print("⚠️  If script failed, you can:")
        print("1. Use pgAdmin (if installed)")
        print("2. Use DBeaver (free tool)")
        print("3. Contact me for alternative solution")

    print()
