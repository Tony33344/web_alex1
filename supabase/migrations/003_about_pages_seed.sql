-- ============================================
-- SEED: Mission & Vision pages
-- Run this in Supabase SQL Editor
-- Safe to re-run (uses ON CONFLICT)
-- ============================================
 
INSERT INTO pages (slug, title_en, content_en, meta_description_en, is_published, page_order)
VALUES (
  'mission',
  'Our Mission',
  '<h2>Transforming Lives Through Holistic Wellness</h2>
<p>At Infinity Role Teachers, our mission is to empower individuals on their journey toward complete well-being — body, mind, and spirit. We believe that every person carries infinite potential waiting to be awakened.</p>
<p>Through our carefully developed programs in Sunyoga, Acupresura, meditation, and holistic coaching, we guide our students to discover their inner strength and live in harmony with themselves and the world around them.</p>
<h3>What Drives Us</h3>
<ul>
  <li><strong>Authenticity</strong> — Teaching methods rooted in ancient wisdom and validated by modern understanding</li>
  <li><strong>Accessibility</strong> — Making holistic wellness available to everyone, regardless of background</li>
  <li><strong>Community</strong> — Building a supportive network of practitioners and teachers worldwide</li>
  <li><strong>Excellence</strong> — Maintaining the highest standards in coach training and certification</li>
</ul>',
  'Our mission at Infinity Role Teachers: empowering individuals through holistic wellness, Sunyoga, and certified coach training programs.',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  content_en = EXCLUDED.content_en,
  meta_description_en = EXCLUDED.meta_description_en,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
 
INSERT INTO pages (slug, title_en, content_en, meta_description_en, is_published, page_order)
VALUES (
  'vision',
  'Our Vision',
  '<h2>A World Where Wellness Is a Way of Life</h2>
<p>We envision a future where holistic wellness practices are woven into the fabric of everyday life — where people don''t just treat symptoms, but cultivate lasting vitality and inner peace.</p>
<p>Infinity Role Teachers is building a global community of certified coaches and practitioners who carry this vision forward, one student at a time, one community at a time.</p>
<h3>Where We Are Heading</h3>
<ul>
  <li><strong>Global Reach</strong> — Certified coaches in every continent, teaching in local languages</li>
  <li><strong>Innovation</strong> — Blending traditional techniques with modern science and technology</li>
  <li><strong>Impact</strong> — Measurable transformation in the lives of our students and their communities</li>
  <li><strong>Sustainability</strong> — Programs that create lasting change, not temporary fixes</li>
</ul>
<p>Together, we are not just teaching wellness — we are creating a movement that transforms how humanity approaches health, purpose, and connection.</p>',
  'Our vision at Infinity Role Teachers: a world where holistic wellness is a way of life, powered by certified coaches worldwide.',
  true,
  2
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  content_en = EXCLUDED.content_en,
  meta_description_en = EXCLUDED.meta_description_en,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- ============================================
-- HOME PAGE: Hero section image
-- ============================================

INSERT INTO pages (slug, title_en, content_en, meta_description_en, is_published, page_order)
VALUES (
  'home',
  'Home',
  '<p>Welcome to Infinity Role Teachers - your journey to holistic wellness begins here.</p>',
  'Infinity Role Teachers - Holistic wellness, Sunyoga, meditation, and certified coach training programs.',
  true,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en,
  content_en = EXCLUDED.content_en,
  meta_description_en = EXCLUDED.meta_description_en,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
 