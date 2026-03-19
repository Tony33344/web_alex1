-- ============================================
-- COMPLETE SCHEMA + PAYMENTS & ENROLLMENTS
-- Single self-contained migration — safe to re-run
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 0: PATCH ANY PRE-EXISTING TABLES
-- Add missing columns before RLS policies run.
-- Safe to run even if tables don't exist yet.
-- ============================================
DO $patch$
BEGIN

  -- teachers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
    ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE teachers ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
    ALTER TABLE teachers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- health_categories
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'health_categories') THEN
    ALTER TABLE health_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE health_categories ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
    ALTER TABLE health_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- programs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs') THEN
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'CHF';
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
    ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- events
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    ALTER TABLE events ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'CHF';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS current_attendees INT NOT NULL DEFAULT 0;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- pages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pages') THEN
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS page_order INT NOT NULL DEFAULT 0;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- sections
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sections') THEN
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE sections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- testimonials
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
    ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
  END IF;

  -- membership_plans
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'membership_plans') THEN
    ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS is_popular BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
    ALTER TABLE membership_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- blog_posts
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts') THEN
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_members_only BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;

  -- case_studies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_studies') THEN
    ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- newsletter_subscribers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers') THEN
    ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- event_registrations — payment fields
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_registrations') THEN
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS bank_transfer_reference TEXT;
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS confirmed_by UUID;
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
    ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS notes TEXT;
  END IF;

END $patch$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'de', 'it', 'fr', 'hi', 'si')),
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PAGES
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  content_en TEXT, content_de TEXT, content_it TEXT, content_fr TEXT, content_hi TEXT, content_si TEXT,
  meta_description_en TEXT, meta_description_de TEXT, meta_description_it TEXT, meta_description_fr TEXT, meta_description_hi TEXT, meta_description_si TEXT,
  hero_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  page_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL DEFAULT 'text',
  title_en TEXT, title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  content_en TEXT, content_de TEXT, content_it TEXT, content_fr TEXT, content_hi TEXT, content_si TEXT,
  image_url TEXT,
  video_url TEXT,
  cta_text_en TEXT, cta_text_de TEXT,
  cta_link TEXT,
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  section_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TEACHERS
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title_en TEXT, title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  bio_en TEXT, bio_de TEXT, bio_it TEXT, bio_fr TEXT, bio_hi TEXT, bio_si TEXT,
  short_bio_en TEXT, short_bio_de TEXT, short_bio_it TEXT, short_bio_fr TEXT, short_bio_hi TEXT, short_bio_si TEXT,
  photo_url TEXT,
  cover_image_url TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  social_links JSONB NOT NULL DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TESTIMONIALS
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_photo_url TEXT,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  content_en TEXT NOT NULL,
  content_de TEXT, content_it TEXT, content_fr TEXT, content_hi TEXT, content_si TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- HEALTH CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS health_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_de TEXT, name_it TEXT, name_fr TEXT, name_hi TEXT, name_si TEXT,
  description_en TEXT, description_de TEXT, description_it TEXT, description_fr TEXT, description_hi TEXT, description_si TEXT,
  long_content_en TEXT, long_content_de TEXT, long_content_it TEXT, long_content_fr TEXT, long_content_hi TEXT, long_content_si TEXT,
  icon_name TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROGRAMS
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_de TEXT, name_it TEXT, name_fr TEXT, name_hi TEXT, name_si TEXT,
  description_en TEXT, description_de TEXT, description_it TEXT, description_fr TEXT, description_hi TEXT, description_si TEXT,
  long_content_en TEXT, long_content_de TEXT, long_content_it TEXT, long_content_fr TEXT, long_content_hi TEXT, long_content_si TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  duration TEXT,
  price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'CHF',
  stripe_price_id TEXT,
  max_participants INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  what_you_learn TEXT[] NOT NULL DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  description_en TEXT, description_de TEXT, description_it TEXT, description_fr TEXT, description_hi TEXT, description_si TEXT,
  long_content_en TEXT, long_content_de TEXT, long_content_it TEXT, long_content_fr TEXT, long_content_hi TEXT, long_content_si TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  location_address TEXT,
  location_map_url TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_link TEXT,
  price DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'CHF',
  stripe_price_id TEXT,
  max_attendees INT,
  current_attendees INT NOT NULL DEFAULT 0,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  registration_deadline TIMESTAMPTZ,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENT REGISTRATIONS (with payment fields)
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended', 'waitlisted')),
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
  UNIQUE(event_id, user_id)
);

-- If event_registrations already existed without payment columns, add them
DO $$ BEGIN
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS bank_transfer_reference TEXT;
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES profiles(id);
  ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

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

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  excerpt_en TEXT, excerpt_de TEXT, excerpt_it TEXT, excerpt_fr TEXT, excerpt_hi TEXT, excerpt_si TEXT,
  content_en TEXT, content_de TEXT, content_it TEXT, content_fr TEXT, content_hi TEXT, content_si TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('article', 'newsletter', 'news', 'health', 'wellness', 'training')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_members_only BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  views_count INT NOT NULL DEFAULT 0,
  reading_time_minutes INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MEMBERSHIP PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_de TEXT, name_it TEXT, name_fr TEXT, name_hi TEXT, name_si TEXT,
  description_en TEXT, description_de TEXT, description_it TEXT, description_fr TEXT, description_hi TEXT, description_si TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  stripe_price_id TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CASE STUDIES
-- ============================================
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_de TEXT, title_it TEXT, title_fr TEXT, title_hi TEXT, title_si TEXT,
  content_en TEXT, content_de TEXT, content_it TEXT, content_fr TEXT, content_hi TEXT, content_si TEXT,
  image_url TEXT,
  client_name TEXT,
  result_summary_en TEXT, result_summary_de TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONTACT SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ============================================
-- SITE SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MEDIA
-- ============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  folder TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRANSLATION OVERRIDES
-- ============================================
CREATE TABLE IF NOT EXISTS translation_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(translation_key, locale)
);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts SET views_count = views_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- (DROP IF EXISTS + CREATE to be idempotent)
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Pages
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published pages" ON pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON pages;
CREATE POLICY "Anyone can read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read visible sections" ON sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON sections;
CREATE POLICY "Anyone can read visible sections" ON sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage sections" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active teachers" ON teachers;
DROP POLICY IF EXISTS "Admins can manage teachers" ON teachers;
CREATE POLICY "Anyone can read active teachers" ON teachers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage teachers" ON teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Anyone can read published testimonials" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Health Categories
ALTER TABLE health_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active health categories" ON health_categories;
DROP POLICY IF EXISTS "Admins can manage health categories" ON health_categories;
CREATE POLICY "Anyone can read active health categories" ON health_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage health categories" ON health_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Anyone can read active programs" ON programs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage programs" ON programs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Anyone can read published events" ON events FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Event Registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Users can create registrations" ON event_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON event_registrations;
CREATE POLICY "Users can view their own registrations" ON event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create registrations" ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage registrations" ON event_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Program Enrollments
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own enrollments" ON program_enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON program_enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON program_enrollments;
CREATE POLICY "Users can view their own enrollments" ON program_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create enrollments" ON program_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON program_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Blog Posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Anyone can read published posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage blog posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Membership Plans
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active plans" ON membership_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON membership_plans;
CREATE POLICY "Anyone can read active plans" ON membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON membership_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Case Studies
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published case studies" ON case_studies;
DROP POLICY IF EXISTS "Admins can manage case studies" ON case_studies;
CREATE POLICY "Anyone can read published case studies" ON case_studies FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage case studies" ON case_studies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Contact Submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage contacts" ON contact_submissions;
CREATE POLICY "Admins can manage contacts" ON contact_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Newsletter Subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can manage subscribers" ON newsletter_subscribers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Media
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage media" ON media;
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Translation Overrides
ALTER TABLE translation_overrides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read overrides" ON translation_overrides;
DROP POLICY IF EXISTS "Admins can manage overrides" ON translation_overrides;
CREATE POLICY "Anyone can read overrides" ON translation_overrides FOR SELECT USING (true);
CREATE POLICY "Admins can manage overrides" ON translation_overrides FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================
-- SEED DATA (idempotent)
-- ============================================

INSERT INTO pages (slug, title_en, is_published, page_order) VALUES
  ('home', 'Home', true, 0),
  ('role-teachers', 'Role Teachers', true, 1),
  ('health', 'Health', true, 2),
  ('coach-training', 'Coach Training', true, 3),
  ('events', 'Events', true, 4),
  ('membership', 'Membership', true, 5),
  ('blog', 'Blog', true, 6),
  ('contact', 'Contact', true, 7)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO teachers (slug, name, title_en, short_bio_en, specialties, display_order) VALUES
  ('avalon', 'Avalon', 'Founder & Lead Teacher', 'With over 20 years of experience in holistic wellness, Avalon guides students toward their infinite potential.', ARRAY['Sunyoga', 'Meditation', 'Holistic Healing'], 1),
  ('akasha', 'Akasha', 'Senior Teacher', 'Akasha brings deep expertise in Acupresura and Yoga, helping students discover the healing power within.', ARRAY['Acupresura', 'Yoga', 'Wellness Coaching'], 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO health_categories (slug, name_en, description_en, icon_name, display_order) VALUES
  ('nutrition', 'Nutrition', 'Nourish your body with mindful eating practices', 'Leaf', 1),
  ('yoga', 'Yoga', 'Balance body, mind, and spirit through ancient practice', 'Heart', 2),
  ('sunyoga', 'Sunyoga', 'Harness the healing energy of the sun', 'Sun', 3),
  ('meditation', 'Meditation', 'Cultivate inner peace and clarity of mind', 'Brain', 4),
  ('power-training', 'Power Training', 'Build strength with conscious movement', 'Dumbbell', 5),
  ('acupresura', 'Acupresura', 'Activate healing points for holistic wellbeing', 'Hand', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO programs (slug, name_en, description_en, duration, price, display_order) VALUES
  ('sunyoga-training', 'Sunyoga Coach Training', 'Become a certified Sunyoga coach', '6 months', 2400, 1),
  ('acupresura-training', 'Acupresura Coach Training', 'Master the art of acupresura healing', '3 weekends', 1800, 2),
  ('awaken-inner-compass', 'Awaken Your Inner Compass', 'Discover your true purpose', '8 weeks', 990, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, value, description) VALUES
  ('site_name', '"Infinity Role Teachers"', 'Website name'),
  ('site_description', '"Transform your life through holistic wellness and coaching"', 'Website description'),
  ('contact_email', '"info@infinityroleteachers.com"', 'Contact email'),
  ('contact_phone', '"+41 XX XXX XX XX"', 'Contact phone'),
  ('default_currency', '"CHF"', 'Default currency'),
  ('social_instagram', '""', 'Instagram URL'),
  ('social_facebook', '""', 'Facebook URL'),
  ('social_twitter', '""', 'Twitter URL'),
  ('social_linkedin', '""', 'LinkedIn URL'),
  ('social_youtube', '""', 'YouTube URL'),
  ('bank_company', '"AMS4EVER AG"', 'Bank company name'),
  ('bank_iban', '""', 'Bank IBAN'),
  ('bank_bic', '""', 'Bank BIC/SWIFT'),
  ('bank_name', '""', 'Bank name'),
  ('bank_transfer_enabled', 'true', 'Enable bank transfer as payment method'),
  ('bank_account_holder', '"Infinity Role Teachers"', 'Account holder name for bank transfers')
ON CONFLICT (key) DO NOTHING;
