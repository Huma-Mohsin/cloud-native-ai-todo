-- Fix Task user_id type to match Better Auth string IDs
-- This migration changes tasks.user_id from INTEGER to TEXT
-- to match the users.id column type from Better Auth

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Step 2: Change user_id column type from INTEGER to TEXT
ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT;

-- Step 3: Re-add the foreign key constraint
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'user_id';
