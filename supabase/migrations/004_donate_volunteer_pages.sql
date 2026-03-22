-- Seed Donate and Volunteer pages into the pages table
-- These are managed via Admin > About alongside Mission and Vision

INSERT INTO pages (slug, title_en, content_en, meta_description_en, is_published, page_order)
VALUES
  ('donate', 'Donate', '<p>Support the Infinity Role Teachers community. Your generous contributions help us continue our mission of fostering self-realisation and conscious living.</p>', 'Support our work and help us build a home for the seeker.', true, 3),
  ('volunteer', 'Volunteer', '<p>Join the Infinity Role Teachers community as a volunteer. Share your time, skills, and energy to help us grow and serve more seekers on their path.</p>', 'Join our community and contribute your time and skills.', true, 4)
ON CONFLICT (slug) DO NOTHING;
