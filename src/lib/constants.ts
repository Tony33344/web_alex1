export const LOCALES = ['en', 'de', 'it', 'fr', 'hi', 'si'] as const;
export const DEFAULT_LOCALE = 'en';

export const SITE_NAME = 'Infinity Role Teachers';
export const SITE_DESCRIPTION = 'Transform your life through holistic wellness and coaching';

export const LOCALE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  fr: { label: 'Français', flag: '🇫🇷' },
  hi: { label: 'हिन्दी', flag: '🇮🇳' },
  si: { label: 'Slovenščina', flag: '🇸🇮' },
};

export const CONTACT_SUBJECTS = [
  'general',
  'membership',
  'events',
  'training',
  'partnership',
  'other',
] as const;

export const BLOG_CATEGORIES = [
  'article',
  'newsletter',
  'news',
  'health',
  'wellness',
  'training',
] as const;
