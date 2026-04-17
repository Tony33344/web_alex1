-- ============================================
-- Member Survey (Anketa)
-- Admin-editable questions + per-user answers + GDPR consent
-- Safe to re-run
-- ============================================

-- 1) Questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT UNIQUE NOT NULL,
  question_en TEXT NOT NULL,
  question_de TEXT,
  question_it TEXT,
  question_fr TEXT,
  question_hi TEXT,
  question_si TEXT,
  help_text_en TEXT,
  help_text_de TEXT,
  help_text_it TEXT,
  help_text_fr TEXT,
  help_text_hi TEXT,
  help_text_si TEXT,
  -- 'text' | 'textarea' | 'number' | 'select' | 'multiselect'
  question_type TEXT NOT NULL DEFAULT 'text',
  -- For select/multiselect: JSON array of {value, label}
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  question_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_questions_active_order ON survey_questions(is_active, question_order);

-- 2) Responses table (one row per user per question)
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
  answer JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_user ON survey_responses(user_id);

-- 3) GDPR consent + survey completion marker on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS survey_completed_at TIMESTAMPTZ;

-- 4) RLS
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "survey_questions_public_read" ON survey_questions;
CREATE POLICY "survey_questions_public_read" ON survey_questions
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "survey_questions_admin_all" ON survey_questions;
CREATE POLICY "survey_questions_admin_all" ON survey_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

DROP POLICY IF EXISTS "survey_responses_own" ON survey_responses;
CREATE POLICY "survey_responses_own" ON survey_responses
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "survey_responses_admin_read" ON survey_responses;
CREATE POLICY "survey_responses_admin_read" ON survey_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

-- 5) Seed default questions (English primary; admin can add translations later)
INSERT INTO survey_questions (question_key, question_en, question_si, help_text_en, help_text_si, question_type, options, is_required, question_order) VALUES
(
  'eating_habits',
  'How would you describe your eating habits?',
  'Kako bi opisali svoje prehranjevalne navade?',
  'This helps us design a diet plan tailored to you.',
  'To nam pomaga pripraviti prehranski načrt po vaši meri.',
  'select',
  '[
    {"value":"omnivore","label":"Omnivore (meat + plants)"},
    {"value":"pescatarian","label":"Pescatarian (fish, no meat)"},
    {"value":"vegetarian","label":"Vegetarian"},
    {"value":"vegan","label":"Vegan"},
    {"value":"other","label":"Other / specify in notes"}
  ]'::jsonb,
  true,
  1
),
(
  'sport_type',
  'Which sport(s) do you practice?',
  'Katere športe izvajate?',
  'Select all that apply. Leave blank if none.',
  'Izberite vse, ki veljajo. Pustite prazno, če nič.',
  'multiselect',
  '[
    {"value":"running","label":"Running"},
    {"value":"cycling","label":"Cycling"},
    {"value":"swimming","label":"Swimming"},
    {"value":"yoga","label":"Yoga"},
    {"value":"pilates","label":"Pilates"},
    {"value":"gym","label":"Gym / Weight training"},
    {"value":"team_sports","label":"Team sports"},
    {"value":"hiking","label":"Hiking"},
    {"value":"martial_arts","label":"Martial arts"},
    {"value":"none","label":"None currently"}
  ]'::jsonb,
  false,
  2
),
(
  'sport_frequency',
  'How many times per week do you exercise?',
  'Kolikokrat na teden telovadite?',
  NULL, NULL,
  'select',
  '[
    {"value":"0","label":"Never"},
    {"value":"1-2","label":"1–2 times"},
    {"value":"3-4","label":"3–4 times"},
    {"value":"5+","label":"5 or more"}
  ]'::jsonb,
  true,
  3
),
(
  'alcohol_tobacco',
  'Alcohol or tobacco consumption (monthly)',
  'Uživanje alkohola ali tobaka (mesečno)',
  'Roughly, how many drinks/cigarettes per month? Leave blank if none.',
  'Približno, koliko pijač/cigaret na mesec? Pustite prazno, če nič.',
  'textarea',
  '[]'::jsonb,
  false,
  4
),
(
  'family_status',
  'Family status',
  'Družinski status',
  NULL, NULL,
  'select',
  '[
    {"value":"single","label":"Single"},
    {"value":"in_relationship","label":"In a relationship"},
    {"value":"married","label":"Married"},
    {"value":"family_with_kids","label":"Family with children"},
    {"value":"prefer_not_to_say","label":"Prefer not to say"}
  ]'::jsonb,
  false,
  5
),
(
  'employment',
  'Employment type',
  'Vrsta zaposlitve',
  NULL, NULL,
  'select',
  '[
    {"value":"employee","label":"Employee"},
    {"value":"entrepreneur","label":"Entrepreneur / Self-employed"},
    {"value":"freelancer","label":"Freelancer"},
    {"value":"student","label":"Student"},
    {"value":"retired","label":"Retired"},
    {"value":"other","label":"Other"}
  ]'::jsonb,
  false,
  6
),
(
  'goals',
  'What are your main goals?',
  'Kateri so vaši glavni cilji?',
  'Physical, mental, spiritual — anything you want our teacher to help you with.',
  'Telesni, duhovni, mentalni — karkoli, pri čemer vam lahko naš učitelj pomaga.',
  'textarea',
  '[]'::jsonb,
  true,
  7
),
(
  'preferred_contact',
  'Preferred contact method for your 1:1 session',
  'Željen način stika za 1:1 srečanje',
  'After you complete this survey, one of our Infinity Role Teachers will contact you to design a personalized 1-month plan (diet, training, mental & spiritual goals).',
  'Ko izpolnite anketo, vas kontaktira eden od naših Infinity Role Teachers in z vami pripravi oseben 1-mesečni načrt (prehrana, vadba, duševni in duhovni cilji).',
  'select',
  '[
    {"value":"phone","label":"Phone call"},
    {"value":"zoom","label":"Zoom"},
    {"value":"signal","label":"Signal"},
    {"value":"whatsapp","label":"WhatsApp"}
  ]'::jsonb,
  true,
  8
)
ON CONFLICT (question_key) DO NOTHING;
