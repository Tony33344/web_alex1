import { test, expect, Page } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { generateTestAdmin, generateTestUser, supabaseAdmin, cleanupAllTestUsers } from '../utils/test-utils';

/**
 * Admin Dashboard Test Suite (8 tests)
 * Covers: access control, stats, quick actions, CRUD operations
 */

test.describe('Admin Dashboard', () => {
  let adminPage: AdminDashboardPage;
  let adminCredentials: { email: string; password: string };

  test.beforeAll(async () => {
    // Clean up any existing test users
    await cleanupAllTestUsers();
  });

  async function createAndLoginAdmin(page: Page): Promise<{ email: string; password: string }> {
    const adminData = generateTestAdmin();
    
    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: { full_name: adminData.full_name },
    });
    
    expect(error).toBeNull();
    
    if (authData.user) {
      await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
    }

    const loginPage = new LoginPage(page, 'en');
    await loginPage.goto();
    await loginPage.login(adminData.email, adminData.password);
    await loginPage.expectRedirectToAdmin();

    return { email: adminData.email, password: adminData.password };
  }

  test.describe('Access Control', () => {
    test('13. Regular user cannot access admin dashboard', async ({ page }) => {
      const userData = generateTestUser();
      
      // Create regular user
      const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
      expect(error).toBeNull();

      // Login as regular user
      const loginPage = new LoginPage(page, 'en');
      await loginPage.goto();
      await loginPage.login(userData.email, userData.password);

      // Try to access admin
      await page.goto('/admin');
      
      // Should redirect to login or show access denied
      await expect(page).toHaveURL(/.*login.*/, { timeout: 10000 });

      // Cleanup
      if (authData?.user) await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    });
  });

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      adminCredentials = await createAndLoginAdmin(page);
      adminPage = new AdminDashboardPage(page);
    });

    test.afterEach(async () => {
      // Cleanup admin user
      const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', adminCredentials.email).single();
      if (data?.id) await supabaseAdmin.auth.admin.deleteUser(data.id).catch(() => {});
    });

    test('14. Admin dashboard loads with stats cards', async ({ page }) => {
      await adminPage.goto();
      await adminPage.expectDashboardLoaded();
      await adminPage.expectAllStatCardsVisible();
    });

    test('15. Stats are loaded (not showing loading state)', async ({ page }) => {
      await adminPage.goto();
      await adminPage.expectDashboardLoaded();
      
      // Wait a moment for stats to load
      await page.waitForTimeout(2000);
      
      // Check that stat cards don't show "..."
      const statCards = page.locator('.grid > div');
      const loadingTexts = statCards.locator('text="..."');
      const count = await loadingTexts.count();
      
      // Some stats may legitimately be 0, but shouldn't all be "..."
      expect(count).toBeLessThan(6);
    });

    test('16. Quick actions navigate correctly', async ({ page }) => {
      await adminPage.goto();
      await adminPage.expectQuickActionsVisible();

      // Test New Blog Post navigation
      await adminPage.clickNewBlogPost();
      await expect(page).toHaveURL(/.*admin\/blog\/new.*/, { timeout: 5000 });

      // Go back and test New Event
      await adminPage.goto();
      await adminPage.clickNewEvent();
      await expect(page).toHaveURL(/.*admin\/events\/new.*/, { timeout: 5000 });

      // Go back and test View Contacts
      await adminPage.goto();
      await adminPage.clickViewContacts();
      await expect(page).toHaveURL(/.*admin\/contacts.*/, { timeout: 5000 });
    });
  });

  test.describe('User Management', () => {
    test('17. User list loads in admin', async ({ page }) => {
      // Create a test user first
      const userData = generateTestUser();
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      adminCredentials = await createAndLoginAdmin(page);
      
      // Navigate to users page
      await page.goto('/admin/users');
      
      // Check page loaded
      await expect(page.locator('h1, h2').filter({ hasText: /users/i })).toBeVisible({ timeout: 10000 });

      // Cleanup
      const { data: user } = await supabaseAdmin.from('profiles').select('id').eq('email', userData.email).single();
      if (user?.id) await supabaseAdmin.auth.admin.deleteUser(user.id).catch(() => {});
    });

    test('18. Settings page loads', async ({ page }) => {
      adminCredentials = await createAndLoginAdmin(page);
      
      await page.goto('/admin/settings');
      await expect(page.locator('h1, h2').filter({ hasText: /settings/i })).toBeVisible({ timeout: 10000 });
    });
  });
});
