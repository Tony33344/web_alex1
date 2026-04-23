-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CHF',
  message TEXT,
  payment_method VARCHAR(50) NOT NULL, -- 'stripe' or 'bank_transfer'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  stripe_payment_intent_id TEXT,
  bank_transfer_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own donations" ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all donations" ON donations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all donations" ON donations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donations_updated_at BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_donations_updated_at();
