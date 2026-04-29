import { readFileSync } from 'fs';
import { join } from 'path';

const EMAILS_DIR = join(process.cwd(), 'emails', 'application');

// Template cache to avoid reading files repeatedly
const templateCache: Map<string, string> = new Map();

export function loadTemplate(templateName: string): string {
  // Check cache first
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  try {
    const templatePath = join(EMAILS_DIR, `${templateName}.html`);
    const template = readFileSync(templatePath, 'utf-8');
    templateCache.set(templateName, template);
    return template;
  } catch (error) {
    console.error(`Failed to load email template: ${templateName}`, error);
    throw new Error(`Email template not found: ${templateName}`);
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
  COACH_TRAINING_REGISTRATION: 'coach-training-registration',
  MEMBERSHIP_CONFIRMATION: 'membership-confirmation',
  DONATION_CONFIRMATION: 'donation-confirmation',
  PASSWORD_RESET: 'password-reset',
  SUPABASE_VERIFICATION: 'supabase-verification',
  WELCOME: 'welcome',
} as const;

export type EmailTemplateName = typeof EmailTemplates[keyof typeof EmailTemplates];

// Helper to send templated email
export interface TemplatedEmailOptions {
  to: string;
  subject: string;
  template: EmailTemplateName;
  variables: Record<string, string>;
}

export function prepareEmail(options: TemplatedEmailOptions): { subject: string; html: string } {
  const template = loadTemplate(options.template);
  const html = renderTemplate(template, options.variables);
  
  return {
    subject: options.subject,
    html,
  };
}
