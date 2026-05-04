-- Add price_paid column to event_registrations and program_enrollments
-- This stores the actual price paid (early bird or regular) at the time of registration/enrollment
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);
ALTER TABLE program_enrollments ADD COLUMN IF NOT EXISTS price_paid DECIMAL(10,2);
