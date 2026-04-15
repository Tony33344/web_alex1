-- Add header_logo_url column to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS header_logo_url TEXT;
