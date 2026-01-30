#!/usr/bin/env python3
"""Create all Better Auth tables with correct singular names and camelCase columns."""

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


async def create_better_auth_tables():
    """Create all Better Auth tables from scratch."""
    print("=" * 60)
    print("Creating Better Auth Tables")
    print("=" * 60)

    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Create user table (quoted because it's a reserved keyword)
        print("[INFO] Creating 'user' table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS "user" (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                "emailVerified" BOOLEAN DEFAULT FALSE,
                name TEXT,
                image TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        ''')
        print("[SUCCESS] 'user' table created!")

        # Create session table
        print("[INFO] Creating 'session' table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS session (
                id TEXT PRIMARY KEY,
                "expiresAt" TIMESTAMP NOT NULL,
                token TEXT UNIQUE NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
            );
        ''')
        print("[SUCCESS] 'session' table created!")

        # Create account table (for OAuth providers)
        print("[INFO] Creating 'account' table...")
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS account (
                id TEXT PRIMARY KEY,
                "accountId" TEXT NOT NULL,
                "providerId" TEXT NOT NULL,
                "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                "accessToken" TEXT,
                "refreshToken" TEXT,
                "idToken" TEXT,
                "accessTokenExpiresAt" TIMESTAMP,
                "refreshTokenExpiresAt" TIMESTAMP,
                scope TEXT,
                password TEXT,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                UNIQUE("providerId", "accountId")
            );
        ''')
        print("[SUCCESS] 'account' table created!")

        # Verification table already exists from previous script

        # Create indexes
        print("[INFO] Creating indexes...")
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_session_user_id ON session("userId");')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_account_user_id ON account("userId");')
        await conn.execute('CREATE INDEX IF NOT EXISTS idx_account_provider ON account("providerId", "accountId");')
        print("[SUCCESS] Indexes created!")

        # Verify tables
        print("\n[INFO] Verifying tables...")
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('user', 'session', 'account', 'verification')
            ORDER BY table_name
        """)

        print("[SUCCESS] Better Auth tables verified:")
        for table in tables:
            print(f"   + {table['table_name']}")

    except Exception as e:
        print(f"[ERROR] Failed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await conn.close()

    print("\n" + "=" * 60)
    print("[SUCCESS] Better Auth tables created!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(create_better_auth_tables())
