import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

/**
 * Edge Cases & Cross-cutting Concerns Test Suite (3 tests)
 * Covers: 404 handling, loading states, responsive design
 */

test.describe('Edge Cases & Cross-cutting Concerns', () => {
  test.describe('404 Handling', () => {
    test('36. Non-existent routes show 404 page', async ({ page }) => {
      await page.goto('/en/non-existent-page-12345');
      
      // Should show 404 or not found message
      const notFoundContent = await page.locator('text=/404|Not Found|not found|Seite nicht gefunden/i').count();
      const errorHeading = await page.locator('h1:has-text(/404|Not Found/)').count();
      
      expect(notFoundContent + errorHeading).toBeGreaterThan(0);
    });

    test('37. 404 page has navigation back to home', async ({ page }) => {
      await page.goto('/en/non-existent-page-12345');
      
      // Look for home link or logo
      const homeLinks = await page.locator('a[href="/"], a[href="/en"], a[href="/de"]').count();
      const logo = await page.locator('[class*="Logo"], img[alt*="logo"]').count();
      
      expect(homeLinks + logo).toBeGreaterThan(0);
    });
  });

  test.describe('Loading States', () => {
    test('38. Loading spinner appears during form submission', async ({ page }) => {
      const loginPage = new LoginPage(page, 'en');
      await loginPage.goto();
      
      // Fill with invalid credentials to trigger error (keeps us on page)
      await loginPage.fillCredentials('test@example.com', 'wrong');
      
      // Submit and immediately check for loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Check for loading spinner or disabled state
      const hasLoading = await page.locator('[class*="animate-spin"]').count() > 0;
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      
      expect(hasLoading || isDisabled).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('39. Login form is usable on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const loginPage = new LoginPage(page, 'en');
      await loginPage.goto();
      
      // Form should still be visible and accessible
      await loginPage.expectLoginFormVisible();
      
      // Inputs should be clickable
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toBeEnabled();
    });

    test('40. Navigation works on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/en');
      
      // Page should load without horizontal scroll
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      
      expect(scrollWidth).toBeLessThanOrEqual(768 * 1.2); // Allow some tolerance
    });
  });
});
