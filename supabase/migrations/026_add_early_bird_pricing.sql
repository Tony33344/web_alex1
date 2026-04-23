-- Early-bird discount pricing for programs and events
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS early_bird_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS early_bird_stripe_price_id TEXT;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS early_bird_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS early_bird_stripe_price_id TEXT;
