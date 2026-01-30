#!/usr/bin/env python3
"""Fix Better Auth table names to match expected schema.

Better Auth expects singular table names:
- account (not accounts)
- session (not sessions)
- user (not users)
- verification (already correct)
"""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Convert asyncpg URL format
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


async def fix_table_names():
    """Rename Better Auth tables to singular form."""
    print("=" * 60)
    print("Fixing Better Auth Table Names")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Check existing tables
        print("[INFO] Checking existing tables...")
        existing = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'sessions', 'accounts', 'user', 'session', 'account')
            ORDER BY table_name
        """)

        print("[INFO] Existing tables:")
        for table in existing:
            print(f"   - {table['table_name']}")

        # Rename accounts -> account
        print("\n[INFO] Renaming 'accounts' to 'account'...")
        await conn.execute("DROP TABLE IF EXISTS account CASCADE;")
        await conn.execute("ALTER TABLE IF EXISTS accounts RENAME TO account;")
        print("[SUCCESS] Renamed accounts -> account")

        # Rename sessions -> session
        print("[INFO] Renaming 'sessions' to 'session'...")
        await conn.execute("DROP TABLE IF EXISTS session CASCADE;")
        await conn.execute("ALTER TABLE IF EXISTS sessions RENAME TO session;")
        print("[SUCCESS] Renamed sessions -> session")

        # Rename users -> user (user is a reserved keyword, need quotes)
        print("[INFO] Renaming 'users' to 'user'...")
        await conn.execute('DROP TABLE IF EXISTS "user" CASCADE;')
        await conn.execute('ALTER TABLE IF EXISTS users RENAME TO "user";')
        print("[SUCCESS] Renamed users -> user")

        # Verify new tables
        print("\n[INFO] Verifying renamed tables...")
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('user', 'session', 'account', 'verification')
            ORDER BY table_name
        """)

        print("[SUCCESS] Better Auth tables (singular names):")
        for table in tables:
            print(f"   ✓ {table['table_name']}")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] Table names fixed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(fix_table_names())
