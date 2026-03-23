-- Add brief_description columns to events table for homepage featured event snippet
-- Run this in Supabase SQL Editor

ALTER TABLE events
ADD COLUMN IF NOT EXISTS brief_description_en TEXT,
ADD COLUMN IF NOT EXISTS brief_description_de TEXT,
ADD COLUMN IF NOT EXISTS brief_description_it TEXT,
ADD COLUMN IF NOT EXISTS brief_description_fr TEXT,
ADD COLUMN IF NOT EXISTS brief_description_hi TEXT,
ADD COLUMN IF NOT EXISTS brief_description_si TEXT;
