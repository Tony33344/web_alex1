-- Add optional finish / end date to programs (auto-derivable from duration)
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS programs_end_date_idx ON programs (end_date);
