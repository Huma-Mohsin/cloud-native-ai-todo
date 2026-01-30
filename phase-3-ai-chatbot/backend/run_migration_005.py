"""Run migration 005: Fix task user_id type from INTEGER to TEXT.

This script runs the database migration to change tasks.user_id column
type to match Better Auth's TEXT user IDs.

Usage:
    python run_migration_005.py
"""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def run_migration():
    """Run the migration to fix user_id type."""

    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set!")
        print("Please create a .env file with your Neon PostgreSQL connection string.")
        print("Example: DATABASE_URL=postgresql+asyncpg://user:pass@host/db?ssl=require")
        return False

    print("🔧 Running Migration 005: Fix task user_id type...")
    print(f"📊 Database: {database_url.split('@')[1].split('/')[0]}")
    print()

    try:
        # Create async engine
        engine = create_async_engine(database_url, echo=False)

        # Read migration SQL
        migration_file = Path(__file__).parent / "migrations" / "005_fix_task_user_id_type.sql"

        if not migration_file.exists():
            print(f"❌ ERROR: Migration file not found: {migration_file}")
            return False

        migration_sql = migration_file.read_text()

        print("📝 Migration SQL:")
        print("-" * 60)
        print(migration_sql)
        print("-" * 60)
        print()

        # Execute migration
        async with engine.begin() as conn:
            print("⚙️  Executing migration...")

            # Split SQL into individual statements
            statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

            for i, statement in enumerate(statements, 1):
                if statement:
                    print(f"  Step {i}/{len(statements)}: Executing...")
                    result = await conn.execute(text(statement))

                    # If it's the verification query, show results
                    if "SELECT column_name" in statement:
                        rows = result.fetchall()
                        for row in rows:
                            print(f"    ✅ {row.column_name}: {row.data_type}")

        print()
        print("✅ Migration completed successfully!")
        print()
        print("📋 Next steps:")
        print("1. Restart your backend server")
        print("2. Test the application")
        print("3. Verify tasks are properly linked to users")

        await engine.dispose()
        return True

    except Exception as e:
        print(f"❌ ERROR: Migration failed!")
        print(f"Error: {str(e)}")
        print()
        print("🔍 Troubleshooting:")
        print("1. Check your DATABASE_URL is correct")
        print("2. Ensure you have network access to Neon")
        print("3. Verify the tasks table exists")
        print("4. Check if migration was already run (it's safe to run again)")
        return False


async def verify_migration():
    """Verify the migration was applied correctly."""

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        return

    try:
        engine = create_async_engine(database_url, echo=False)

        async with engine.begin() as conn:
            # Check user_id column type
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'tasks' AND column_name = 'user_id'
            """))

            row = result.fetchone()

            if row:
                print("\n🔍 Verification:")
                print(f"  Column: {row.column_name}")
                print(f"  Type: {row.data_type}")
                print(f"  Nullable: {row.is_nullable}")

                if row.data_type == 'text':
                    print("  ✅ Migration successful - user_id is now TEXT!")
                else:
                    print(f"  ⚠️  Warning - user_id is still {row.data_type}")
            else:
                print("\n⚠️  Warning: Could not find user_id column in tasks table")

        await engine.dispose()

    except Exception as e:
        print(f"\n⚠️  Verification failed: {str(e)}")


if __name__ == "__main__":
    # Load environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("📁 Loaded .env file")
    except ImportError:
        print("⚠️  python-dotenv not installed, using system environment variables")

    print()

    # Run migration
    success = asyncio.run(run_migration())

    if success:
        # Verify migration
        asyncio.run(verify_migration())
