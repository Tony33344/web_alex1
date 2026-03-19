export type Locale = 'en' | 'de' | 'it' | 'fr' | 'hi' | 'si';

export type UserRole = 'user' | 'admin' | 'super_admin';

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';

export type LocalizedField<T = string> = {
  en: T;
  de?: T;
  it?: T;
  fr?: T;
  hi?: T;
  si?: T;
};

export type SectionType =
  | 'hero'
  | 'text'
  | 'text_image'
  | 'image_gallery'
  | 'video'
  | 'cta'
  | 'features'
  | 'faq'
  | 'quote'
  | 'two_columns'
  | 'three_columns'
  | 'full_width_image';

export type EventRegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'attended' | 'waitlisted';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'free';

export type BlogCategory = 'article' | 'newsletter' | 'news' | 'health' | 'wellness' | 'training';

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

export type PlanType = 'monthly' | 'yearly';
