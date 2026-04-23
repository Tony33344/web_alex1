-- Add optional start_date to programs so they can be sorted earliest-first
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS programs_start_date_idx ON programs (start_date);
