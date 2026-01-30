#!/usr/bin/env python3
"""Fix Better Auth verification table column names.

Better Auth expects camelCase column names, not snake_case.
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


async def fix_verification_columns():
    """Recreate verification table with correct camelCase column names."""
    print("=" * 60)
    print("Fixing Better Auth Verification Table Columns")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Drop existing verification table
        print("[INFO] Dropping old 'verification' table...")
        await conn.execute("DROP TABLE IF EXISTS verification CASCADE;")
        print("[SUCCESS] Old table dropped!")

        # Create verification table with camelCase columns (Better Auth format)
        # Use double quotes to preserve camelCase in PostgreSQL
        print("[INFO] Creating 'verification' table with camelCase columns...")
        await conn.execute("""
            CREATE TABLE verification (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP
            );
        """)

        print("[SUCCESS] 'verification' table created with camelCase columns!")

        # Create index for performance
        print("[INFO] Creating index...")
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
        """)

        print("[SUCCESS] Index created!")

        # Verify table and columns
        print("[INFO] Verifying columns...")
        columns = await conn.fetch("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'verification' AND table_schema = 'public'
            ORDER BY ordinal_position
        """)

        print("[SUCCESS] Verification table columns:")
        for col in columns:
            print(f"   - {col['column_name']}: {col['data_type']}")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] Verification table columns fixed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(fix_verification_columns())
