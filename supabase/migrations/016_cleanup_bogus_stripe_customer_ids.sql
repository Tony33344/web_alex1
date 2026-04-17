-- Clear any bogus stripe_customer_id values (must start with 'cus_' for real Stripe customers)
UPDATE profiles SET stripe_customer_id = NULL
WHERE stripe_customer_id IS NOT NULL AND stripe_customer_id NOT LIKE 'cus_%';
