#!/usr/bin/env python3
"""Fix tasks table - remove foreign key constraint."""

import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")


async def fix_tasks_table():
    """Drop and recreate tasks table WITHOUT foreign key constraint."""
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        print("Dropping existing tasks table...")
        await conn.execute("DROP TABLE IF EXISTS tasks CASCADE")
        print("[OK] Tasks table dropped")

        print("Creating tasks table WITHOUT foreign key...")
        await conn.execute("""
            CREATE TABLE tasks (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description VARCHAR(1000),
                completed BOOLEAN DEFAULT FALSE,
                priority VARCHAR(20) DEFAULT 'medium',
                due_date TIMESTAMP,
                category VARCHAR(50),
                tags JSONB DEFAULT '[]',
                position INTEGER DEFAULT 0,
                archived BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("[OK] Tasks table created")

        # Create indexes
        await conn.execute("CREATE INDEX idx_tasks_user_id ON tasks(user_id)")
        await conn.execute("CREATE INDEX idx_tasks_position ON tasks(position)")
        await conn.execute("CREATE INDEX idx_tasks_archived ON tasks(archived)")
        print("[OK] Indexes created")

        print("\n[SUCCESS] Tasks table fixed successfully!")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(fix_tasks_table())
