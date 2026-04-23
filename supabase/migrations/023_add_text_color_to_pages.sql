-- Add configurable text color to pages
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS text_color VARCHAR(32) DEFAULT '#404040';
