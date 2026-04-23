-- Add second phone number setting
INSERT INTO site_settings (key, value, description) VALUES
  ('contact_phone_2', '""', 'Secondary contact phone')
ON CONFLICT (key) DO NOTHING;
