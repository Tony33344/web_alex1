import { readFileSync } from 'fs';
import { join } from 'path';

const EMAILS_DIR = join(process.cwd(), 'emails', 'application');

// Template cache to avoid reading files repeatedly
const templateCache: Map<string, string> = new Map();

export function loadTemplate(templateName: string, locale: string = 'en'): string {
  // Check cache first with locale
  const cacheKey = `${templateName}-${locale}`;
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  // Try to load language-specific template first
  const languageSpecificPath = join(EMAILS_DIR, locale, `${templateName}.html`);
  const defaultPath = join(EMAILS_DIR, `${templateName}.html`);

  try {
    // Try language-specific template
    const template = readFileSync(languageSpecificPath, 'utf-8');
    templateCache.set(cacheKey, template);
    return template;
  } catch (error) {
    // Fallback to English template
    try {
      const template = readFileSync(defaultPath, 'utf-8');
      templateCache.set(cacheKey, template);
      return template;
    } catch (fallbackError) {
      console.error(`Failed to load email template: ${templateName} for locale ${locale}`, error);
      throw new Error(`Email template not found: ${templateName}`);
    }
  }
}

// Replace template variables
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

// Predefined email templates
export const EmailTemplates = {
  EVENT_REGISTRATION: 'event-registration',
  EVENT_REGISTRATION_PENDING: 'event-registration-pending',
  FREE_EVENT_REGISTRATION: 'free-event-registration',
  COACH_TRAINING_REGISTRATION: 'coach-training-registration',
  COACH_TRAINING_REGISTRATION_PENDING: 'coach-training-registration-pending',
  FREE_PROGRAM_ENROLLMENT: 'free-program-enrollment',
  MEMBERSHIP_CONFIRMATION: 'membership-confirmation',
  MEMBERSHIP_PENDING: 'membership-pending',
  DONATION_CONFIRMATION: 'donation-confirmation',
  DONATION_PENDING: 'donation-pending',
  PASSWORD_RESET: 'password-reset',
  SUPABASE_VERIFICATION: 'supabase-verification',
  WELCOME: 'welcome',
  EVENT_WAITLIST_CONFIRMATION: 'event-waitlist-confirmation',
} as const;

export type EmailTemplateName = typeof EmailTemplates[keyof typeof EmailTemplates];

// Helper to send templated email
export interface TemplatedEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplateName;
  variables: Record<string, string>;
}

export function prepareEmail(options: TemplatedEmailOptions & { locale?: string }): { subject: string; html: string } {
  const template = loadTemplate(options.template, options.locale || 'en');
  const html = renderTemplate(template, options.variables);

  return {
    subject: options.subject,
    html,
  };
}
