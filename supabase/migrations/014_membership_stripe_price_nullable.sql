-- Make stripe_price_id nullable for dynamic pricing support
ALTER TABLE membership_plans ALTER COLUMN stripe_price_id DROP NOT NULL;
