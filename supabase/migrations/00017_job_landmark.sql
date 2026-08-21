-- Add landmark column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS landmark VARCHAR(100);
