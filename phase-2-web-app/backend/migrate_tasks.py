"""Migration script to add missing columns to tasks table."""
import asyncio
from sqlalchemy import text
from src.database import engine


async def add_columns():
    """Add missing columns to tasks table."""
    async with engine.begin() as conn:
        print("Adding missing columns to tasks table...")

        # Add priority column as VARCHAR (simpler than ENUM)
        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'
        """))
        print("[OK] Priority column added")

        # Add other columns
        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS due_date TIMESTAMP
        """))
        print("[OK] due_date column added")

        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS category VARCHAR(50)
        """))
        print("[OK] category column added")

        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS tags JSON DEFAULT '[]'
        """))
        print("[OK] tags column added")

        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0
        """))
        print("[OK] position column added")

        await conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE
        """))
        print("[OK] archived column added")

        # Create indexes
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_tasks_user_id ON tasks(user_id)
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_tasks_position ON tasks(position)
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_tasks_archived ON tasks(archived)
        """))
        print("[OK] Indexes created")

        print()
        print("[SUCCESS] All columns added successfully!")


if __name__ == "__main__":
    asyncio.run(add_columns())
