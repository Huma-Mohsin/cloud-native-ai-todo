#!/usr/bin/env python3
"""
Check existing database tables
"""
import asyncio
import asyncpg
import os


async def check_tables():
    """Check what tables exist in the database"""
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:T3EdLwVxC8Xg@ep-restless-water-a1uvgzo2-pooler.ap-southeast-1.aws.neon.tech/neondb?ssl=require"
    )
    database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(database_url)

        # Check if conversations table exists
        conv_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'conversations'
            )
        """)

        # Check if messages table exists
        msg_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'messages'
            )
        """)

        print(f"conversations table exists: {conv_exists}")
        print(f"messages table exists: {msg_exists}")

        if msg_exists:
            print("\nMessages table columns:")
            columns = await conn.fetch("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'messages'
                ORDER BY ordinal_position
            """)
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']}")

        await conn.close()

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(check_tables())
