-- ============================================
-- Gallery Images: polymorphic image gallery
-- Supports any entity type (teacher, event, program, health_category, page)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,          -- 'teacher', 'event', 'program', 'health_category', 'page'
  entity_id UUID NOT NULL,            -- FK to the parent entity
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_de TEXT,
  caption_it TEXT,
  caption_fr TEXT,
  caption_hi TEXT,
  caption_si TEXT,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by entity
CREATE INDEX IF NOT EXISTS idx_gallery_entity ON gallery_images (entity_type, entity_id, display_order);

-- RLS policies
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Gallery images are publicly readable"
  ON gallery_images FOR SELECT
  USING (is_visible = true);

-- Admin full access
CREATE POLICY "Admins can manage gallery images"
  ON gallery_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
  );
