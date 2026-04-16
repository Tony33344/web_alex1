-- Add confirmed_at column to event_registrations and program_enrollments for tracking when payments are confirmed
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE program_enrollments ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
