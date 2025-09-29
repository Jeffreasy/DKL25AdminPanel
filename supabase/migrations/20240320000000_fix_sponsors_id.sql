-- Add a temporary column for the new id
ALTER TABLE sponsors ADD COLUMN new_id UUID;

-- Generate UUIDs for existing rows
UPDATE sponsors SET new_id = gen_random_uuid();

-- Make the new_id column NOT NULL
ALTER TABLE sponsors ALTER COLUMN new_id SET NOT NULL;

-- Drop the primary key constraint
ALTER TABLE sponsors DROP CONSTRAINT sponsors_pkey;

-- Rename the old id column
ALTER TABLE sponsors RENAME COLUMN id TO old_id;

-- Rename the new_id column to id
ALTER TABLE sponsors RENAME COLUMN new_id TO id;

-- Add primary key constraint to the new id column
ALTER TABLE sponsors ADD PRIMARY KEY (id);

-- Drop the old_id column
ALTER TABLE sponsors DROP COLUMN old_id;

-- Configure the id column for new rows
ALTER TABLE sponsors ALTER COLUMN id SET DEFAULT gen_random_uuid(); 