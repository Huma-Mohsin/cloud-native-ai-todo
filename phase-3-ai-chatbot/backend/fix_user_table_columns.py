#!/usr/bin/env python3
"""Fix user table columns to match Better Auth expectations."""

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


async def fix_user_table():
    """Check and fix user table columns."""
    print("=" * 60)
    print("Fixing User Table Columns")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Check current columns
        print("[INFO] Checking current user table columns...")
        columns = await conn.fetch("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)

        print("[INFO] Current columns:")
        for col in columns:
            print(f"   - {col['column_name']}: {col['data_type']}")

        # Drop and recreate user table with correct schema
        print("\n[INFO] Recreating user table with correct schema...")

        # Drop the table
        await conn.execute('DROP TABLE IF EXISTS "user" CASCADE;')
        print("[INFO] Dropped old user table")

        # Create with correct camelCase columns
        await conn.execute('''
            CREATE TABLE "user" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                "emailVerified" BOOLEAN DEFAULT FALSE,
                name TEXT,
                image TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        ''')
        print("[SUCCESS] User table recreated with camelCase columns!")

        # Verify new columns
        print("\n[INFO] Verifying new columns...")
        new_columns = await conn.fetch("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'user' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)

        print("[SUCCESS] User table columns:")
        for col in new_columns:
            print(f"   + {col['column_name']}: {col['data_type']}")

        # Recreate foreign key constraints in session and account tables
        print("\n[INFO] Recreating foreign key constraints...")
        await conn.execute('ALTER TABLE session DROP CONSTRAINT IF EXISTS session_userId_fkey;')
        await conn.execute('ALTER TABLE session ADD CONSTRAINT session_userId_fkey FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;')

        await conn.execute('ALTER TABLE account DROP CONSTRAINT IF EXISTS account_userId_fkey;')
        await conn.execute('ALTER TABLE account ADD CONSTRAINT account_userId_fkey FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;')

        print("[SUCCESS] Foreign key constraints recreated!")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] User table fixed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(fix_user_table())
