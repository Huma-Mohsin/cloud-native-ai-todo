#!/usr/bin/env python3
"""Fix Better Auth verification table naming.

Better Auth expects a 'verification' table but we created 'verification_tokens'.
This script creates the correct table name.
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


async def fix_verification_table():
    """Create verification table for Better Auth."""
    print("=" * 60)
    print("Fixing Better Auth Verification Table")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Create verification table (what Better Auth expects)
        print("[INFO] Creating 'verification' table...")
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS verification (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)

        print("[SUCCESS] 'verification' table created!")

        # Create index for performance
        print("[INFO] Creating index...")
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
        """)

        print("[SUCCESS] Index created!")

        # Verify table exists
        result = await conn.fetchrow("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'verification'
        """)

        if result:
            print(f"[SUCCESS] Table 'verification' verified in database!")
        else:
            print("[WARNING] Table not found after creation")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] Verification table fix completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(fix_verification_table())
