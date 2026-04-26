import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test environment configuration
export const TEST_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
export const DEFAULT_LOCALE = 'en';

// Supabase admin client for test data management
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Test user data generators
export function generateTestUser(suffix: string = '') {
  const timestamp = Date.now();
  return {
    email: `test${suffix}_${timestamp}@e2etest.com`,
    password: 'TestPass123!',
    full_name: `Test User ${suffix}`,
    phone: '+41791234567',
    preferred_language: 'en' as const,
  };
}

export function generateTestAdmin() {
  const timestamp = Date.now();
  return {
    email: `admin_${timestamp}@e2etest.com`,
    password: 'AdminPass123!',
    full_name: 'Test Admin',
    phone: '+41791234567',
    preferred_language: 'en' as const,
  };
}

// Database cleanup helpers
export async function cleanupTestUser(email: string) {
  const { data: user } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (user?.id) {
    // Delete from auth.users (requires service role)
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }
}

export async function cleanupAllTestUsers() {
  // Clean up users with @e2etest.com emails
  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .like('email', '%@e2etest.com');

  if (users) {
    for (const user of users) {
      await supabaseAdmin.auth.admin.deleteUser(user.id).catch(() => {});
    }
  }
}

// Wait helpers
export async function waitForLoadingState(page: Page, selector: string, timeout = 5000) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return el && !el.classList.contains('animate-spin') && !el.closest('button')?.disabled;
    },
    selector,
    { timeout }
  );
}

export async function waitForToast(page: Page, timeout = 5000) {
  await page.waitForSelector('[data-sonner-toast]', { timeout });
}

// Navigation helpers
export function getLocalizedPath(path: string, locale: string = DEFAULT_LOCALE) {
  if (path.startsWith('/')) {
    return `/${locale}${path}`;
  }
  return `/${locale}/${path}`;
}

// Form interaction helpers
export async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[name="email"], input#email, input[type="email"]', email);
  await page.fill('input[name="password"], input#password, input[type="password"]', password);
}

export async function fillRegistrationForm(page: Page, userData: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language?: string;
}) {
  await page.fill('input[name="full_name"], input#full_name', userData.full_name);
  await page.fill('input[name="email"], input#email', userData.email);
  await page.fill('input[name="phone"], input#phone', userData.phone);
  await page.fill('input[name="password"], input#password', userData.password);
  await page.fill('input[name="confirm_password"], input#confirm_password', userData.password);
  
  if (userData.preferred_language) {
    await page.selectOption('select[name="preferred_language"], select#preferred_language', userData.preferred_language);
  }
  
  // Accept terms
  await page.check('input[name="accept_terms"], input#accept_terms');
}

// Assertion helpers
export async function expectUrlToContain(page: Page, text: string) {
  await expect(page).toHaveURL(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

export async function expectPageToHaveTitle(page: Page, title: string) {
  await expect(page).toHaveTitle(new RegExp(title, 'i'));
}

export async function expectElementToContainText(page: Page, selector: string, text: string) {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}

// Storage helpers for auth state
export async function saveAuthState(page: Page, path: string) {
  await page.context().storageState({ path });
}
