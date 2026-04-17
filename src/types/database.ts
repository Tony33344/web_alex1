export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  preferred_language: 'en' | 'de' | 'it' | 'fr' | 'hi' | 'si';
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  subscription_plan: 'monthly' | 'yearly' | null;
  subscription_end_date: string | null;
  survey_completed_at: string | null;
  gdpr_consent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title_en: string;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  content_en: string | null;
  content_de: string | null;
  content_it: string | null;
  content_fr: string | null;
  content_hi: string | null;
  content_si: string | null;
  meta_description_en: string | null;
  meta_description_de: string | null;
  meta_description_it: string | null;
  meta_description_fr: string | null;
  meta_description_hi: string | null;
  meta_description_si: string | null;
  hero_image_url: string | null;
  header_logo_url: string | null;
  is_published: boolean;
  page_order: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  page_id: string;
  section_type: string;
  title_en: string | null;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  content_en: string | null;
  content_de: string | null;
  content_it: string | null;
  content_fr: string | null;
  content_hi: string | null;
  content_si: string | null;
  image_url: string | null;
  video_url: string | null;
  cta_text_en: string | null;
  cta_text_de: string | null;
  cta_link: string | null;
  background_color: string;
  section_order: number;
  is_visible: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  slug: string;
  name: string;
  title_en: string | null;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  bio_en: string | null;
  bio_de: string | null;
  bio_it: string | null;
  bio_fr: string | null;
  bio_hi: string | null;
  bio_si: string | null;
  short_bio_en: string | null;
  short_bio_de: string | null;
  short_bio_it: string | null;
  short_bio_fr: string | null;
  short_bio_hi: string | null;
  short_bio_si: string | null;
  photo_url: string | null;
  cover_image_url: string | null;
  specialties: string[];
  social_links: Record<string, string>;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  author_photo_url: string | null;
  teacher_id: string | null;
  content_en: string;
  content_de: string | null;
  content_it: string | null;
  content_fr: string | null;
  content_hi: string | null;
  content_si: string | null;
  rating: number | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface HealthCategory {
  id: string;
  slug: string;
  name_en: string;
  name_de: string | null;
  name_it: string | null;
  name_fr: string | null;
  name_hi: string | null;
  name_si: string | null;
  description_en: string | null;
  description_de: string | null;
  description_it: string | null;
  description_fr: string | null;
  description_hi: string | null;
  description_si: string | null;
  long_content_en: string | null;
  long_content_de: string | null;
  long_content_it: string | null;
  long_content_fr: string | null;
  long_content_hi: string | null;
  long_content_si: string | null;
  icon_name: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  slug: string;
  name_en: string;
  name_de: string | null;
  name_it: string | null;
  name_fr: string | null;
  name_hi: string | null;
  name_si: string | null;
  description_en: string | null;
  description_de: string | null;
  description_it: string | null;
  description_fr: string | null;
  description_hi: string | null;
  description_si: string | null;
  long_content_en: string | null;
  long_content_de: string | null;
  long_content_it: string | null;
  long_content_fr: string | null;
  long_content_hi: string | null;
  long_content_si: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  stripe_price_id: string | null;
  max_participants: number | null;
  is_active: boolean;
  is_featured: boolean;
  teacher_id: string | null;
  prerequisites: string[];
  what_you_learn: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  slug: string;
  title_en: string;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  description_en: string | null;
  description_de: string | null;
  description_it: string | null;
  description_fr: string | null;
  description_hi: string | null;
  description_si: string | null;
  brief_description_en: string | null;
  brief_description_de: string | null;
  brief_description_it: string | null;
  brief_description_fr: string | null;
  brief_description_hi: string | null;
  brief_description_si: string | null;
  long_content_en: string | null;
  long_content_de: string | null;
  long_content_it: string | null;
  long_content_fr: string | null;
  long_content_hi: string | null;
  long_content_si: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  location_address: string | null;
  location_map_url: string | null;
  is_online: boolean;
  online_link: string | null;
  price: number | null;
  currency: string;
  stripe_price_id: string | null;
  max_attendees: number | null;
  current_attendees: number;
  teacher_id: string | null;
  program_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  registration_deadline: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'confirmed' | 'cancelled' | 'attended' | 'waitlisted';
  payment_status: 'pending' | 'paid' | 'refunded' | 'free';
  payment_method: 'stripe' | 'bank_transfer' | 'free';
  stripe_payment_intent_id: string | null;
  amount: number | null;
  currency: string;
  bank_transfer_reference: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  event?: Event;
  profile?: Pick<Profile, 'email' | 'full_name'>;
}

export interface WaitlistEntry {
  id: string;
  event_id: string;
  user_id: string | null;
  email: string;
  name: string;
  phone: string | null;
  participant_type: 'member' | 'registered_user' | 'guest';
  status: 'waiting' | 'notified' | 'confirmed' | 'cancelled';
  position: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  event?: Pick<Event, 'title_en' | 'start_date'>;
}

export interface ProgramEnrollment {
  id: string;
  program_id: string;
  user_id: string;
  status: 'enrolled' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'free';
  payment_method: 'stripe' | 'bank_transfer' | 'free';
  stripe_payment_intent_id: string | null;
  amount: number | null;
  currency: string;
  bank_transfer_reference: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  program?: Program;
  profile?: Pick<Profile, 'email' | 'full_name'>;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_en: string;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  excerpt_en: string | null;
  excerpt_de: string | null;
  excerpt_it: string | null;
  excerpt_fr: string | null;
  excerpt_hi: string | null;
  excerpt_si: string | null;
  content_en: string | null;
  content_de: string | null;
  content_it: string | null;
  content_fr: string | null;
  content_hi: string | null;
  content_si: string | null;
  featured_image_url: string | null;
  author_id: string | null;
  teacher_id: string | null;
  category: 'article' | 'newsletter' | 'news' | 'health' | 'wellness' | 'training' | null;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  is_members_only: boolean;
  published_at: string | null;
  views_count: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlan {
  id: string;
  name_en: string;
  name_de: string | null;
  name_it: string | null;
  name_fr: string | null;
  name_hi: string | null;
  name_si: string | null;
  description_en: string | null;
  description_de: string | null;
  description_it: string | null;
  description_fr: string | null;
  description_hi: string | null;
  description_si: string | null;
  long_content_en: string | null;
  long_content_de: string | null;
  long_content_it: string | null;
  long_content_fr: string | null;
  long_content_hi: string | null;
  long_content_si: string | null;
  cover_image_url: string | null;
  plan_type: 'monthly' | 'yearly';
  price: number;
  currency: string;
  stripe_price_id: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title_en: string;
  title_de: string | null;
  title_it: string | null;
  title_fr: string | null;
  title_hi: string | null;
  title_si: string | null;
  content_en: string | null;
  content_de: string | null;
  content_it: string | null;
  content_fr: string | null;
  content_hi: string | null;
  content_si: string | null;
  image_url: string | null;
  client_name: string | null;
  result_summary_en: string | null;
  result_summary_de: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  preferred_language: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
}

export interface Media {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  folder: string;
  created_at: string;
}

export interface TranslationOverride {
  id: string;
  translation_key: string;
  locale: string;
  value: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  entity_type: 'teacher' | 'event' | 'program' | 'health_category' | 'page' | 'membership';
  entity_id: string;
  image_url: string;
  caption_en: string | null;
  caption_de: string | null;
  caption_it: string | null;
  caption_fr: string | null;
  caption_hi: string | null;
  caption_si: string | null;
  alt_text_en: string | null;
  alt_text_de: string | null;
  alt_text_it: string | null;
  alt_text_fr: string | null;
  alt_text_hi: string | null;
  alt_text_si: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}
