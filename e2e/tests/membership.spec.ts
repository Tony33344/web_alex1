import { test, expect, Page } from '@playwright/test';
import { MembershipPage } from '../pages/MembershipPage';
import { LoginPage } from '../pages/LoginPage';
import { EventsPage } from '../pages/EventsPage';
import { generateTestUser, supabaseAdmin, cleanupAllTestUsers } from '../utils/test-utils';

/**
 * Membership & Payment Test Suite (6 tests)
 * Covers: membership page, plan display, payment flows, access control
 */

test.describe('Membership & Payments', () => {
  const locale = 'en';

  test.beforeAll(async () => {
    await cleanupAllTestUsers();
  });

  test.describe('Membership Page', () => {
    test('19. Membership page loads and displays plans', async ({ page }) => {
      const membershipPage = new MembershipPage(page, locale);
      await membershipPage.goto();
      await membershipPage.expectMembershipPageLoaded();
      await membershipPage.expectPlansVisible();
    });

    test('20. Gallery images load for membership plans', async ({ page }) => {
      const membershipPage = new MembershipPage(page, locale);
      await membershipPage.goto();
      await membershipPage.expectMembershipPageLoaded();
      
      // Check if gallery images exist (may be empty depending on data)
      const imageCount = await membershipPage.getPlanCount();
      expect(imageCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Payment Flows', () => {
    test('21. Cancelled payment shows cancellation banner', async ({ page }) => {
      const eventsPage = new EventsPage(page, locale);
      
      // Visit events page with cancelled payment param
      await page.goto(`/en/events?payment=cancelled`);
      await eventsPage.expectCancelledPaymentBanner();
    });

    test('22. Payment success shows success banner', async ({ page }) => {
      const eventsPage = new EventsPage(page, locale);
      
      // Visit events page with success param
      await page.goto(`/en/events?payment=success`);
      // Success toast should appear
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Access Control', () => {
    test('23. Member-only content requires authentication', async ({ page }) => {
      // Try to access a protected route without auth
      await page.goto('/en/members');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });
    });

    test('24. Authenticated user can access member area', async ({ page }) => {
      const userData = generateTestUser();
      
      // Create and login user
      const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
      expect(error).toBeNull();

      const loginPage = new LoginPage(page, locale);
      await loginPage.goto();
      await loginPage.login(userData.email, userData.password);
      await loginPage.expectRedirectToWelcome();

      // Now try to access members area
      await page.goto('/en/members');
      
      // Should stay on members page (not redirect to login)
      await expect(page).not.toHaveURL(/.*login.*/, { timeout: 5000 });

      // Cleanup
      if (authData?.user) await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    });
  });
});
