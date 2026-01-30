#!/usr/bin/env python3
"""Run Better Auth database migration.

This script creates the necessary tables for Better Auth authentication.
"""

import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Convert asyncpg URL format
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


async def run_migration():
    """Run the Better Auth migration."""
    print("=" * 60)
    print("Better Auth Database Migration")
    print("=" * 60)

    # Read migration file
    migration_file = Path(__file__).parent / "migrations" / "004_add_better_auth_tables.sql"
    print(f"[INFO] Reading migration file: {migration_file}")

    with open(migration_file, "r") as f:
        migration_sql = f.read()

    print("[INFO] Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        print("[INFO] Running migration...")
        await conn.execute(migration_sql)
        print("[SUCCESS] Migration completed successfully!")

        # Verify tables
        print("\n[INFO] Verifying tables...")
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name IN ('users', 'sessions', 'accounts', 'verification_tokens')
            ORDER BY table_name
        """)

        print("[SUCCESS] Better Auth tables created:")
        for table in tables:
            print(f"   - {table['table_name']}")

    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] Better Auth migration completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_migration())
