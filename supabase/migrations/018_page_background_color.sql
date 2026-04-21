ALTER TABLE pages
ADD COLUMN IF NOT EXISTS background_color TEXT;

UPDATE pages
SET background_color = NULL
WHERE background_color = '';
