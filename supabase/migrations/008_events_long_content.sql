-- Ensure long_content columns exist in events table
-- Run this in Supabase SQL Editor if you get errors about missing columns

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS long_content_en TEXT,
ADD COLUMN IF NOT EXISTS long_content_de TEXT,
ADD COLUMN IF NOT EXISTS long_content_it TEXT,
ADD COLUMN IF NOT EXISTS long_content_fr TEXT,
ADD COLUMN IF NOT EXISTS long_content_hi TEXT,
ADD COLUMN IF NOT EXISTS long_content_si TEXT;
