import { test as base, expect, Page } from '@playwright/test';
import { generateTestUser, generateTestAdmin, getLocalizedPath, supabaseAdmin } from '../utils/test-utils';
import path from 'path';

// Define test types
type AuthFixtures = {
  userPage: Page;
  adminPage: Page;
  createUserAndLogin: () => Promise<{ email: string; password: string; page: Page }>;
  createAdminAndLogin: () => Promise<{ email: string; password: string; page: Page }>;
};

// Storage state paths
const authDir = path.join(__dirname, '../.auth');
export const userAuthFile = path.join(authDir, 'user.json');
export const adminAuthFile = path.join(authDir, 'admin.json');

// Extended test with auth fixtures
export const test = base.extend<AuthFixtures>(
  {
    // Authenticated user page fixture
    userPage: async ({ browser }, use) => {
      const context = await browser.newContext({
        storageState: userAuthFile,
      });
      const page = await context.newPage();
      await use(page);
      await context.close();
    },

    // Authenticated admin page fixture
    adminPage: async ({ browser }, use) => {
      const context = await browser.newContext({
        storageState: adminAuthFile,
      });
      const page = await context.newPage();
      await use(page);
      await context.close();
    },

    // Helper to create user and login
    createUserAndLogin: async ({ browser }, use) => {
      const createAndLogin = async () => {
        const userData = generateTestUser();
        const context = await browser.newContext();
        const page = await context.newPage();

        // Navigate to register page
        await page.goto(getLocalizedPath('/register'));

        // Fill registration form
        await page.fill('input[name="full_name"], input#full_name', userData.full_name);
        await page.fill('input[name="email"], input#email', userData.email);
        await page.fill('input[name="phone"], input#phone', userData.phone);
        await page.fill('input[name="password"], input#password', userData.password);
        await page.fill('input[name="confirm_password"], input#confirm_password', userData.password);
        await page.check('input[name="accept_terms"], input#accept_terms');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for success state
        await expect(page.locator('text=Check Your Email')).toBeVisible({ timeout: 10000 });

        // Confirm user via admin API (auto-confirm for testing)
        const { data: user } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', userData.email)
          .single();

        if (user?.id) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, { 
            user_metadata: { email_confirmed: true }
          });
        }

        // Now login
        await page.goto(getLocalizedPath('/login'));
        await page.fill('input[type="email"]', userData.email);
        await page.fill('input[type="password"]', userData.password);
        await page.click('button[type="submit"]');

        // Wait for redirect to welcome page
        await expect(page).toHaveURL(/.*welcome.*/, { timeout: 10000 });

        return { email: userData.email, password: userData.password, page };
      };

      await use(createAndLogin);
    },

    // Helper to create admin and login
    createAdminAndLogin: async ({ browser }, use) => {
      const createAndLogin = async () => {
        const adminData = generateTestAdmin();
        const context = await browser.newContext();
        const page = await context.newPage();

        // Create user via admin API
        const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: {
            full_name: adminData.full_name,
            phone: adminData.phone,
          },
        });

        if (error) throw error;

        // Set admin role
        if (authData.user) {
          await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('id', authData.user.id);
        }

        // Login
        await page.goto(getLocalizedPath('/login'));
        await page.fill('input[type="email"]', adminData.email);
        await page.fill('input[type="password"]', adminData.password);
        await page.click('button[type="submit"]');

        // Wait for redirect to admin dashboard
        await expect(page).toHaveURL(/.*admin.*/, { timeout: 10000 });

        return { email: adminData.email, password: adminData.password, page };
      };

      await use(createAndLogin);
    },
  }
);

export { expect };
