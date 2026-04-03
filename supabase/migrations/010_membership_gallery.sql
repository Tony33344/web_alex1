-- Add gallery support to membership_plans table
-- Run this in Supabase SQL Editor

ALTER TABLE membership_plans
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
