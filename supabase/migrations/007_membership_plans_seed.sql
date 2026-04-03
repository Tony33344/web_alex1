-- Seed default membership plans
-- Run this in Supabase SQL Editor to create the default membership plans

INSERT INTO membership_plans (
  id,
  name_en,
  name_de,
  name_it,
  name_fr,
  name_hi,
  name_si,
  description_en,
  description_de,
  description_it,
  description_fr,
  description_hi,
  description_si,
  plan_type,
  price,
  currency,
  stripe_price_id,
  features,
  is_active,
  is_popular,
  display_order
) VALUES (
  gen_random_uuid(),
  'Monthly Membership',
  'Monatliche Mitgliedschaft',
  'Abbonamento Mensile',
  'Abonnement Mensuel',
  'मासिक सदस्यता',
  'මාසික සාමාජිකත්වය',
  'Full access to all premium content and features',
  'Voller Zugang zu allen Premium-Inhalten und Funktionen',
  'Accesso completo a tutti i contenuti e funzionalità premium',
  'Accès complet à tout le contenu et les fonctionnalités premium',
  'सभी प्रीमियम सामग्री और सुविधाओं तक पूर्ण पहुंच',
  'සියලුම උසස් සහ විශේෂාංග වලට පූර්ණ ප්‍රවේශය',
  'monthly',
  29,
  'CHF',
  '', -- Add your Stripe price ID here
  ARRAY[
    'Access to all members-only blog posts',
    'Early access to event registration',
    'Discounts on all coach training programs',
    'Exclusive monthly online workshops',
    'Access to the meditation library',
    'Community forum access',
    'Monthly 1-on-1 guidance session',
    'Priority support'
  ],
  true,
  false,
  1
), (
  gen_random_uuid(),
  'Yearly Membership',
  'Jährliche Mitgliedschaft',
  'Abbonamento Annuale',
  'Abonnement Annuel',
  'वार्षिक सदस्यता',
  'වාර්ෂික සාමාජිකත්වය',
  'Full access to all premium content with yearly savings',
  'Voller Zugang zu allen Premium-Inhalten mit jährlicher Ersparnis',
  'Accesso completo a tutti i contenuti premium con risparmio annuale',
  'Accès complet à tout le contenu premium avec des économies annuelles',
  'वार्षिक बचत के साथ सभी प्रीमियम सामग्री तक पूर्ण पहुंच',
  'වාර්ෂික ඉතිරිකිරීම් සමඟ සියලුම උසස් අන්තර්ගත වලට පූර්ණ ප්‍රවේශය',
  'yearly',
  249,
  'CHF',
  '', -- Add your Stripe price ID here
  ARRAY[
    'All monthly membership benefits',
    '2 months free (save 30%)',
    'Exclusive yearly member events',
    'Priority booking for retreats',
    'Annual wellness assessment',
    'Free merchandise package'
  ],
  true,
  true,
  2
)
ON CONFLICT (id) DO NOTHING;
