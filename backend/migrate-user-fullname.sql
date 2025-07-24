-- Migration script to update User model from firstName/lastName to fullName
-- This script safely migrates existing data

-- Step 1: Add the new fullName column with a temporary default
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) DEFAULT 'Unknown User';

-- Step 2: Update existing records to combine firstName and lastName
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name) WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- Step 3: Remove the default constraint and make it required
ALTER TABLE users MODIFY COLUMN full_name VARCHAR(255) NOT NULL;

-- Step 4: Drop the old columns
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
