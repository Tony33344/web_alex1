-- Create program_enrollments table
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
  payment_method TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'CHF',
  bank_transfer_reference TEXT,
  stripe_payment_intent_id TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, user_id)
);

-- Enable RLS
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own enrollments" ON program_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enrollments" ON program_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON program_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
