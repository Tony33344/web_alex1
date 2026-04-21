ALTER TABLE pages
ADD COLUMN IF NOT EXISTS banner_gradient_to TEXT,
ADD COLUMN IF NOT EXISTS banner_width TEXT NOT NULL DEFAULT 'full'
  CHECK (banner_width IN ('full', 'contained'));
