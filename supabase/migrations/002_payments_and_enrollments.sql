-- ============================================
-- MIGRATION 002: Payments & Program Enrollments
-- Run this in Supabase SQL Editor
-- ============================================

-- Add payment_method to event_registrations
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'bank_transfer', 'free')),
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS bank_transfer_reference TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- ============================================
-- PROGRAM ENROLLMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
  payment_method TEXT DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'bank_transfer', 'free')),
  stripe_payment_intent_id TEXT,
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  bank_transfer_reference TEXT,
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, user_id)
);

-- RLS for program_enrollments
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments" ON program_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create enrollments" ON program_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to enrollments" ON program_enrollments
  FOR ALL USING (
    (auth.jwt()->>'role') = 'service_role'
  );

-- ============================================
-- BANK TRANSFER SETTINGS (stored in site_settings)
-- ============================================
INSERT INTO site_settings (key, value, description) VALUES
  ('bank_transfer_enabled', 'true', 'Enable bank transfer as payment method'),
  ('bank_name', '"Your Bank Name"', 'Bank name for transfers'),
  ('bank_iban', '"AT00 0000 0000 0000 0000"', 'IBAN for bank transfers'),
  ('bank_bic', '"BICCODE"', 'BIC/SWIFT code'),
  ('bank_account_holder', '"Infinity Role Teachers"', 'Account holder name')
ON CONFLICT (key) DO NOTHING;
