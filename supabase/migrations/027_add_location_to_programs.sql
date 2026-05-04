-- Add location column to programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS location TEXT;
