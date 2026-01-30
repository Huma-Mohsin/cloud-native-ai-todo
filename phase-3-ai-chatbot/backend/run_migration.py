#!/usr/bin/env python3
"""
Phase III Database Migration Script
Runs the 003_add_chat_tables.sql migration
"""
import asyncio
import asyncpg
import os
from pathlib import Path


async def run_migration():
    """Run the Phase III database migration"""
    # Get database URL from environment
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:T3EdLwVxC8Xg@ep-restless-water-a1uvgzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?ssl=require"
    )

    # Convert asyncpg URL format (remove +asyncpg if present)
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

    # Read migration file
    migration_file = Path(__file__).parent / "migrations" / "003_add_chat_tables.sql"

    if not migration_file.exists():
        print(f"[ERROR] Migration file not found: {migration_file}")
        return False

    print(f"[INFO] Reading migration file: {migration_file}")
    migration_sql = migration_file.read_text()

    try:
        # Connect to database
        print("[INFO] Connecting to database...")
        conn = await asyncpg.connect(database_url)

        print("[INFO] Running migration...")

        # Execute the entire migration as a single transaction
        # This handles $$ delimiters in functions correctly
        try:
            print("\n[DEBUG] Executing migration SQL...")
            await conn.execute(migration_sql)
            print("  [OK] Migration SQL executed successfully")
        except Exception as e:
            # If table already exists, that's okay
            if "already exists" in str(e):
                print(f"  [WARN] {e} (continuing)")
            else:
                print(f"  [ERROR] Failed to execute migration")
                raise

        # Verify tables were created
        print("\n[INFO] Verifying tables...")
        tables = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('conversations', 'messages')
            ORDER BY table_name
        """)

        if len(tables) == 2:
            print("[SUCCESS] Migration successful! Tables created:")
            for table in tables:
                print(f"   - {table['table_name']}")

            # Verify indexes
            print("\n[INFO] Verifying indexes...")
            indexes = await conn.fetch("""
                SELECT indexname
                FROM pg_indexes
                WHERE tablename IN ('conversations', 'messages')
                AND indexname LIKE 'idx_%'
                ORDER BY indexname
            """)

            print(f"[SUCCESS] {len(indexes)} indexes created:")
            for idx in indexes:
                print(f"   - {idx['indexname']}")

            result = True
        else:
            print(f"[ERROR] Migration failed! Expected 2 tables, found {len(tables)}")
            result = False

        await conn.close()
        return result

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Phase III Database Migration")
    print("=" * 60)

    success = asyncio.run(run_migration())

    if success:
        print("\n" + "=" * 60)
        print("[SUCCESS] Migration completed successfully!")
        print("=" * 60)
        exit(0)
    else:
        print("\n" + "=" * 60)
        print("[ERROR] Migration failed!")
        print("=" * 60)
        exit(1)
