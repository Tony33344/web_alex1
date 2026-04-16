-- ============================================
-- Event Waitlist Table
-- ============================================

CREATE TABLE IF NOT EXISTS event_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  -- 'member' = existing paying member, 'registered_user' = has account but no membership, 'guest' = no account
  participant_type TEXT NOT NULL DEFAULT 'guest' CHECK (participant_type IN ('member', 'registered_user', 'guest')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'confirmed', 'cancelled')),
  position INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-assign position on insert
CREATE OR REPLACE FUNCTION set_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1
  INTO NEW.position
  FROM event_waitlist
  WHERE event_id = NEW.event_id AND status != 'cancelled';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_waitlist_position
BEFORE INSERT ON event_waitlist
FOR EACH ROW EXECUTE FUNCTION set_waitlist_position();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_waitlist_updated_at
BEFORE UPDATE ON event_waitlist
FOR EACH ROW EXECUTE FUNCTION update_waitlist_updated_at();

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_event_waitlist_event_id ON event_waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_email ON event_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_user_id ON event_waitlist(user_id);

-- RLS
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- Admins can do everything (service role bypasses RLS)
CREATE POLICY "Admin full access" ON event_waitlist
  FOR ALL USING (true);
