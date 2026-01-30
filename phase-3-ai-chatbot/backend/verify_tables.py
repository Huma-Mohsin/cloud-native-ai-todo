#!/usr/bin/env python3
"""Verify Better Auth tables exist with correct names."""

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


async def verify_tables():
    """Verify all Better Auth tables exist."""
    print("=" * 60)
    print("Verifying Better Auth Tables")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Check all tables
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)

        print("\n[INFO] All tables in database:")
        for table in tables:
            print(f"   - {table['table_name']}")

        # Check Better Auth specific tables
        print("\n[INFO] Checking Better Auth tables...")
        required_tables = ['user', 'session', 'account', 'verification']

        for table_name in required_tables:
            # Use quotes for reserved keywords
            quoted_name = f'"{table_name}"' if table_name == 'user' else table_name
            exists = await conn.fetchval(f"""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = '{table_name}'
                )
            """)
            status = "EXISTS" if exists else "MISSING"
            print(f"   [{status}] {table_name}")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(verify_tables())
