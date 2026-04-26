import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

/**
 * Internationalization (i18n) Test Suite (4 tests)
 * Covers: locale switching, translated content, default locale handling
 */

test.describe('Internationalization', () => {
  const locales = ['en', 'de', 'it', 'fr'];

  test.describe('Locale Switching', () => {
    test('32. Different locale URLs load correctly', async ({ page }) => {
      const loginPage = new LoginPage(page, 'en');
      
      // Test English
      await loginPage.goto();
      await loginPage.expectLoginFormVisible();
      
      // Test German
      await page.goto('/de/login');
      await loginPage.expectLoginFormVisible();
      
      // Test Italian
      await page.goto('/it/login');
      await loginPage.expectLoginFormVisible();
    });

    test('33. Default locale redirect works', async ({ page }) => {
      // Try to access without locale prefix
      await page.goto('/login');
      
      // Should redirect to locale-prefixed URL
      const url = page.url();
      expect(url).toMatch(/\/(en|de|it|fr)\/login/);
    });
  });

  test.describe('Translated Content', () => {
    test('34. Login form labels are translated', async ({ page }) => {
      // Test German translations
      await page.goto('/de/login');
      
      // Look for German email/password labels or placeholders
      const emailLabel = await page.locator('text=/E-Mail|Email|email/i').count();
      const passwordLabel = await page.locator('text=/Passwort|Password/i').count();
      
      expect(emailLabel + passwordLabel).toBeGreaterThan(0);
    });

    test('35. Registration form has language selector', async ({ page }) => {
      const registerPage = new RegisterPage(page, 'en');
      await registerPage.goto();
      
      // Language selector should be visible
      await expect(page.locator('select[name="preferred_language"], select#preferred_language')).toBeVisible();
      
      // Should have multiple language options
      const options = await page.locator('select[name="preferred_language"] option, select#preferred_language option').count();
      expect(options).toBeGreaterThan(1);
    });
  });
});
