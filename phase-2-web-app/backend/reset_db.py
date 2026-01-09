#!/usr/bin/env python3
"""
Database Reset Script

This script drops all existing tables and recreates them with the new schema.
⚠️ WARNING: This will DELETE all existing data!

Usage:
    python reset_db.py
"""

import asyncio
import sys
from src.database import drop_tables, create_tables, dispose_engine


async def reset_database():
    """Drop and recreate all database tables."""

    print("=" * 60)
    print("⚠️  DATABASE RESET SCRIPT")
    print("=" * 60)
    print()
    print("This script will:")
    print("  1. Drop all existing tables (users, tasks, subtasks)")
    print("  2. Recreate tables with new schema")
    print()
    print("⚠️  WARNING: ALL EXISTING DATA WILL BE DELETED!")
    print()

    # Ask for confirmation
    response = input("Are you sure you want to continue? (yes/no): ").strip().lower()

    if response not in ['yes', 'y']:
        print("\n❌ Operation cancelled.")
        sys.exit(0)

    print("\n" + "=" * 60)
    print("Starting database reset...")
    print("=" * 60)

    try:
        # Step 1: Drop existing tables
        print("\n📋 Step 1: Dropping existing tables...")
        await drop_tables()
        print("✅ Tables dropped successfully")

        # Step 2: Create new tables with updated schema
        print("\n📋 Step 2: Creating new tables with updated schema...")
        await create_tables()
        print("✅ Tables created successfully")

        # Step 3: Dispose engine
        print("\n📋 Step 3: Cleaning up database connections...")
        await dispose_engine()
        print("✅ Cleanup complete")

        print("\n" + "=" * 60)
        print("🎉 DATABASE RESET COMPLETE!")
        print("=" * 60)
        print()
        print("New schema includes:")
        print("  ✓ Users table")
        print("  ✓ Tasks table with:")
        print("    - priority (low/medium/high)")
        print("    - due_date")
        print("    - category")
        print("    - tags (JSON array)")
        print("    - position (for drag & drop)")
        print("    - archived flag")
        print("  ✓ Subtasks table")
        print()
        print("You can now start the server with:")
        print("  uvicorn src.main:app --reload")
        print()

    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ ERROR OCCURRED")
        print("=" * 60)
        print(f"\nError: {str(e)}")
        print()
        print("Possible solutions:")
        print("  1. Check your DATABASE_URL in .env file")
        print("  2. Ensure PostgreSQL database exists")
        print("  3. Verify database credentials are correct")
        print("  4. Check network connection to database")
        print()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(reset_database())
