-- Add long_content columns to membership_plans table for detailed content
-- Run this in Supabase SQL Editor

ALTER TABLE membership_plans
ADD COLUMN IF NOT EXISTS long_content_en TEXT,
ADD COLUMN IF NOT EXISTS long_content_de TEXT,
ADD COLUMN IF NOT EXISTS long_content_it TEXT,
ADD COLUMN IF NOT EXISTS long_content_fr TEXT,
ADD COLUMN IF NOT EXISTS long_content_hi TEXT,
ADD COLUMN IF NOT EXISTS long_content_si TEXT,

ADD COLUMN IF NOT EXISTS content_image_url TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_en TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_de TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_it TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_fr TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_hi TEXT,
ADD COLUMN IF NOT EXISTS content_image_alt_si TEXT;
